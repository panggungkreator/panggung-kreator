"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getAttendanceEmailSettingAction(): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "attendance_email_enabled")
      .maybeSingle();

    if (error) {
      console.warn("system_settings query error:", error.message);
    }

    if (data && data.value !== undefined && data.value !== null) {
      return data.value === "true" || data.value === true;
    }
  } catch (err) {
    console.warn("system_settings table query error, fallback to true:", err);
  }
  return true;
}

export async function saveAttendanceEmailSettingAction(enabled: boolean) {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: "attendance_email_enabled",
          value: enabled ? "true" : "false",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, enabled };
  } catch (err: any) {
    console.error("saveAttendanceEmailSettingAction error:", err);
    return { success: false, error: err.message || "Gagal menyimpan ke database." };
  }
}
