import { createBrowserClient } from "@supabase/ssr";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { clearStaleAuthStorage } from "@/lib/utils/url";

let supabaseBrowserInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

  if (typeof window === "undefined") {
    // Return fresh instance for SSR to avoid state leaking across requests
    return createBrowserClient(
      cleanUrl,
      anonKey,
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
      cleanUrl,
      anonKey,
      {
        cookieOptions: {
          domain: cookieDomain,
          path: "/",
          sameSite: "lax",
          secure: isProd,
        },
      }
    );

    // Auto-cleanup: jika refresh token gagal (expired / tidak ditemukan),
    // sign out secara otomatis untuk membersihkan sesi korup di browser.
    supabaseBrowserInstance.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        // Bersihkan instance agar klien baru dibuat di navigasi berikutnya
        supabaseBrowserInstance = null;
      }
    });

    // Tangani error refresh token yang tidak bisa di-catch melalui onAuthStateChange
    supabaseBrowserInstance.auth.getSession().then(({ error }: { error: Error | null }) => {
      if (
        error &&
        (error.message?.includes("Refresh Token Not Found") ||
          error.message?.includes("Invalid Refresh Token"))
      ) {
        // Otomatis bersihkan localStorage dari token korup agar tidak mengganggu sesi pemulihan baru
        clearStaleAuthStorage();
        supabaseBrowserInstance = null;
      }
    });
  }

  return supabaseBrowserInstance;
}