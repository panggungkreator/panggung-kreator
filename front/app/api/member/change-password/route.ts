import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini harus diisi'),
  new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi user terautentikasi
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user || !user.email) {
      return NextResponse.json({ error: 'Sesi telah berakhir, silakan login kembali.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { current_password, new_password } = parsed.data

    // 2. Verifikasi password saat ini dengan re-authenticate
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current_password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Password saat ini tidak sesuai. Silakan periksa kembali.' },
        { status: 400 }
      )
    }

    // 3. Update password user ke password baru
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: `Gagal mengupdate password: ${updateError.message}` },
        { status: 500 }
      )
    }

    const targetEmail = user.email

    // 4. Kirim email notifikasi perubahan password (sebelum global signout)
    let emailSent = false
    let emailErrorDetail: string | null = null

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        console.log(`[CHANGE PASSWORD] Sending security email notification to ${targetEmail}...`)

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: process.env.SMTP_SECURE === "false" ? false : true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const changeTime = new Date().toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Asia/Jakarta",
        })

        const mailResult = await transporter.sendMail({
          from: `"Panggung Kreator Security" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          subject: "🔐 Keamanan Akun: Password Panggung Kreator Berhasil Diubah",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #e5e7eb;">
              <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #000; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">PANGGUNG KREATOR</h2>
                <span style="font-size: 11px; color: #6b7280; font-family: monospace;">PEMBERITAHUAN KEAMANAN AKUN</span>
              </div>

              <h3 style="color: #111; font-size: 16px; margin-top: 0;">Password Akun Anda Telah Diperbarui 🔒</h3>
              
              <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                Halo, pemberitahuan ini mengonfirmasi bahwa kata sandi (password) untuk akun <strong>${targetEmail}</strong> baru saja berhasil diubah.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 16px; margin: 20px 0;">
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📅 <strong>Waktu Perubahan:</strong> ${changeTime} WIB</p>
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📧 <strong>Email Terkait:</strong> ${targetEmail}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">Status: <strong style="color: #059669;">Berhasil Diperbarui</strong></p>
              </div>

              <div style="background-color: #fffbe6; border: 1px solid #fde68a; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                  ⚠️ <strong>Jika Anda tidak melakukan perubahan ini:</strong> Segera lakukan reset password melalui halaman login atau hubungi Tim Support Panggung Kreator.
                </p>
              </div>

              <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                Email ini dikirim secara otomatis oleh sistem keamanan Panggung Kreator.
              </p>
            </div>
          `,
        })

        console.log(`[CHANGE PASSWORD] Security email sent successfully! MessageId: ${mailResult.messageId}`)
        emailSent = true
      } catch (emailErr: any) {
        console.error("[CHANGE PASSWORD] Gagal mengirim email notifikasi password:", emailErr)
        emailErrorDetail = emailErr.message || String(emailErr)
      }
    } else {
      console.warn("[CHANGE PASSWORD] SMTP credentials missing (SMTP_USER/SMTP_PASS). Email skipped.")
      emailErrorDetail = "SMTP credentials missing"
    }

    // 5. Global Sign-out: Invalidate token & logout akun dari semua platform/perangkat
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (soErr) {
      console.warn('[CHANGE PASSWORD] Global signout error:', soErr)
    }

    return NextResponse.json({
      message: 'Password berhasil diperbarui!',
      emailSent,
      email: targetEmail,
      emailErrorDetail,
    }, { status: 200 })
  } catch (err: any) {
    console.error('Change password error:', err)
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    )
  }
}
