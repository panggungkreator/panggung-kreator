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
            response.cookies.set(name, value, {
              ...options,
              path: "/",
            });
          });
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      if (type === "recovery") {
        response.cookies.set("sb-recovery-mode", "1", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 600, // 10 menit batas waktu reset password
        });
      }
      return response;
    } else {
      console.error("verifyOtp error:", error);
      return NextResponse.redirect(
        `${redirectTo}${next}?error=${encodeURIComponent("Link reset password kedaluwarsa atau tidak valid. Silakan minta link baru.")}`
      );
    }
  }

  return NextResponse.redirect(`${redirectTo}/forgot-password`);
}
