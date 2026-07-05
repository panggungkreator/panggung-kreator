import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AcaraCreateForm from "./AcaraCreateForm";

export const dynamic = "force-dynamic";

export default async function AcaraCreatePage() {
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

  // Fetch list of recommended venues to populate location selector
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name, address")
    .order("name", { ascending: true });

  return <AcaraCreateForm venues={venues || []} />;
}
