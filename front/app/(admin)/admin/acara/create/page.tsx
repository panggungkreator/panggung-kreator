import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AcaraCreateForm from "./AcaraCreateForm";

export const dynamic = "force-dynamic";

export default async function AcaraCreatePage() {
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

  // Fetch venues ordered by highest usage frequency and last used date
  const [venuesResponse, eventTypesResponse] = await Promise.all([
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

  const venues = venuesResponse.data || [];
  const eventTypes = eventTypesResponse.data || [];

  return <AcaraCreateForm venues={venues} initialEventTypes={eventTypes} />;
}
