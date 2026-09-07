import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AffiliatePayoutClient from "./AffiliatePayoutClient";
import { getAffiliatePayoutDataAction } from "@/lib/actions/referral-actions";

export const dynamic = "force-dynamic";

export default async function AffiliatePayoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi peran admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Ambil data payout menggunakan Server Action
  const payoutData = await getAffiliatePayoutDataAction();

  const affiliators = payoutData.success && payoutData.data ? payoutData.data.affiliators : [];
  const payouts = payoutData.success && payoutData.data ? payoutData.data.payouts : [];
  const mutations = payoutData.success && payoutData.data ? payoutData.data.mutations : [];
  const transactions = payoutData.success && payoutData.data ? (payoutData.data.transactions || []) : [];

  return (
    <AffiliatePayoutClient
      initialAffiliators={affiliators}
      initialPayouts={payouts}
      initialMutations={mutations}
      initialTransactions={transactions}
    />
  );
}
