import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getCookieDomain } from "@/lib/utils/url";

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

  const host = headersList.get("host") || "";
  const cookieDomain = getCookieDomain(host);


  return createServerClient(
    cleanUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions: any = {
                name,
                value,
                ...options,
                path: "/",
              };
              if (cookieDomain) {
                cookieOptions.domain = cookieDomain;
              }
              cookieStore.set(cookieOptions);
            });
          } catch (error) {
            // Diabaikan jika dipanggil dari Server Component
          }
        },
      },
    }
  );
}
