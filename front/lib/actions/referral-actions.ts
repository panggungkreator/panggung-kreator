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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Tidak diotorisasi. Silakan login kembali." };
    }

    const { data: currentAdmin } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
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
        gross_amount,
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
      const settings = await getReferralCommissionSettingsAction();

      let customReward = 0;
      if (tx.referral_code) {
        const { data: rc } = await supabaseAdmin
          .from("referral_codes")
          .select("default_reward")
          .eq("code", tx.referral_code)
          .maybeSingle();
        if (rc?.default_reward && Number(rc.default_reward) > 0) {
          customReward = Number(rc.default_reward);
        }
      }

      if (customReward > 0) {
        cleanRewardAmount = customReward;
      } else {
        if (settings.mode === "percentage") {
          const pct = parseFloat(settings.percentage) || 30;
          // 1. Ambil nilai dasar dari harga produk murni (gross_amount) sebelum nomor unik
          let pureProductPrice = Number(tx.gross_amount) || 0;

          if (pureProductPrice <= 0) {
            const finalAmt = Number(tx.final_amount) || 0;
            const uniqueCode = finalAmt > 1000 ? finalAmt % 1000 : 0;
            pureProductPrice = Math.max(0, finalAmt - uniqueCode);
          }

          if (pureProductPrice <= 0) {
            pureProductPrice = 49000;
          }

          // 2. Hitung persentase komisi murni dari harga produk asli (tanpa nomor unik)
          cleanRewardAmount = Math.round((pureProductPrice * pct) / 100);
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
      tier_changed_by: user.id,
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
            confirmed_by: user.id,
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

          // Catat ke commission_ledger (status pending siap cair)
          await supabaseAdmin
            .from("commission_ledger")
            .insert({
              member_id: refUser.id,
              type: "pending",
              amount: cleanRewardAmount,
              balance_after: newReferrerBalance,
              source: "referral_reward",
              reference_id: rewardRecord?.id || tx.id,
              description: `Komisi referral dari pendaftaran ${payingMember?.full_name || "member"}`,
              created_by: user.id,
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

    // Log admin activity for Payment Confirmation
    try {
      const { logAdminActivity } = await import("@/lib/actions/log-actions");
      const payerName = payingMember?.stage_name || payingMember?.full_name || tx.member_id;
      await logAdminActivity({
        adminId: user.id,
        action: "CONFIRM_PAYMENT",
        module: "Payment",
        targetId: tx.id,
        description: `Mengonfirmasi pembayaran lunas transaksi #${tx.id.slice(0, 8)} (${payerName}) sebesar Rp ${Number(tx.final_amount || 0).toLocaleString("id-ID")}${referrerMember ? ` [Komisi Referral: Rp ${cleanRewardAmount.toLocaleString("id-ID")}]` : ""}`,
        oldData: { status: tx.status, final_amount: tx.final_amount, member_id: tx.member_id },
        newData: {
          status: "paid",
          paid_at: nowStr,
          commission_earned: cleanRewardAmount,
          member_tier: targetTier,
        },
      });
    } catch (logErr) {
      console.warn("Notice: Gagal mencatat log konfirmasi pembayaran:", logErr);
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
  * Member Action: Mengambil riwayat mutasi komisi & bukti transfer payout untuk user yang sedang login
  */
export async function getMyCommissionLedgerAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, data: [] };
    }

    const supabaseAdmin = createServiceRoleClient();

    // 1. Ambil mutasi komisi member dari tabel commission_ledger
    const { data: rawLedger, error: ledgerError } = await supabaseAdmin
      .from("commission_ledger")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    if (ledgerError) {
      console.error("Error fetching member commission ledger:", ledgerError);
      return { success: false, data: [] };
    }

    // 2. Ambil seluruh riwayat payouts member dari tabel affiliate_payouts
    const { data: rawPayouts } = await supabaseAdmin
      .from("affiliate_payouts")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    const payouts = rawPayouts || [];
    const latestPayout = payouts.find((p: any) => p.status === "completed");

    // 3. Ambil data referral_rewards dan referred members untuk melengkapi data teman yang diaffiliatekan
    const [{ data: rawRewards }, { data: rawReferredMembers }] = await Promise.all([
      supabaseAdmin
        .from("referral_rewards")
        .select(`
          id,
          transaction_id,
          referred_id,
          reward_amount,
          created_at,
          referred:members!referred_id (
            id,
            full_name,
            stage_name,
            email,
            membership_tier
          ),
          transaction:transactions!transaction_id (
            id,
            order_id,
            final_amount
          )
        `)
        .eq("referrer_id", user.id),
      supabaseAdmin
        .from("members")
        .select("id, full_name, stage_name, email, membership_tier, created_at")
        .or(`referred_by.eq.${user.id},referred_by_member_id.eq.${user.id}`),
    ]);

    const rewards = rawRewards || [];
    const referredMembers = rawReferredMembers || [];

    // 4. Gabungkan info payout & data teman yang diaffiliatekan ke tiap item ledger
    const enrichedLedger = (rawLedger || []).map((entry: any) => {
      let matchingPayout = null;
      if (entry.reference_id) {
        matchingPayout = payouts.find((p: any) => p.id === entry.reference_id);
      }
      if (!matchingPayout && entry.type === "paid") {
        matchingPayout = latestPayout;
      }

      // Cari data referral reward terkait
      let matchingReward: any = null;
      if (entry.reference_id) {
        matchingReward = rewards.find(
          (r: any) => r.id === entry.reference_id || r.transaction_id === entry.reference_id
        );
      }

      let referredMember: any = matchingReward?.referred;
      if (!referredMember && entry.source === "referral_reward") {
        if (entry.description) {
          referredMember = referredMembers.find((m: any) =>
            entry.description.toLowerCase().includes((m.full_name || "").toLowerCase()) ||
            (m.stage_name && entry.description.toLowerCase().includes(m.stage_name.toLowerCase()))
          );
        }
        if (!referredMember && referredMembers.length === 1) {
          referredMember = referredMembers[0];
        }
      }

      return {
        ...entry,
        paid_at: entry.type === "paid" ? (matchingPayout?.created_at || entry.created_at) : null,
        proof_url: matchingPayout?.proof_url || null,
        bank_name: matchingPayout?.bank_name || null,
        account_number: matchingPayout?.account_number || null,
        account_holder: matchingPayout?.account_holder || null,
        notes: matchingPayout?.notes || null,
        referred_member_name: referredMember?.stage_name || referredMember?.full_name || null,
        referred_member_email: referredMember?.email || null,
        referred_member_tier: referredMember?.membership_tier || null,
        order_id: matchingReward?.transaction?.order_id || null,
        transaction_amount: matchingReward?.transaction?.final_amount || null,
      };
    });

    return { success: true, data: enrichedLedger };
  } catch (err: any) {
    console.error("getMyCommissionLedgerAction error:", err);
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
            default_reward: 0,
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

/**
 * Admin Action: Mengambil data seluruh affiliator (saldo aktif & total pencairan), riwayat payout, dan seluruh mutasi komisi (ledger)
 */
export async function getAffiliatePayoutDataAction() {
  try {
    const supabaseAdmin = createServiceRoleClient();

    // 1. Ambil seluruh data members
    const { data: rawMembers, error: membersError } = await supabaseAdmin
      .from("members")
      .select(`
        id,
        full_name,
        stage_name,
        email,
        whatsapp_number,
        role,
        affiliate_code,
        commission_balance,
        created_at
      `)
      .order("commission_balance", { ascending: false });

    if (membersError) {
      console.error("Error fetching members for payout:", membersError);
      return { success: false, error: "Gagal mengambil data member." };
    }

    const membersMap = new Map<string, any>();
    (rawMembers || []).forEach((m: any) => {
      membersMap.set(m.id, m);
    });

    // 2. Ambil seluruh riwayat payout dari tabel affiliate_payouts
    const { data: rawPayouts, error: payoutsError } = await supabaseAdmin
      .from("affiliate_payouts")
      .select(`
        id,
        member_id,
        amount,
        bank_name,
        account_number,
        account_holder,
        proof_url,
        notes,
        status,
        confirmed_by,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (payoutsError) {
      console.error("Error fetching payouts history:", payoutsError);
    }

    const payouts = rawPayouts || [];

    // Hitung total paid per member
    const totalPaidByMember: Record<string, number> = {};
    payouts.forEach((p: any) => {
      if (p.status === "completed") {
        totalPaidByMember[p.member_id] = (totalPaidByMember[p.member_id] || 0) + Number(p.amount || 0);
      }
    });

    // 3. Ambil seluruh riwayat mutasi komisi dari tabel commission_ledger
    const { data: rawLedger, error: ledgerError } = await supabaseAdmin
      .from("commission_ledger")
      .select(`
        id,
        member_id,
        type,
        amount,
        balance_after,
        source,
        description,
        created_by,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (ledgerError) {
      console.error("Error fetching commission ledger:", ledgerError);
    }

    // Map tanggal produk terakhir berhasil diaffiliatekan
    const lastAffiliatedDateMap = new Map<string, string>();
    (rawLedger || []).forEach((entry: any) => {
      if (entry.type === "pending" || entry.type === "paid" || entry.type === "credit") {
        const existing = lastAffiliatedDateMap.get(entry.member_id);
        if (!existing || new Date(entry.created_at).getTime() > new Date(existing).getTime()) {
          lastAffiliatedDateMap.set(entry.member_id, entry.created_at);
        }
      }
    });

    const mutations = (rawLedger || []).map((entry: any) => {
      const targetMember = membersMap.get(entry.member_id);
      return {
        id: entry.id,
        member_id: entry.member_id,
        member_name: targetMember?.stage_name || targetMember?.full_name || "Member",
        member_email: targetMember?.email || "-",
        member_code: targetMember?.affiliate_code || "-",
        type: entry.type,
        amount: Number(entry.amount || 0),
        balance_after: Number(entry.balance_after || 0),
        source: entry.source || "referral_reward",
        description: entry.description || (entry.type === "paid" ? "Sudah Terbayar" : "Komisi Referral Masuk"),
        created_at: entry.created_at,
      };
    });

    // Cari member yang pernah ada di commission_ledger
    const membersWithLedger = new Set<string>((rawLedger || []).map((l: any) => l.member_id));

    // Format data affiliators:
    // Tampilkan siapa saja yang punya saldo komisi > 0, punya kode referral, ada di ledger, atau pernah payout
    const affiliators = (rawMembers || [])
      .filter((m: any) => {
        const bal = Number(m.commission_balance || 0);
        return bal > 0 || totalPaidByMember[m.id] || m.affiliate_code || membersWithLedger.has(m.id);
      })
      .map((m: any) => ({
        id: m.id,
        full_name: m.full_name || "Tanpa Nama",
        stage_name: m.stage_name || null,
        email: m.email || "-",
        phone_number: m.whatsapp_number || "-",
        affiliate_code: m.affiliate_code || "-",
        commission_balance: Number(m.commission_balance || 0),
        total_payout_paid: totalPaidByMember[m.id] || 0,
        joined_at: m.created_at,
        last_affiliated_at: lastAffiliatedDateMap.get(m.id) || null,
      }));

    // Format riwayat payouts
    const formattedPayouts = payouts.map((p: any) => {
      const targetMember = membersMap.get(p.member_id);
      const adminMember = p.confirmed_by ? membersMap.get(p.confirmed_by) : null;
      return {
        id: p.id,
        member_id: p.member_id,
        member_name: targetMember?.stage_name || targetMember?.full_name || "Affiliator",
        member_email: targetMember?.email || "-",
        member_code: targetMember?.affiliate_code || "-",
        amount: Number(p.amount || 0),
        bank_name: p.bank_name || "-",
        account_number: p.account_number || "-",
        account_holder: p.account_holder || "-",
        proof_url: p.proof_url || null,
        notes: p.notes || null,
        status: p.status || "completed",
        confirmed_by_name: adminMember?.stage_name || adminMember?.full_name || "Admin",
        created_at: p.created_at,
      };
    });

    // 4. Buat list transaksi affiliate murni hanya dari tabel commission_ledger (tanpa fallback legacy)
    const affiliateLedgerEntries = (rawLedger || []).filter((l: any) => l.type !== "debit");

    const transactionsList: any[] = affiliateLedgerEntries.map((entry: any) => {
      const targetMember = membersMap.get(entry.member_id);
      const currentBalance = Number(targetMember?.commission_balance || 0);
      const latestPayout = (payouts || []).find((p: any) => p.member_id === entry.member_id && p.status === "completed");
      const isPaid = entry.type === "paid" || (currentBalance <= 0 && !!latestPayout);

      return {
        id: entry.id,
        member_id: entry.member_id,
        member_name: targetMember?.stage_name || targetMember?.full_name || "Affiliator",
        stage_name: targetMember?.stage_name || null,
        full_name: targetMember?.full_name || "Affiliator",
        member_email: targetMember?.email || "-",
        member_code: targetMember?.affiliate_code || "-",
        phone_number: targetMember?.whatsapp_number || "-",
        affiliated_at: entry.created_at,
        commission_amount: Number(entry.amount || 0),
        member_balance: currentBalance,
        description: entry.description || "Komisi Referral Penjualan",
        is_paid: isPaid,
        paid_at: isPaid ? (latestPayout?.created_at || (entry.type === "paid" ? entry.created_at : null)) : null,
        payout_record: latestPayout || null,
      };
    });

    // Urutkan transaksi affiliate berdasarkan tanggal terbaru (descending)
    transactionsList.sort((a, b) => new Date(b.affiliated_at).getTime() - new Date(a.affiliated_at).getTime());

    return {
      success: true,
      data: {
        affiliators,
        payouts: formattedPayouts,
        mutations,
        transactions: transactionsList,
      },
    };
  } catch (err: any) {
    console.error("getAffiliatePayoutDataAction error:", err);
    return { success: false, error: err.message || "Gagal mengambil data payout affiliate." };
  }
}

/**
 * Admin Action: Memproses Konfirmasi Pembayaran Affiliate Manual (Payout)
 * Mendukung upload bukti transfer (proofUrl), pencatatan bank info, pemotongan saldo, dan audit ledger.
 */
export async function processAffiliatePayoutAction({
  memberId,
  amount,
  bankName,
  accountNumber,
  accountHolder,
  proofUrl,
  notes,
  ledgerId,
}: {
  memberId: string;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  proofUrl?: string | null;
  notes?: string;
  ledgerId?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Tidak diotorisasi. Silakan login kembali." };
    }

    const { data: currentAdmin } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== "admin") {
      return { success: false, error: "Hanya admin yang diperbolehkan memproses payout affiliate." };
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return { success: false, error: "Nominal pembayaran tidak valid." };
    }

    const supabaseAdmin = createServiceRoleClient();

    // 1. Ambil data member target & cek saldo
    const { data: member, error: memberErr } = await supabaseAdmin
      .from("members")
      .select("id, full_name, stage_name, email, commission_balance, affiliate_code")
      .eq("id", memberId)
      .single();

    if (memberErr || !member) {
      return { success: false, error: "Data affiliator tidak ditemukan." };
    }

    const currentBalance = Number(member.commission_balance || 0);
    const newBalance = Math.max(0, currentBalance - cleanAmount);
    const nowStr = new Date().toISOString();

    // 2. Simpan ke tabel affiliate_payouts
    const { data: payoutRecord, error: payoutInsertErr } = await supabaseAdmin
      .from("affiliate_payouts")
      .insert({
        member_id: member.id,
        amount: cleanAmount,
        bank_name: bankName?.trim() || null,
        account_number: accountNumber?.trim() || null,
        account_holder: accountHolder?.trim() || null,
        proof_url: proofUrl?.trim() || null,
        notes: notes?.trim() || null,
        status: "completed",
        confirmed_by: user.id,
        created_at: nowStr,
      })
      .select("id")
      .single();

    if (payoutInsertErr) {
      console.error("Gagal mencatat affiliate_payouts:", payoutInsertErr);
      return { success: false, error: `Gagal mencatat payout: ${payoutInsertErr.message}` };
    }

    // 3. Update commission_balance member
    const { error: updateBalanceErr } = await supabaseAdmin
      .from("members")
      .update({ commission_balance: newBalance })
      .eq("id", member.id);

    if (updateBalanceErr) {
      console.error("Gagal mengupdate commission_balance:", updateBalanceErr);
      return { success: false, error: `Gagal memperbarui saldo affiliator: ${updateBalanceErr.message}` };
    }

    // 4. Update status mutasi pending/credit menjadi paid di commission_ledger
    if (ledgerId && !ledgerId.startsWith("legacy-")) {
      await supabaseAdmin
        .from("commission_ledger")
        .update({ type: "paid" })
        .eq("id", ledgerId);
    } else {
      await supabaseAdmin
        .from("commission_ledger")
        .update({ type: "paid" })
        .eq("member_id", member.id)
        .in("type", ["pending", "credit"]);
    }

    // 5. Send automated email notification to the affiliate member
    if (member.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://panggungkreator.web.id";

        const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;
        const recipientName = member.stage_name || member.full_name || "Kreator";

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: member.email,
          subject: "🎉 Pembayaran Komisi Affiliate Berhasil - Panggung Kreator",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; line-height: 1.6;">
              <div style="background-color: #bc151b; color: #ffffff; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 20px; font-weight: bold;">🎉 Pembayaran Komisi Berhasil!</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">Dana komisi Anda telah dikirimkan oleh Admin</p>
              </div>

              <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
                <p style="font-size: 14px; margin-top: 0;">Halo <strong>${recipientName}</strong>,</p>
                <p style="font-size: 14px; color: #374151;">Kabar baik! Permintaan pencairan komisi (payout) Anda telah berhasil diproses dan dikirimkan oleh Admin ke rekening Anda.</p>

                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; tracking: 1px; color: #6b7280; font-weight: bold;">Detail Pembayaran</h3>
                  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Nominal Pembayaran:</td>
                      <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #16a34a; font-size: 15px;">${formatRupiah(cleanAmount)}</td>
                    </tr>
                    ${bankName ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Bank/E-Wallet:</td>
                      <td style="padding: 4px 0; font-weight: bold; text-align: right;">${bankName}</td>
                    </tr>
                    ` : ""}
                    ${accountNumber ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Nomor Rekening:</td>
                      <td style="padding: 4px 0; font-weight: bold; text-align: right; font-family: monospace;">${accountNumber}</td>
                    </tr>
                    ` : ""}
                    ${accountHolder ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Nama Pemilik:</td>
                      <td style="padding: 4px 0; font-weight: bold; text-align: right;">${accountHolder}</td>
                    </tr>
                    ` : ""}
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 8px 0 4px 0; color: #111827; font-weight: bold;">Sisa Saldo Komisi:</td>
                      <td style="padding: 8px 0 4px 0; font-weight: bold; text-align: right; color: #111827; font-size: 15px;">${formatRupiah(newBalance)}</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 13px; color: #4b5563;">
                  Silakan cek mutasi rekening Anda secara berkala. Jika dalam 1x24 jam kerja dana belum masuk, Anda dapat menghubungi tim support kami.
                </p>

                <div style="margin-top: 24px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                  <a href="${appUrl}/myprofile" style="background-color: #0f172a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">Cek Dashboard Profil</a>
                  <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0;">Terima kasih telah terus berkarya bersama Panggung Kreator! 🙏</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Gagal mengirim email notifikasi payout:", emailErr);
      }
    }

    return {
      success: true,
      newBalance,
      payoutId: payoutRecord?.id,
      memberName: member.stage_name || member.full_name,
    };
  } catch (err: any) {
    console.error("processAffiliatePayoutAction error:", err);
    return { success: false, error: err.message || "Gagal memproses pembayaran affiliate." };
  }
}

/**
 * Admin Action: Menghapus data riwayat payout atau mereset komisi affiliator
 */
export async function deleteAffiliateRecordAction({
  memberId,
  ledgerId,
}: {
  memberId: string;
  ledgerId?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Tidak diotorisasi. Silakan login kembali." };
    }

    const { data: currentAdmin } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== "admin") {
      return { success: false, error: "Hanya admin yang diperbolehkan menghapus data affiliate." };
    }

    const supabaseAdmin = createServiceRoleClient();

    if (ledgerId && !ledgerId.startsWith("legacy-")) {
      // Ambil data ledger yang mau dihapus untuk mengoreksi saldo jika tipe credit
      const { data: ledgerItem } = await supabaseAdmin
        .from("commission_ledger")
        .select("amount, type")
        .eq("id", ledgerId)
        .single();

      if (ledgerItem && (ledgerItem.type === "pending" || ledgerItem.type === "credit")) {
        const { data: mem } = await supabaseAdmin
          .from("members")
          .select("commission_balance")
          .eq("id", memberId)
          .single();
        if (mem) {
          const updatedBal = Math.max(0, Number(mem.commission_balance || 0) - Number(ledgerItem.amount || 0));
          await supabaseAdmin
            .from("members")
            .update({ commission_balance: updatedBal })
            .eq("id", memberId);
        }
      }

      await supabaseAdmin
        .from("commission_ledger")
        .delete()
        .eq("id", ledgerId);
    } else {
      // Reset saldo komisi member ke 0
      await supabaseAdmin
        .from("members")
        .update({ commission_balance: 0 })
        .eq("id", memberId);

      await supabaseAdmin
        .from("affiliate_payouts")
        .delete()
        .eq("member_id", memberId);

      await supabaseAdmin
        .from("commission_ledger")
        .delete()
        .eq("member_id", memberId);
    }

    return { success: true };
  } catch (err: any) {
    console.error("deleteAffiliateRecordAction error:", err);
    return { success: false, error: err.message || "Gagal menghapus data affiliate." };
  }
}


