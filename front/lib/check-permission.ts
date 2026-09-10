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

  // 1 & 2. Dapatkan role member dan detail admin_role secara paralel
  const [memberRes, adminRoleRes] = await Promise.all([
    supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle(),
    supabase
      .from("admin_roles")
      .select("id, status, color, is_super_admin")
      .eq("member_id", session.user.id)
      .maybeSingle(),
  ]);

  const member = memberRes.data;
  const adminRole = adminRoleRes.data;
  const isGlobalAdmin = member?.role === "admin";

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

  // 3. Cek status aktivasi admin_roles
  if (adminRole) {
    if (adminRole.status !== "active") {
      if (mode === "page") {
        redirect("/admin/denied");
      }
      return false;
    }

    // Cek spesifik di tabel admin_role_permissions (relasi via action_id)
    const possibleSlugs = [
      pageSlug,
      `cms_${pageSlug}`,
      pageSlug.replace(/^cms_/, ""),
    ];

    const { data: perms } = await supabase
      .from("admin_role_permissions")
      .select(`
        id,
        privilege_items!inner(id, slug, href),
        privilege_actions:action_id!inner(slug)
      `)
      .eq("admin_role_id", adminRole.id)
      .eq("privilege_actions.slug", action);

    const hasMatch = perms?.some((p: any) => {
      const itemSlug = p.privilege_items?.slug;
      const itemHref = p.privilege_items?.href;
      return (
        possibleSlugs.includes(itemSlug) ||
        (itemHref && itemHref.includes(`/${pageSlug}`))
      );
    });

    if (hasMatch) {
      return true;
    }

    // Admin role terdaftar dan aktif, namun permission tidak diberikan: tolak akses!
    if (mode === "page") {
      redirect("/admin/denied");
    }
    return false;
  }

  // 4. Fallback: Hanya untuk akun lama yang tidak memiliki record di admin_roles sama sekali
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
    const [memberRes, adminRoleRes] = await Promise.all([
      supabase
        .from("members")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase
        .from("admin_roles")
        .select("id, status, color, is_super_admin")
        .eq("member_id", session.user.id)
        .maybeSingle(),
    ]);

    const member = memberRes.data;
    const adminRole = adminRoleRes.data;

    if (
      isSuperAdmin({
        email: session.user.email,
        memberRole: member?.role,
        adminRoleColor: adminRole?.color,
        adminRoleStatus: adminRole?.status,
        isSuperAdminFlag: adminRole?.is_super_admin,
      })
    ) {
      return { "*": ["*"] };
    }

    if (!adminRoleId && adminRole?.id) {
      adminRoleId = adminRole.id;
    }
  }

  if (!adminRoleId) return {};

  const { data: perms } = await supabase
    .from("admin_role_permissions")
    .select(`
      privilege_items!inner ( id, slug, href ),
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
      if (page.startsWith("cms_")) {
        const alias = page.replace(/^cms_/, "");
        if (!permMap[alias]) permMap[alias] = [];
        if (!permMap[alias].includes(action)) {
          permMap[alias].push(action);
        }
      }
    }
  });

  return permMap;
}
