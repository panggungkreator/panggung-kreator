import React from "react";
import { createClient } from "@supabase/supabase-js";
import CollaborationsClient, { PartnerItem } from "./CollaborationsClient";

export default async function CollaborationsSection() {
  let partners: PartnerItem[] = [];

  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

    if (cleanUrl && anonKey) {
      const supabase = createClient(cleanUrl, anonKey);
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, type, logo_url, website_url, instagram_url, description, is_active, order_index")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });

      if (!error && data) {
        partners = data as PartnerItem[];
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data partners:", err);
  }

  return <CollaborationsClient partners={partners} />;
}
