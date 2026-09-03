import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MentoringClient from "./MentoringClient";

export const dynamic = "force-dynamic";

export default async function MentoringPage() {
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

  // Fetch mentoring sessions, members list, and packages in parallel
  const [sessionsResponse, membersResponse, mentorsResponse, packagesResponse] = await Promise.all([
    supabase
      .from("mentoring_sessions")
      .select(`
        id,
        member_id,
        mentor_id,
        package_id,
        session_date,
        start_time,
        end_time,
        platform,
        meeting_link,
        location,
        status,
        session_number,
        notes,
        member_notes,
        created_at,
        member:members!member_id (
          full_name,
          email
        ),
        mentor:members!mentor_id (
          full_name
        ),
        packages (
          name
        )
      `)
      .order("session_date", { ascending: false }),
    // Fetch members for session creation dropdown
    supabase
      .from("members")
      .select("id, full_name")
      .eq("role", "member")
      .order("full_name", { ascending: true }),
    // Fetch admins/mentors for session creation dropdown
    supabase
      .from("members")
      .select("id, full_name")
      .eq("role", "admin")
      .order("full_name", { ascending: true }),
    // Fetch packages
    supabase
      .from("packages")
      .select("id, name")
  ]);

  const rawSessions = sessionsResponse.data || [];
  const members = membersResponse.data || [];
  const mentors = mentorsResponse.data || [];
  const packages = packagesResponse.data || [];

  // Format mentoring sessions for client-side type safety
  const formattedSessions = rawSessions.map((s: any) => ({
    id: s.id,
    member_id: s.member_id,
    mentor_id: s.mentor_id,
    package_id: s.package_id,
    session_date: s.session_date,
    start_time: s.start_time,
    end_time: s.end_time,
    platform: s.platform || "zoom",
    meeting_link: s.meeting_link || "",
    location: s.location || "",
    status: s.status || "scheduled",
    session_number: s.session_number || 1,
    notes: s.notes || "",
    member_notes: s.member_notes || "",
    created_at: s.created_at,
    member_name: s.member?.full_name || "MEMBER TERHAPUS",
    member_email: s.member?.email || "",
    mentor_name: s.mentor?.full_name || "MENTOR TERHAPUS",
    package_name: s.packages?.name || "TIDAK ADA PAKET",
  }));

  // Fetch pagination limit setting
  const { getPaginationLimitSettingAction } = await import("@/lib/actions/settings-actions");
  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <MentoringClient
      initialSessions={formattedSessions}
      members={members}
      mentors={mentors}
      packages={packages}
      paginationLimit={paginationLimit}
    />
  );
}
