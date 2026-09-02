"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import nodemailer from "nodemailer";
import { getPublicOrigin } from "@/lib/utils/url";

export async function signout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" }).catch(() => {});
  } catch (_) {}

  // Bersihkan secara eksplisit seluruh cookie auth dari header server
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    allCookies.forEach((c) => {
      if (
        c.name.startsWith("sb-") ||
        c.name.includes("auth") ||
        c.name.includes("token") ||
        c.name.includes("session")
      ) {
        cookieStore.set({
          name: c.name,
          value: "",
          maxAge: 0,
          path: "/",
        });
      }
    });
  } catch (_) {}

  return { success: true };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect(data.url);
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect(data.url);
}

function formatSupabaseError(error: any): string {
  if (!error) return "Unknown error";

  const keys = Object.getOwnPropertyNames(error);
  const details: Record<string, any> = {};
  for (const key of keys) {
    details[key] = error[key];
  }

  let msg = error.message;
  if (!msg || msg === "{}" || typeof msg !== "string") {
    msg = error.error_description || error.error || error.name || "Unknown Auth Error";
  }

  if (typeof msg === "object") {
    try {
      msg = JSON.stringify(msg);
    } catch {
      msg = String(msg);
    }
  }

  return `${msg} (Status: ${error.status || 'N/A'}, Code: ${error.code || 'N/A'}, Details: ${JSON.stringify(details)})`;
}

export async function signInWithPasswordAction(emailOrUsername: string, password: string) {
  console.log("[AUTH ACTION] Menggunakan NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!emailOrUsername || !password) {
    return { success: false, error: "Email/Username dan Password wajib diisi" };
  }

  const supabase = await createClient();

  let loginEmail = emailOrUsername.trim();

  // Jika input tidak mengandung '@', kita anggap itu adalah username
  if (!loginEmail.includes("@")) {
    // Cari email di tabel members berdasarkan username menggunakan RPC (untuk bypass RLS)
    const { data: memberEmail, error: searchError } = await supabase
      .rpc("get_email_by_username", { p_username: loginEmail });

    if (searchError) {
      console.error("Error searching username in database:", searchError);
      return { success: false, error: `Database Error: ${formatSupabaseError(searchError)}` };
    }

    if (memberEmail) {
      loginEmail = memberEmail;
    } else {
      return { success: false, error: `Username "${loginEmail}" tidak terdaftar sebagai member.` };
    }
  }

  // Jalankan autentikasi Supabase
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: password,
  });

  if (error) {
    if (error.code === "invalid_credentials" || error.message?.toLowerCase().includes("invalid login credentials")) {
      return {
        success: false,
        error: "Email/Username atau Password tidak sesuai.",
      };
    }
    console.error("Login error:", error);
    return { success: false, error: `Supabase Auth Error: ${formatSupabaseError(error)}` };
  }

  let isAdmin = false;
  if (authData?.user) {
    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (member && member.role === "admin") {
      isAdmin = true;
    }
  }

  return { success: true, isAdmin };
}

export async function signUpWithPasswordAction(email: string, password: string, username: string) {
  if (!email || !password || !username) {
    return { success: false, error: "Semua field wajib diisi" };
  }

  const supabase = await createClient();

  // Pastikan username unik
  const { data: existingUser, error: checkError } = await supabase
    .from("members")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (checkError) {
    console.error("Username check error:", checkError);
  }

  if (existingUser) {
    return { success: false, error: `Username "${username}" sudah digunakan.` };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password,
    options: {
      data: {
        username: username.trim().toLowerCase(),
        full_name: username.trim(),
      }
    }
  });

  if (error) {
    console.error("SignUp error:", error);
    return { success: false, error: `Supabase Auth Error: ${formatSupabaseError(error)}` };
  }

  return { success: true, user: data.user, session: data.session };
}

export async function checkEmailExistsAction(email: string) {
  if (!email || !email.trim()) return false;
  const cleanEmail = email.trim().toLowerCase();

  const standardClient = await createClient();
  const { data: { user } } = await standardClient.auth.getUser();

  const serviceClient = createServiceRoleClient();

  // 1. Cek di tabel public.members
  let query = serviceClient
    .from("members")
    .select("id")
    .eq("email", cleanEmail);

  if (user) {
    query = query.neq("id", user.id);
  }

  const { data: memberData, error } = await query.maybeSingle();

  if (error) {
    console.error("Email check error in members table:", error);
  }

  if (memberData) return true;

  // 2. Cek di tabel auth.users Supabase
  try {
    const { data: { users }, error: authListError } = await serviceClient.auth.admin.listUsers();
    if (!authListError && users) {
      const existsInAuth = users.some(
        (u) => u.email?.toLowerCase() === cleanEmail && (!user || u.id !== user.id)
      );
      if (existsInAuth) return true;
    }
  } catch (authErr) {
    console.error("Auth check error in auth.users:", authErr);
  }

  return false;
}

