import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import AdminDetailClient from "./AdminDetailClient";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

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
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify that the user is an admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/dashboard");
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
        instagram_username,
        tiktok_username,
        occupation
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (adminError || !admin) {
    notFound();
  }

  const formattedAdmin = {
    id: admin.id,
    label: admin.label,
    color: admin.color,
    status: admin.status as any,
    created_at: admin.created_at,
    members: Array.isArray(admin.members) ? admin.members[0] : (admin.members as any)
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
