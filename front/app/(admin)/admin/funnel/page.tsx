import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FunnelClient from "./FunnelClient";

export const dynamic = "force-dynamic";

export default async function FunnelPage() {
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

  // Query actual membership tiers counts
  const { data: rawCounts } = await supabase
    .from("members")
    .select("membership_tier");

  const countsMap = {
    free: 0,
    regular: 0,
    mvp: 0,
  };

  if (rawCounts) {
    rawCounts.forEach((m: any) => {
      const tier = m.membership_tier || "free";
      if (tier === "regular") {
        countsMap.regular++;
      } else if (tier === "mvp") {
        countsMap.mvp++;
      } else {
        countsMap.free++;
      }
    });
  }

  return <FunnelClient dbCounts={countsMap} />;
}
