import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddGalleryClient from "./AddGalleryClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AddGalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id;
  const supabase = await createClient();

  // Check user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify user role
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/dashboard");
  }

  let initialAlbum = null;
  if (id) {
    const { data, error } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("id", id)
      .single();
    if (data && !error) {
      initialAlbum = data;
    }
  }

  return <AddGalleryClient initialAlbum={initialAlbum} />;
}
