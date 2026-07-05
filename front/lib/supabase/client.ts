import { createBrowserClient } from "@supabase/ssr";

let supabaseBrowserInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    // Return fresh instance for SSR to avoid state leaking across requests
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          path: "/",
        },
      }
    );
  }

  // Reuse browser client singleton instance
  if (!supabaseBrowserInstance) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "panggungkreator.web.id";
    const cookieDomain = `.${rootDomain}`;
    const isProd = rootDomain.endsWith("web.id");

    supabaseBrowserInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          domain: cookieDomain,
          path: "/",
          sameSite: "lax",
          secure: isProd,
        },
      }
    );
  }

  return supabaseBrowserInstance;
}