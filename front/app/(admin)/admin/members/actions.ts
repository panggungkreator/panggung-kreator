"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { ADMIN_USERNAME } from "@/lib/constants";

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

        const { getMemberCredentialsEmailHtml } = await import("@/lib/email-templates/member-credentials");
        const emailHtml = getMemberCredentialsEmailHtml({
          memberName,
          email: member.email.trim(),
          username: finalUsername,
          password: finalPassword,
          appUrl,
        });

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: member.email.trim(),
          subject: "Kredensial Akses Akun - Panggung Kreator",
          html: emailHtml,
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

    // Fetch target member details for logging
    const supabaseAdmin = createServiceRoleClient();
    const { data: memberToDelete } = await supabaseAdmin
      .from("members")
      .select("id, full_name, stage_name, email, username, membership_tier")
      .eq("id", memberId)
      .maybeSingle();

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
    try {
      await supabaseAdmin.auth.admin.deleteUser(memberId);
    } catch (authDelErr: any) {
      console.warn("Auth delete warning (user might already be deleted):", authDelErr?.message);
    }

    // Log admin activity
    try {
      const { logAdminActivity } = await import("@/lib/actions/log-actions");
      await logAdminActivity({
        adminId: currentUser.id,
        action: "DELETE",
        module: "Members",
        targetId: memberId,
        description: `Menghapus data member "${memberToDelete?.stage_name || memberToDelete?.full_name || memberId}" (${memberToDelete?.email || "-"}) beserta seluruh relasi datanya`,
        oldData: memberToDelete,
        newData: null,
      });
    } catch (logErr) {
      console.warn("Notice: Gagal mencatat log hapus member:", logErr);
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

    // Verifikasi user dan role admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
    }

    const { data: currentMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentMember || currentMember.role !== "admin") {
      return { success: false, error: "Akses ditolak. Hanya admin yang diizinkan." };
    }

    let membersQuery = supabase
      .from("members")
      .select("*, interests:member_interests(*), package:packages(id, name)")
      .neq("username", ADMIN_USERNAME)
      .or("role.eq.admin,payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

    let { data: members, error } = await membersQuery.order("created_at", { ascending: false });

    if (error) {
      console.warn("Fallback query for members in fetchLatestMembersAction:", error.message);
      let fallbackQuery = supabase
        .from("members")
        .select("*")
        .neq("username", ADMIN_USERNAME)
        .or("role.eq.admin,payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

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

    // Tarik data admin_roles untuk memetakan jabatan admin
    const { data: adminRolesData } = await supabase
      .from("admin_roles")
      .select("member_id, label, color, status")
      .neq("status", "revoked");

    const adminRolesMap = new Map(
      (adminRolesData || []).map((ar: any) => [ar.member_id, ar])
    );

    const enrichedMembers = (members || []).map((m: any) => ({
      ...m,
      admin_role: adminRolesMap.get(m.id) || null,
    }));

    return { success: true, data: enrichedMembers };
  } catch (err: any) {
    console.error("Error in fetchLatestMembersAction:", err);
    return { success: false, error: err.message || "Gagal mengambil data terbaru." };
  }
}

export async function updateMemberStatusAction(payload: {
  memberId: string;
  community: string;
  membership_tier: string;
  tier_note?: string | null;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
    }

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak. Anda tidak memiliki wewenang admin." };
    }

    // Fetch old data
    const { data: oldMember } = await supabase
      .from("members")
      .select("id, full_name, stage_name, community, membership_tier, tier_note")
      .eq("id", payload.memberId)
      .single();

    const nowStr = new Date().toISOString();
    const updateData = {
      community: payload.community,
      membership_tier: payload.membership_tier,
      tier_changed_at: nowStr,
      tier_changed_by: currentUser.id,
      tier_note: payload.tier_note ? payload.tier_note.trim() : null,
    };

    const { error: updateErr } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", payload.memberId);

    if (updateErr) throw updateErr;

    // Log the activity
    const { logAdminActivity } = await import("@/lib/actions/log-actions");
    await logAdminActivity({
      adminId: currentUser.id,
      action: "UPDATE",
      module: "Members",
      targetId: payload.memberId,
      description: `Mengubah status/tier member "${oldMember?.stage_name || oldMember?.full_name || payload.memberId}" menjadi ${payload.membership_tier} (${payload.community})`,
      oldData: oldMember,
      newData: { ...oldMember, ...updateData },
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateMemberStatusAction:", err);
    return { success: false, error: err.message || "Gagal memperbarui status member." };
  }
}

export async function adminAssignAffiliateAction(payload: {
  memberId: string;
  referrerId: string | null;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
    }

    const { data: adminMember } = await supabase
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

    const supabaseAdmin = createServiceRoleClient();
    const { data: targetMember, error: fetchErr } = await supabaseAdmin
      .from("members")
      .select("id, full_name, stage_name, email, role, membership_tier, referred_by_member_id, referred_by")
      .eq("id", payload.memberId)
      .single();

    if (fetchErr || !targetMember) {
      return { success: false, error: "Data member tidak ditemukan." };
    }

    // Constraint: Hanya berlaku untuk user dengan role member reguler (bukan admin)
    const isRegularMember = targetMember.role !== "admin";

    if (!isRegularMember) {
      return {
        success: false,
        error: "Penetapan affiliator hanya berlaku untuk member reguler (bukan akun admin).",
      };
    }

    let referrerMember: any = null;
    if (payload.referrerId) {
      if (payload.referrerId === payload.memberId) {
        return {
          success: false,
          error: "Member tidak dapat menjadi affiliator untuk dirinya sendiri.",
        };
      }

      const { data: refData, error: refErr } = await supabaseAdmin
        .from("members")
        .select("id, full_name, stage_name, email, affiliate_code, commission_balance")
        .eq("id", payload.referrerId)
        .single();

      if (refErr || !refData) {
        return { success: false, error: "Data member affiliator terpilih tidak ditemukan." };
      }
      referrerMember = refData;
    }

    const oldReferrerId = targetMember.referred_by_member_id || targetMember.referred_by;

    // 1. Update target member referred_by in database
    const { syncDualOperation } = await import("@/lib/supabase/dual-sync");
    const { devResult, error: syncErr } = await syncDualOperation(async (client) => {
      return await client
        .from("members")
        .update({
          referred_by_member_id: payload.referrerId || null,
          referred_by: payload.referrerId || null,
        })
        .eq("id", payload.memberId);
    });

    if (devResult?.error || syncErr) {
      console.error("Error updating member referrer via dual-sync:", devResult?.error || syncErr);
      return {
        success: false,
        error: `Gagal menyimpan affiliator: ${(devResult?.error || syncErr)?.message}`,
      };
    }

    // 2. Calculate Commission Reward Amount based on system settings
    const { getReferralCommissionSettingsAction } = await import("@/lib/actions/settings-actions");
    const settings = await getReferralCommissionSettingsAction();
    let rewardAmount = 10000;
    if (settings.mode === "percentage") {
      const basePrice = Number((targetMember as any).final_price || 49000);
      const pct = parseFloat(settings.percentage) || 10;
      rewardAmount = Math.round((basePrice * pct) / 100);
    } else {
      const cleanFlat = parseInt(String(settings.flatAmount).replace(/\D/g, ""), 10);
      rewardAmount = isNaN(cleanFlat) ? 10000 : cleanFlat;
    }

    // 3. Handle Old Referrer Commission Removal (if changing or clearing affiliator)
    if (oldReferrerId && oldReferrerId !== payload.referrerId) {
      try {
        const { data: oldLedgers } = await supabaseAdmin
          .from("commission_ledger")
          .select("id, amount, member_id")
          .eq("member_id", oldReferrerId)
          .eq("reference_id", targetMember.id);

        if (oldLedgers && oldLedgers.length > 0) {
          const totalOldAmount = oldLedgers.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const { data: oldRefUser } = await supabaseAdmin
            .from("members")
            .select("id, commission_balance")
            .eq("id", oldReferrerId)
            .single();

          if (oldRefUser) {
            const newOldBal = Math.max(0, Number(oldRefUser.commission_balance || 0) - totalOldAmount);
            await supabaseAdmin
              .from("members")
              .update({ commission_balance: newOldBal })
              .eq("id", oldReferrerId);
          }

          await supabaseAdmin
            .from("commission_ledger")
            .delete()
            .eq("member_id", oldReferrerId)
            .eq("reference_id", targetMember.id);
        }
      } catch (oldErr) {
        console.warn("Notice: Error reverting old commission ledger:", oldErr);
      }
    }

    // 4. Handle New Referrer Commission Addition (if affiliator is assigned)
    if (payload.referrerId) {
      try {
        const { data: existingLedger } = await supabaseAdmin
          .from("commission_ledger")
          .select("id")
          .eq("member_id", payload.referrerId)
          .eq("reference_id", targetMember.id)
          .maybeSingle();

        if (!existingLedger && rewardAmount > 0) {
          const { data: refCurrent } = await supabaseAdmin
            .from("members")
            .select("commission_balance")
            .eq("id", payload.referrerId)
            .single();

          const currentBalance = Number(refCurrent?.commission_balance || 0);
          const newReferrerBalance = currentBalance + rewardAmount;

          await supabaseAdmin
            .from("members")
            .update({ commission_balance: newReferrerBalance })
            .eq("id", payload.referrerId);

          await supabaseAdmin
            .from("commission_ledger")
            .insert({
              member_id: payload.referrerId,
              type: "pending",
              amount: rewardAmount,
              balance_after: newReferrerBalance,
              source: "referral_reward",
              reference_id: targetMember.id,
              description: `Komisi referral dari pendaftaran ${targetMember.stage_name || targetMember.full_name || "member"}`,
              created_by: currentUser.id,
            });
        }
      } catch (newLedgerErr) {
        console.warn("Notice: Error adding new commission ledger entry:", newLedgerErr);
      }
    }

    // 5. Log the admin activity
    try {
      const { logAdminActivity } = await import("@/lib/actions/log-actions");
      const memberName = targetMember.stage_name || targetMember.full_name || targetMember.id;
      const referrerName = referrerMember
        ? referrerMember.stage_name || referrerMember.full_name || referrerMember.id
        : "Tanpa Affiliator";

      await logAdminActivity({
        adminId: currentUser.id,
        action: "UPDATE",
        module: "Members",
        targetId: payload.memberId,
        description: payload.referrerId
          ? `Menetapkan affiliator "${referrerName}" untuk member "${memberName}" (Komisi Rp ${rewardAmount.toLocaleString("id-ID")})`
          : `Menghapus affiliator dari member "${memberName}"`,
        oldData: {
          referred_by_member_id: targetMember.referred_by_member_id,
          referred_by: targetMember.referred_by,
        },
        newData: {
          referred_by_member_id: payload.referrerId || null,
          referred_by: payload.referrerId || null,
        },
      });
    } catch (logErr) {
      console.warn("Notice: Gagal mencatat log assign affiliate:", logErr);
    }

    revalidatePath("/admin/members");
    revalidatePath("/admin/affiliate-payout");
    revalidatePath("/myprofile");

    return {
      success: true,
      message: payload.referrerId
        ? `Berhasil menetapkan affiliator (${referrerMember.stage_name || referrerMember.full_name}) untuk ${targetMember.stage_name || targetMember.full_name} beserta komisi referral.`
        : `Berhasil menghapus affiliator untuk ${targetMember.stage_name || targetMember.full_name}.`,
    };
  } catch (err: any) {
    console.error("Error in adminAssignAffiliateAction:", err);
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat menetapkan affiliator.",
    };
  }
}
