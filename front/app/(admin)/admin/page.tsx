import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="text-center font-mono text-xs md:text-sm tracking-widest text-text-secondary uppercase select-none">
        Dashboard under construction !!!
      </div>
    </div>
  );
}
