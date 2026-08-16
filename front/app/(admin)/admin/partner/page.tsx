import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PartnerClient from "./PartnerClient";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
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

  // Fetch all partners
  const { data: rawPartners } = await supabase
    .from("partners")
    .select("*")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });

  const partners = rawPartners || [];

  // Format partners data for typescript safety
  const formattedPartners = partners.map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type || "kafe",
    logo_url: p.logo_url || "",
    website_url: p.website_url || "",
    instagram_url: p.instagram_url || "",
    contact_person: p.contact_person || "",
    contact_wa: p.contact_wa || "",
    description: p.description || "",
    partnership_since: p.partnership_since || "",
    is_active: p.is_active ?? true,
    is_featured: p.is_featured ?? false,
    order_index: p.order_index || 0,
    created_at: p.created_at,
  }));

  return <PartnerClient initialPartners={formattedPartners} />;
}
