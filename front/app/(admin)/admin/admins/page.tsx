import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminsClient from "./AdminsClient";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isSuperAdmin } from "@/lib/security";
import { getPaginationLimitSettingAction } from "@/lib/actions/settings-actions";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify member role & admin status concurrently
  const [{ data: member }, { data: currentAdminRole }] = await Promise.all([
    supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("admin_roles")
      .select("id, color, status, is_super_admin")
      .eq("member_id", user.id)
      .maybeSingle(),
  ]);

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  const isSuper = isSuperAdmin({
    email: user.email,
    memberRole: member.role,
    adminRoleColor: currentAdminRole?.color,
    adminRoleStatus: currentAdminRole?.status,
    isSuperAdminFlag: currentAdminRole?.is_super_admin,
  });

  if (!isSuper) {
    redirect("/admin/denied");
  }

  // Fetch admin roles and pagination settings concurrently
  const serviceRoleClient = createServiceRoleClient();
  const [{ data: adminRoles, error }, paginationLimit] = await Promise.all([
    serviceRoleClient
      .from("admin_roles")
      .select(`
        id,
        label,
        color,
        status,
        created_at,
        members:members!member_id (
          id,
          full_name,
          email,
          whatsapp_number,
          role
        )
      `)
      .neq("status", "revoked")
      .order("created_at", { ascending: false }),
    getPaginationLimitSettingAction(),
  ]);

  if (error) {
    console.error("Error fetching admin roles:", error);
  }

  const formattedAdmins = (adminRoles || [])
    .map((ar: any) => {
      const rawMember = ar.members;
      const member = Array.isArray(rawMember) ? rawMember[0] : rawMember;
      return {
        id: ar.id,
        memberId: member?.id || "",
        name: member?.full_name || "Tanpa Nama",
        email: member?.email || "-",
        whatsappNumber: member?.whatsapp_number || "-",
        label: ar.label || "-",
        color: ar.color,
        status: ar.status,
        role: member?.role || "member",
        created_at: ar.created_at,
      };
    })
    .filter((adm) => {
      // Jika statusnya active, perannya harus berupa admin
      // Jika statusnya pending, tetap ditampilkan agar bisa di-review
      if (adm.role === "member") {
        return false;
      }
      return true;
    });

  return (
    <AdminsClient
      initialAdmins={formattedAdmins}
      paginationLimit={paginationLimit}
    />
  );
}
