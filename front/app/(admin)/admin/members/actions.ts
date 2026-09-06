"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

interface SendCredentialsPayload {
  memberId: string;
  username?: string;
  password?: string;
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  credentials?: {
    username: string;
    password?: string;
  };
}

/**
 * Generate a random secure temporary password
 */
function generateRandomPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let password = "PK-";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Helper to generate a clean username from a full name / stage name
 */
function generateBaseUsername(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${cleanName || "kreator"}${randomSuffix}`;
}

export async function sendMemberCredentialsAction(
  payload: SendCredentialsPayload
): Promise<ActionResponse> {
  try {
    const supabaseServer = await createClient();

    // 1. Verify caller authentication & admin role
    const {
      data: { user: currentUser },
    } = await supabaseServer.auth.getUser();

    if (!currentUser) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
    }

    const { data: adminMember } = await supabaseServer
      .from("members")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return {
        success: false,
        error: "Akses ditolak. Anda tidak memiliki wewenang admin.",
      };
    }

    // 2. Fetch target member details
    const supabaseAdmin = createServiceRoleClient();
    const { data: member, error: fetchError } = await supabaseAdmin
      .from("members")
      .select("id, full_name, stage_name, email, whatsapp_number, username, temporary_password")
      .eq("id", payload.memberId)
      .single();

    if (fetchError || !member) {
      return { success: false, error: "Data member tidak ditemukan." };
    }

    if (!member.email) {
      return {
        success: false,
        error: "Member tidak memiliki alamat email terdaftar.",
      };
    }

    // 3. Determine Username & Password
    let finalUsername = (payload.username || "").trim();
    if (!finalUsername) {
      finalUsername = member.username || generateBaseUsername(member.stage_name || member.full_name);
    }

    let finalPassword = (payload.password || "").trim();
    if (!finalPassword) {
      finalPassword = member.temporary_password || generateRandomPassword();
    }

    // 4. Check if username is already taken by another member
    const { data: existingUser } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("username", finalUsername)
      .neq("id", member.id)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: `Username "${finalUsername}" sudah digunakan oleh member lain. Silakan pilih username lain.`,
      };
    }

    // 5. Update / Create Auth User password in Supabase Auth
    try {
      const { data: authUser, error: getAuthError } =
        await supabaseAdmin.auth.admin.getUserById(member.id);

      if (getAuthError || !authUser?.user) {
        // Create user if not existing in Auth
        const { error: createAuthErr } =
          await supabaseAdmin.auth.admin.createUser({
            id: member.id,
            email: member.email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: {
              full_name: member.full_name,
              stage_name: member.stage_name,
              username: finalUsername,
            },
          });

        if (createAuthErr) {
          console.error("Auth createUser error:", createAuthErr);
        }
      } else {
        // Update password of existing Auth user
        const { error: updateAuthErr } =
          await supabaseAdmin.auth.admin.updateUserById(member.id, {
            password: finalPassword,
            user_metadata: {
              ...authUser.user.user_metadata,
              username: finalUsername,
            },
          });

        if (updateAuthErr) {
          console.error("Auth updateUserById error:", updateAuthErr);
        }
      }
    } catch (authErr: any) {
      console.warn("Supabase Auth sync warning:", authErr?.message);
    }

    // 6. Update member record in public.members
    const { error: updateDbError } = await supabaseAdmin
      .from("members")
      .update({
        username: finalUsername,
        temporary_password: finalPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (updateDbError) {
      throw updateDbError;
    }

    const memberName = member.stage_name || member.full_name || "Kreator";

    // 7. Send Credentials Email via Nodemailer if SMTP is configured
    let emailSent = false;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: process.env.SMTP_SECURE === "false" ? false : true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: member.email.trim(),
          subject: "Kredensial Akses Akun - Panggung Kreator",
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 20px;">
              <div style="background-color: #18181b; color: #ffffff; padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
                  Panggung Kreator
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">
                  Kredensial Akses Akun Komunitas & Akademi
                </p>
              </div>

              <div style="background-color: #ffffff; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="margin-top: 0; font-size: 15px; color: #334155;">
                  Halo <strong>${memberName}</strong>,
                </p>
                
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  Berikut adalah informasi kredensial akses untuk login ke platform <strong>Panggung Kreator</strong> Anda:
                </p>

                <!-- CREDENTIAL BOX -->
                <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    🔑 KREDENSIAL LOGIN ANDA
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Username:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${finalUsername}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; font-weight: 600;">Password:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${finalPassword}</td>
                    </tr>
                  </table>
                </div>

                <!-- LOGIN BUTTON -->
                <div style="margin: 28px 0; text-align: center;">
                  <a href="${appUrl}/login" 
                     style="background-color: #18181b; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Login ke Dashboard Member
                  </a>
                </div>

                <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 12px 16px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; font-size: 12px; color: #9f1239; line-height: 1.5;">
                    💡 <strong>Tips Keamanan:</strong> Demi keamanan akun Anda, silakan ubah password sementara ini melalui halaman profil setelah pertama kali berhasil login.
                  </p>
                </div>

                <p style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 13px; color: #64748b; line-height: 1.5;">
                  Salam hangat,<br />
                  <strong style="color: #0f172a;">Tim Panggung Kreator</strong><br />
                  <span style="font-size: 11px; color: #94a3b8;">#OneStageOneProgress</span>
                </p>
              </div>
            </div>
          `,
        });

        emailSent = true;
      } catch (emailErr: any) {
        console.error("Gagal mengirim email kredensial:", emailErr);
      }
    } else {
      console.warn("SMTP_USER/PASS belum dikonfigurasi di environment variables.");
    }

    revalidatePath("/admin/members");

    return {
      success: true,
      message: emailSent
        ? `Berhasil memperbarui kredensial dan mengirim email ke ${member.email}`
        : `Berhasil memperbarui kredensial member ${memberName} (Email SMTP belum dikirim/terkonfigurasi).`,
      credentials: {
        username: finalUsername,
        password: finalPassword,
      },
    };
  } catch (err: any) {
    console.error("Error in sendMemberCredentialsAction:", err);
    return {
      success: false,
      error: err.message || "Gagal memperbarui dan mengirim kredensial member.",
    };
  }
}

