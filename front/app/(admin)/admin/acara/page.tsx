import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AcaraListClient from "./AcaraListClient";

export const dynamic = "force-dynamic";

export default async function AcaraPage() {
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

  // Fetch events along with their attendance records to calculate present counts and attendees
  const { data: rawEvents } = await supabase
    .from("events")
    .select(`
      id,
      title,
      description,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      capacity,
      is_published,
      created_at,
      attendances (
        id,
        is_present,
        members (
          full_name,
          avatar_url
        )
      )
    `)
    .order("event_date", { ascending: false });

  const events = rawEvents || [];

  // Format events for client consumption
  const formattedEvents = events.map((e: any) => {
    const presentList = (e.attendances || []).filter((a: any) => a.is_present);
    const presentCount = presentList.length;
    const totalRegistered = (e.attendances || []).length;
    
    const attendees = presentList
      .filter((a: any) => a.members)
      .map((a: any) => ({
        name: a.members?.full_name || "Peserta",
        avatar: a.members?.avatar_url || null,
      }))
      .slice(0, 4);

    return {
      id: e.id,
      title: e.title,
      description: e.description || "",
      event_type: e.event_type || "lainnya",
      event_date: e.event_date,
      start_time: e.start_time || "",
      end_time: e.end_time || "",
      location: e.location || "",
      capacity: e.capacity || 0,
      is_published: e.is_published ?? false,
      created_at: e.created_at,
      present_count: presentCount,
      total_registered: totalRegistered,
      attendees,
    };
  });


  return <AcaraListClient initialEvents={formattedEvents} />;
}
