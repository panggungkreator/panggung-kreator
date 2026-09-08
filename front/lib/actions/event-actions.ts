"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { ensureVenueExistsAction } from "./venue-actions";
import { revalidatePath } from "next/cache";

export interface EventFormData {
  title: string;
  description?: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location: string;
  capacity?: number;
  is_published?: boolean;
}

export async function updateEventAction(id: string, data: EventFormData) {
  if (!id) {
    return { success: false, error: "ID acara tidak valid." };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Sesi tidak ditemukan atau kedaluwarsa." };

  const hasAccess = await checkPermission("acara", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengedit acara.",
    };
  }

  const trimmedTitle = data.title?.trim();
  const trimmedLocation = data.location?.trim();

  if (!trimmedTitle || !data.event_type || !data.event_date || !data.start_time || !trimmedLocation) {
    return { success: false, error: "Mohon lengkapi semua kolom wajib." };
  }

  // 1. Pastikan venue tersimpan di database jika ada perubahan / penambahan venue baru
  try {
    await ensureVenueExistsAction(trimmedLocation);
  } catch (venueErr) {
    console.warn("Notice: Gagal auto-save venue:", venueErr);
  }

  const payload = {
    title: trimmedTitle,
    description: data.description?.trim() || "",
    event_type: data.event_type,
    event_date: data.event_date,
    start_time: data.start_time,
    end_time: data.end_time === "selesai" || !data.end_time ? null : data.end_time,
    location: trimmedLocation,
    capacity: data.capacity || 50,
    is_published: data.is_published ?? false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("events")
      .update(payload)
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message || "Gagal memperbarui acara di database." };
  }

  revalidatePath("/admin/acara");
  revalidatePath(`/admin/acara/${id}`);
  revalidatePath(`/absensi/${id}`);
  revalidatePath("/myprofile");

  return { success: true };
}

export async function deleteEventAction(id: string) {
  if (!id) return { success: false, error: "ID acara tidak valid." };

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi." };

  const hasAccess = await checkPermission("acara", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus acara.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("events")
      .delete()
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/acara");
  return { success: true };
}
