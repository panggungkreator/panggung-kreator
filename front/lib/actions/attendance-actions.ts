"use server";

import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";
import { getAttendanceEmailSettingAction } from "@/lib/actions/settings-actions";

export async function checkAttendanceStatusAction(eventId: string) {
  try {
    const supabase = await createClient();

    // 1. Cek User Session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { authenticated: false, isAttended: false, event: null, member: null };
    }

    const userId = session.user.id;

    // 2. Fetch Event Detail
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return {
        authenticated: true,
        isAttended: false,
        event: null,
        member: null,
        error: "Acara tidak ditemukan atau telah dihapus.",
      };
    }

    // 3. Fetch Member Profile
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name, stage_name, email")
      .eq("id", userId)
      .single();

    // 4. Cek Presensi Ganda di Tabel attendances
    const { data: existingAttendance } = await supabase
      .from("attendances")
      .select("id, is_present, scanned_at, created_at")
      .eq("member_id", userId)
      .eq("event_id", eventId)
      .eq("is_present", true)
      .maybeSingle();

    return {
      authenticated: true,
      isAttended: !!existingAttendance,
      attendanceRecord: existingAttendance,
      event,
      member: member || { id: userId, email: session.user.email, full_name: "Kreator" },
    };
  } catch (error: any) {
    console.error("Error in checkAttendanceStatusAction:", error);
    return { authenticated: false, isAttended: false, event: null, member: null, error: error.message };
  }
}

