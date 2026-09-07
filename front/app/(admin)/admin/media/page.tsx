import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MediaLibraryClient from "./MediaLibraryClient";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
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

  return <MediaLibraryClient />;
}
