"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { syncDualOperation } from "@/lib/supabase/dual-sync";
import { revalidatePath } from "next/cache";

export async function saveMentoringSessionAction(
  data: {
    member_id: string;
    mentor_id: string;
    package_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    platform: string;
    meeting_link: string;
    location: string;
    session_number: number;
    notes: string;
    status: string;
  },
  id?: string
) {
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
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const permissionType = id ? "edit" : "create";
  const hasAccess = await checkPermission("mentoring", permissionType);
  if (!hasAccess) {
    return {
      success: false,
      error: `Akses ditolak: Anda tidak memiliki izin untuk ${id ? "mengedit" : "menambah"} sesi mentoring.`,
    };
  }

  const payload = {
    member_id: data.member_id,
    mentor_id: data.mentor_id,
    package_id: data.package_id,
    session_date: data.session_date,
    start_time: data.start_time,
    end_time: data.end_time,
    platform: data.platform,
    meeting_link: data.platform !== "offline" ? data.meeting_link : "",
    location: data.platform === "offline" ? data.location : "",
    session_number: data.session_number,
    notes: data.notes || "",
    status: data.status,
  };

  const { error } = await syncDualOperation(async (client) => {
    if (id) {
      const { error: err } = await client
        .from("mentoring_sessions")
        .update(payload)
        .eq("id", id);
      if (err) throw err;
    } else {
      const { error: err } = await client
        .from("mentoring_sessions")
        .insert([payload]);
      if (err) throw err;
    }
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/mentoring");
  return { success: true };
}

export async function deleteMentoringSessionAction(id: string) {
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
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const hasAccess = await checkPermission("mentoring", "delete");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk menghapus sesi mentoring.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("mentoring_sessions")
      .delete()
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/mentoring");
  return { success: true };
}

export async function updateMentoringStatusAction(id: string, status: string) {
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
  if (!session) return { success: false, error: "Tidak diotorisasi" };

  const hasAccess = await checkPermission("mentoring", "edit");
  if (!hasAccess) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah status sesi.",
    };
  }

  const { error } = await syncDualOperation(async (client) => {
    const { error: err } = await client
      .from("mentoring_sessions")
      .update({ status })
      .eq("id", id);
    if (err) throw err;
    return true;
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/mentoring");
  return { success: true };
}
