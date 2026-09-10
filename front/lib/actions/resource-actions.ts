"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { revalidatePath } from "next/cache";

export async function saveResourceAction(
  data: {
    title: string;
    description: string;
    file_url: string;
    file_type: string;
    file_size_kb: number;
    package_tier: string;
    category: string;
    is_published: boolean;
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
  const hasAccess = await checkPermission("resources", permissionType);
  if (!hasAccess) {
    return {
      success: false,
      error: `Akses ditolak: Anda tidak memiliki izin untuk ${id ? "mengedit" : "menambah"} resources.`,
    };
  }

  const payload: any = {
    title: data.title,
    description: data.description || "",
    file_url: data.file_url,
    file_type: data.file_type || "doc",
    file_size_kb: data.file_size_kb || 0,
    package_tier: data.package_tier || "free",
    category: data.category || "General",
    is_published: data.is_published ?? false,
    order_index: data.order_index ?? 0,
    uploaded_by: session.user.id,
  };

  const { error } = await syncDualOperation(async (client) => {
    if (id) {
      const { error: err } = await client
        .from("resources")
        .update(payload)
        .eq("id", id);
      if (err) throw err;
    } else {
      const { error: err } = await client
        .from("resources")
        .insert([payload]);
      if (err) throw err;
    }
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
      action: id ? "UPDATE" : "CREATE",
      module: "Resources",
      targetId: id || null,
      description: `${id ? "Memperbarui" : "Menambahkan"} resource: "${data.title}" (${data.category})`,
      oldData: null,
      newData: payload,
    });
  } catch (logErr) {
    console.warn("Notice: Gagal mencatat log resource:", logErr);
  }

  revalidatePath("/admin/resources");
  return { success: true };
}

export async function deleteResourceAction(id: string) {
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

  const hasAccess = await checkPermission("resources", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus resources.",
    };
  }

  // Get resource info before delete
  const { data: resToDelete } = await supabase
    .from("resources")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("resources")
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
      module: "Resources",
      targetId: id,
      description: `Menghapus resource: "${resToDelete?.title || id}"`,
      oldData: resToDelete,
      newData: null,
    });
  } catch (logErr) {
    console.warn("Notice: Gagal mencatat log delete resource:", logErr);
  }

  revalidatePath("/admin/resources");
  return { success: true };
}

export async function toggleResourcePublishAction(id: string, currentStatus: boolean) {
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

  const hasAccess = await checkPermission("resources", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah status materi.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("resources")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/resources");
  return { success: true };
}
