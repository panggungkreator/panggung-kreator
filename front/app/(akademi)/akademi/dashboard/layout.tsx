import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "panggungkreator.web.id";

  if (!session?.user) {
    // Redirect to login center (Web Komunitas /login)
    redirect(`https://${rootDomain}/login`);
  }

  // Fetch member data
  const { data: member } = await supabase
    .from("members")
    .select("membership_tier, role, payment_status")
    .eq("id", session.user.id)
    .single();

  // If not paid and not admin, redirect to checkout
  const isPaid = member?.payment_status === "paid" || member?.membership_tier === "regular" || member?.membership_tier === "mvp";
  const isAdmin = member?.role === "admin";

  if (!isPaid && !isAdmin) {
    redirect("/checkout");
  }

  return <>{children}</>;
}
