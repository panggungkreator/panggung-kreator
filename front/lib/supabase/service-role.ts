import { createClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
  const serviceKey = (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^["']|["']$/g, "");

  return createClient(cleanUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
