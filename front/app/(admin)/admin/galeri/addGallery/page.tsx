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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user role
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
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

  // Fetch all events
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, title, event_type, event_date")
    .order("event_date", { ascending: false });

  // Fetch all gallery albums to know which events are already assigned
  let galleriesData: { id: string; event_id?: string | null; title: string }[] = [];
  const { data: gData, error: gErr } = await supabase
    .from("gallery_albums")
    .select("id, event_id, title");

  if (gErr) {
    const { data: fallbackGData } = await supabase
      .from("gallery_albums")
      .select("id, title");
    galleriesData = fallbackGData || [];
  } else {
    galleriesData = gData || [];
  }

  return (
    <AddGalleryClient
      initialAlbum={initialAlbum}
      events={eventsData || []}
      existingGalleries={galleriesData}
    />
  );
}