export async function deleteMemberAction(memberId: string): Promise<ActionResponse> {
  try {
    const supabaseServer = await createClient();

    // 1. Verify caller authentication & admin role
    const {
      data: { user: currentUser },
    } = await supabaseServer.auth.getUser();

    if (!currentUser) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
    }

    const { data: adminMember } = await supabaseServer
      .from("members")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return {
        success: false,
        error: "Akses ditolak. Anda tidak memiliki wewenang admin.",
      };
    }

    // Prevent self-deletion by admin
    if (currentUser.id === memberId) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus akun admin Anda sendiri.",
      };
    }

    const { syncDualOperation } = await import("@/lib/supabase/dual-sync");

    const { devResult } = await syncDualOperation(async (client) => {
      await client.from("member_interests").delete().eq("member_id", memberId);
      await client.from("member_ai_analysis").delete().eq("member_id", memberId);
      await client.from("event_attendances").delete().eq("member_id", memberId);
      await client.from("member_portfolios").delete().eq("member_id", memberId);
      await client.from("transactions").delete().eq("member_id", memberId);
      await client.from("referrals").delete().or(`referrer_id.eq.${memberId},referee_id.eq.${memberId}`);
      return await client.from("members").delete().eq("id", memberId);
    });

    if (devResult.error) {
      console.error("Error deleting member record via dual-sync:", devResult.error);
      return { success: false, error: `Gagal menghapus data member: ${devResult.error.message}` };
    }

    // Delete from Supabase Auth auth.users
    const supabaseAdmin = createServiceRoleClient();
    try {
      await supabaseAdmin.auth.admin.deleteUser(memberId);
    } catch (authDelErr: any) {
      console.warn("Auth delete warning (user might already be deleted):", authDelErr?.message);
    }

    revalidatePath("/admin/members");

    return {
      success: true,
      message: "Member dan seluruh data terkait berhasil dihapus.",
    };
  } catch (err: any) {
    console.error("Error in deleteMemberAction:", err);
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat menghapus member.",
    };
  }
}

export async function fetchLatestMembersAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Verifikasi sesi dan role admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
    }

    const { data: currentMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!currentMember || currentMember.role !== "admin") {
      return { success: false, error: "Akses ditolak. Hanya admin yang diizinkan." };
    }

    // Ambil daftar member_id yang berstatus admin untuk diexclude
    const { data: adminRoles } = await supabase
      .from("admin_roles")
      .select("member_id")
      .neq("status", "revoked");

    const adminMemberIds = (adminRoles || []).map((r) => r.member_id).filter(Boolean);

    let membersQuery = supabase
      .from("members")
      .select("*, interests:member_interests(*), package:packages(id, name)")
      .neq("role", "admin")
      .or("payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

    if (adminMemberIds.length > 0) {
      membersQuery = membersQuery.not("id", "in", `(${adminMemberIds.join(",")})`);
    }

    let { data: members, error } = await membersQuery.order("created_at", { ascending: false });

    if (error) {
      console.warn("Fallback query for members in fetchLatestMembersAction:", error.message);
      let fallbackQuery = supabase
        .from("members")
        .select("*")
        .neq("role", "admin")
        .or("payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

      if (adminMemberIds.length > 0) {
        fallbackQuery = fallbackQuery.not("id", "in", `(${adminMemberIds.join(",")})`);
      }

      const { data: rawMembers, error: rawError } = await fallbackQuery.order("created_at", { ascending: false });

      if (rawError) {
        return { success: false, error: rawError.message };
      }

      if (rawMembers) {
        const { data: interestsData } = await supabase.from("member_interests").select("*");
        const interestsMap = new Map((interestsData || []).map((item: any) => [item.member_id, item]));

        members = rawMembers.map((m: any) => ({
          ...m,
          interests: interestsMap.get(m.id) || null,
        }));
      }
    }

    return { success: true, data: members || [] };
  } catch (err: any) {
    console.error("Error in fetchLatestMembersAction:", err);
    return { success: false, error: err.message || "Gagal mengambil data terbaru." };
  }
}


