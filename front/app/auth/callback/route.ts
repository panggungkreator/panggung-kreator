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

    if (!code) {
        // Jika tidak ada code (misal alur implicit/hash URL dari Supabase recovery link),
        // tetap arahkan ke halaman `next` agar client-side SDK dapat membaca #access_token dari URL
        return NextResponse.redirect(`${redirectTo}${next}`);
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options) {
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        // Redirect kembali ke halaman login di domain yang benar jika ada error
        return NextResponse.redirect(
            `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
        );
    }

    // Redirect ke halaman tujuan (next) di domain yang benar
    return NextResponse.redirect(`${redirectTo}${next}`);
}
