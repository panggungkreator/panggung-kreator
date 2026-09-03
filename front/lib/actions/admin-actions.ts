"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { COLOR_RANGERS } from "@/lib/constants";
import { syncDualOperation } from "@/lib/supabase/dual-sync";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: any) { cookieStore.set({ name, value: "", ...options }); },
      },
    }
  );
}

function generateUsername(stageName: string, color: string): string {
  const cleanName = stageName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15);
  const cleanColor = color.replace(/[^a-z0-9]/g, "");
  return `${cleanName}.${cleanColor}`;
}

function generateTempPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "PK-";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function getTakenColorsAction() {
  noStore();
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("admin_roles")
      .select("color, members:members!member_id(full_name)")
      .neq("status", "revoked");

    if (error) throw error;

    const taken = data.map((item: any) => {
      const rawMember = item.members;
      const member = Array.isArray(rawMember) ? rawMember[0] : rawMember;
      return {
        color: item.color,
        fullName: member?.full_name || "Admin Lain"
      };
    });

    return { success: true, data: taken };
  } catch (error: any) {
    console.error("Error fetching taken colors:", error);
    return { success: false, error: error.message };
  }
}

export async function submitAdminOnboardingAction(input: {
  fullName: string;
  stageName: string;
  email: string;
  whatsappNumber: string;
  occupation: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  username: string;
  color: string;
}) {
  try {
    const supabase = createServiceRoleClient();

    // 0. Cek username ganda
    const { data: duplicateUsername } = await supabase
      .from("members")
      .select("id")
      .eq("username", input.username.trim().toLowerCase())
      .maybeSingle();

    if (duplicateUsername) {
      return { success: false, error: "Username sudah terdaftar!" };
    }

    // 1. Cek email ganda
    const { data: duplicateEmail } = await supabase
      .from("members")
      .select("id")
      .eq("email", input.email.trim())
      .maybeSingle();

    if (duplicateEmail) {
      return { success: false, error: "Email sudah terdaftar!" };
    }

    // Cek no WA ganda
    const { data: duplicateWa } = await supabase
      .from("members")
      .select("id")
      .eq("whatsapp_number", input.whatsappNumber.trim())
      .maybeSingle();

    if (duplicateWa) {
      return { success: false, error: "Nomor WhatsApp sudah terdaftar!" };
    }

    // Cek warna ganda
    const { data: duplicateColor } = await supabase
      .from("admin_roles")
      .select("id")
      .eq("color", input.color)
      .neq("status", "revoked")
      .maybeSingle();

    if (duplicateColor) {
      return { success: false, error: "Warna Ranger ini baru saja diambil oleh admin lain!" };
    }

    // 2. Create Auth User first (to satisfy members_id_fkey constraint)
    const initialTempPassword = crypto.randomBytes(16).toString("hex");
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: input.email.trim(),
      password: initialTempPassword,
      email_confirm: true
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const authUserId = authUser.user.id;

    // 3. Insert into members using the auth user's ID
    const { error: memberError } = await supabase
      .from("members")
      .insert({
        id: authUserId,
        full_name: input.fullName.trim(),
        stage_name: input.stageName.trim(),
        email: input.email.trim(),
        whatsapp_number: input.whatsappNumber.trim(),
        occupation: input.occupation,
        instagram_username: input.instagramUsername?.trim() || null,
        tiktok_username: input.tiktokUsername?.trim() || null,
        username: input.username.trim().toLowerCase(),
        role: "admin",
        membership_tier: "free",
        payment_status: "paid",
      });

    if (memberError) {
      await supabase.auth.admin.deleteUser(authUserId);
      return { success: false, error: memberError.message };
    }

    // 4. Insert into admin_roles (including color_code hex value)
    const colorHex = COLOR_RANGERS[input.color as keyof typeof COLOR_RANGERS]?.hex || "#475569";
    const { error: roleError } = await supabase
      .from("admin_roles")
      .insert({
        member_id: authUserId,
        color: input.color,
        color_code: colorHex,
        status: "pending"
      });

    if (roleError) {
      await supabase.from("members").delete().eq("id", authUserId);
      await supabase.auth.admin.deleteUser(authUserId);
      return { success: false, error: roleError.message };
    }

    revalidatePath("/form/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error during admin onboarding:", error);
    return { success: false, error: error.message };
  }
}

export async function saveAdminPermissionsAction(
  adminRoleId: string,
  permissionRows: { privilege_item_id: string; action_id: string }[]
) {
  try {
    // 1. Delete all existing permissions and insert new permissions with dual sync
    const { error: dualErr } = await syncDualOperation(async (client) => {
      const { error: deleteError } = await client
        .from("admin_role_permissions")
        .delete()
        .eq("admin_role_id", adminRoleId);

      if (deleteError) throw deleteError;

      if (permissionRows.length > 0) {
        const inserts = permissionRows.map((row) => ({
          admin_role_id: adminRoleId,
          privilege_item_id: row.privilege_item_id,
          action_id: row.action_id,
        }));

        const { error: insertError } = await client
          .from("admin_role_permissions")
          .insert(inserts);

        if (insertError) throw insertError;
      }
      return true;
    });

    if (dualErr) throw dualErr;

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving admin permissions:", error);
    return { success: false, error: error.message };
  }
}

