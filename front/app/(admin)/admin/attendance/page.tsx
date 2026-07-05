import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
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
    redirect("/dashboard");
  }

  // Fetch events, members, and attendances in parallel
  const [eventsResponse, membersResponse, attendancesResponse] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_type, event_date")
      .order("event_date", { ascending: false }),
    supabase
      .from("members")
      .select("id, full_name, stage_name, whatsapp_number")
      .eq("role", "member")
      .order("full_name", { ascending: true }),
    supabase
      .from("attendances")
      .select(`
        id,
        event_id,
        member_id,
        is_present,
        scan_method,
        scanned_at,
        created_at,
        members (
          full_name,
          stage_name,
          whatsapp_number
        ),
        events (
          title,
          event_type,
          event_date
        )
      `)
      .order("created_at", { ascending: false })
  ]);

  const rawAttendances = attendancesResponse.data || [];
  const events = eventsResponse.data || [];
  const members = membersResponse.data || [];

  // Format attendance list for strict TypeScript safety
  const formattedAttendances = rawAttendances.map((att: any) => ({
    id: att.id,
    event_id: att.event_id,
    member_id: att.member_id,
    is_present: att.is_present ?? false,
    scan_method: att.scan_method || "manual",
    scanned_at: att.scanned_at || att.created_at,
    member_name: att.members?.full_name || "MEMBER TERHAPUS",
    member_stage_name: att.members?.stage_name || "",
    member_wa: att.members?.whatsapp_number || "",
    event_title: att.events?.title || "EVENT TERHAPUS",
    event_type: att.events?.event_type || "",
    event_date: att.events?.event_date || "",
  }));

  return (
    <AttendanceClient
      initialAttendances={formattedAttendances}
      events={events}
      members={members}
    />
  );
}
