// src/app/(auth)/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/utils/url";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/myprofile";
    const redirectTo = getPublicOrigin(request);

    const redirectUrl = `${redirectTo}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    if (!code) {
        return NextResponse.redirect(`${redirectTo}${next}`);
    }

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
                        response.cookies.set(name, value, {
                            ...options,
                            path: "/",
                        });
                    });
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return NextResponse.redirect(
            `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
        );
    }

    return response;
}
