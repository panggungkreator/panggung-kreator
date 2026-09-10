import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import AdminDetailClient from "./AdminDetailClient";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import { isSuperAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function AdminDetailPage({ params }: Props) {
  // Await params to support Next.js 14 and 15 safely
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify that the user is an admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Only Super Admin can view and manage admin permissions
  const { data: currentAdminRole } = await supabase
    .from("admin_roles")
    .select("id, color, status, is_super_admin")
    .eq("member_id", user.id)
    .maybeSingle();

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

  // 1. Fetch admin role joined with member using Service Role Client to bypass RLS
  const serviceRoleClient = createServiceRoleClient();
  const { data: admin, error: adminError } = await serviceRoleClient
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
        social_media,
        occupation
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (adminError || !admin) {
    if (adminError) {
      console.error("Error fetching admin in AdminDetailPage:", adminError.message);
    }
    notFound();
  }

  const rawMember = Array.isArray(admin.members) ? admin.members[0] : (admin.members as any);
  const socialMedia = (rawMember?.social_media as any) || {};

  const formattedAdmin = {
    id: admin.id,
    label: admin.label,
    color: admin.color,
    status: admin.status as any,
    created_at: admin.created_at,
    members: {
      id: rawMember?.id || "",
      full_name: rawMember?.full_name || "Admin",
      email: rawMember?.email || "",
      whatsapp_number: rawMember?.whatsapp_number || "-",
      occupation: rawMember?.occupation || "-",
      instagram_username: socialMedia.instagram || null,
      tiktok_username: socialMedia.tiktok || null,
    }
  };

  // 2. Fetch privilege groups, items, actions, and current admin permissions using Service Role Client
  const [groupsRes, itemsRes, actionsRes, permissionsRes] = await Promise.all([
    serviceRoleClient
      .from("privilege_groups")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    serviceRoleClient
      .from("privilege_items")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    serviceRoleClient
      .from("privilege_actions")
      .select("*")
      .order("sort_order", { ascending: true }),
    serviceRoleClient
      .from("admin_role_permissions")
      .select("privilege_item_id, action_id")
      .eq("admin_role_id", id)
  ]);

  const groups = groupsRes.data || [];
  const items = itemsRes.data || [];
  const actions = actionsRes.data || [];
  const permissions = permissionsRes.data || [];

  return (
    <div className="bg-card min-h-screen">
      <AdminDetailClient
        admin={formattedAdmin}
        groups={groups}
        items={items}
        actions={actions}
        initialPermissions={permissions}
      />
    </div>
  );
}
