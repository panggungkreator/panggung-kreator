import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GaleriCMSClient from "./GaleriCMSClient";
import { getPaginationLimitSettingAction } from "@/lib/actions/settings-actions";

export const dynamic = "force-dynamic";

export default async function GaleriCMSPage() {
  const supabase = await createClient();

  // Ambil user yang terotentikasi
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi peran (role) user
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Tarik data seluruh album galeri & pagination setting secara paralel
  const [{ data: albums, error }, paginationLimit] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select("*")
      .order("event_date", { ascending: false }),
    getPaginationLimitSettingAction(),
  ]);

  if (error) {
    console.error("Error fetching gallery albums for admin:", error);
  }

  return (
    <GaleriCMSClient
      initialAlbums={albums || []}
      paginationLimit={paginationLimit}
    />
  );
}
