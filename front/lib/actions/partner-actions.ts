"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { revalidatePath } from "next/cache";

export async function savePartnerAction(
  data: {
    name: string;
    type: string;
    logo_url?: string;
    website_url?: string;
    instagram_url?: string;
    contact_person?: string;
    contact_wa?: string;
    description?: string;
    partnership_since?: string;
    is_active?: boolean;
    is_featured?: boolean;
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
  const hasAccess = await checkPermission("partner", permissionType);
  if (!hasAccess) {
    return {
      success: false,
      error: `Akses ditolak: Anda tidak memiliki izin untuk ${id ? "mengedit" : "menambah"} partner.`,
    };
  }

  const payload = {
    name: data.name.trim(),
    type: data.type || "kafe",
    logo_url: data.logo_url || "",
    website_url: data.website_url?.trim() || "",
    instagram_url: data.instagram_url?.trim() || "",
    contact_person: data.contact_person?.trim() || "",
    contact_wa: data.contact_wa?.trim() || "",
    description: data.description?.trim() || "",
    partnership_since: data.partnership_since || null,
    is_active: data.is_active ?? true,
    is_featured: data.is_featured ?? false,
    order_index: data.order_index ?? 0,
  };

  const { error } = await syncDualOperation(async (client) => {
    if (id) {
      const { error: err } = await client
        .from("partners")
        .update(payload)
        .eq("id", id);
      if (err) throw err;
    } else {
      const { error: err } = await client
        .from("partners")
        .insert([payload]);
      if (err) throw err;
    }
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/partner");
  return { success: true };
}

export async function deletePartnerAction(id: string) {
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

  const hasAccess = await checkPermission("partner", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus partner.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("partners")
      .delete()
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/partner");
  return { success: true };
}

export async function togglePartnerFeaturedAction(id: string, currentStatus: boolean) {
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

  const hasAccess = await checkPermission("partner", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah status rekomendasi.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("partners")
      .update({ is_featured: !currentStatus })
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/partner");
  return { success: true };
}

export async function togglePartnerActiveAction(id: string, currentStatus: boolean) {
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

  const hasAccess = await checkPermission("partner", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah status aktif partner.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("partners")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/partner");
  return { success: true };
}

export async function updatePartnersOrderAction(orderedItems: { id: string; order_index: number }[]) {
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

  const hasAccess = await checkPermission("partner", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengatur urutan partner.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    for (const item of orderedItems) {
      const { error: err } = await client
        .from("partners")
        .update({ order_index: item.order_index })
        .eq("id", item.id);
      if (err) throw err;
    }
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/partner");
  return { success: true };
}
