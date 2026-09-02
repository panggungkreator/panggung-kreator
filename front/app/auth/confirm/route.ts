import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicOrigin } from "@/lib/utils/url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/reset-password";
  const redirectTo = getPublicOrigin(request);

  const redirectUrl = `${redirectTo}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  if (token_hash && type) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

    const host = request.headers.get("host") || "";
    const cleanHost = host.split(":")[0];
    const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost");

    let cookieDomain: string | undefined = undefined;
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

    const supabase = createServerClient(cleanUrl, anonKey, {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") || "";
          return cookieHeader
            .split(";")
            .map((c) => {
              const [name, ...val] = c.trim().split("=");
              return { name, value: val.join("=") };
            })
            .filter((c) => c.name);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions: any = {
              ...options,
              path: "/",
            };
            if (cookieDomain) {
              cookieOptions.domain = cookieDomain;
            }
            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    });

    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log(`[AUTH CONFIRM] verifyOtp success for user=${verifyData?.user?.email}, type=${type}, cookieDomain=${cookieDomain}`);
      if (type === "recovery") {
        const recoveryCookieOptions: any = {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 600, // 10 menit batas waktu reset password
        };
        if (cookieDomain) {
          recoveryCookieOptions.domain = cookieDomain;
        }
        response.cookies.set("sb-recovery-mode", "1", recoveryCookieOptions);
      }
      return response;
    } else {
      console.error("[AUTH CONFIRM] verifyOtp error:", error);
      return NextResponse.redirect(
        `${redirectTo}${next}?error=${encodeURIComponent("Link reset password kedaluwarsa atau tidak valid. Silakan minta link baru.")}`
      );
    }
  }

  return NextResponse.redirect(`${redirectTo}/forgot-password`);
}