export async function checkWhatsappExistsAction(whatsappNumber: string) {
  if (!whatsappNumber || !whatsappNumber.trim()) return false;
  const cleanPhone = whatsappNumber.trim();

  const serviceClient = createServiceRoleClient();

  const { data: memberData, error } = await serviceClient
    .from("members")
    .select("id")
    .eq("whatsapp_number", cleanPhone)
    .maybeSingle();

  if (error) {
    console.error("WhatsApp check error in members table:", error);
  }

  return !!memberData;
}

export async function registerPriorityMemberAction(onboardingData: any) {
  let createdAuthUserId: string | null = null;
  let isNewAuthUserCreated = false;

  try {
    const supabaseAdmin = createServiceRoleClient();
    const { profile, interests } = onboardingData;
    const cleanEmail = profile.email.trim().toLowerCase();

    // 1. Check if email is already in public.members
    const { data: existingMember } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingMember) {
      return {
        success: false,
        error: "Email ini sudah terdaftar di sistem. Silakan login atau gunakan email lain.",
      };
    }

    // 1b. Check if whatsapp_number is already in public.members
    const cleanPhone = profile.whatsapp_number ? profile.whatsapp_number.trim() : "";
    if (cleanPhone) {
      const { data: existingPhone } = await supabaseAdmin
        .from("members")
        .select("id")
        .eq("whatsapp_number", cleanPhone)
        .maybeSingle();

      if (existingPhone) {
        return {
          success: false,
          error: "No. WhatsApp ini sudah terdaftar di sistem. Silakan login atau gunakan nomor lain.",
        };
      }
    }

    // 2. Generate Username & Password
    const baseName = (profile.full_name || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUsername = `${baseName}${randomSuffix}`;
    const generatedPassword = `Panggung${Math.floor(1000 + Math.random() * 9000)}!`;

    // 3. Sign Up User using Supabase Auth Admin API
    let user: any = null;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: profile.full_name,
        whatsapp_number: profile.whatsapp_number,
        username: generatedUsername,
      },
    });

    if (authError) {
      // Handling jika user sudah ada di auth.users (misal akibat retry/orphaned auth user)
      if (
        authError.message?.includes("already been registered") ||
        authError.message?.includes("already exists")
      ) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (existingAuthUser) {
          user = existingAuthUser;
        } else {
          return {
            success: false,
            error: "Email ini sudah terdaftar. Silakan gunakan email lain atau login ke akun Anda.",
          };
        }
      } else {
        console.error("Auth creation error:", authError);
        return { success: false, error: authError.message };
      }
    } else {
      user = authData?.user;
      if (user) {
        createdAuthUserId = user.id;
        isNewAuthUserCreated = true;
      }
    }

    if (!user) {
      return { success: false, error: "Gagal membuat akun autentikasi." };
    }

    // 4. Insert into members table (menggunakan upsert agar tidak crash jika ID sudah pernah dibuat)
    const { error: memberError } = await supabaseAdmin
      .from("members")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        stage_name: profile.full_name,
        whatsapp_number: profile.whatsapp_number,
        email: cleanEmail,
        birth_date: profile.birth_date || null,
        address: profile.address || null,
        social_media: profile.social_media || {},
        occupation: profile.occupation || null,
        subscribed_newsletter: profile.subscribed_newsletter ?? true,
        username: generatedUsername,
        membership_tier: 'priority',
        role: 'member',
        payment_status: 'paid'
      }, { onConflict: "id" });

    if (memberError) {
      console.error("Member insert error (triggering ROLLBACK):", memberError);

      // ROLLBACK STEP: Delete newly created auth user if members table insertion failed!
      if (isNewAuthUserCreated && createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId).catch((delErr) => {
          console.error("Failed to delete auth user during rollback:", delErr);
        });
      }

      if (
        memberError.message?.includes("members_whatsapp_number_key") ||
        memberError.message?.includes("whatsapp_number")
      ) {
        return {
          success: false,
          error: "No. WhatsApp ini sudah terdaftar di sistem. Silakan login atau gunakan nomor lain.",
        };
      }
      if (
        memberError.message?.includes("members_email_key") ||
        memberError.message?.includes("email")
      ) {
        return {
          success: false,
          error: "Email ini sudah terdaftar di sistem. Silakan login atau gunakan email lain.",
        };
      }
      return { success: false, error: memberError.message };
    }

    // 5. Insert into member_interests table
    const goalsList = [];
    if (interests.career_goal) goalsList.push(interests.career_goal);
    if (interests.first_opportunity) goalsList.push(interests.first_opportunity);

    const topicsList = [];
    if (interests.main_topic) topicsList.push(interests.main_topic);
    if (interests.main_message) topicsList.push(interests.main_message);

    const { error: interestError } = await supabaseAdmin
      .from("member_interests")
      .upsert({
        member_id: user.id,
        primary_interests: interests.primary_interests || [],
        experience_level: null,
        goals: goalsList,
        content_topics: topicsList,
        availability: null,
        learning_preference: interests.skills_to_master ? [interests.skills_to_master] : [],
        skills_to_master: interests.skills_to_master || null,
        monetization_interest: interests.monetization_interest || null,
        active_communities: interests.active_communities || null,
        career_obstacle: interests.career_obstacle || null,
        ps_challenges: interests.ps_challenges || [],
        confidence_scale: interests.confidence_scale ?? null,
        nervous_trigger: interests.nervous_trigger || null,
        role_model: interests.role_model || null,
        target_audience: interests.target_audience || null,
        expert_desire: interests.expert_desire || null,
        time_commitment: interests.time_commitment || null,
      }, { onConflict: "member_id" });

    if (interestError) {
      console.error("Interest insert error (triggering ROLLBACK):", interestError);

      // ROLLBACK STEP: Roll back members row and newly created auth user!
      try {
        await supabaseAdmin.from("members").delete().eq("id", user.id);
      } catch (delMemErr) {
        console.error("Failed to delete member during rollback:", delMemErr);
      }

      if (isNewAuthUserCreated && createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId).catch((delErr) => {
          console.error("Failed to delete auth user during rollback:", delErr);
        });
      }

      return { success: false, error: "Gagal menyimpan minat member. Pendaftaran dibatalkan." };
    }

    // Panggil AI Analysis secara asinkron di latar belakang
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch(`${origin}/api/member/analyze-interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: user.id }),
      }).catch(console.error);
    } catch (aiErr) {
      console.error("Failed to trigger AI analysis:", aiErr);
    }

    // Kirim Email Kredensial Langsung ke Member via Nodemailer SMTP
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
        const memberName = profile.full_name || "Kreator";

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: "Selamat Datang di Member Priority - Panggung Kreator",
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 20px;">
              <div style="background-color: #18181b; color: #ffffff; padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
                  Panggung Kreator
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">
                  Kredensial Akses Akun Member Priority
                </p>
              </div>

              <div style="background-color: #ffffff; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="margin-top: 0; font-size: 15px; color: #334155;">
                  Halo <strong>${memberName}</strong>,
                </p>
                
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  Selamat! Pendaftaran Anda sebagai <strong>Member Priority Panggung Kreator</strong> telah berhasil dikonfirmasi. Berikut adalah informasi kredensial untuk login ke platform:
                </p>

                <!-- CREDENTIAL BOX -->
                <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    🔑 KREDENSIAL LOGIN ANDA
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Email:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${cleanEmail}</td>
                    </tr>
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Username:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${generatedUsername}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; font-weight: 600;">Password:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${generatedPassword}</td>
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
      } catch (emailErr) {
        console.error("Failed to send welcome email via SMTP:", emailErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("registerPriorityMemberAction error (triggering EMERGENCY ROLLBACK):", err);

    // EMERGENCY ROLLBACK
    if (isNewAuthUserCreated && createdAuthUserId) {
      try {
        const supabaseAdmin = createServiceRoleClient();
        await supabaseAdmin.from("members").delete().eq("id", createdAuthUserId);
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      } catch (rollbackErr) {
        console.error("Emergency rollback failed:", rollbackErr);
      }
    }

    return { success: false, error: err.message || "Terjadi kesalahan internal server." };
  }
}

export async function requestPasswordResetAction(emailOrUsername: string) {
  if (!emailOrUsername || !emailOrUsername.trim()) {
    return { success: false, error: "Email atau Username wajib diisi." };
  }

  const inputStr = emailOrUsername.trim();
  const supabaseAdmin = createServiceRoleClient();

  let targetEmail = inputStr.toLowerCase();

  // Jika input bukan email (tidak ada '@'), cari email dari username
  if (!targetEmail.includes("@")) {
    const { data: memberData, error: searchError } = await supabaseAdmin
      .from("members")
      .select("email")
      .eq("username", targetEmail)
      .maybeSingle();

    if (searchError || !memberData?.email) {
      return { success: false, error: `Username "${inputStr}" tidak ditemukan.` };
    }
    targetEmail = memberData.email.toLowerCase();
  } else {
    // Pastikan email terdaftar di tabel members
    const { data: memberData } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("email", targetEmail)
      .maybeSingle();

    if (!memberData) {
      // Jangan bocorkan bahwa email tidak terdaftar (pencegahan email enumeration)
      return { success: true, email: targetEmail };
    }
  }

  const headersList = await headers();
  const origin = getPublicOrigin(null, headersList);

  // Generate link recovery menggunakan Supabase Admin API
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: targetEmail,
    options: {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    },
  });

  if (linkError) {
    console.error("Generate recovery link error:", linkError);
    return { success: false, error: `Gagal membuat link reset password: ${linkError.message}` };
  }

  const hashedToken = linkData?.properties?.hashed_token;
  const actionLink = hashedToken
    ? `${origin}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=/reset-password`
    : linkData?.properties?.action_link;

  if (!actionLink) {
    return { success: false, error: "Gagal membuat link verifikasi reset password." };
  }

  // Kirim email notifikasi via Nodemailer SMTP
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

      const changeTime = new Date().toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      });

      await transporter.sendMail({
        from: `"Panggung Kreator Security" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: "🔑 Permintaan Reset Password - Panggung Kreator",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
              <span style="font-size: 11px; color: #6b7280; font-family: monospace;">PERMINTAAN RESET PASSWORD</span>
            </div>

            <h3 style="color: #111; font-size: 16px; margin-top: 0;">Reset Password Akun Anda</h3>
            
            <p style="font-size: 12px; line-height: 1.6; color: #374151;">
              Kami menerima permintaan untuk mereset kata sandi (password) akun <strong>${targetEmail}</strong>.
            </p>

            <div style="margin: 28px 0; text-align: center;">
              <a href="${actionLink}" 
                 style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 0px; font-weight: 700; font-size: 13px; font-family: monospace; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                RESET PASSWORD SAYA &rarr;
              </a>
            </div>

            <div style="background-color: #fffbe6; border: 1px solid #fde68a; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                ⏰ <strong>Masa Kedaluwarsa:</strong> Link verifikasi di atas berlaku terbatas. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan password Anda akan tetap aman.
              </p>
            </div>

            <p style="font-size: 11px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 16px; font-family: monospace;">
              Jika tombol di atas tidak dapat diklik, salin & tempel link berikut di browser Anda:<br />
              <a href="${actionLink}" style="color: #4b5563; word-break: break-all;">${actionLink}</a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Gagal mengirim email reset password via SMTP:", emailErr);
    }
  }

  return { success: true, email: targetEmail };
}

