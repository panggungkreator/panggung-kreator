"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { revalidatePath } from "next/cache";

export async function saveGalleryAlbumAction(
  data: {
    title: string;
    slug?: string;
    category: string;
    event_date: string;
    hero_image_url?: string | null;
    album_link?: string | null;
    description?: string | null;
    is_published?: boolean;
    display_order?: number;
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
  const hasAccess = await checkPermission("galeri", permissionType);
  if (!hasAccess) {
    return {
      success: false,
      error: `Akses ditolak: Anda tidak memiliki izin untuk ${id ? "mengedit" : "menambah"} galeri.`,
    };
  }

  const generatedSlug =
    data.slug?.trim() ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const payload = {
    title: data.title.trim(),
    slug: generatedSlug,
    category: data.category || "lainnya",
    event_date: data.event_date,
    hero_image_url: data.hero_image_url || null,
    album_link: data.album_link?.trim() || null,
    description: data.description?.trim() || null,
    is_published: data.is_published ?? true,
    display_order: data.display_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await syncDualOperation(async (client) => {
    if (id) {
      const { error: err } = await client
        .from("gallery_albums")
        .update(payload)
        .eq("id", id);
      if (err) throw err;
    } else {
      const { error: err } = await client
        .from("gallery_albums")
        .insert([payload]);
      if (err) throw err;
    }
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
  return { success: true };
}

export async function deleteGalleryAlbumAction(id: string) {
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

  const hasAccess = await checkPermission("galeri", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus album galeri.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("gallery_albums")
      .delete()
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
  return { success: true };
}

export async function deleteMultipleGalleryAlbumsAction(ids: string[]) {
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

  const hasAccess = await checkPermission("galeri", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus album galeri.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("gallery_albums")
      .delete()
      .in("id", ids);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
  return { success: true };
}

export async function toggleGalleryAlbumPublishedAction(id: string, currentStatus: boolean) {
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

  const hasAccess = await checkPermission("galeri", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah status publikasi galeri.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("gallery_albums")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
  return { success: true };
}
