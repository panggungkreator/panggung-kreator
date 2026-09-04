import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function noCacheRedirect(url: URL | string, init?: { headers?: HeadersInit }) {
  const res = NextResponse.redirect(url, init);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;


  // 1. Skip static assets, favicon, files with extensions, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 2. Detect subdomain, protocol, and port dynamically
  const host = request.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";

  // Cek apakah host berupa localhost atau IP address (IPv4/IPv6 saat diakses dari HP via LAN)
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost) || cleanHost.includes(":") || cleanHost === "[::1]";
  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost") || cleanHost.endsWith(".local") || isIpAddress;

  let rootDomain = "panggungkreator.web.id";
  if (!isLocalhost) {
    const parts = cleanHost.split(".");
    if (parts.length >= 2) {
      if (cleanHost.endsWith(".web.id") && parts.length >= 3) {
        rootDomain = parts.slice(-3).join(".");
      } else {
        rootDomain = parts.slice(-2).join(".");
      }
    }
  } else {
    rootDomain = cleanHost;
  }

  const protocol = request.nextUrl.protocol; // "http:" or "https:"
  const rootHost = isLocalhost ? `${cleanHost}${port}` : `${rootDomain}${port}`;

  const sub = isLocalhost ? "" : cleanHost.replace(`.${rootDomain}`, "").replace(rootDomain, "");
  const isRootDomain = isLocalhost || sub === "" || sub === "www";


  // 3. Centralized login/register redirect
  // If accessing auth routes on a subdomain (admin or akademi), redirect to root domain login center
  const AUTH_PATHS = ["/login", "/register"];
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPath && !isRootDomain) {
    return NextResponse.redirect(
      new URL(`${protocol}//${rootHost}${pathname}${search}`)
    );
  }

  // 4. Initialize Supabase Client with dynamic cookie domain
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieDomain = isLocalhost ? undefined : `.${rootDomain}`;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions: any = {
              name,
              value,
              ...options,
            };
            if (cookieDomain) {
              cookieOptions.domain = cookieDomain;
            }
            response.cookies.set(cookieOptions);
          });
        },
      },
    }
  );

  // 5. Check Recovery Mode & Session Protection
  const isRecoveryMode = request.cookies.get("sb-recovery-mode")?.value === "1";

  // 5.1 SECURITY GUARD: Scoped Recovery Session Protection
  // Pengguna dalam recovery mode HANYA diizinkan mereset password di /reset-password.
  // Dilarang masuk ke dashboard terproteksi (/myprofile, /admin, /akademi/dashboard) tanpa menyelesaikan reset password.
  const isProtectedPath =
    pathname === "/myprofile" ||
    pathname.startsWith("/myprofile/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/akademi/dashboard");

  if (isRecoveryMode && isProtectedPath) {
    console.log(`[PROXY SECURITY] Recovery session blocked from accessing protected route ${pathname}.`);
    await supabase.auth.signOut().catch(() => {});
    const loginRedirect = new URL("/login", request.url);
    const redirectResponse = noCacheRedirect(loginRedirect, {
      headers: response.headers,
    });
    redirectResponse.cookies.set("sb-recovery-mode", "", { maxAge: 0, path: "/" });
    if (cookieDomain) {
      redirectResponse.cookies.set("sb-recovery-mode", "", { maxAge: 0, path: "/", domain: cookieDomain });
    }
    return redirectResponse;
  }

  // 5.2 Check Session — capture auth error to detect stale/corrupted tokens for normal browsing
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  // Jika token di cookie tidak valid / sudah expired, sign out server-side agar
  // browser menerima header Set-Cookie yang menghapus cookie korup secara otomatis.
  // PENTING: JANGAN lakukan signOut jika sedang dalam recovery mode di /reset-password!
  const isStaleTokenError =
    !isRecoveryMode &&
    getUserError &&
    (getUserError.message?.includes("Invalid Refresh Token") ||
      getUserError.message?.includes("Refresh Token Not Found") ||
      getUserError.message?.includes("Token expired") ||
      getUserError.message?.includes("token is expired"));

  if (isStaleTokenError) {
    console.log(`[PROXY] Stale token detected (${getUserError!.message}), clearing session cookies...`);
    await supabase.auth.signOut().catch(() => {});
    // Bersihkan cookie auth secara eksplisit di level host maupun domain agar cookie ganda di Chrome terhapus
    const allCookieNames = request.cookies.getAll().map((c) => c.name);
    allCookieNames.forEach((name) => {
      if (name.startsWith("sb-") || name.includes("auth") || name.includes("token")) {
        response.cookies.set(name, "", { maxAge: 0, path: "/" });
        if (cookieDomain) {
          response.cookies.set(name, "", { maxAge: 0, path: "/", domain: cookieDomain });
        }
      }
    });
  }



  // 6. Direct Path Guards (for localhost or direct path access)
  const isDirectAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDirectAkademiDashboardPath = pathname === "/akademi/dashboard" || pathname.startsWith("/akademi/dashboard/");

  if (isDirectAdminPath) {
    if (!user) {
      return noCacheRedirect(new URL("/login", request.url));
    }

    let { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!member && user.email) {
      const { data: memberByEmail } = await supabase
        .from("members")
        .select("role")
        .ilike("email", user.email)
        .maybeSingle();
      if (memberByEmail) member = memberByEmail;
    }

    if (!member || member.role !== "admin") {
      return noCacheRedirect(new URL("/", request.url));
    }
  }

  if (isDirectAkademiDashboardPath) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("role, membership_tier, payment_status")
      .eq("id", user.id)
      .single();

    const isPaid =
      member?.payment_status === "paid" ||
      member?.membership_tier === "regular" ||
      member?.membership_tier === "mvp";
    const isAdmin = member?.role === "admin";

    if (!isPaid && !isAdmin) {
      return NextResponse.redirect(new URL("/akademi/checkout", request.url));
    }
  }

  // 7. Router-Specific Guards & Rewrites

  // A. Admin CMS Subdomain (admin.panggungkreator.web.id)
  if (sub === "admin") {
    // Alihkan rute absensi publik ke domain publik (bukan subdomain admin)
    if (pathname === "/absensi" || pathname.startsWith("/absensi/")) {
      return NextResponse.redirect(new URL(`${protocol}//${rootHost}${pathname}${search}`));
    }

    // Redirect untuk menghilangkan prefix "/admin" jika diakses via subdomain admin
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const strippedPath = pathname.replace(/^\/admin/, "") || "/";
      return NextResponse.redirect(new URL(`${protocol}//${host}${strippedPath}${search}`));
    }


    if (!user) {
      return NextResponse.redirect(new URL(`${protocol}//${rootHost}/login`, request.url));
    }

    let { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!member && user.email) {
      const { data: memberByEmail } = await supabase
        .from("members")
        .select("role")
        .ilike("email", user.email)
        .maybeSingle();
      if (memberByEmail) member = memberByEmail;
    }

    if (!member || member.role !== "admin") {
      // If logged in but not admin, redirect to root homepage
      return noCacheRedirect(new URL(`${protocol}//${rootHost}/`, request.url));
    }


    // Rewrite request to /admin subfolder
    return NextResponse.rewrite(new URL(`/admin${pathname}${search}`, request.url));
  }

  // B. Web Akademi Subdomain (akademi.panggungkreator.web.id)
  if (sub === "akademi") {
    // Redirect untuk menghilangkan prefix "/akademi" jika diakses via subdomain akademi
    if (pathname === "/akademi" || pathname.startsWith("/akademi/")) {
      const strippedPath = pathname.replace(/^\/akademi/, "") || "/";
      return NextResponse.redirect(new URL(`${protocol}//${host}${strippedPath}${search}`));
    }

    if (pathname.startsWith("/dashboard")) {
      if (!user) {
        return NextResponse.redirect(new URL(`${protocol}//${rootHost}/login`, request.url));
      }

      const { data: member } = await supabase
        .from("members")
        .select("role, membership_tier, payment_status")
        .eq("id", user.id)
        .single();

      const isPaid =
        member?.payment_status === "paid" ||
        member?.membership_tier === "regular" ||
        member?.membership_tier === "mvp";
      const isAdmin = member?.role === "admin";

      if (!isPaid && !isAdmin) {
        // Redirect to /checkout on the same akademi subdomain
        return NextResponse.redirect(new URL(`${protocol}//${host}/checkout${search}`, request.url));
      }
    }

    // Rewrite request to /akademi subfolder
    return NextResponse.rewrite(new URL(`/akademi${pathname}${search}`, request.url));
  }

  // C. Web Komunitas (panggungkreator.web.id)
  if (isRootDomain) {
    // Redirect /akademi to akademi subdomain in production
    if (!isLocalhost && (pathname === "/akademi" || pathname.startsWith("/akademi/"))) {
      const targetPath = pathname.replace(/^\/akademi/, "") || "/";
      const targetUrl = `${protocol}//akademi.${rootHost}${targetPath}${search}`;
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    if (pathname === "/myprofile" || pathname.startsWith("/myprofile/")) {
      if (!user) {
        const loginRedirect = new URL("/login", request.url);
        const redirectRes = noCacheRedirect(loginRedirect);
        // Bersihkan cookie auth yang tidak valid/stale agar browser lama tidak terjebak dalam cookie korup
        const cookieNames = request.cookies.getAll().map((c) => c.name);
        cookieNames.forEach((name) => {
          if (name.startsWith("sb-") || name.includes("auth") || name.includes("token")) {
            redirectRes.cookies.set(name, "", { maxAge: 0, path: "/" });
            if (cookieDomain) {
              redirectRes.cookies.set(name, "", { maxAge: 0, path: "/", domain: cookieDomain });
            }
          }
        });
        return redirectRes;
      }

      // Check member role & onboarding status
      let { data: member } = await supabase
        .from("members")
        .select("role, membership_tier, interests:member_interests(id)")
        .eq("id", user.id)
        .maybeSingle();

      if (!member && user.email) {
        const { data: memberByEmail } = await supabase
          .from("members")
          .select("role, membership_tier, interests:member_interests(id)")
          .ilike("email", user.email)
          .maybeSingle();
        if (memberByEmail) member = memberByEmail;
      }

      const isAdmin = member?.role === "admin";
      const interests = member?.interests;
      const hasInterests = interests && (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);

      // Jika role === admin, selalu lempar ke halaman admin
      if (isAdmin) {
        const defaultAdminUrl = isLocalhost
          ? `${protocol}//localhost${port}/admin`
          : `${protocol}//admin.${rootHost}`;
        const adminRedirectUrl = process.env.NEXT_PUBLIC_ADMIN_URL
          ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/`
          : `${defaultAdminUrl}/`;
        return noCacheRedirect(new URL(adminRedirectUrl, request.url));
      }

      const isOnboardingPath = pathname === "/myprofile/onboarding";

      // Jika member biasa belum melengkapi data minat dan BUKAN sedang di halaman /myprofile/onboarding
      if (!hasInterests && !isOnboardingPath) {
        return noCacheRedirect(new URL("/myprofile/onboarding", request.url));
      }

      // Jika member biasa sudah melengkapi data minat tapi mencoba buka /myprofile/onboarding lagi
      if (hasInterests && isOnboardingPath) {
        return noCacheRedirect(new URL("/myprofile", request.url));
      }

      // Pastikan response /myprofile tidak pernah di-cache oleh browser mobile
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      response.headers.set("Pragma", "no-cache");
    }

    // If logged in (not in recovery mode) and goes to login page via GET (page load), redirect based on role/tier
    if (pathname === "/login" && user && !isRecoveryMode && request.method === "GET") {
      let { data: member } = await supabase
        .from("members")
        .select("role, membership_tier, interests:member_interests(id)")
        .eq("id", user.id)
        .maybeSingle();

      if (!member && user.email) {
        const { data: memberByEmail } = await supabase
          .from("members")
          .select("role, membership_tier, interests:member_interests(id)")
          .ilike("email", user.email)
          .maybeSingle();
        if (memberByEmail) member = memberByEmail;
      }

      if (member) {
        if (member.role === "admin") {
          const defaultAdminUrl = isLocalhost
            ? `${protocol}//localhost${port}/admin`
            : `${protocol}//admin.${rootHost}`;
          const adminRedirectUrl = process.env.NEXT_PUBLIC_ADMIN_URL
            ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/`
            : `${defaultAdminUrl}/`;
          return noCacheRedirect(new URL(adminRedirectUrl, request.url));
        } else {
          const interests = member.interests;
          const hasInterests = interests && (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);
          if (!hasInterests) {
            return noCacheRedirect(new URL("/myprofile/onboarding", request.url));
          }
          return noCacheRedirect(new URL("/myprofile", request.url));
        }
      }
    }


    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)"],
};
