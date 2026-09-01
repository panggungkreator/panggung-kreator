import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/security";

type PermissionMode = "page" | "button";

/**
 * Cek apakah admin punya izin untuk aksi tertentu di halaman tertentu.
 * 
 * @param pageSlug  - Slug halaman (misal: "members", "packages", "acara")
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

  // 1. Cek role global di tabel members
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  const isGlobalAdmin = member?.role === "admin";

  // 2. Dapatkan detail admin_role (jika terdaftar di admin_roles)
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("id, status, color, is_super_admin")
    .eq("member_id", session.user.id)
    .maybeSingle();

  // Multi-layered Bulletproof Super Admin Check (Full Unconstrained Access)
  if (
    isSuperAdmin({
      email: session.user.email,
      memberRole: member?.role,
      adminRoleColor: adminRole?.color,
      adminRoleStatus: adminRole?.status,
      isSuperAdminFlag: adminRole?.is_super_admin,
    })
  ) {
    return true;
  }

  // 3. Cek spesifik di tabel admin_role_permissions (relasi via action_id)
  if (adminRole && adminRole.status === "active") {
    const { data: perm } = await supabase
      .from("admin_role_permissions")
      .select(`
        id,
        privilege_items!inner(slug),
        privilege_actions:action_id!inner(slug)
      `)
      .eq("admin_role_id", adminRole.id)
      .eq("privilege_items.slug", pageSlug)
      .eq("privilege_actions.slug", action)
      .limit(1)
      .maybeSingle();

    if (perm) {
      return true;
    }
  }

  // 4. Fallback: Jika pengguna memiliki role = 'admin' di tabel members
  if (isGlobalAdmin) {
    return true;
  }

  if (mode === "page") {
    redirect("/admin/denied");
  }

  return false;
}

/**
 * Fetch seluruh permission admin saat ini dalam 1 query.
 * Hasilnya berupa Record (plain object) untuk Next.js serialization compatibility.
 */
export async function getPermissionMap(
  adminRoleId?: string
): Promise<Record<string, string[]>> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("id, status, color, is_super_admin")
      .eq("member_id", session.user.id)
      .maybeSingle();

    if (
      isSuperAdmin({
        email: session.user.email,
        memberRole: member?.role,
        adminRoleColor: adminRole?.color,
        adminRoleStatus: adminRole?.status,
        isSuperAdminFlag: adminRole?.is_super_admin,
      }) ||
      member?.role === "admin"
    ) {
      return { "*": ["*"] };
    }
  }

  if (!adminRoleId) return {};

  const { data: perms } = await supabase
    .from("admin_role_permissions")
    .select(`
      privilege_items!inner ( slug ),
      privilege_actions:action_id!inner ( slug )
    `)
    .eq("admin_role_id", adminRoleId);

  const permMap: Record<string, string[]> = {};
  perms?.forEach((p: any) => {
    const page = p.privilege_items?.slug;
    const action = p.privilege_actions?.slug;
    if (page && action) {
      if (!permMap[page]) {
        permMap[page] = [];
      }
      if (!permMap[page].includes(action)) {
        permMap[page].push(action);
      }
    }
  });

  return permMap;
}
