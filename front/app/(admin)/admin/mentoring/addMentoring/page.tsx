import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddMentoringClient from "./AddMentoringClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AddMentoringPage({ searchParams }: PageProps) {
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
    redirect("/myprofile");
  }

  let initialSession = null;
  if (id) {
    const { data, error } = await supabase
      .from("mentoring_sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (data && !error) {
      initialSession = data;
    }
  }

  // Fetch members, mentors, and packages for the form dropdowns
  const [membersResponse, mentorsResponse, packagesResponse] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name")
      .eq("role", "member")
      .order("full_name", { ascending: true }),
    supabase
      .from("members")
      .select("id, full_name")
      .eq("role", "admin")
      .order("full_name", { ascending: true }),
    supabase
      .from("packages")
      .select("id, name")
  ]);

  return (
    <AddMentoringClient
      initialSession={initialSession}
      members={membersResponse.data || []}
      mentors={mentorsResponse.data || []}
      packages={packagesResponse.data || []}
    />
  );
}
