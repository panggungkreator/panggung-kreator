import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicOrigin, getCookieDomain } from "@/lib/utils/url";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/myprofile";
    const redirectTo = getPublicOrigin(request);

    if (!code) {
        const fallbackRes = NextResponse.redirect(`${redirectTo}${next}`);
        fallbackRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        fallbackRes.headers.set("Pragma", "no-cache");
        return fallbackRes;
    }

    const host = request.headers.get("host") || "";
    const cleanHost = host.split(":")[0].toLowerCase();
    const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost) || cleanHost.includes(":") || cleanHost === "[::1]";
    const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost") || cleanHost.endsWith(".local") || isIpAddress;
    const cookieDomain = getCookieDomain(host);

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, "").replace(/^["']|["']$/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");

    // Tampung cookies sementara agar bisa diterapkan ke response redirect final
    const cookiesToSetList: Array<{ name: string; value: string; options: any }> = [];

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
                        cookiesToSetList.push({ name, value, options: cookieOptions });
                    });
                },
            },
        }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("[AUTH CALLBACK] exchangeCodeForSession error:", error);
        const errorRedirect = NextResponse.redirect(
            `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
        );
        errorRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        errorRedirect.headers.set("Pragma", "no-cache");
        return errorRedirect;
    }

    const authUser = sessionData?.user;
    let isAdmin = false;

    if (authUser) {
        try {
            // 1. Cek di tabel members via Supabase client (berdasarkan auth id)
            let { data: member } = await supabase
                .from("members")
                .select("id, role, email")
                .eq("id", authUser.id)
                .maybeSingle();

            // 2. Jika tidak ditemukan via ID, cari via email
            if (!member && authUser.email) {
                const { data: memberByEmail } = await supabase
                    .from("members")
                    .select("id, role, email")
                    .ilike("email", authUser.email)
                    .maybeSingle();
                if (memberByEmail) {
                    member = memberByEmail;
                }
            }

            // 3. Fallback Service Role Client untuk bypass RLS jika diperlukan
            if (!member) {
                try {
                    const serviceClient = createServiceRoleClient();
                    const { data: sMember } = await serviceClient
                        .from("members")
                        .select("id, role, email")
                        .eq("id", authUser.id)
                        .maybeSingle();

                    if (sMember) {
                        member = sMember;
                    } else if (authUser.email) {
                        const { data: sMemberEmail } = await serviceClient
                            .from("members")
                            .select("id, role, email")
                            .ilike("email", authUser.email)
                            .maybeSingle();

                        if (sMemberEmail) {
                            member = sMemberEmail;
                            // Sinkronisasi ID jika ID di tabel members berbeda dengan authUser.id
                            if (sMemberEmail.id !== authUser.id) {
                                try {
                                    await serviceClient
                                        .from("members")
                                        .update({ id: authUser.id })
                                        .eq("id", sMemberEmail.id);
                                } catch (syncErr) {
                                    console.error("[AUTH CALLBACK] Sync id failed:", syncErr);
                                }

                            }
                        }
                    }
                } catch (srErr) {
                    console.error("[AUTH CALLBACK] Service role error:", srErr);
                }
            }

            if (member && member.role === "admin") {
                isAdmin = true;
            }
        } catch (mErr) {
            console.error("[AUTH CALLBACK] Error checking member role:", mErr);
        }
    }

    // Tentukan URL tujuan
    const nextParam = searchParams.get("next");
    const isExplicitCustomPath = nextParam && nextParam !== "/myprofile" && nextParam !== "/";

    let targetUrl: string;

    if (isAdmin && !isExplicitCustomPath) {
        // User adalah ADMIN dan tidak sedang scan QR absensi khusus -> arahkan ke Admin Dashboard!
        if (isLocalhost) {
            targetUrl = `${redirectTo}/admin`;
        } else {
            let rootDomain = "panggungkreator.web.id";
            const parts = cleanHost.split(".");
            if (parts.length >= 2) {
                if (cleanHost.endsWith(".web.id") && parts.length >= 3) {
                    rootDomain = parts.slice(-3).join(".");
                } else {
                    rootDomain = parts.slice(-2).join(".");
                }
            }
            const rootHost = `${rootDomain}${port}`;
            const defaultAdminUrl = `https://admin.${rootHost}`;
            targetUrl = process.env.NEXT_PUBLIC_ADMIN_URL
                ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/`
                : `${defaultAdminUrl}/`;
        }
        console.log(`[AUTH CALLBACK] Admin user detected (${authUser?.email}), redirecting to ${targetUrl}`);
    } else {
        const destination = isExplicitCustomPath ? nextParam : "/myprofile";
        targetUrl = destination.startsWith("http") ? destination : `${redirectTo}${destination}`;
        console.log(`[AUTH CALLBACK] Standard user detected (${authUser?.email}), redirecting to ${targetUrl}`);
    }

    const response = NextResponse.redirect(targetUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");

    // Terapkan semua cookies sesi yang telah dibuat
    cookiesToSetList.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}


