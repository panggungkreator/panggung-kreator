"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { syncDualOperation } from "@/lib/supabase/dual-sync";

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

  // Verifikasi role admin & permissions
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const hasAccess = await checkPermission("voucher", "view");
  if (!hasAccess) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin untuk melihat voucher." };
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

  // Verifikasi admin & permissions
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  
  const hasAccess = await checkPermission("voucher", "create");
  if (!hasAccess) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin untuk membuat voucher." };
  }

  const payload = {
    code: data.code.toUpperCase(),
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    max_uses: data.max_uses,
    is_active: true
  };

  const { devResult, error } = await syncDualOperation(async (client) => {
    const { error: insErr } = await client.from("vouchers").insert(payload);
    if (insErr) throw insErr;
    return true;
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
  
  const hasAccess = await checkPermission("voucher", "delete");
  if (!hasAccess) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus voucher." };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: delErr } = await client.from("vouchers").delete().eq("id", id);
    if (delErr) throw delErr;
    return true;
  });

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
  
  const hasAccess = await checkPermission("voucher", "edit");
  if (!hasAccess) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin untuk mengedit voucher." };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: updErr } = await client
      .from("vouchers")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (updErr) throw updErr;
    return true;
  });

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

  // Verifikasi admin & permissions
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Tidak diotorisasi" };
  
  const hasAccess = await checkPermission("voucher", "edit");
  if (!hasAccess) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin untuk mengedit voucher." };
  }

  const payload = {
    code: data.code.toUpperCase(),
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    max_uses: data.max_uses
  };

  const { error } = await syncDualOperation(async (client) => {
    const { error: updErr } = await client
      .from("vouchers")
      .update(payload)
      .eq("id", id);
    if (updErr) throw updErr;
    return true;
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: "Kode voucher sudah ada." };
    return { success: false, error: error.message };
  }
  return { success: true };
}

