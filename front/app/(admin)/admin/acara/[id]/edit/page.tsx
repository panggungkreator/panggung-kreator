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

  // Fetch event details, venues sorted by usage frequency, and event types in parallel
  const [eventResponse, venuesResponse, eventTypesResponse] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single(),
    supabase
      .from("venues")
      .select("id, name, address, use_count, last_used_at")
      .order("use_count", { ascending: false })
      .order("last_used_at", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true }),
    supabase
      .from("event_types")
      .select("id, name, value, color")
      .order("name", { ascending: true })
  ]);

  const event = eventResponse.data;
  const venues = venuesResponse.data || [];
  const eventTypes = eventTypesResponse.data || [];

  if (!event) {
    return notFound();
  }

  return <AcaraEditForm event={event} venues={venues} initialEventTypes={eventTypes} />;
}
