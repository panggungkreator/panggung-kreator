import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_COLOR } from "@/lib/constants";

export interface SuperAdminCheckInput {
  email?: string | null;
  memberRole?: string | null;
  adminRoleColor?: string | null;
  adminRoleStatus?: string | null;
  isSuperAdminFlag?: boolean | null;
}

/**
 * Multi-layered Security Helper untuk mengidentifikasi Super Admin secara 100% aman & anti-tamper.
 * 
 * Lapisan Keamanan:
 * 1. Email Resmi Super Admin (SUPER_ADMIN_EMAIL dari .env / constants)
 * 2. Flag is_super_admin pada tabel admin_roles di Supabase
 * 3. Color Ranger Slate ('slate') & Status 'active' di database
 */
export function isSuperAdmin(input?: SuperAdminCheckInput | null): boolean {
  if (!input) return false;

  // 1. Lapisan 1: Pengecekan Email Resmi Super Admin
  const isOfficialEmail = !!(
    input.email &&
    input.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim()
  );

  // 2. Lapisan 2: Attributes Database (is_super_admin flag / color slate)
  const isSlateColor = input.adminRoleColor === SUPER_ADMIN_COLOR;
  const isSuperFlag = input.isSuperAdminFlag === true;
  const isActive = input.adminRoleStatus === "active";

  // Jika Email Resmi Super Admin match & memegang role admin -> Super Admin!
  if (isOfficialEmail && (input.memberRole === "admin" || !input.memberRole)) {
    return true;
  }

  // Jika di database bertanda is_super_admin = true atau color = 'slate' (active) -> Super Admin!
  if (isActive && (isSlateColor || isSuperFlag)) {
    return true;
  }

  return false;
}
