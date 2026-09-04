"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import nodemailer from "nodemailer";
import {
  getReferralCommissionSettingsAction,
} from "./settings-actions";

export interface ReferralReward {
  id: string;
  transaction_id: string;
  referral_code_id: string | null;
  referrer_id: string;
  referred_id: string;
  reward_amount: number;
  status: "pending" | "confirmed" | "paid_out" | "cancelled";
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  referred_name?: string;
  package_name?: string;
  transaction_amount?: number;
}

/**
 * Validasi Kode Referral untuk Form Checkout (Real-time Validation)
 */
export async function validateReferralCodeAction(code: string) {
  try {
    if (!code || !code.trim()) {
      return { success: false, isValid: false, message: "Kode referral kosong.", error: "Kode referral kosong." };
    }

    const cleanCode = code.trim().toUpperCase();
    const supabaseAdmin = createServiceRoleClient();

    // 1. Cek di tabel referral_codes
    const { data: refCode, error } = await supabaseAdmin
      .from("referral_codes")
      .select("id, code, owner_member_id, is_active, max_usage, usage_count, default_reward")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!error && refCode) {
      if (!refCode.is_active) {
        return { success: false, isValid: false, message: "Kode referral tidak aktif.", error: "Kode referral tidak aktif." };
      }
      if (refCode.max_usage > 0 && refCode.usage_count >= refCode.max_usage) {
        return { success: false, isValid: false, message: "Kode referral sudah mencapai batas penggunaan.", error: "Kode referral sudah mencapai batas penggunaan." };
      }

      // Ambil nama pemilik kode
      const { data: owner } = await supabaseAdmin
        .from("members")
        .select("full_name, stage_name")
        .eq("id", refCode.owner_member_id)
        .single();

      const ownerName = owner?.stage_name || owner?.full_name || "Member Panggung Kreator";

      return {
        success: true,
        isValid: true,
        code: cleanCode,
        ownerName: ownerName,
        message: `Kode valid (Pemilik: ${ownerName})`,
        ownerId: refCode.owner_member_id,
        defaultReward: refCode.default_reward || 0,
      };
    }

    // 2. Fallback: Cek di tabel members kolom affiliate_code atau my_referral_code
    const { data: refMember } = await supabaseAdmin
      .from("members")
      .select("id, full_name, stage_name, affiliate_code, my_referral_code")
      .or(`affiliate_code.eq.${cleanCode},my_referral_code.eq.${cleanCode}`)
      .maybeSingle();

    if (refMember) {
      const ownerName = refMember.stage_name || refMember.full_name || "Member Panggung Kreator";
      return {
        success: true,
        isValid: true,
        code: cleanCode,
        ownerName: ownerName,
        message: `Kode valid (Pemilik: ${ownerName})`,
        ownerId: refMember.id,
        defaultReward: 10000,
      };
    }

    return { success: false, isValid: false, message: "Kode referral tidak ditemukan.", error: "Kode referral tidak ditemukan." };
  } catch (err: any) {
    console.error("Error validating referral code:", err);
    return { success: false, isValid: false, message: "Gagal memvalidasi kode referral.", error: "Gagal memvalidasi kode referral." };
  }
}

/**
 * Helper untuk mengirim email notifikasi reward ke pemilik kode referral
 */
