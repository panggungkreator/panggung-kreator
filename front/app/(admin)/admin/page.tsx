import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/admin/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Parallelize independent queries to resolve performance waterfall
  const [
    { count: totalMembers },
    { count: paidMembers },
    { data: monthTx },
    { data: chartTx },
    { data: recentEvents },
    { data: recentTx },
    { data: newMembers }
  ] = await Promise.all([
    // 1. Total Members (non-admins)
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("role", "member"),

    // 2. Paid Members (Regular/MVP)
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("role", "member")
      .neq("membership_tier", "free"),

    // 3. Transactions & Revenue this calendar month
    supabase
      .from("transactions")
      .select("final_amount")
      .eq("status", "paid")
      .gte("paid_at", startOfMonth),

    // 4. Last 7 Days Paid Transactions Dataset for Recharts
    supabase
      .from("transactions")
      .select("final_amount, paid_at")
      .eq("status", "paid")
      .gte("paid_at", sevenDaysAgo.toISOString())
      .order("paid_at", { ascending: true }),

    // 5. Recent events (3)
    supabase
      .from("events")
      .select("title, event_date, event_type")
      .order("event_date", { ascending: false })
      .limit(3),

    // 6. Recent transactions (5) with joins
    supabase
      .from("transactions")
      .select("final_amount, status, created_at, members(full_name), packages(name)")
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. New members (5)
    supabase
      .from("members")
      .select("full_name, email, membership_tier, created_at")
      .eq("role", "member")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const monthTxCount = monthTx?.length || 0;
  const monthRevenue = monthTx?.reduce((sum, tx) => sum + (tx.final_amount || 0), 0) || 0;

  // Map to past 7 days calendar dates (for chart fallback/interpolation)
  const chartData: Array<{ name: string; value: number; dateKey: string }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateLabel = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const key = d.toDateString();
    chartData.push({ name: dateLabel, value: 0, dateKey: key });
  }

  chartTx?.forEach((tx) => {
    if (!tx.paid_at) return;
    const txDate = new Date(tx.paid_at);
    const matched = chartData.find((item) => {
      const itemDate = new Date(item.dateKey);
      return (
        itemDate.getFullYear() === txDate.getFullYear() &&
        itemDate.getMonth() === txDate.getMonth() &&
        itemDate.getDate() === txDate.getDate()
      );
    });
    if (matched) {
      matched.value += tx.final_amount || 0;
    }
  });

  // Explicit type mapping for TS safety
  const formattedRecentTx = (recentTx || []).map((tx: any) => ({
    final_amount: tx.final_amount,
    status: tx.status,
    created_at: tx.created_at,
    members: tx.members ? { full_name: tx.members.full_name } : null,
    packages: tx.packages ? { name: tx.packages.name } : null,
  }));

  return (
    <DashboardClient
      stats={{
        totalMembers: totalMembers || 0,
        paidMembers: paidMembers || 0,
        monthTxCount,
        monthRevenue,
      }}
      chartData={chartData.map(({ name, value }) => ({ name, value }))}
      recentEvents={recentEvents || []}
      recentTx={formattedRecentTx}
      newMembers={newMembers || []}
    />
  );
}
