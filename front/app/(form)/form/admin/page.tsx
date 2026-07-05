import React from "react";
import OnboardingClient from "./OnboardingClient";
import { getTakenColorsAction } from "@/lib/actions/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminOnboardingPage() {
  const { data: takenColors = [] } = await getTakenColorsAction();

  return (
    <OnboardingClient initialTakenColors={takenColors} />
  );
}
