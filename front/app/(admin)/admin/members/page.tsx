import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createClient();

  // Ambil sesi user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verifikasi peran (role) user
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/dashboard");
  }

  // Ambil daftar member_id yang terdaftar sebagai admin (active/pending) untuk diexclude
  const { data: adminRoles } = await supabase
    .from("admin_roles")
    .select("member_id")
    .neq("status", "revoked");

  const adminMemberIds = (adminRoles || []).map((r) => r.member_id).filter(Boolean);

  // Tarik data seluruh member untuk tabel admin (kecuali admin & pending/active admin)
  let membersQuery = supabase
    .from("members")
    .select("*")
    .neq("role", "admin");

  if (adminMemberIds.length > 0) {
    membersQuery = membersQuery.not("id", "in", `(${adminMemberIds.join(",")})`);
  }

  const { data: members, error } = await membersQuery.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members for admin:", error);
  }

  // Tarik data seluruh paket untuk pemetaan paket di tabel admin
  const { data: packages, error: pkgError } = await supabase
    .from("packages")
    .select("id, name");

  if (pkgError) {
    console.error("Error fetching packages for admin map:", pkgError);
  }

  return <MembersClient initialMembers={members || []} packages={packages || []} />;
}
