import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RegistrationClient from "./RegistrationClient";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
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
    redirect("/myprofile");
  }

  // Tarik data seluruh member untuk tabel admin (kecuali admin dan priority)
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .neq("role", "admin")
    .or("membership_tier.neq.priority,membership_tier.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members for admin registration:", error);
  }

  // Tarik data seluruh paket untuk pemetaan paket di tabel admin
  const { data: packages, error: pkgError } = await supabase
    .from("packages")
    .select("id, name");

  if (pkgError) {
    console.error("Error fetching packages for admin map:", pkgError);
  }

  return <RegistrationClient initialMembers={members || []} packages={packages || []} />;
}
