import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "panggungkreator.web.id";
  const cookieDomain = `.${rootDomain}`;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              domain: cookieDomain,
              path: "/",
            });
          } catch (error) {
            // Diabaikan jika dipanggil dari Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
              domain: cookieDomain,
              path: "/",
            });
          } catch (error) {
            // Diabaikan jika dipanggil dari Server Component
          }
        },
      },
    }
  );
}
