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
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
    const isProd = !isLocalhost && (hostname.endsWith("web.id") || hostname.endsWith(".com"));

    let cookieDomain = undefined;
    if (!isLocalhost) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        if (hostname.endsWith(".web.id") && parts.length >= 3) {
          cookieDomain = `.${parts.slice(-3).join(".")}`;
        } else {
          cookieDomain = `.${parts.slice(-2).join(".")}`;
        }
      }
    }

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