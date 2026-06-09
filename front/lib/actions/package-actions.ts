"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );
}

// Helper to ensure at least one default package exists if table is not empty
async function ensureOneDefaultPackage(supabase: any) {
  const { data: defaultPkg } = await supabase
    .from("packages")
    .select("id")
    .eq("is_default", true)
    .limit(1);

  if (!defaultPkg || defaultPkg.length === 0) {
    const { data: firstPkg } = await supabase
      .from("packages")
      .select("id")
      .order("order_index", { ascending: true })
      .limit(1);

    if (firstPkg && firstPkg.length > 0) {
      await supabase
        .from("packages")
        .update({ is_default: true })
        .eq("id", firstPkg[0].id);
    }
  }
}

// Fetch all packages
export async function getPackagesAction() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return { success: false, error: error.message };
  }
}

// Get single package
export async function getPackageAction(id: string) {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error(`Error fetching package ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Create package (Admin only)
export async function createPackageAction(packageData: any) {
  try {
    const supabase = await getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak" };
    }

    const { data, error } = await supabase
      .from("packages")
      .insert([packageData])
      .select()
      .single();

    if (error) throw error;

    await ensureOneDefaultPackage(supabase);

    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating package:", error);
    return { success: false, error: error.message };
  }
}

// Update package (Admin only)
export async function updatePackageAction(id: string, packageData: any) {
  try {
    const supabase = await getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak" };
    }

    const { error } = await supabase
      .from("packages")
      .update({ ...packageData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    await ensureOneDefaultPackage(supabase);

    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating package ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Delete package (Admin only)
export async function deletePackageAction(id: string) {
  try {
    const supabase = await getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak" };
    }

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await ensureOneDefaultPackage(supabase);

    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting package ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Bulk update order (Admin only)
export async function updatePackagesOrderAction(orderedPackages: { id: string; order_index: number }[]) {
  try {
    const supabase = await getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak" };
    }

    // Update in parallel
    await Promise.all(
      orderedPackages.map((pkg) => 
        supabase.from("packages").update({ order_index: pkg.order_index }).eq("id", pkg.id)
      )
    );

    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating packages order:", error);
    return { success: false, error: error.message };
  }
}

// Set default package (Admin only)
export async function setDefaultPackageAction(id: string) {
  try {
    const supabase = await getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak" };
    }

    // Set target to true, others to false
    await supabase.from("packages").update({ is_default: false }).neq("id", id);
    const { error } = await supabase.from("packages").update({ is_default: true }).eq("id", id);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error: any) {
    console.error("Error setting default package:", error);
    return { success: false, error: error.message };
  }
}
