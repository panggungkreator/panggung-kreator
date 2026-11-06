"use server";

import { checkPermission } from "@/lib/check-permission";
import { createClient } from "@/lib/supabase/server";

export async function setPerformanceStatus(eventId: string, attendanceId: string, hasPerformed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await checkPermission("acara", "edit"))) {
    return { error: "Anda tidak memiliki izin untuk mengubah status tampil." };
  }
  if (typeof hasPerformed !== "boolean") return { error: "Status tampil tidak valid." };

  const { data: event, error: eventError } = await supabase
    .from("events").select("event_type").eq("id", eventId).maybeSingle();
  if (eventError || event?.event_type !== "open_mic") return { error: "Acara Open Mic tidak ditemukan." };

  const { data, error } = await supabase.from("attendances")
    .update({ has_performed: hasPerformed })
    .eq("id", attendanceId).eq("event_id", eventId).eq("is_present", true)
    .select("id").maybeSingle();
  if (error || !data) return { error: "Gagal menyimpan status. Pastikan member masih tercatat hadir." };
  return { success: true };
}
