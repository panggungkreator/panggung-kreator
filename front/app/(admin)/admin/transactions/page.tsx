import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
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

  // Fetch all transactions with member and package details in parallel
  const [txResponse, packagesResponse] = await Promise.all([
    supabase
      .from("transactions")
      .select(`
        id,
        member_id,
        package_id,
        voucher_id,
        order_id,
        status,
        gross_amount,
        discount_amount,
        final_amount,
        payment_method,
        paid_at,
        expired_at,
        created_at,
        members (
          full_name,
          email
        ),
        packages (
          name
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("packages")
      .select("id, name")
  ]);

  const rawTx = txResponse.data || [];
  const packages = packagesResponse.data || [];

  // Format transactions to ensure strict typescript safety
  const formattedTransactions = rawTx.map((tx: any) => ({
    id: tx.id,
    member_id: tx.member_id,
    package_id: tx.package_id,
    voucher_id: tx.voucher_id,
    order_id: tx.order_id,
    status: tx.status,
    gross_amount: tx.gross_amount || 0,
    discount_amount: tx.discount_amount || 0,
    final_amount: tx.final_amount || 0,
    payment_method: tx.payment_method || "N/A",
    paid_at: tx.paid_at,
    expired_at: tx.expired_at,
    created_at: tx.created_at,
    member_name: tx.members?.full_name || "MEMBER TERHAPUS",
    member_email: tx.members?.email || "",
    package_name: tx.packages?.name || "TIDAK ADA PAKET",
  }));

  return (
    <TransactionsClient 
      initialTransactions={formattedTransactions} 
      packages={packages} 
    />
  );
}