export async function sendReferralRewardNotificationEmail({
  recipientEmail,
  recipientName,
  referralCode,
  newMemberName,
  packageName,
  finalAmount,
  rewardAmount,
  newBalance,
}: {
  recipientEmail: string;
  recipientName: string;
  referralCode: string;
  newMemberName: string;
  packageName: string;
  finalAmount: number;
  rewardAmount: number;
  newBalance: number;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER atau SMTP_PASS tidak diset, email notifikasi referral reward tidak dikirim.");
    return;
  }

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

    const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

    await transporter.sendMail({
      from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `🎉 Komisi Referral Masuk: ${formatRupiah(rewardAmount)} - Panggung Kreator`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; line-height: 1.6;">
          <div style="background-color: #bc151b; color: #ffffff; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold;">🎉 Komisi Referral Berhasil Masuk!</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">Ada member baru yang bergabung lewat kode referral Anda</p>
          </div>

          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
            <p style="font-size: 14px; margin-top: 0;">Halo <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #374151;">Kabar baik! Member baru baru saja menyelesaikan pendaftaran dan pembayarannya telah dikonfirmasi lunas oleh Admin.</p>

            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; tracking: 1px; color: #6b7280; font-weight: bold;">Detail Komisi Referral</h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Kode Referral:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right; font-family: monospace;">${referralCode}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Member Baru:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right;">${newMemberName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Paket Pendaftaran:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right;">${packageName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Nominal Pembayaran:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right;">${formatRupiah(finalAmount)}</td>
                </tr>
                <tr style="border-top: 1px border #e5e7eb;">
                  <td style="padding: 8px 0 4px 0; color: #16a34a; font-weight: bold;">Reward Ditambahkan:</td>
                  <td style="padding: 8px 0 4px 0; font-weight: bold; text-align: right; color: #16a34a; font-size: 15px;">+${formatRupiah(rewardAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #111827; font-weight: bold;">Total Saldo Komisi Saat Ini:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #111827; font-size: 15px;">${formatRupiah(newBalance)}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #4b5563;">
              Saldo komisi Anda dapat digunakan sebagai potongan harga untuk langganan berikutnya atau dicairkan melalui dashboard profil Anda.
            </p>

            <div style="margin-top: 24px; pt-16 border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">Terima kasih telah membantu memperluas komunitas Panggung Kreator! 🙏</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Gagal mengirim email notifikasi referral reward:", emailErr);
  }
}

/**
 * Konfirmasi pembayaran oleh admin sekaligus mencatat reward referral dinamis
 */
export async function confirmPaymentWithRewardAction({
  transactionId,
  rewardAmount = 0,
  notes = "",
}: {
  transactionId: string;
  rewardAmount?: number;
  notes?: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Verifikasi Admin Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: "Tidak diotorisasi. Silakan login kembali." };
    }

    const { data: currentAdmin } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== "admin") {
      return { success: false, error: "Hanya admin yang diperbolehkan memverifikasi pembayaran." };
    }

    const supabaseAdmin = createServiceRoleClient();

    // 2. Ambil data transaksi beserta relasi member & package
    const { data: tx, error: fetchTxError } = await supabaseAdmin
      .from("transactions")
      .select(`
        id,
        member_id,
        package_id,
        referral_code,
        referred_by_id,
        final_amount,
        status,
        members:member_id (
          id,
          full_name,
          stage_name,
          email,
          username,
          temporary_password,
          referred_by,
          referred_by_member_id
        ),
        packages:package_id (
          id,
          name,
          tier
        )
      `)
      .eq("id", transactionId)
      .single();

    if (fetchTxError || !tx) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    if (tx.status === "paid") {
      return { success: false, error: "Transaksi ini sudah dikonfirmasi lunas sebelumnya." };
    }

    const nowStr = new Date().toISOString();
    const payingMember = tx.members as any;
    const pkg = tx.packages as any;

    // Resolve Referrer ID with multiple fallbacks
    let referrerId: string | null = tx.referred_by_id;

    if (!referrerId && payingMember) {
      referrerId = payingMember.referred_by || payingMember.referred_by_member_id || null;
    }

    if (!referrerId && tx.referral_code) {
      const { data: rc } = await supabaseAdmin
        .from("referral_codes")
        .select("owner_member_id")
        .eq("code", tx.referral_code)
        .maybeSingle();

      if (rc?.owner_member_id) {
        referrerId = rc.owner_member_id;
      } else {
        const { data: refMem } = await supabaseAdmin
          .from("members")
          .select("id")
          .or(`affiliate_code.eq.${tx.referral_code},my_referral_code.eq.${tx.referral_code}`)
          .maybeSingle();
        if (refMem?.id) {
          referrerId = refMem.id;
        }
      }
    }

    // Hitung besaran reward jika cleanRewardAmount masih 0 tapi ada referrer/kode referral
    let cleanRewardAmount = Math.max(0, Number(rewardAmount) || 0);

    if (cleanRewardAmount === 0 && (referrerId || tx.referral_code)) {
      if (tx.referral_code) {
        const { data: rc } = await supabaseAdmin
          .from("referral_codes")
          .select("default_reward")
          .eq("code", tx.referral_code)
          .maybeSingle();
        if (rc?.default_reward && Number(rc.default_reward) > 0) {
          cleanRewardAmount = Number(rc.default_reward);
        }
      }

      if (cleanRewardAmount === 0) {
        const settings = await getReferralCommissionSettingsAction();
        if (settings.mode === "percentage") {
          const pct = parseFloat(settings.percentage) || 10;
          cleanRewardAmount = Math.round((Number(tx.final_amount || 0) * pct) / 100);
        } else {
          cleanRewardAmount = parseInt(settings.flatAmount.replace(/\D/g, ""), 10) || 10000;
        }
      }
    }

    // 3. Update status transaksi
    const { error: updateTxError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: "paid",
        paid_at: nowStr,
        commission_earned: cleanRewardAmount,
        referred_by_id: referrerId || tx.referred_by_id,
      })
      .eq("id", tx.id);

    if (updateTxError) {
      return { success: false, error: `Gagal memperbarui transaksi: ${updateTxError.message}` };
    }

    // 4. Update status & membership_tier member yang mendaftar
    const targetTier = pkg?.tier || "membership";
    const updateMemberPayload: any = {
      payment_status: "paid",
      membership_tier: targetTier,
      tier_changed_at: nowStr,
      tier_changed_by: session.user.id,
    };

    if (referrerId) {
      updateMemberPayload.referred_by = referrerId;
      updateMemberPayload.referred_by_member_id = referrerId;
    }

    const { error: updateMemberError } = await supabaseAdmin
      .from("members")
      .update(updateMemberPayload)
      .eq("id", tx.member_id);

    if (updateMemberError) {
      console.error("Gagal upgrade tier member:", updateMemberError);
    }

    // 5. Proses Komisi Referral jika ada referrer
    let referrerMember: any = null;
    let newReferrerBalance = 0;

    if (referrerId) {
      // Ambil data referrer
      const { data: refUser } = await supabaseAdmin
        .from("members")
        .select("id, full_name, stage_name, email, commission_balance")
        .eq("id", referrerId)
        .single();

      if (refUser) {
        referrerMember = refUser;
        const currentBalance = Number(refUser.commission_balance || 0);
        newReferrerBalance = currentBalance + cleanRewardAmount;

        // Ambil ID referral_codes jika ada
        let referralCodeId: string | null = null;
        if (tx.referral_code) {
          const { data: rc } = await supabaseAdmin
            .from("referral_codes")
            .select("id, total_revenue")
            .eq("code", tx.referral_code)
            .maybeSingle();

          if (rc) {
            referralCodeId = rc.id;
            await supabaseAdmin
              .from("referral_codes")
              .update({
                total_revenue: Number(rc.total_revenue || 0) + Number(tx.final_amount || 0),
                updated_at: nowStr,
              })
              .eq("id", rc.id);
          }
        }

        // Catat ke referral_rewards
        const { data: rewardRecord, error: rewardErr } = await supabaseAdmin
          .from("referral_rewards")
          .insert({
            transaction_id: tx.id,
            referral_code_id: referralCodeId,
            referrer_id: refUser.id,
            referred_id: tx.member_id,
            reward_amount: cleanRewardAmount,
            status: "confirmed",
            confirmed_by: session.user.id,
            confirmed_at: nowStr,
            notes: notes || null,
          })
          .select("id")
          .single();

        if (rewardErr) {
          console.error("Gagal mencatat referral_rewards:", rewardErr);
        }

        // Update commission_balance referrer jika reward > 0
        if (cleanRewardAmount > 0) {
          await supabaseAdmin
            .from("members")
            .update({
              commission_balance: newReferrerBalance,
            })
            .eq("id", refUser.id);

          // Catat ke commission_ledger
          await supabaseAdmin
            .from("commission_ledger")
            .insert({
              member_id: refUser.id,
              type: "credit",
              amount: cleanRewardAmount,
              balance_after: newReferrerBalance,
              source: "referral_reward",
              reference_id: rewardRecord?.id || tx.id,
              description: `Komisi referral dari pendaftaran ${payingMember?.full_name || "member"}`,
              created_by: session.user.id,
            });
        }

        // Kirim email notifikasi reward ke referrer
        if (refUser.email) {
          sendReferralRewardNotificationEmail({
            recipientEmail: refUser.email,
            recipientName: refUser.stage_name || refUser.full_name || "Kreator",
            referralCode: tx.referral_code || "KODE REFERRAL",
            newMemberName: payingMember?.full_name || "Member Baru",
            packageName: pkg?.name || "Akademi Membership",
            finalAmount: Number(tx.final_amount || 0),
            rewardAmount: cleanRewardAmount,
            newBalance: newReferrerBalance,
          }).catch((err) => console.error("Error email reward notification:", err));
        }
      }
    }

    // 6. Kirim email konfirmasi ke member yang mendaftar
    if (payingMember?.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        let finalPassword = payingMember.temporary_password;

        if (!finalPassword) {
          finalPassword = `Panggung${Math.floor(1000 + Math.random() * 9000)}!`;
          try {
            await supabaseAdmin.auth.admin.updateUserById(payingMember.id, {
              password: finalPassword,
            });
            await supabaseAdmin
              .from("members")
              .update({ temporary_password: finalPassword })
              .eq("id", payingMember.id);
          } catch (passErr) {
            console.warn("Gagal update password member:", passErr);
          }
        }

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
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://panggungkreator.web.id";
        const loginUrl = `${appUrl.replace(/\/+$/, "")}/login`;
        const memberName = payingMember.stage_name || payingMember.full_name || "Kreator";
        const memberUsername = payingMember.username || payingMember.email;

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: payingMember.email,
          subject: "Pembayaran Terkonfirmasi & Kredensial Akun - Panggung Kreator",
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 20px;">
              <div style="background-color: #18181b; color: #ffffff; padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
                  Panggung Kreator
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">
                  Pembayaran Terkonfirmasi & Akses Akun Akademi
                </p>
              </div>

              <div style="background-color: #ffffff; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="color: #bc151b; margin-top: 0; font-size: 18px;">Selamat, Pembayaran Anda Sudah Terkonfirmasi! 🎉</h2>
                <p style="font-size: 15px; color: #334155; margin-top: 0;">
                  Halo <strong>${memberName}</strong>,
                </p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  Pembayaran Anda untuk bergabung di <strong>Panggung Kreator Akademi</strong> telah berhasil kami verifikasi. Akun Anda kini telah aktif sepenuhnya. Berikut adalah informasi kredensial untuk login ke platform:
                </p>

                <!-- CREDENTIAL BOX -->
                <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    🔑 KREDENSIAL LOGIN ANDA
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Email:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${payingMember.email}</td>
                    </tr>
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Username:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${memberUsername}</td>
                    </tr>
                    <tr>
                      <td style="width: 100px; color: #64748b; padding: 6px 0; font-weight: 600;">Password:</td>
                      <td style="color: #0f172a; padding: 6px 0; font-weight: 700;">${finalPassword}</td>
                    </tr>
                  </table>
                </div>

                <!-- LOGIN BUTTON -->
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
                    Masuk ke Akun Saya &rarr;
                  </a>
                </div>

                <!-- WHATSAPP GROUP SECTION -->
                <div style="margin: 28px 0; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #166534;">
                    Silakan klik tombol di bawah ini untuk bergabung dengan Grup WhatsApp Akademi:
                  </p>
                  <a href="https://chat.whatsapp.com/JrJ9oXeYmdG4zC40HXMXjt" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Gabung ke Grup WhatsApp
                  </a>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  Jika Anda mengalami kendala atau membutuhkan bantuan, silakan balas email ini untuk menghubungi tim support kami.
                </p>

                <p style="margin-top: 20px; font-size: 13px; color: #334155;">
                  Salam hangat,<br/>
                  <strong>Tim Panggung Kreator</strong>
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Gagal mengirim email konfirmasi pembeli:", emailErr);
      }
    }

    return {
      success: true,
      rewardRecorded: !!referrerMember,
      rewardAmount: cleanRewardAmount,
      referrerName: referrerMember?.stage_name || referrerMember?.full_name || null,
    };
  } catch (error: any) {
    console.error("Error in confirmPaymentWithRewardAction:", error);
    return { success: false, error: error.message || "Terjadi kesalahan internal server." };
  }
}