export async function approveAdminAction(
  adminRoleId: string,
  label: string
) {
  try {
    const supabase = await getSupabaseClient();
    const serviceRoleClient = createServiceRoleClient();

    // 1. Get admin_role details joined with member info using Service Role to bypass RLS
    const { data: adminRole, error: fetchError } = await serviceRoleClient
      .from("admin_roles")
      .select(`
        id,
        color,
        member_id,
        members:members!member_id (
          full_name,
          stage_name,
          email,
          username
        )
      `)
      .eq("id", adminRoleId)
      .single();

    if (fetchError || !adminRole) {
      throw new Error(fetchError?.message || "Admin role tidak ditemukan.");
    }

    const rawMember = adminRole.members;
    const member = (Array.isArray(rawMember) ? rawMember[0] : rawMember) as any;
    if (!member) {
      throw new Error("Data member terkait peran admin tidak ditemukan.");
    }
    const email = member.email;
    const stageName = member.stage_name || member.full_name;

    // Use existing username if set during onboarding, otherwise fallback to generating one
    const username = member.username || generateUsername(stageName, adminRole.color);
    const tempPassword = generateTempPassword();

    // 2. Update existing user password in Supabase Auth via Service Role
    const { error: authError } = await serviceRoleClient.auth.admin.updateUserById(adminRole.member_id, {
      password: tempPassword
    });

    if (authError) {
      throw authError;
    }

    // 3. Update member record to role = 'admin' and set username, plus update admin_role status with dual sync
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const approvedBy = currentUser?.id || null;

    const { error: dualErr } = await syncDualOperation(async (client) => {
      const { error: updateMemberError } = await client
        .from("members")
        .update({
          role: "admin",
          username: username,
        })
        .eq("id", adminRole.member_id);

      if (updateMemberError) throw updateMemberError;

      const { error: updateRoleError } = await client
        .from("admin_roles")
        .update({
          status: "active",
          label: label,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", adminRoleId);

      if (updateRoleError) throw updateRoleError;
      return true;
    });

    if (dualErr) throw dualErr;

    // 5. Send Credentials Email via Nodemailer
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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Akses Admin Disetujui - Panggung Kreator",
          html: `
            <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
              <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Uyeahh, Wilujeung Sumping </h1>
              </div>
              <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Halo <strong>${member.full_name}</strong>,</p>
                <p style="margin-top: 20px; font-weight: bold;">Yuk, cobain login pakai akses di bawah ini:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> ${tempPassword}</p>
                </div>
                
                <p>Langsung ae masuk ke dashboard admin lewat link di bawah ini:</p>
                <div style="margin: 25px 0; text-align: center;">
                  <a href="${appUrl}/login" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login ke Panel Admin</a>
                </div>
                
                <p style="color: #666; font-size: 13px;"><em>Jangan lupa, habis login pertama kali, langsung ganti username dan password di halaman profil admin biar akun kamu tetap aman.</em></p>
                
                <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 13px; color: #666;">
                  Salam #OneStageOneProgress,<br/>
                  <strong>Captain Aldi</strong>
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Gagal mengirim email kredensial:", emailError);
      }
    } else {
      console.warn("SMTP_USER/PASS tidak ditemukan, email kredensial tidak dikirim.");
    }

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving admin:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdminAction(adminRoleId: string) {
  try {
    const serviceRoleClient = createServiceRoleClient();

    // 1. Get the admin_role record to find the member_id
    const { data: adminRole, error: fetchError } = await serviceRoleClient
      .from("admin_roles")
      .select("member_id")
      .eq("id", adminRoleId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!adminRole) {
      return { success: false, error: "Admin role tidak ditemukan." };
    }

    const memberId = adminRole.member_id;

    // 2. Delete privilege rows, admin_roles record, and members record across both databases
    const { error: dualErr } = await syncDualOperation(async (client) => {
      await client
        .from("admin_role_permissions")
        .delete()
        .eq("admin_role_id", adminRoleId);

      await client
        .from("admin_roles")
        .delete()
        .eq("id", adminRoleId);

      await client
        .from("members")
        .delete()
        .eq("id", memberId);

      return true;
    });

    if (dualErr) throw dualErr;

    // 5. Delete auth user from Supabase Auth
    const { error: authError } = await serviceRoleClient.auth.admin.deleteUser(memberId);
    if (authError) {
      console.warn("Gagal menghapus user dari Supabase Auth (mungkin sudah terhapus):", authError.message);
    }

    revalidatePath("/admin/admins");
    revalidatePath("/admin/members");
    revalidatePath("/form/admin");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return { success: false, error: error.message };
  }
}
