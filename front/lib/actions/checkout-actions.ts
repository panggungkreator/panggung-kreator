"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";

type OnboardingPayload = {
  full_name: string;
  stage_name: string;
  birth_place: string;
  birth_date: string;
  whatsapp_number: string;
  instagram_username: string;
  occupation: string;
};

export async function submitOnboardingData(payload: OnboardingPayload) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Get current user session
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return { success: false, error: "Sesi tidak ditemukan atau kadaluarsa. Silakan login kembali." };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Check if user already exists in members table
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("id", userId)
      .single();

    let dbError;
    let generatedDescription = "";

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `Buatkan deskripsi singkat dan elegan (maksimal 3 kalimat) dalam bahasa Indonesia tentang seorang kreator dengan nama panggung "${payload.stage_name}". Dia lahir di ${payload.birth_place} pada tanggal ${payload.birth_date}. Pekerjaannya saat ini adalah ${payload.occupation}. Buat deskripsinya profesional, kreatif, dan cocok untuk profil portfolio. Jangan menggunakan kata sapaan atau penjelasan tambahan, langsung berikan deskripsinya.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 150,
      });

      generatedDescription = chatCompletion.choices[0]?.message?.content?.trim() || "";
    } catch (groqError) {
      console.error("Groq generation failed:", groqError);
      generatedDescription = `${payload.occupation} yang berbakat dari ${payload.birth_place}. Dikenal dengan nama panggung ${payload.stage_name}.`;
    }

    if (existingMember) {
      // Update existing record
      const { error } = await supabase
        .from("members")
        .update({
          full_name: payload.full_name,
          stage_name: payload.stage_name,
          birth_place: payload.birth_place,
          birth_date: payload.birth_date,
          whatsapp_number: payload.whatsapp_number,
          instagram_username: payload.instagram_username,
          occupation: payload.occupation,
          description: generatedDescription,
          email: userEmail,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      dbError = error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from("members")
        .insert({
          id: userId,
          full_name: payload.full_name,
          stage_name: payload.stage_name,
          birth_place: payload.birth_place,
          birth_date: payload.birth_date,
          whatsapp_number: payload.whatsapp_number,
          instagram_username: payload.instagram_username,
          occupation: payload.occupation,
          description: generatedDescription,
          email: userEmail,
        });
      dbError = error;
    }

    if (dbError) {
      console.error("Database error:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true };

  } catch (error) {
    console.error("Onboarding submission error:", error);
    return { success: false, error: "Terjadi kesalahan internal server." };
  }
}

type CheckoutPayload = {
  fullName: string;
  stageName: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  email: string;
  profession: string;
};

export async function registerMemberAction(payload: CheckoutPayload) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // 1. Generate Username & Password
    const baseName = (payload.stageName || payload.fullName || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUsername = `${baseName}${randomSuffix}`;
    const generatedPassword = `Panggung${Math.floor(1000 + Math.random() * 9000)}!`;

    // Initialize Supabase Admin client with Service Role Key to bypass rate limits
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return ""; },
          set(name: string, value: string, options: any) {},
          remove(name: string, options: any) {},
        },
      }
    );

    // 2. Sign Up User using Supabase Auth Admin API (bypasses rate limit and email verification SMTP)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email.trim(),
      password: generatedPassword,
      email_confirm: true, // auto-confirm the email
    });

    if (authError) {
      console.error("Auth signUp error:", authError);
      let friendlyError = authError.message;
      if (authError.message.includes("rate limit exceeded")) {
        friendlyError = "Batas pendaftaran email terlampaui (rate limit Supabase). Silakan coba lagi nanti atau hubungi Admin.";
      }
      return { success: false, error: friendlyError };
    }

    const user = authData?.user;
    if (!user) {
      return { success: false, error: "Gagal membuat akun autentikasi." };
    }

    // 3. Save Member Details to Database (using admin client to bypass RLS)
    const { error: dbError } = await supabaseAdmin
      .from("members")
      .insert({
        id: user.id,
        full_name: payload.fullName,
        stage_name: payload.stageName,
        whatsapp_number: payload.whatsapp,
        email: payload.email.trim(),
        instagram_username: payload.instagram,
        tiktok_username: payload.tiktok,
        occupation: payload.profession,
        username: generatedUsername,
        temporary_password: generatedPassword,
        payment_status: 'pending',
        role: 'member'
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return { success: false, error: dbError.message };
    }

    // 4. Sign in the user on the cookie-based client so their session is persisted on the client browser
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email.trim(),
      password: generatedPassword,
    });

    if (signInError) {
      console.error("Sign in after registration failed:", signInError);
    }

    return {
      success: true,
      username: generatedUsername,
      password: generatedPassword
    };

  } catch (error: any) {
    console.error("Registration action error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan internal server." };
  }
}

export async function verifyMemberPaymentAction(memberId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Cek apakah user yang memanggil adalah admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Tidak diotorisasi" };
    }

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Hanya admin yang diperbolehkan memverifikasi pembayaran." };
    }

    // Fetch member details before updating
    const { data: memberToVerify, error: fetchError } = await supabase
      .from("members")
      .select("email, username, temporary_password, full_name")
      .eq("id", memberId)
      .single();

    if (fetchError || !memberToVerify) {
      return { success: false, error: "Gagal mengambil data member." };
    }

    // Update status
    const { error } = await supabase
      .from("members")
      .update({ payment_status: "paid" })
      .eq("id", memberId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Kirim Email Konfirmasi menggunakan Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: process.env.SMTP_SECURE === "false" ? false : true, // true untuk port 465, false untuk port lain
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Dapatkan origin untuk link login
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: memberToVerify.email,
          subject: "Pembayaran Terkonfirmasi - Panggung Kreator Akademi",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #bc151b;">Selamat, Pembayaran Anda Sudah Terkonfirmasi! 🎉</h2>
              <p>Halo <strong>${memberToVerify.full_name || "Kreator"}</strong>,</p>
              <p>Pembayaran Anda untuk bergabung di Panggung Kreator Akademi telah berhasil kami verifikasi.</p>
              <p>Berikut adalah detail akun Anda untuk masuk ke sistem:</p>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Username:</strong> ${memberToVerify.username}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> ${memberToVerify.temporary_password}</p>
              </div>
              <p>Silakan klik tautan di bawah ini untuk masuk ke akun Anda:</p>
              <div style="margin: 30px 0;">
                <a href="${appUrl}/login" style="background-color: #bc151b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login ke Dashboard</a>
              </div>
              <p style="font-size: 14px; color: #666;">Jika Anda mengalami kendala, silakan balas email ini untuk menghubungi tim support kami.</p>
              <p style="margin-top: 30px;">Salam hangat,<br/><strong>Tim Panggung Kreator</strong></p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Gagal mengirim email konfirmasi:", emailError);
      }
    } else {
      console.warn("SMTP_USER atau SMTP_PASS tidak ditemukan di .env, email konfirmasi tidak dikirim.");
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Terjadi kesalahan internal." };
  }
}
