import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicOrigin, getCookieDomain } from "@/lib/utils/url";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/myprofile";
    const redirectTo = getPublicOrigin(request);

    const redirectUrl = `${redirectTo}${next}`;
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");

    if (!code) {
        return response;
    }

    const host = request.headers.get("host") || "";
    const cookieDomain = getCookieDomain(host);

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

    const supabase = createServerClient(
        cleanUrl,
        anonKey,
        {
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
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        const errorRedirect = NextResponse.redirect(
            `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
        );
        errorRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        return errorRedirect;
    }

    return response;
}

