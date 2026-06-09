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

    const { data: existingSection } = await supabase
      .from("landing_sections")
      .select("id")
      .eq("section_type", sectionType)
      .maybeSingle();

    if (existingSection) {
      const { error } = await supabase
        .from("landing_sections")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existingSection.id);
      if (error) throw error;
    } else {
      const { data: maxOrder } = await supabase
        .from("landing_sections")
        .select("section_order")
        .order("section_order", { ascending: false })
        .limit(1);
      const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].section_order + 1 : 1;

      const { error } = await supabase
        .from("landing_sections")
        .insert({ 
          section_type: sectionType, 
          content, 
          section_order: nextOrder,
          is_visible: true
        });
      if (error) throw error;
    }

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

    const { data: existingSection } = await supabase
      .from("landing_sections")
      .select("id")
      .eq("section_type", sectionType)
      .maybeSingle();

    if (existingSection) {
      const { error } = await supabase
        .from("landing_sections")
        .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
        .eq("id", existingSection.id);
      if (error) throw error;
    } else {
      const { data: maxOrder } = await supabase
        .from("landing_sections")
        .select("section_order")
        .order("section_order", { ascending: false })
        .limit(1);
      const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].section_order + 1 : 1;

      const { error } = await supabase
        .from("landing_sections")
        .insert({ 
          section_type: sectionType, 
          content: {}, 
          section_order: nextOrder,
          is_visible: isVisible
        });
      if (error) throw error;
    }

    // Revalidate the home page to reflect changes
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error toggling visibility for ${sectionType}:`, error);
    return { success: false, error: error.message };
  }
}
