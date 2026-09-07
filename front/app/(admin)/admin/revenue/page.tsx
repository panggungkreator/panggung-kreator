import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RevenueClient from "./RevenueClient";
import { getPaginationLimitSettingAction } from "@/lib/actions/settings-actions";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
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

  // Query 1: Revenue per month (dihitung mulai 7 September 2026)
  const { data: monthlyRaw } = await supabase
    .from("transactions")
    .select(`
      paid_at,
      final_amount,
      members!inner (
        created_at
      )
    `)
    .eq("status", "paid")
    .gte("members.created_at", "2026-09-07T00:00:00+07:00");

  // Aggregate monthly in JS
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

  // Query 2: Revenue per package (dihitung mulai 7 September 2026)
  const { data: packageRaw } = await supabase
    .from("transactions")
    .select(`
      final_amount,
      packages (
        name
      ),
      members!inner (
        created_at
      )
    `)
    .eq("status", "paid")
    .gte("members.created_at", "2026-09-07T00:00:00+07:00");

  const packageMap: Record<string, { total: number; count: number }> = {};

  if (packageRaw) {
    packageRaw.forEach((tx: any) => {
      const name = tx.packages?.name || "Akademi Regular";
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

  // Query 3: Rincian transaksi membership (dihitung mulai 7 September 2026)
  const { data: rawTransactions } = await supabase
    .from("transactions")
    .select(`
      id,
      order_id,
      created_at,
      paid_at,
      final_amount,
      gross_amount,
      discount_amount,
      commission_earned,
      referral_code,
      status,
      member:members!transactions_member_id_fkey (
        id,
        full_name,
        stage_name,
        username,
        email,
        created_at,
        whatsapp_number
      ),
      referrer:members!transactions_referred_by_id_fkey (
        id,
        full_name,
        stage_name,
        username,
        affiliate_code
      ),
      package:packages (
        id,
        name
      )
    `)
    .eq("status", "paid")
    .gte("members.created_at", "2026-09-07T00:00:00+07:00")
    .order("created_at", { ascending: false });

  const membershipTransactions = (rawTransactions || []).map((tx: any) => {
    let gross = Number(tx.gross_amount) || 0;
    if (gross <= 0) {
      const finalAmt = Number(tx.final_amount) || 0;
      const uniqueCode = finalAmt > 1000 ? finalAmt % 1000 : 0;
      gross = Math.max(0, finalAmt - uniqueCode) || 49000;
    }

    const comm = tx.commission_earned != null 
      ? Number(tx.commission_earned) 
      : (tx.referrer || tx.referral_code ? Math.round((gross * 30) / 100) : 0);
    const net = Math.max(0, gross - comm);

    return {
      id: tx.id,
      orderId: tx.order_id || "-",
      memberName: tx.member?.full_name || "Member Panggung",
      stageName: tx.member?.stage_name || "",
      username: tx.member?.username || "member",
      email: tx.member?.email || "",
      whatsapp: tx.member?.whatsapp_number || "",
      registeredDate: tx.member?.created_at || tx.created_at,
      paidDate: tx.paid_at || tx.created_at,
      packageName: tx.package?.name || "Akademi Regular",
      amount: gross,
      referrerName: tx.referrer?.stage_name || tx.referrer?.full_name || (tx.referral_code ? `Ref: ${tx.referral_code}` : ""),
      referrerUsername: tx.referrer?.username || "",
      referralCode: tx.referral_code || tx.referrer?.affiliate_code || "",
      commissionAmount: comm,
      netAmount: net,
      status: tx.status || "paid",
    };
  });

  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <RevenueClient 
      dbMonthly={monthlyData} 
      dbPackages={packagesData}
      dbTransactions={membershipTransactions}
      paginationLimit={paginationLimit}
    />
  );
}
