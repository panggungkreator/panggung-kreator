import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

  const host = headersList.get("host") || "";
  const cleanHost = host.split(":")[0];
  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost");
  
  let cookieDomain = undefined;
  if (!isLocalhost) {
    const parts = cleanHost.split(".");
    if (parts.length >= 2) {
      if (cleanHost.endsWith(".web.id") && parts.length >= 3) {
        cookieDomain = `.${parts.slice(-3).join(".")}`;
      } else {
        cookieDomain = `.${parts.slice(-2).join(".")}`;
      }
    }
  }

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
