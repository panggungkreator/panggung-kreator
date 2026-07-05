import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GaleriCMSClient from "./GaleriCMSClient";

export const dynamic = "force-dynamic";

export default async function GaleriCMSPage() {
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

  // Tarik data seluruh album galeri
  const { data: albums, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Error fetching gallery albums for admin:", error);
  }

  return <GaleriCMSClient initialAlbums={albums || []} />;
}
