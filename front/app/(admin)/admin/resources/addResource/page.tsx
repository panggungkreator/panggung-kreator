import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddResourceClient from "./AddResourceClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AddResourcePage({ searchParams }: PageProps) {
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

  let initialResource = null;
  if (id) {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();
    if (data && !error) {
      initialResource = data;
    }
  }

  return <AddResourceClient initialResource={initialResource} />;
}
