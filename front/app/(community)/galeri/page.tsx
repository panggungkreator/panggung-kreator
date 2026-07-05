import React from "react";
import { createClient } from "@/lib/supabase/server";
import GaleriHeroSection from "@/components/galeri/GaleriHeroSection";
import GaleriFilterSection from "@/components/galeri/GaleriFilterSection";
import GaleriCTASection from "@/components/galeri/GaleriCTASection";

export const dynamic = "force-dynamic";

export default async function Page() {
  let albums: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: false });
    
    if (data) {
      albums = data;
    }
  } catch (error) {
    console.error("Error fetching gallery albums:", error);
  }

  return (
    <div className="overflow-x-hidden">
      {/* 1. Hero Section */}
      <GaleriHeroSection />

      {/* 2. Filter & Grid Section */}
      <GaleriFilterSection initialAlbums={albums} />

      {/* 3. CTA Section */}
      <GaleriCTASection />
    </div>
  );
}
