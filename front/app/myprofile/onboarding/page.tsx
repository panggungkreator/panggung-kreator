import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getMemberOnboardingDataAction } from "@/lib/actions/onboarding-actions";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function MemberOnboardingPage() {
  const result = await getMemberOnboardingDataAction();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  const { role, hasCompletedInterests, initialData, membership_tier } = result.data;

  // Jika admin, lempar ke dashboard admin
  if (role === "admin") {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const isLocalhost =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(host.split(":")[0]);

    if (!isLocalhost && process.env.NEXT_PUBLIC_ADMIN_URL) {
      redirect(process.env.NEXT_PUBLIC_ADMIN_URL);
    } else {
      redirect("/admin");
    }
  }

  // Jika member sudah pernah melengkapi data minat, lempar ke /myprofile
  if (hasCompletedInterests) {
    redirect("/myprofile");
  }

  return <OnboardingClient initialData={initialData} tierName={membership_tier} />;
}
