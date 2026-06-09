import React from "react";
import { getPackageAction, getPackagesAction } from "@/lib/actions/package-actions";
import CheckoutClient from "./CheckoutClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ packageId?: string }> }) {
  let selectedPackage = null;
  const resolvedParams = await searchParams;

  // 1. If packageId is provided, fetch it
  if (resolvedParams.packageId) {
    const { data, success } = await getPackageAction(resolvedParams.packageId);
    if (success && data) {
      selectedPackage = data;
    }
  }

  // 2. If no valid package found from URL, fallback to default package
  if (!selectedPackage) {
    const { data: packages, success } = await getPackagesAction();
    if (success && packages && packages.length > 0) {
      // Find the one marked as default, or fallback to the first one
      selectedPackage = packages.find((p: any) => p.is_default) || packages[0];
    }
  }

  // If still no package found, meaning database is completely empty
  if (!selectedPackage) {
    redirect("/"); // Or show a 404, but redirect to home is safer
  }

  return <CheckoutClient selectedPackage={selectedPackage} />;
}
