"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  confirmPaymentWithRewardAction,
  sendReferralRewardNotificationEmail,
} from "./referral-actions";
import { getReferralCommissionSettingsAction } from "./settings-actions";

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

function cleanSocialUsername(val?: string | null): string | null {
  if (!val) return null;
  let cleaned = val.trim();
  if (!cleaned || cleaned === "-") return null;
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com\/@?)/i, "");
  cleaned = cleaned.split("?")[0].replace(/\/+$/, "");
  cleaned = cleaned.replace(/^@+/, "").trim();
  return cleaned || null;
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
  referralCode?: string;
  useReferralBalance?: number;
};

export async function validateVoucherAction(code: string) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return ""; },
          set() { },
          remove() { },
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
    const supabase = await createClient();

    // 1. Generate Username & Password
    const baseName = (payload.stageName || payload.fullName || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUsername = `${baseName}${randomSuffix}`;
    const generatedPassword = `Panggung${Math.floor(1000 + Math.random() * 9000)}!`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

    // Extract project ref & role from JWT key for server log diagnosis
    let keyRefInfo = "INVALID_JWT";
    try {
      if (key.includes(".")) {
        const payloadBase64 = key.split(".")[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
        keyRefInfo = `project_ref="${decoded.ref}" role="${decoded.role}"`;
      }
    } catch (e) {
      keyRefInfo = "PARSE_ERROR";
    }

    console.log(`[REGISTER DEBUG] Target URL: "${url}" | Key Info: ${keyRefInfo}`);

    // Validasi environment variables sebelum memanggil Admin API
    if (!url || !key) {
      console.error("[registerMemberAction] Missing env vars: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY tidak diset di production!");
      return { success: false, error: "Konfigurasi server tidak lengkap. Hubungi Admin." };
    }

    // Initialize Supabase Admin client using official service-role client
    const supabaseAdmin = createServiceRoleClient();

    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanWhatsapp = payload.whatsapp ? payload.whatsapp.trim() : "";

    // 1.5 Pre-submission validation: Check existing email or WhatsApp before calling createUser
    if (cleanEmail) {
      const { data: existingEmailMember } = await supabaseAdmin
        .from("members")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingEmailMember) {
        return {
          success: false,
          error: "Email ini sudah terdaftar. Silakan gunakan email lain atau hubungi Admin.",
        };
      }
    }

    if (cleanWhatsapp) {
      const { data: existingWaMember } = await supabaseAdmin
        .from("members")
        .select("id")
        .eq("whatsapp_number", cleanWhatsapp)
        .maybeSingle();

      if (existingWaMember) {
        return {
          success: false,
          error: "Nomor WhatsApp ini sudah terdaftar oleh akun lain. Gunakan nomor WhatsApp yang berbeda.",
        };
      }
    }

    // 2. Sign Up User using Supabase Auth Admin API (bypasses rate limit and email verification SMTP)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email.trim(),
      password: generatedPassword,
      email_confirm: true, // auto-confirm the email
      user_metadata: {
        full_name: payload.fullName,
        stage_name: payload.stageName || payload.fullName,
        whatsapp_number: payload.whatsapp,
        username: generatedUsername,
      },
    });

    if (authError) {
      const errorProps: Record<string, any> = {};
      Object.getOwnPropertyNames(authError).forEach((k) => {
        errorProps[k] = (authError as any)[k];
      });
      console.error("[REGISTER AUTH ERROR DETAILS]:", JSON.stringify(errorProps), `KeyRef: ${keyRefInfo}`);

      let friendlyError = authError.message;
      const lowerMsg = (authError.message || "").toLowerCase();

      if (lowerMsg.includes("rate limit")) {
        friendlyError = "Batas pendaftaran email terlampaui (rate limit Supabase). Silakan coba lagi nanti atau hubungi Admin.";
      } else if (lowerMsg.includes("already registered") || lowerMsg.includes("already exists")) {
        friendlyError = "Email sudah terdaftar. Jika sebelumnya Anda belum menyelesaikan pembayaran dan sesi telah habis, silakan hubungi Admin untuk bantuan.";
      } else if (authError.name === "AuthRetryableFetchError" || !friendlyError || friendlyError === "{}") {
        friendlyError = `Gagal terhubung ke Supabase Auth (Status ${authError.status || 500}). Periksa koneksi jaringan atau URL Supabase server.`;
      } else if (authError.status === 500) {
        friendlyError = `Supabase Auth Error (Status 500): ${authError.message}. Periksa konfigurasi API Key / DB Trigger di Supabase.`;
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

    // Handle Referral Code Validation & Attribution
    let referralOwnerId: string | null = null;
    let cleanReferralCode: string | null = null;

    if (payload.referralCode && payload.referralCode.trim()) {
      cleanReferralCode = payload.referralCode.trim().toUpperCase();

      const { data: refCode } = await supabaseAdmin
        .from("referral_codes")
        .select("id, owner_member_id, is_active, max_usage, usage_count")
        .eq("code", cleanReferralCode)
        .maybeSingle();

      if (refCode && refCode.is_active) {
        if (refCode.max_usage === 0 || refCode.usage_count < refCode.max_usage) {
          referralOwnerId = refCode.owner_member_id;

          // Panggil RPC function use_referral_code
          await supabaseAdmin.rpc("use_referral_code", {
            p_code: cleanReferralCode,
            p_member_id: user.id,
          });
        }
      } else {
        // Fallback: Jika kode tidak ada di referral_codes, cari di tabel members (affiliate_code / my_referral_code)
        const { data: refMember } = await supabaseAdmin
          .from("members")
          .select("id")
          .or(`affiliate_code.eq.${cleanReferralCode},my_referral_code.eq.${cleanReferralCode}`)
          .maybeSingle();

        if (refMember) {
          referralOwnerId = refMember.id;
        }
      }
    }

    // 3. Generate Unique Code (100 - 999) if price is greater than 0
    const uniqueCode = validFinalPrice > 0 ? Math.floor(100 + Math.random() * 900) : 0;
    const finalPriceWithUniqueCode = validFinalPrice > 0 ? validFinalPrice + uniqueCode : 0;

    // Generate order ID
    const orderId = `PK-AKAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cleanIg = cleanSocialUsername(payload.instagram);
    const cleanTt = cleanSocialUsername(payload.tiktok);

    // 4. Save/Update Member Details in Database (using upsert to support DB triggers and bypass RLS)
    const { error: dbError } = await supabaseAdmin
      .from("members")
      .upsert({
        id: user.id,
        full_name: payload.fullName.trim(),
        stage_name: (payload.stageName || payload.fullName).trim(),
        whatsapp_number: payload.whatsapp.trim(),
        email: payload.email.trim(),
        social_media: {
          instagram: cleanIg,
          tiktok: cleanTt,
        },
        occupation: payload.profession?.trim() || "Lainnya",
        username: generatedUsername,
        payment_status: 'pending',
        role: 'member',
        used_voucher_code: payload.usedVoucherCode || null,
        package_id: payload.packageId || null,
        final_price: finalPriceWithUniqueCode,
        payment_order_id: orderId,
        referred_by: referralOwnerId || null,
        referred_by_member_id: referralOwnerId || null,
      });

    if (dbError) {
      console.error("Database insert error:", dbError);

      // Rollback Auth user creation if DB insert fails to prevent orphaned Auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`[REGISTER ROLLBACK] Deleted orphaned Auth user ${user.id} due to DB error.`);
      } catch (rollbackErr) {
        console.error("[REGISTER ROLLBACK ERROR]: Failed to delete Auth user after DB error:", rollbackErr);
      }

      const dbErrMsg = dbError.message || "";
      if (dbErrMsg.includes("members_whatsapp_number_key") || (dbErrMsg.includes("duplicate key") && dbErrMsg.includes("whatsapp"))) {
        return { success: false, error: "Nomor WhatsApp ini sudah terdaftar oleh akun lain. Gunakan nomor WhatsApp yang berbeda atau hubungi Admin jika ini adalah kesalahan." };
      }
      if (dbErrMsg.includes("members_email_key") || (dbErrMsg.includes("duplicate key") && dbErrMsg.includes("email"))) {
        return { success: false, error: "Email ini sudah terdaftar. Silakan gunakan email lain atau hubungi Admin." };
      }
      if (dbErrMsg.includes("members_username_key") || (dbErrMsg.includes("duplicate key") && dbErrMsg.includes("username"))) {
        return { success: false, error: "Username yang dibuat secara otomatis sudah ada. Silakan coba daftar kembali." };
      }

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
        referral_code: cleanReferralCode || null,
        referred_by_id: referralOwnerId || null,
        affiliate_code_used: cleanReferralCode || null,
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
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`[REGISTER ROLLBACK] Deleted orphaned Auth user ${user.id} due to Transaction error.`);
      } catch (rollbackErr) {
        console.error("[REGISTER ROLLBACK ERROR]: Failed to delete Auth user after TX error:", rollbackErr);
      }
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

    // Send Registration & Payment Instruction Email via Nodemailer
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

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: payload.email.trim(),
          subject: "Instruksi Pembayaran & Kredensial Akun - Panggung Kreator Akademi",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
              <div style="background-color: #bc151b; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">Pendaftaran Berhasil Diproses! 🎉</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Satu langkah lagi untuk bergabung di Akademi</p>
              </div>
              <div style="padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
                <p>Halo <strong>${payload.fullName}</strong>,</p>
                <p>Terima kasih telah mendaftar di <strong>Panggung Kreator Akademi</strong>. Akun Anda telah berhasil dibuat dengan status <strong>Menunggu Pembayaran</strong>.</p>

                <!-- INSTRUKSI PEMBAYARAN -->
                <div style="border: 2px dashed #e2e8f0; padding: 20px; border-radius: 12px; margin: 25px 0; background-color: #fffdf5;">
                  <h3 style="margin-top: 0; color: #bc151b; font-size: 15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; text-transform: uppercase; tracking-wider: 1px;">💰 Rincian Transfer Manual (QRIS)</h3>
                  
                  <p style="font-size: 13px; margin: 10px 0;">Silakan lakukan transfer dengan nominal presisi berikut:</p>
                  
                  <div style="background-color: #fff; border: 1px solid #fef08a; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 15px;">
                    <span style="font-size: 12px; color: #713f12; font-weight: bold; display: block; margin-bottom: 5px;">TOTAL PEMBAYARAN</span>
                    <strong style="font-size: 24px; color: #bc151b; display: block; letter-spacing: 0.5px;">Rp ${finalPriceWithUniqueCode.toLocaleString('id-ID')}</strong>
                    ${uniqueCode > 0 ? `<span style="font-size: 11px; color: #16a34a; font-weight: bold; display: block; margin-top: 5px;">* Termasuk kode unik: Rp ${uniqueCode} (Wajib sama persis)</span>` : ''}
                  </div>

                  <h4 style="margin: 15px 0 8px 0; font-size: 13px; color: #334155;">Langkah Pembayaran & Verifikasi:</h4>
                  <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                    <li>Pindai QRIS Panggung Kreator pada layar checkout atau lakukan pembayaran ke QRIS resmi Panggung Kreator.</li>
                    <li>Transfer sebesar nominal di atas (harus sama persis hingga 3 digit terakhir).</li>
                    <li>Ambil tangkapan layar (screenshot) bukti pembayaran Anda.</li>
                    <li>Kirimkan bukti pembayaran ke WhatsApp Admin untuk verifikasi & aktivasi instan.</li>
                  </ol>
                </div>

                <!-- TOMBOL KONFIRMASI WA -->
                <div style="margin: 30px 0; text-align: center;">
                  <a href="https://wa.me/6281111156736?text=Halo%20Admin%20Panggung%20Kreator%2C%20saya%20sudah%20melakukan%20pembayaran%20pendaftaran%20Akademi.%20Berikut%20bukti%20transfernya.%0A%0AUsername%20Login%20Saya%3A%20${generatedUsername}" style="background-color: #25d366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Kirim Bukti Pembayaran ke WhatsApp</a>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">Jika Anda memiliki kendala atau pertanyaan, silakan balas email ini untuk menghubungi tim support kami.</p>
                
                <p style="margin-top: 20px; font-size: 13px; color: #334155;">
                  Salam hangat,<br/>
                  <strong>Tim Panggung Kreator</strong>
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Gagal mengirim email pendaftaran & instruksi pembayaran:", emailError);
      }
    } else {
      console.warn("SMTP_USER atau SMTP_PASS tidak diatur, email pendaftaran tidak terkirim.");
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
    const supabase = await createClient();

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

    const supabaseAdmin = createServiceRoleClient();

    // Cek apakah ada transaksi pending untuk member ini di tabel transactions
    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("id, status")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tx && tx.status !== "paid") {
      // Panggil confirmPaymentWithRewardAction agar alur komisi referral, ledger & email terpicu
      const confirmRes = await confirmPaymentWithRewardAction({
        transactionId: tx.id,
      });

      if (!confirmRes.success) {
        console.warn("confirmPaymentWithRewardAction warning:", confirmRes.error);
        // Fallback update payment_status jika ada kendala
        await supabaseAdmin
          .from("members")
          .update({ payment_status: "paid" })
          .eq("id", memberId);
      }
      return { success: true };
    }

    // Fallback jika tidak ada transaksi di tabel transactions
    const { data: memberToVerify, error: fetchError } = await supabaseAdmin
      .from("members")
      .select("id, email, username, full_name, referred_by, referred_by_member_id")
      .eq("id", memberId)
      .single();

    if (fetchError || !memberToVerify) {
      return { success: false, error: "Gagal mengambil data member." };
    }

    // Update status
    const { error } = await supabaseAdmin
      .from("members")
      .update({
        payment_status: "paid",
        membership_tier: "membership",
        tier_changed_at: new Date().toISOString(),
        tier_changed_by: session.user.id,
      })
      .eq("id", memberId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Jika member ini punya referrer, proses komisi referral & email
    const referrerId = memberToVerify.referred_by || memberToVerify.referred_by_member_id;
    if (referrerId) {
      const { data: refUser } = await supabaseAdmin
        .from("members")
        .select("id, full_name, stage_name, email, commission_balance")
        .eq("id", referrerId)
        .single();

      if (refUser) {
        const settings = await getReferralCommissionSettingsAction();
        const rewardAmount = parseInt(settings.flatAmount.replace(/\D/g, ""), 10) || 10000;
        const newBalance = Number(refUser.commission_balance || 0) + rewardAmount;

        await supabaseAdmin
          .from("members")
          .update({ commission_balance: newBalance })
          .eq("id", refUser.id);

        await supabaseAdmin
          .from("commission_ledger")
          .insert({
            member_id: refUser.id,
            type: "credit",
            amount: rewardAmount,
            balance_after: newBalance,
            source: "referral_reward",
            description: `Komisi referral dari pendaftaran ${memberToVerify.full_name || "member"}`,
            created_by: session.user.id,
          });

        if (refUser.email) {
          sendReferralRewardNotificationEmail({
            recipientEmail: refUser.email,
            recipientName: refUser.stage_name || refUser.full_name || "Kreator",
            referralCode: "KODE REFERRAL",
            newMemberName: memberToVerify.full_name || "Member Baru",
            packageName: "Akademi Membership",
            finalAmount: 49000,
            rewardAmount: rewardAmount,
            newBalance: newBalance,
          }).catch((err) => console.error("Error email reward notification:", err));
        }
      }
    }

    // Kirim Email Konfirmasi menggunakan Nodemailer ke pembeli
    if (process.env.SMTP_USER && process.env.SMTP_PASS && memberToVerify.email) {
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
          set(name: string, value: string, options: CookieOptions) { },
          remove(name: string, options: CookieOptions) { },
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

    const supabaseAdmin = createServiceRoleClient();

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

