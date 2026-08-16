import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PaymentClient from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
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

  // Fetch transactions (including member details, package details, and metadata)
  const { data: rawTx } = await supabase
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
      metadata,
      created_at,
      members (
        full_name,
        email,
        membership_tier
      ),
      packages (
        name,
        tier
      )
    `)
    .order("created_at", { ascending: false });

  const transactions = rawTx || [];

  // Format transactions for strict typing
  const formattedTransactions = transactions.map((tx: any) => ({
    id: tx.id,
    member_id: tx.member_id,
    package_id: tx.package_id,
    voucher_id: tx.voucher_id,
    order_id: tx.order_id,
    status: tx.status,
    gross_amount: tx.gross_amount || 0,
    discount_amount: tx.discount_amount || 0,
    final_amount: tx.final_amount || 0,
    payment_method: tx.payment_method || "Transfer Bank",
    paid_at: tx.paid_at,
    expired_at: tx.expired_at,
    created_at: tx.created_at,
    metadata: tx.metadata || null,
    member_name: tx.members?.full_name || "MEMBER TERHAPUS",
    member_email: tx.members?.email || "",
    member_tier: tx.members?.membership_tier || "free",
    package_name: tx.packages?.name || "TIDAK ADA PAKET",
    package_tier: tx.packages?.tier || "free",
  }));

  return <PaymentClient initialTransactions={formattedTransactions} />;
}
