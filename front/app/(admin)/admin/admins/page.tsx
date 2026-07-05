import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminsClient from "./AdminsClient";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
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

  // Fetch admin roles from DB joining members info using Service Role Client to bypass RLS
  const serviceRoleClient = createServiceRoleClient();
  const { data: adminRoles, error } = await serviceRoleClient
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
    .order("created_at", { ascending: false });

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

  return <AdminsClient initialAdmins={formattedAdmins} />;
}