export async function checkRecoverySessionAction() {
  try {
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map((c) => c.name);
    console.log(`[CHECK RECOVERY ACTION] cookies present: ${cookieNames.join(", ") || "(none)"}`);

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log(`[CHECK RECOVERY ACTION] getUser result: user=${user?.email || "null"}, error=${error?.message || "none"}`);

    if (error || !user) {
      return { hasSession: false, error: error?.message };
    }
    return { hasSession: true, email: user.email };
  } catch (err: any) {
    console.error("[CHECK RECOVERY ACTION] exception:", err);
    return { hasSession: false, error: err?.message };
  }
}

export async function resetPasswordAction(newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password baru minimal 8 karakter." };
  }

  try {
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map((c) => c.name);
    console.log(`[RESET PWD ACTION] cookies present: ${cookieNames.join(", ") || "(none)"}`);

    const supabase = await createClient();
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    console.log(`[RESET PWD ACTION] current user: ${user?.email || "null"}, getUserError: ${getUserError?.message || "none"}`);

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    console.log(`[RESET PWD ACTION] updateUser result: user=${updateData?.user?.email || "null"}, updateError=${updateError?.message || "none"}`);

    if (updateError) {
      console.error("[RESET PWD ACTION] updateUser error:", updateError);
      return { success: false, error: updateError.message || "Gagal memperbarui password." };
    }

    // Global Sign-Out untuk keamanan
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (soErr) {
      console.warn("Global signout error during reset password:", soErr);
    }

    // Bersihkan secara eksplisit seluruh cookie auth dan recovery mode dari header server
    try {
      const allCookies = cookieStore.getAll();
      allCookies.forEach((c) => {
        if (
          c.name.startsWith("sb-") ||
          c.name.includes("auth") ||
          c.name.includes("token") ||
          c.name.includes("session") ||
          c.name.includes("recovery")
        ) {
          cookieStore.set({
            name: c.name,
            value: "",
            maxAge: 0,
            path: "/",
          });
        }
      });
    } catch (_) {}

    return { success: true };
  } catch (err: any) {
    console.error("[RESET PWD ACTION] exception:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan pada server." };
  }
}