export async function recordAttendanceAction(eventId: string) {
  try {
    const supabase = await createClient();

    // 1. Cek User Session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan login terlebih dahulu." };
    }

    const userId = session.user.id;

    // 2. Fetch Event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "Acara tidak ditemukan." };
    }

    // 3. Fetch Member Info
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name, stage_name, email")
      .eq("id", userId)
      .single();

    const userEmail = member?.email || session.user.email;
    const userName = member?.stage_name || member?.full_name || "Kreator";

    // 4. Validasi Absen Ganda (Backend Safeguard)
    const { data: existingAttendance } = await supabase
      .from("attendances")
      .select("id")
      .eq("member_id", userId)
      .eq("event_id", eventId)
      .eq("is_present", true)
      .maybeSingle();

    if (existingAttendance) {
      return {
        success: true,
        alreadyAttended: true,
        message: `Anda sudah pernah mencatat kehadiran untuk acara "${event.title}".`,
      };
    }

    // 5. Catat Presensi Baru
    const { error: insertError } = await supabase.from("attendances").insert([
      {
        member_id: userId,
        event_id: eventId,
        is_present: true,
        scan_method: "qr_code",
        scanned_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Gagal mencatat absensi:", insertError);
      return { success: false, error: insertError.message || "Gagal mencatat presensi." };
    }

    // 6. Kirim Email Konfirmasi (jika fitur aktif di Settings & SMTP dikonfigurasi)
    const isEmailEnabled = await getAttendanceEmailSettingAction();

    if (isEmailEnabled && userEmail && process.env.SMTP_USER && process.env.SMTP_PASS) {
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

        const formattedDate = event.event_date
          ? new Date(event.event_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-";

        await transporter.sendMail({
          from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: `Konfirmasi Kehadiran: ${event.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #e5e7eb;">
              <h2 style="color: #000; border-bottom: 2px solid #ffe78a; padding-bottom: 8px;">Konfirmasi Kehadiran Acara 🎟️</h2>
              <p style="font-size: 14px;">Halo <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6;">
                Terima kasih telah hadir di acara komunitas Panggung Kreator. Presensi Anda telah berhasil dicatat oleh sistem.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #000; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px; color: #111;">${event.title}</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📅 <strong>Tanggal:</strong> ${formattedDate}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">⏰ <strong>Waktu:</strong> ${event.start_time || "-"} - ${event.end_time || "Selesai"}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📍 <strong>Tempat:</strong> ${event.location || "Venue Komunitas"}</p>
              </div>

              <p style="font-size: 13px; color: #6b7280;">
                Terus bertumbuh dan nikmati proses berkembang bersama lingkungan yang suportif!
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 11px; color: #9ca3af; text-align: center; font-family: monospace;">
                PANGGUNG KREATOR · BANDUNG
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Gagal mengirim email konfirmasi presensi:", emailErr);
      }
    }

    return {
      success: true,
      alreadyAttended: false,
      message: `Presensi Anda di acara "${event.title}" berhasil dicatat!`,
    };
  } catch (error: any) {
    console.error("Error in recordAttendanceAction:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function manualAttendanceAddAction(eventId: string, memberIds: string[]) {
  try {
    const supabase = await createClient();

    // 1. Cek User Session (harus Admin)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan login kembali." };
    }

    // 2. Fetch Event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "Acara tidak ditemukan." };
    }

    // 3. Fetch existing attendance records
    const { data: existingRecords, error: checkError } = await supabase
      .from("attendances")
      .select("id, member_id, is_present")
      .eq("event_id", eventId)
      .in("member_id", memberIds);

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    const existingMap = new Map(existingRecords?.map((r) => [r.member_id, r]));
    const toInsertIds = memberIds.filter((id) => !existingMap.has(id));
    const toUpdateRecords = existingRecords?.filter((r) => !r.is_present) || [];

    // 4. Batch Update
    if (toUpdateRecords.length > 0) {
      const { error: updateError } = await supabase
        .from("attendances")
        .update({
          is_present: true,
          scan_method: "manual",
          scanned_at: new Date().toISOString(),
        })
        .in("id", toUpdateRecords.map((r) => r.id));

      if (updateError) return { success: false, error: updateError.message };
    }

    // 5. Batch Insert
    if (toInsertIds.length > 0) {
      const insertData = toInsertIds.map((id) => ({
        event_id: eventId,
        member_id: id,
        is_present: true,
        scan_method: "manual",
        scanned_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase.from("attendances").insert(insertData);
      if (insertError) return { success: false, error: insertError.message };
    }

    // 6. CEK SYSTEM SETTINGS: Apakah Email Absensi Aktif?
    const isEmailEnabled = await getAttendanceEmailSettingAction();

    if (isEmailEnabled && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Fetch member details (email & name) for selected member IDs
      const { data: targetMembers } = await supabase
        .from("members")
        .select("id, full_name, stage_name, email")
        .in("id", memberIds);

      if (targetMembers && targetMembers.length > 0) {
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

          const formattedDate = event.event_date
            ? new Date(event.event_date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-";

          // Send confirmation email to each registered member
          for (const m of targetMembers) {
            if (!m.email) continue;
            const userName = m.stage_name || m.full_name || "Kreator";

            await transporter.sendMail({
              from: `"Panggung Kreator" <${process.env.SMTP_USER}>`,
              to: m.email,
              subject: `Konfirmasi Kehadiran: ${event.title}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #e5e7eb;">
                  <h2 style="color: #000; border-bottom: 2px solid #ffe78a; padding-bottom: 8px;">Konfirmasi Kehadiran Acara 🎟️</h2>
                  <p style="font-size: 14px;">Halo <strong>${userName}</strong>,</p>
                  <p style="font-size: 14px; line-height: 1.6;">
                    Terima kasih telah hadir di acara komunitas Panggung Kreator. Presensi Anda telah berhasil dicatat oleh admin.
                  </p>
                  
                  <div style="background-color: #f9fafb; border-left: 4px solid #000; padding: 16px; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #111;">${event.title}</h3>
                    <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📅 <strong>Tanggal:</strong> ${formattedDate}</p>
                    <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">⏰ <strong>Waktu:</strong> ${event.start_time || "-"} - ${event.end_time || "Selesai"}</p>
                    <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">📍 <strong>Tempat:</strong> ${event.location || "Venue Komunitas"}</p>
                  </div>

                  <p style="font-size: 13px; color: #6b7280;">
                    Terus bertumbuh dan nikmati proses berkembang bersama lingkungan yang suportif!
                  </p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #9ca3af; text-align: center; font-family: monospace;">
                    PANGGUNG KREATOR · BANDUNG
                  </p>
                </div>
              `,
            });
          }
        } catch (emailErr) {
          console.error("Error sending manual attendance emails:", emailErr);
        }
      }
    }

    return {
      success: true,
      message: `Berhasil mendaftarkan ${memberIds.length} peserta!`,
    };
  } catch (error: any) {
    console.error("Error in manualAttendanceAddAction:", error);
    return { success: false, error: error.message || "Gagal mendaftarkan peserta." };
  }
}
