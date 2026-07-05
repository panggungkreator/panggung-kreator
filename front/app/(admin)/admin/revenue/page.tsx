import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RevenueClient from "./RevenueClient";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
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

  // Query 1: Revenue per month (12 months)
  const { data: monthlyRaw } = await supabase
    .from("transactions")
    .select("paid_at, final_amount")
    .eq("status", "paid");

  // Aggregate monthly in JS to avoid complex date_trunc queries that depend on Postgres timezone settings
  const monthlyMap: Record<string, { total: number; count: number }> = {};
  
  if (monthlyRaw) {
    monthlyRaw.forEach((tx: any) => {
      if (!tx.paid_at) return;
      const date = new Date(tx.paid_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0, count: 0 };
      }
      monthlyMap[monthKey].total += tx.final_amount || 0;
      monthlyMap[monthKey].count++;
    });
  }

  const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    total: data.total,
    jumlah: data.count,
  })).sort((a, b) => b.month.localeCompare(a.month));

  // Query 2: Revenue per package
  // We can fetch transactions and join packages
  const { data: packageRaw } = await supabase
    .from("transactions")
    .select(`
      final_amount,
      packages (
        name
      )
    `)
    .eq("status", "paid");

  const packageMap: Record<string, { total: number; count: number }> = {};

  if (packageRaw) {
    packageRaw.forEach((tx: any) => {
      const name = tx.packages?.name || "TIDAK ADA PAKET";
      if (!packageMap[name]) {
        packageMap[name] = { total: 0, count: 0 };
      }
      packageMap[name].total += tx.final_amount || 0;
      packageMap[name].count++;
    });
  }

  const packagesData = Object.entries(packageMap).map(([name, data]) => ({
    name,
    total: data.total,
    jumlah: data.count,
  })).sort((a, b) => b.total - a.total);

  return (
    <RevenueClient 
      dbMonthly={monthlyData} 
      dbPackages={packagesData} 
    />
  );
}
