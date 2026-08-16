import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResourcesClient from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
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

  // Fetch resources list
  const { data: rawResources } = await supabase
    .from("resources")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  const resources = rawResources || [];

  // Format resources list for strict typing
  const formattedResources = resources.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description || "",
    file_url: r.file_url,
    file_type: r.file_type || "",
    file_size_kb: r.file_size_kb || 0,
    package_tier: r.package_tier || "free",
    category: r.category || "General",
    is_published: r.is_published ?? false,
    order_index: r.order_index || 0,
    uploaded_by: r.uploaded_by,
    created_at: r.created_at,
  }));

  return <ResourcesClient initialResources={formattedResources} />;
}
