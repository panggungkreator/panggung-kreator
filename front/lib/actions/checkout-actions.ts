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
  packageId?: string;
  usedVoucherCode?: string;
  finalPrice?: number;
};

export async function validateVoucherAction(code: string) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return ""; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !voucher) {
      return { success: false, error: "Kode voucher tidak valid atau tidak ditemukan." };
    }

    if (!voucher.is_active) {
      return { success: false, error: "Kode voucher sudah tidak aktif." };
    }

    if (voucher.max_uses > 0 && voucher.current_uses >= voucher.max_uses) {
      return { success: false, error: "Batas penggunaan kode voucher ini sudah habis." };
    }

    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return { success: false, error: "Kode voucher sudah kadaluarsa." };
    }

    return { 
      success: true, 
      discount_type: voucher.discount_type, 
      discount_value: voucher.discount_value 
    };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan sistem saat memvalidasi voucher." };
  }
}

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
      } else if (authError.message.toLowerCase().includes("already registered") || authError.message.toLowerCase().includes("already exists")) {
        friendlyError = "Email sudah terdaftar. Jika sebelumnya Anda belum menyelesaikan pembayaran dan sesi telah habis, silakan hubungi Admin untuk bantuan.";
      }
      return { success: false, error: friendlyError };
    }

    const user = authData?.user;
    if (!user) {
      return { success: false, error: "Gagal membuat akun autentikasi." };
    }

    // Determine Base Price from Package
    let validBasePrice = 49000;
    if (payload.packageId) {
      const { data: pkg } = await supabaseAdmin
        .from("packages")
        .select("price")
        .eq("id", payload.packageId)
        .single();
      
      if (pkg?.price) {
        const parsed = parseInt(pkg.price.replace(/\D/g, ""), 10);
        if (!isNaN(parsed)) {
          validBasePrice = parsed;
        }
      }
    }

    // Server-side recalculate finalPrice if voucher is used to prevent tampering
    let validFinalPrice = validBasePrice;
    if (payload.usedVoucherCode) {
      const { data: voucher } = await supabaseAdmin
        .from("vouchers")
        .select("*")
        .eq("code", payload.usedVoucherCode)
        .single();
      
      if (voucher && voucher.is_active && (voucher.max_uses === 0 || voucher.current_uses < voucher.max_uses)) {
        if (voucher.discount_type === 'nominal') {
          validFinalPrice = Math.max(0, validBasePrice - voucher.discount_value);
        } else if (voucher.discount_type === 'percentage') {
          validFinalPrice = Math.max(0, validBasePrice - (validBasePrice * voucher.discount_value / 100));
        }

        // Increment current_uses
        await supabaseAdmin
          .from("vouchers")
          .update({ current_uses: voucher.current_uses + 1 })
          .eq("id", voucher.id);
      } else {
        // Fallback if voucher is invalid at the last moment
        return { success: false, error: "Voucher yang Anda gunakan sudah tidak berlaku atau kuota habis." };
      }
    }

    // 3. Generate Unique Code (100 - 999) if price is greater than 0
    const uniqueCode = validFinalPrice > 0 ? Math.floor(100 + Math.random() * 900) : 0;
    const finalPriceWithUniqueCode = validFinalPrice > 0 ? validFinalPrice + uniqueCode : 0;

    // Generate order ID
    const orderId = `PK-AKAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Save Member Details to Database (using admin client to bypass RLS)
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
        payment_status: 'pending',
        role: 'member',
        used_voucher_code: payload.usedVoucherCode || null,
        package_id: payload.packageId || null,
        final_price: finalPriceWithUniqueCode,
        payment_order_id: orderId
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return { success: false, error: dbError.message };
    }

    // Get voucher ID if applicable
    let voucherId = null;
    if (payload.usedVoucherCode) {
      const { data: voucher } = await supabaseAdmin
        .from("vouchers")
        .select("id")
        .eq("code", payload.usedVoucherCode)
        .maybeSingle();
      if (voucher) {
        voucherId = voucher.id;
      }
    }

    // Save Transaction Details to Database
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .insert({
        member_id: user.id,
        package_id: payload.packageId || null,
        voucher_id: voucherId,
        order_id: orderId,
        status: 'pending',
        gross_amount: validBasePrice,
        final_amount: finalPriceWithUniqueCode,
        discount_amount: validBasePrice - validFinalPrice,
        unique_code: uniqueCode,
        payment_method: 'Transfer Bank'
      });

    if (txError) {
      console.error("Transaction insert error:", txError);
      return { success: false, error: txError.message };
    }

    // 5. Sign in the user on the cookie-based client so their session is persisted on the client browser
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
      password: generatedPassword,
      finalPrice: finalPriceWithUniqueCode,
      uniqueCode: uniqueCode
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
      .select("email, username, full_name")
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
              <p>Silakan klik tombol di bawah ini untuk bergabung dengan Grup WhatsApp Akademi:</p>
              <div style="margin: 30px 0;">
                <a href="https://chat.whatsapp.com/JrJ9oXeYmdG4zC40HXMXjt" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Gabung ke Grup WhatsApp</a>
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

export async function deleteMembersAction(memberIds: string[]) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
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
      return { success: false, error: "Hanya admin yang diperbolehkan menghapus data." };
    }

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

    // Loop through each member id to delete auth account and member record
    // Note: If members table has ON DELETE CASCADE from auth.users, deleting auth user is enough.
    // However, we will delete auth.user which should cascade if setup correctly, 
    // or we delete both explicitly.
    for (const id of memberIds) {
      // Delete member record first (just in case cascade is not set)
      await supabaseAdmin.from("members").delete().eq("id", id);
      // Delete auth user
      await supabaseAdmin.auth.admin.deleteUser(id);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete members error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menghapus data." };
  }
}

