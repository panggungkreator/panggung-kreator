import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VenueClient from "./VenueClient";

export const dynamic = "force-dynamic";

export default async function VenuePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify that the user is an admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Fetch all venues ordered by order_index and name
  const { data: rawVenues } = await supabase
    .from("venues")
    .select("*")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });

  const venues = rawVenues || [];

  // Format venues data for typescript safety
  const formattedVenues = venues.map((v: any) => ({
    id: v.id,
    name: v.name,
    address: v.address || "",
    city: v.city || "",
    description: v.description || "",
    capacity: v.capacity || 0,
    contact_wa: v.contact_wa || "",
    contact_name: v.contact_name || "",
    latitude: v.latitude || 0,
    longitude: v.longitude || 0,
    photo_urls: Array.isArray(v.photo_urls) ? v.photo_urls : [],
    order_index: v.order_index || 0,
    created_at: v.created_at,
  }));

  return <VenueClient initialVenues={formattedVenues} />;
}
