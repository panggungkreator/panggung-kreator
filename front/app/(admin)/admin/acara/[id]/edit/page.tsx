import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import AcaraEditForm from "./AcaraEditForm";
import { checkPermission } from "@/lib/check-permission";

export const dynamic = "force-dynamic";

export default async function AcaraEditPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id: eventId } = await params;
  if (!eventId) return notFound();

  // ═══ LAYER 1: PAGE GUARD ═══
  await checkPermission("acara", "edit", "page");

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

  // Fetch event details and list of venues in parallel
  const [eventResponse, venuesResponse] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single(),
    supabase
      .from("venues")
      .select("id, name, address")
      .order("name", { ascending: true })
  ]);

  const event = eventResponse.data;
  const venues = venuesResponse.data || [];

  if (!event) {
    return notFound();
  }

  return <AcaraEditForm event={event} venues={venues} />;
}
