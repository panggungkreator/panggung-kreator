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

  console.log("🔍 [AUTH CONFIRM ROUTE] Request received:", {
    url: request.url,
    redirectTo,
    token_hash_exists: !!token_hash,
    type,
    next,
  });

  if (token_hash && type) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

    let setCookieCount = 0;

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
            setCookieCount++;
            response.cookies.set(name, value, {
              ...options,
              path: "/",
            });
          });
        },
      },
    });

    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log("✅ [AUTH CONFIRM ROUTE] verifyOtp success!", {
        userId: verifyData?.user?.id,
        email: verifyData?.user?.email,
        cookiesSet: setCookieCount,
        redirectingTo: redirectUrl,
      });
      return response;
    } else {
      console.error("❌ [AUTH CONFIRM ROUTE] verifyOtp error:", error);
      return NextResponse.redirect(
        `${redirectTo}${next}?error=${encodeURIComponent(`Link reset password kedaluwarsa atau tidak valid (${error.message})`)}`
      );
    }
  }

  console.warn("⚠️ [AUTH CONFIRM ROUTE] Missing token_hash or type in query params");
  return NextResponse.redirect(`${redirectTo}/forgot-password`);
}
