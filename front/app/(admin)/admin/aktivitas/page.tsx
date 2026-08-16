import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AktivitasClient from "./AktivitasClient";

export const dynamic = "force-dynamic";

export default async function AktivitasPage() {
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

  // Query 1: Attendances per month (is_present = true)
  const { data: monthlyRaw } = await supabase
    .from("attendances")
    .select(`
      id,
      event:events (
        event_date
      )
    `)
    .eq("is_present", true);

  const monthlyMap: Record<string, number> = {};

  if (monthlyRaw) {
    monthlyRaw.forEach((att: any) => {
      const dateStr = att.event?.event_date;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
    });
  }

  const monthlyData = Object.entries(monthlyMap).map(([month, total]) => ({
    month,
    total,
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Query 2: Top 10 active members by attendance counts
  const { data: membersRaw } = await supabase
    .from("attendances")
    .select(`
      id,
      member:members (
        full_name
      )
    `)
    .eq("is_present", true);

  const memberMap: Record<string, number> = {};

  if (membersRaw) {
    membersRaw.forEach((att: any) => {
      const name = att.member?.full_name || "MEMBER TERHAPUS";
      memberMap[name] = (memberMap[name] || 0) + 1;
    });
  }

  const membersData = Object.entries(memberMap).map(([name, count]) => ({
    name,
    hadir: count,
  }))
    .sort((a, b) => b.hadir - a.hadir)
    .slice(0, 10);

  return (
    <AktivitasClient 
      dbMonthly={monthlyData} 
      dbMembers={membersData} 
    />
  );
}
