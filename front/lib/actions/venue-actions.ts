"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { revalidatePath } from "next/cache";

export async function saveVenueAction(
  data: {
    name: string;
    address: string;
    city: string;
    description: string;
    capacity: number;
    contact_name: string;
    contact_wa: string;
    latitude?: number;
    longitude?: number;
    photo_urls?: string[];
    order_index?: number;
  },
  id?: string
) {
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
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const permissionType = id ? "edit" : "create";
  const hasAccess = await checkPermission("venue", permissionType);
  if (!hasAccess) {
    return {
      success: false,
      error: `Akses ditolak: Anda tidak memiliki izin untuk ${id ? "mengedit" : "menambah"} venue.`,
    };
  }

  const payload = {
    name: data.name.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    description: data.description?.trim() || "",
    capacity: data.capacity || 0,
    contact_name: data.contact_name?.trim() || "",
    contact_wa: data.contact_wa?.trim() || "",
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    photo_urls: data.photo_urls || [],
    order_index: data.order_index ?? 0,
  };

  const { error } = await syncDualOperation(async (client) => {
    if (id) {
      const { error: err } = await client
        .from("venues")
        .update(payload)
        .eq("id", id);
      if (err) throw err;
    } else {
      const { error: err } = await client
        .from("venues")
        .insert([payload]);
      if (err) throw err;
    }
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/venue");
  return { success: true };
}

export async function deleteVenueAction(id: string) {
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
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const hasAccess = await checkPermission("venue", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus venue.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("venues")
      .delete()
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/venue");
  return { success: true };
}

/**
 * Memastikan venue tersimpan di tabel `venues`.
 * Jika sudah ada, memperbarui timestamp `last_used_at`.
 * Jika belum ada, otomatis menyimpannya ke kedua database (Dev & Prod).
 */
export async function ensureVenueExistsAction(locationStr: string) {
  if (!locationStr || !locationStr.trim()) {
    return { success: false, error: "Lokasi tidak boleh kosong." };
  }

  const trimmed = locationStr.trim();
  let name = trimmed;
  let address = trimmed;

  if (trimmed.includes(" - ")) {
    const parts = trimmed.split(" - ");
    name = parts[0].trim();
    address = parts.slice(1).join(" - ").trim();
  } else if (trimmed.includes(", ")) {
    const parts = trimmed.split(", ");
    name = parts[0].trim();
    address = parts.slice(1).join(", ").trim();
  }

  const todayDate = new Date().toISOString().split("T")[0];

  const { devResult, error } = await syncDualOperation(async (client) => {
    // 1. Cek apakah venue dengan nama atau alamat serupa sudah ada
    const { data: existingByName } = await client
      .from("venues")
      .select("id, name, address")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();

    if (existingByName) {
      await client
        .from("venues")
        .update({ last_used_at: todayDate })
        .eq("id", existingByName.id);
      return existingByName;
    }

    const { data: existingByAddress } = await client
      .from("venues")
      .select("id, name, address")
      .ilike("address", address)
      .limit(1)
      .maybeSingle();

    if (existingByAddress) {
      await client
        .from("venues")
        .update({ last_used_at: todayDate })
        .eq("id", existingByAddress.id);
      return existingByAddress;
    }

    // 2. Jika belum ada, buat entri venue baru
    const { data: inserted, error: insertErr } = await client
      .from("venues")
      .insert([
        {
          name,
          address: address || name,
          city: "Bandung",
          description: "Ditambahkan otomatis dari pembuatan acara",
          last_used_at: todayDate,
        },
      ])
      .select("id, name, address")
      .single();

    if (insertErr) throw insertErr;
    return inserted;
  });

  if (error) {
    console.warn("ensureVenueExistsAction warning:", error);
  }

  revalidatePath("/admin/venue");
  return { success: true, venue: devResult };
}

