"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getVouchersAction() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // Verifikasi role admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const { data: adminMember } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminMember || adminMember.role !== "admin") {
    return { success: false, error: "Hanya admin yang diperbolehkan." };
  }

  const { data: vouchers, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, vouchers };
}

export async function createVoucherAction(data: {
  code: string;
  discount_type: "nominal" | "percentage";
  discount_value: number;
  max_uses: number;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // Verifikasi admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  const { data: adminMember } = await supabase.from("members").select("role").eq("id", session.user.id).single();
  if (!adminMember || adminMember.role !== "admin") return { success: false, error: "Hanya admin yang diperbolehkan." };

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get(name: string) { return ""; }, set() {}, remove() {} } }
  );

  const { error } = await supabaseAdmin.from("vouchers").insert({
    code: data.code.toUpperCase(),
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    max_uses: data.max_uses,
    is_active: true
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: "Kode voucher sudah ada." };
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteVoucherAction(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  const { data: adminMember } = await supabase.from("members").select("role").eq("id", session.user.id).single();
  if (!adminMember || adminMember.role !== "admin") return { success: false, error: "Hanya admin yang diperbolehkan." };

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get(name: string) { return ""; }, set() {}, remove() {} } }
  );

  const { error } = await supabaseAdmin.from("vouchers").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleVoucherAction(id: string, currentStatus: boolean) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  const { data: adminMember } = await supabase.from("members").select("role").eq("id", session.user.id).single();
  if (!adminMember || adminMember.role !== "admin") return { success: false, error: "Hanya admin yang diperbolehkan." };

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get(name: string) { return ""; }, set() {}, remove() {} } }
  );

  const { error } = await supabaseAdmin.from("vouchers").update({ is_active: !currentStatus }).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateVoucherAction(id: string, data: {
  code: string;
  discount_type: "nominal" | "percentage";
  discount_value: number;
  max_uses: number;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // Verifikasi admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  const { data: adminMember } = await supabase.from("members").select("role").eq("id", session.user.id).single();
  if (!adminMember || adminMember.role !== "admin") return { success: false, error: "Hanya admin yang diperbolehkan." };

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get(name: string) { return ""; }, set() {}, remove() {} } }
  );

  const { error } = await supabaseAdmin.from("vouchers").update({
    code: data.code.toUpperCase(),
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    max_uses: data.max_uses
  }).eq("id", id);

  if (error) {
    if (error.code === '23505') return { success: false, error: "Kode voucher sudah ada." };
    return { success: false, error: error.message };
  }
  return { success: true };
}

