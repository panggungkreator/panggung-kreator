import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VoucherManagement from "./VoucherManagement";

export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const supabase = await createClient();

  // Ambil sesi user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verifikasi peran (role) user
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Tarik data seluruh voucher
  const { data: vouchers, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vouchers for admin:", error);
  }

  return (
    <div className="flex flex-col h-full animate-fade-in p-8 text-zinc-800">
      {/* Main Content Title Area */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-title text-zinc-900 dark:text-white">
          Voucher Diskon
        </h2>
      </div>

      <VoucherManagement initialVouchers={vouchers || []} />
    </div>
  );
}
