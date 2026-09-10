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

export interface EventTypeItem {
  id: string;
  name: string;
  value: string;
  color?: string;
}

/**
 * Memastikan tipe acara / tag tersimpan di tabel `event_types`.
 * Jika belum ada, otomatis menyimpannya ke kedua database (Dev & Prod).
 */
export async function ensureEventTypeExistsAction(nameOrValue: string) {
  if (!nameOrValue || !nameOrValue.trim()) {
    return { success: false, error: "Tipe acara tidak boleh kosong." };
  }

  const raw = nameOrValue.trim();

  // Buat slug value yang aman
  const value =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "lainnya";

  // Format display name
  const name = raw.includes("_")
    ? raw
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : raw.charAt(0).toUpperCase() + raw.slice(1);

  const colors = [
    "bg-amber-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-sky-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const { devResult, error } = await syncDualOperation(async (client) => {
    // Cek apakah tag dengan value atau nama serupa sudah ada
    const { data: existing } = await client
      .from("event_types")
      .select("id, name, value, color")
      .or(`value.eq.${value},name.ilike.${name}`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Insert tag baru
    const { data: inserted, error: insErr } = await client
      .from("event_types")
      .insert([{ name, value, color: randomColor }])
      .select("id, name, value, color")
      .single();

    if (insErr) throw insErr;
    return inserted;
  });

  if (error) {
    console.warn("Notice: ensureEventTypeExistsAction warning:", error);
  }

  revalidatePath("/admin/acara/create");
  revalidatePath("/admin/acara");
  return { success: true, eventType: devResult };
}

export async function createEventAction(data: EventFormData) {
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

  const hasAccess = await checkPermission("acara", "create");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk membuat acara.",
    };
  }

  const trimmedTitle = data.title?.trim();
  const trimmedLocation = data.location?.trim();
  const trimmedType = data.event_type?.trim();

  if (!trimmedTitle || !trimmedType || !data.event_date || !data.start_time || !trimmedLocation) {
    return { success: false, error: "Mohon lengkapi semua kolom wajib." };
  }

  // 1. Auto-save tag tipe acara jika baru
  try {
    await ensureEventTypeExistsAction(trimmedType);
  } catch (typeErr) {
    console.warn("Notice: Gagal auto-save tipe acara:", typeErr);
  }

  // 2. Auto-save venue jika baru atau update frekuensi penggunaan
  try {
    await ensureVenueExistsAction(trimmedLocation);
  } catch (venueErr) {
    console.warn("Notice: Gagal auto-save venue:", venueErr);
  }

  // Format tipe acara slug
  const cleanEventType =
    trimmedType
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "lainnya";

  const payload = {
    title: trimmedTitle,
    description: data.description?.trim() || "",
    event_type: cleanEventType,
    event_date: data.event_date,
    start_time: data.start_time,
    end_time: data.end_time === "selesai" || !data.end_time ? null : data.end_time,
    location: trimmedLocation,
    capacity: data.capacity || 50,
    is_published: data.is_published ?? true,
    created_by: session.user.id,
  };

  const { devResult, error } = await syncDualOperation(async (client) => {
    const { data: inserted, error: err } = await client
      .from("events")
      .insert([payload])
      .select("id")
      .single();
    if (err) throw err;
    return inserted;
  });

  if (error) {
    return { success: false, error: error.message || "Gagal membuat acara di database." };
  }

  // Log admin activity
  try {
    const { logAdminActivity } = await import("@/lib/actions/log-actions");
    await logAdminActivity({
      adminId: session.user.id,
      action: "CREATE",
      module: "Acara",
      targetId: devResult?.id,
      description: `Membuat acara baru: "${trimmedTitle}" (${data.event_date})`,
      oldData: null,
      newData: payload,
    });
  } catch (logErr) {
    console.warn("Notice: Gagal mencatat log acara:", logErr);
  }

  revalidatePath("/admin/acara");
  revalidatePath("/myprofile");

  return { success: true, eventId: devResult?.id };
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
  const trimmedType = data.event_type?.trim();

  if (!trimmedTitle || !trimmedType || !data.event_date || !data.start_time || !trimmedLocation) {
    return { success: false, error: "Mohon lengkapi semua kolom wajib." };
  }

  // 1. Auto-save tag tipe acara jika baru
  try {
    await ensureEventTypeExistsAction(trimmedType);
  } catch (typeErr) {
    console.warn("Notice: Gagal auto-save tipe acara:", typeErr);
  }

  // 2. Pastikan venue tersimpan di database jika ada perubahan / penambahan venue baru
  try {
    await ensureVenueExistsAction(trimmedLocation);
  } catch (venueErr) {
    console.warn("Notice: Gagal auto-save venue:", venueErr);
  }

  // Format tipe acara slug
  const cleanEventType =
    trimmedType
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "lainnya";

  const payload = {
    title: trimmedTitle,
    description: data.description?.trim() || "",
    event_type: cleanEventType,
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

  // Log admin activity
  try {
    const { logAdminActivity } = await import("@/lib/actions/log-actions");
    await logAdminActivity({
      adminId: session.user.id,
      action: "UPDATE",
      module: "Acara",
      targetId: id,
      description: `Memperbarui acara: "${trimmedTitle}" (${data.event_date})`,
      oldData: null,
      newData: payload,
    });
  } catch (logErr) {
    console.warn("Notice: Gagal mencatat log update acara:", logErr);
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

  // Get event info before deleting
  const { data: eventToDelete } = await supabase
    .from("events")
    .select("id, title, event_date")
    .eq("id", id)
    .maybeSingle();

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

  // Log admin activity
  try {
    const { logAdminActivity } = await import("@/lib/actions/log-actions");
    await logAdminActivity({
      adminId: session.user.id,
      action: "DELETE",
      module: "Acara",
      targetId: id,
      description: `Menghapus acara: "${eventToDelete?.title || id}" (${eventToDelete?.event_date || "-"})`,
      oldData: eventToDelete,
      newData: null,
    });
  } catch (logErr) {
    console.warn("Notice: Gagal mencatat log hapus acara:", logErr);
  }

  revalidatePath("/admin/acara");
  return { success: true };
}
