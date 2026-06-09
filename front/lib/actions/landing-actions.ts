"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper for Supabase client
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

// Fetch all landing sections (publicly accessible)
export async function getLandingSectionsAction() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("landing_sections")
      .select("*")
      .order("section_order", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching landing sections:", error);
    return { success: false, error: error.message };
  }
}

// Update landing section content (Admin only)
export async function updateLandingSectionAction(sectionType: string, content: any) {
  try {
    const supabase = await getSupabaseClient();
    
    // Check if user is authenticated and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak: Hanya admin yang bisa mengedit" };
    }

    const { error } = await supabase
      .from("landing_sections")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("section_type", sectionType);

    if (error) throw error;

    // Revalidate the home page to reflect changes
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating landing section ${sectionType}:`, error);
    return { success: false, error: error.message };
  }
}

// Toggle section visibility (Admin only)
export async function toggleSectionVisibilityAction(sectionType: string, isVisible: boolean) {
  try {
    const supabase = await getSupabaseClient();
    
    // Check if user is authenticated and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Tidak diotorisasi" };

    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!adminMember || adminMember.role !== "admin") {
      return { success: false, error: "Akses ditolak: Hanya admin yang bisa mengubah visibilitas" };
    }

    const { error } = await supabase
      .from("landing_sections")
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
      .eq("section_type", sectionType);

    if (error) throw error;

    // Revalidate the home page to reflect changes
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error toggling visibility for ${sectionType}:`, error);
    return { success: false, error: error.message };
  }
}
