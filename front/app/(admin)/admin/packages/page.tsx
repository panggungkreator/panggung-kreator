import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPackagesAction } from "@/lib/actions/package-actions";
import PackagesClient from "./PackagesClient";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
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

  // Tarik data seluruh paket menggunakan server action
  const { data: packages, error } = await getPackagesAction();

  if (error) {
    console.error("Error fetching packages for admin:", error);
  }

  // Tarik batas limit pagination dari pengaturan sistem (default: 10)
  const { getPaginationLimitSettingAction } = await import("@/lib/actions/settings-actions");
  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <PackagesClient
      initialPackages={packages || []}
      paginationLimit={paginationLimit}
    />
  );
}
