import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cleanHost = host.split(":")[0];
  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost");

  let rootDomain = "panggungkreator.web.id";
  if (!isLocalhost) {
    const parts = cleanHost.split(".");
    if (parts.length >= 2) {
      if (cleanHost.endsWith(".web.id") && parts.length >= 3) {
        rootDomain = parts.slice(-3).join(".");
      } else {
        rootDomain = parts.slice(-2).join(".");
      }
    }
  }

  if (!user) {
    // Redirect to login center (Web Komunitas /login)
    redirect(`https://${rootDomain}/login`);
  }

  // Fetch member data
  const { data: member } = await supabase
    .from("members")
    .select("membership_tier, role, payment_status")
    .eq("id", user!.id)
    .single();

  // If not paid and not admin, redirect to checkout
  const isPaid = member?.payment_status === "paid" || member?.membership_tier === "regular" || member?.membership_tier === "mvp";
  const isAdmin = member?.role === "admin";

  if (!isPaid && !isAdmin) {
    redirect("/checkout");
  }

  return <>{children}</>;
}
