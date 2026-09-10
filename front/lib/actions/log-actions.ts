"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { syncDualOperation } from "@/lib/supabase/dual-sync";

export interface LogAdminActivityParams {
  action: "CREATE" | "UPDATE" | "DELETE" | "CONFIRM_PAYMENT" | "REVOKE" | "APPROVE" | string;
  module: "Members" | "Payment" | "Acara" | "Admins" | "Voucher" | "Venue" | "Partner" | "Galeri" | "Mentoring" | "Resources" | "Packages" | "Settings" | string;
  targetId?: string | null;
  description: string;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  adminId?: string | null;
}

/**
 * Mencatat aktivitas admin ke dalam tabel admin_activity_logs
 * Secara otomatis mendeteksi admin_id dari sesi user login jika tidak disediakan secara eksplisit,
 * serta mendeteksi IP address dari request headers.
 */
export async function logAdminActivity(params: LogAdminActivityParams) {
  try {
    let resolvedAdminId = params.adminId || null;

    if (!resolvedAdminId) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          resolvedAdminId = user.id;
        }
      } catch (authErr) {
        console.warn("Notice: Gagal mendeteksi session user untuk logAdminActivity:", authErr);
      }
    }

    // Jika tetap tidak ada adminId, batalkan karena foreign key ke members(id) wajib
    if (!resolvedAdminId) {
      console.warn("logAdminActivity dibatalkan: admin_id tidak ditemukan.");
      return { success: false, error: "admin_id is required" };
    }

    // Deteksi IP Address dari headers
    let ipAddress = "127.0.0.1";
    try {
      const headerList = await headers();
      ipAddress =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        headerList.get("cf-connecting-ip") ||
        "127.0.0.1";
    } catch {
      // Fallback default
    }

    const payload = {
      admin_id: resolvedAdminId,
      action: params.action.toUpperCase(),
      module: params.module,
      target_id: params.targetId || null,
      description: params.description,
      old_data: params.oldData ? params.oldData : null,
      new_data: params.newData ? params.newData : null,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    };

    const { devResult, error } = await syncDualOperation(async (client) => {
      const { data, error: insertError } = await client
        .from("admin_activity_logs")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) throw insertError;
      return data;
    });

    if (error) {
      console.warn("Gagal menyimpan log admin ke database:", error.message || error);
      return { success: false, error: error.message || error };
    }

    return { success: true, logId: devResult?.id };
  } catch (err: any) {
    console.error("Error in logAdminActivity:", err);
    return { success: false, error: err.message || "Failed to log activity" };
  }
}
