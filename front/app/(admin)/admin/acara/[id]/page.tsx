import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import AcaraDetailClient from "./AcaraDetailClient";
import { checkPermission, getPermissionMap } from "@/lib/check-permission";
import { isDedicatedAdmin } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AcaraDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id: eventId } = await params;
  if (!eventId) return notFound();

  // ═══ LAYER 1: PAGE GUARD ═══
  await checkPermission("acara", "view", "page");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin role to get permission map
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("id, status")
    .eq("member_id", user.id)
    .maybeSingle();

  let permMap: Record<string, string[]> = {};
  if (adminRole && adminRole.status === "active") {
    permMap = await getPermissionMap(adminRole.id);
  } else {
    permMap = await getPermissionMap();
  }

  // Verify that the user is an admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Fetch event details, event attendances, and members list in parallel
  const [eventResponse, attendancesResponse, membersResponse, adminRolesResponse] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single(),
    supabase
      .from("attendances")
      .select(`
        id,
        event_id,
        member_id,
        is_present,
        scan_method,
        scanned_at,
        created_at,
        members (
          full_name,
          whatsapp_number
        )
      `)
      .eq("event_id", eventId),
    supabase
      .from("members")
      .select("id, full_name, stage_name, username, email, whatsapp_number, role, payment_status")
      .order("full_name", { ascending: true }),
    supabase
      .from("admin_roles")
      .select("member_id")
  ]);

  const event = eventResponse.data;
  const rawAttendances = attendancesResponse.data || [];
  const rawMembers = membersResponse.data || [];
  const adminRoles = adminRolesResponse.data || [];
  
  const adminMemberIds = new Set(adminRoles.map((r: any) => r.member_id));

  // Sertakan semua member aktif/berbayar serta member yang diangkat menjadi admin, KECUALI adminpangkreas
  const members = rawMembers
    .filter((m: any) => {
      if (isDedicatedAdmin(m.username) || isDedicatedAdmin(m.email)) return false;
      return m.payment_status === "paid" || m.role === "admin" || adminMemberIds.has(m.id);
    })
    .map((m: any) => ({
      id: m.id,
      full_name: m.full_name || "Tanpa Nama",
      stage_name: m.stage_name || "",
      whatsapp_number: m.whatsapp_number || "",
      role: (m.role === "admin" || adminMemberIds.has(m.id)) ? "admin" : "member",
    }));

  if (!event) {
    return notFound();
  }

  // Format attendance list for typescript safety
  const formattedAttendances = rawAttendances.map((att: any) => ({
    id: att.id,
    event_id: att.event_id,
    member_id: att.member_id,
    is_present: att.is_present ?? false,
    scan_method: att.scan_method || "manual",
    scanned_at: att.scanned_at || att.created_at,
    member_name: att.members?.full_name || "MEMBER TERHAPUS",
    member_wa: att.members?.whatsapp_number || "",
  }));

  // Format event detail
  const formattedEvent = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    event_type: event.event_type || "lainnya",
    event_date: event.event_date,
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    location: event.location || "",
    capacity: event.capacity || 0,
    is_published: event.is_published ?? false,
  };

  return (
    <AcaraDetailClient
      event={formattedEvent}
      initialAttendances={formattedAttendances}
      members={members}
      permMap={permMap}
    />
  );
}
