import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogsClient from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
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

  // Fetch admin logs and list of admins in parallel
  const [logsResponse, adminsResponse] = await Promise.all([
    supabase
      .from("admin_activity_logs")
      .select(`
        id,
        admin_id,
        action,
        module,
        target_id,
        description,
        old_data,
        new_data,
        ip_address,
        created_at,
        admin:members!admin_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false }),
    // Fetch all admins for filter select list
    supabase
      .from("members")
      .select("id, full_name")
      .neq("role", "member")
      .order("full_name", { ascending: true })
  ]);

  const rawLogs = logsResponse.data || [];
  const admins = adminsResponse.data || [];

  // Format logs for client-side consumption
  const formattedLogs = rawLogs.map((log: any) => ({
    id: log.id,
    admin_id: log.admin_id,
    action: log.action || "CREATE",
    module: log.module || "General",
    target_id: log.target_id || null,
    description: log.description || "",
    old_data: log.old_data || null,
    new_data: log.new_data || null,
    ip_address: log.ip_address || "127.0.0.1",
    created_at: log.created_at,
    admin_name: log.admin?.full_name || "ADMIN TERHAPUS",
    admin_email: log.admin?.email || "",
  }));

  return (
    <LogsClient 
      initialLogs={formattedLogs} 
      adminsList={admins} 
    />
  );
}
