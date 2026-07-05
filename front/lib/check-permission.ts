import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PermissionMode = "page" | "button";

/**
 * Cek apakah admin punya izin untuk aksi tertentu di halaman tertentu.
 * 
 * @param pageSlug  - Slug halaman (misal: "members", "packages")
 * @param action    - Slug aksi (misal: "view", "create", "edit", "delete")
 * @param mode      - "page" (redirect ke /admin/denied jika tidak berwenang) atau "button" (return boolean)
 */
export async function checkPermission(
  pageSlug: string,
  action: string,
  mode: PermissionMode = "button"
): Promise<boolean> {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (mode === "page") {
      redirect("/login");
    }
    return false;
  }

  // 1. Dapatkan admin_role_id & status
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("id, status")
    .eq("member_id", session.user.id)
    .single();

  if (!adminRole || adminRole.status !== "active") {
    if (mode === "page") {
      redirect("/admin/denied");
    }
    return false;
  }

  // 2. Query apakah ada baris permission
  const { data: perm } = await supabase
    .from("admin_role_permissions")
    .select(`
      id,
      privilege_items!inner(slug),
      privilege_actions!inner(slug)
    `)
    .eq("admin_role_id", adminRole.id)
    .eq("privilege_items.slug", pageSlug)
    .eq("privilege_actions.slug", action)
    .limit(1)
    .maybeSingle();

  const hasPerm = !!perm;

  if (!hasPerm && mode === "page") {
    redirect("/admin/denied");
  }

  return hasPerm;
}

/**
 * Fetch seluruh permission admin saat ini dalam 1 query.
 * Hasilnya berupa Record (plain object) untuk Next.js serialization compatibility.
 */
export async function getPermissionMap(
  adminRoleId: string
): Promise<Record<string, string[]>> {
  const supabase = await createClient();

  const { data: perms } = await supabase
    .from("admin_role_permissions")
    .select(`
      privilege_items!inner ( slug ),
      privilege_actions!inner ( slug )
    `)
    .eq("admin_role_id", adminRoleId);

  const permMap: Record<string, string[]> = {};
  perms?.forEach((p: any) => {
    const page = p.privilege_items.slug;
    const action = p.privilege_actions.slug;
    if (!permMap[page]) {
      permMap[page] = [];
    }
    if (!permMap[page].includes(action)) {
      permMap[page].push(action);
    }
  });

  return permMap;
}