/**
 * Admin Action: Mengambil seluruh referral codes untuk dikelola di dashboard admin
 */
export async function getAdminReferralCodesAction() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: "Tidak diotorisasi." };
    }

    const supabaseAdmin = createServiceRoleClient();
    const { data, error } = await supabaseAdmin
      .from("referral_codes")
      .select(`
        id,
        code,
        owner_member_id,
        description,
        is_active,
        usage_count,
        max_usage,
        total_revenue,
        default_reward,
        created_at,
        updated_at,
        members:owner_member_id (
          id,
          full_name,
          email,
          stage_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengambil data referral codes." };
  }
}

/**
 * Admin Action: Membuat / Mengubah Kode Referral
 */
export async function upsertReferralCodeAction({
  id,
  code,
  ownerMemberId,
  description,
  isActive = true,
  maxUsage = 0,
  defaultReward = 0,
}: {
  id?: string;
  code: string;
  ownerMemberId: string;
  description?: string;
  isActive?: boolean;
  maxUsage?: number;
  defaultReward?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { success: false, error: "Tidak diotorisasi." };

    const supabaseAdmin = createServiceRoleClient();
    const cleanCode = code.trim().toUpperCase();

    if (id) {
      // Update
      const { error } = await supabaseAdmin
        .from("referral_codes")
        .update({
          code: cleanCode,
          owner_member_id: ownerMemberId,
          description: description || null,
          is_active: isActive,
          max_usage: maxUsage,
          default_reward: defaultReward,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return { success: false, error: error.message };
    } else {
      // Create
      const { error } = await supabaseAdmin
        .from("referral_codes")
        .insert({
          code: cleanCode,
          owner_member_id: ownerMemberId,
          description: description || null,
          is_active: isActive,
          max_usage: maxUsage,
          default_reward: defaultReward,
        });

      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan kode referral." };
  }
}

/**
 * Admin Action: Toggle status aktif kode referral
 */
export async function toggleReferralCodeStatusAction(id: string, currentStatus: boolean) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const { error } = await supabaseAdmin
      .from("referral_codes")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status." };
  }
}

/**
 * Admin Action: Memproses Pencairan Saldo Komisi (Cash Out)
 */
export async function processCashoutAction({
  memberId,
  amount,
  notes,
}: {
  memberId: string;
  amount: number;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { success: false, error: "Tidak diotorisasi." };

    const supabaseAdmin = createServiceRoleClient();
    const cleanAmount = Number(amount);

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return { success: false, error: "Nominal pencairan tidak valid." };
    }

    // Ambil data member
    const { data: member, error: memberErr } = await supabaseAdmin
      .from("members")
      .select("id, commission_balance, full_name")
      .eq("id", memberId)
      .single();

    if (memberErr || !member) {
      return { success: false, error: "Member tidak ditemukan." };
    }

    const currentBalance = Number(member.commission_balance || 0);
    if (currentBalance < cleanAmount) {
      return { success: false, error: "Saldo komisi member tidak mencukupi untuk pencairan ini." };
    }

    const newBalance = currentBalance - cleanAmount;

    // Update balance
    await supabaseAdmin
      .from("members")
      .update({ commission_balance: newBalance })
      .eq("id", member.id);

    // Catat ke commission_ledger
    await supabaseAdmin
      .from("commission_ledger")
      .insert({
        member_id: member.id,
        type: "debit",
        amount: cleanAmount,
        balance_after: newBalance,
        source: "cash_out",
        description: notes || `Pencairan dana komisi sebesar Rp ${cleanAmount.toLocaleString("id-ID")}`,
        created_by: session.user.id,
      });

    return { success: true, newBalance };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memproses pencairan dana." };
  }
}

/**
 * Member Action: Mengambil daftar teman yang bergabung menggunakan kode referral user
 */
export async function getReferredMembersAction() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, data: [] };
    }

    const supabaseAdmin = createServiceRoleClient();
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("id, full_name, email, membership_tier, created_at")
      .or(`referred_by.eq.${session.user.id},referred_by_member_id.eq.${session.user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching referred members:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getReferredMembersAction error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Member Action: Generate Kode Affiliate Unik
 * Logika: Kombinasi nama akun (username / stage_name / full_name) + 3-4 digit angka random
 * Contoh: BAGASKAWAN550 atau BAGAS842
 */
export async function generateAffiliateCodeAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login tidak valid. Silakan login kembali." };
    }

    const supabaseAdmin = createServiceRoleClient();

    // 1. Ambil data profil member
    const { data: member, error: memberError } = await supabaseAdmin
      .from("members")
      .select("id, username, full_name, stage_name, affiliate_code")
      .eq("id", user.id)
      .single();

    if (memberError || !member) {
      return { success: false, error: "Data member tidak ditemukan." };
    }

    // Jika member sudah memiliki kode affiliate, kembalikan kode yang sudah ada
    if (member.affiliate_code && member.affiliate_code.trim()) {
      return {
        success: true,
        affiliateCode: member.affiliate_code,
        alreadyExisted: true,
        message: "Kode affiliate sudah aktif.",
      };
    }

    // 2. Tentukan basis nama (username > stage_name > full_name)
    const rawBase = (member.username || member.stage_name || member.full_name || "MEMBER")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    const baseClean = (rawBase.length > 0 ? rawBase : "MEMBER").substring(0, 10);

    let finalCode = "";
    let isUnique = false;
    let attempts = 0;

    // 3. Generate dengan kombinasi 3-4 digit angka random (100 - 9999)
    while (!isUnique && attempts < 15) {
      attempts++;
      // Angka random 3 atau 4 digit
      const randomDigits = Math.floor(100 + Math.random() * 9900);
      const candidateCode = `${baseClean}${randomDigits}`;

      const [{ data: existingMember }, { data: existingRefCode }] = await Promise.all([
        supabaseAdmin
          .from("members")
          .select("id")
          .eq("affiliate_code", candidateCode)
          .maybeSingle(),
        supabaseAdmin
          .from("referral_codes")
          .select("id")
          .eq("code", candidateCode)
          .maybeSingle(),
      ]);

      if (!existingMember && !existingRefCode) {
        finalCode = candidateCode;
        isUnique = true;
      }
    }

    if (!finalCode) {
      finalCode = `${baseClean}${Date.now().toString().slice(-4)}`;
    }

    // 4. Update tabel members
    const { error: updateMemberError } = await supabaseAdmin
      .from("members")
      .update({
        affiliate_code: finalCode,
        my_referral_code: finalCode,
      })
      .eq("id", user.id);

    if (updateMemberError) {
      console.error("Error updating member affiliate_code:", updateMemberError);
      return { success: false, error: `Gagal menyimpan kode affiliate: ${updateMemberError.message}` };
    }

    // 5. Simpan juga ke tabel referral_codes untuk validasi multi-sistem
    try {
      await supabaseAdmin
        .from("referral_codes")
        .upsert(
          {
            code: finalCode,
            owner_member_id: user.id,
            description: `Kode Affiliate untuk ${member.stage_name || member.full_name || member.username || "Member"}`,
            is_active: true,
            max_usage: 0,
            default_reward: 10000,
          },
          { onConflict: "code" }
        );
    } catch (err) {
      console.warn("Notice: referral_codes upsert warning:", err);
    }

    return {
      success: true,
      affiliateCode: finalCode,
      alreadyExisted: false,
      message: "Kode affiliate berhasil dibuat!",
    };
  } catch (err: any) {
    console.error("generateAffiliateCodeAction error:", err);
    return { success: false, error: err.message || "Terjadi kesalahan pada server." };
  }
}

