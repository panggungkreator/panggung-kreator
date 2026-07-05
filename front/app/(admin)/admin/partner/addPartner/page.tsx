import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddPartnerClient from "./AddPartnerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AddPartnerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id;
  const supabase = await createClient();

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify role
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/dashboard");
  }

  let initialPartner = null;
  if (id) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .single();
    if (data && !error) {
      initialPartner = data;
    }
  }

  return <AddPartnerClient initialPartner={initialPartner} />;
}
