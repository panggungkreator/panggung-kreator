import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
  const cleanHost = host.split(":")[0];
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost");

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
    rootDomain = "localhost";
  }
  
  const protocol = request.nextUrl.protocol; // "http:" or "https:"
  const rootHost = rootDomain === "localhost" ? `localhost${port}` : `${rootDomain}${port}`;

  const sub = cleanHost.replace(`.${rootDomain}`, "").replace(rootDomain, "");
  const isRootDomain = sub === "" || sub === "www" || sub === "localhost";

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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          const cookieOptions: any = {
            name,
            value,
            ...options,
          };
          if (cookieDomain) {
            cookieOptions.domain = cookieDomain;
          }
          response.cookies.set(cookieOptions);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          const cookieOptions: any = {
            name,
            value: "",
            ...options,
          };
          if (cookieDomain) {
            cookieOptions.domain = cookieDomain;
          }
          response.cookies.set(cookieOptions);
        },
      },
    }
  );

  // 5. Check Session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // DEBUG: Log session state for diagnosis
  const allCookieNames = request.cookies.getAll().map(c => c.name);
  console.log(`[PROXY DEBUG] host=${host} sub="${sub}" isRootDomain=${isRootDomain} pathname=${pathname}`);
  console.log(`[PROXY DEBUG] cookieDomain=${cookieDomain ?? "undefined (localhost)"} session=${session ? session.user.email : "NULL"}`);
  console.log(`[PROXY DEBUG] cookies present: ${allCookieNames.join(", ") || "(none)"}`);


  // 6. Direct Path Guards (for localhost or direct path access)
  const isDirectAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDirectAkademiDashboardPath = pathname === "/akademi/dashboard" || pathname.startsWith("/akademi/dashboard/");

  if (isDirectAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!member || member.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isDirectAkademiDashboardPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("role, membership_tier, payment_status")
      .eq("id", session.user.id)
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
    // Redirect untuk menghilangkan prefix "/admin" jika diakses via subdomain admin
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const strippedPath = pathname.replace(/^\/admin/, "") || "/";
      return NextResponse.redirect(new URL(`${protocol}//${host}${strippedPath}${search}`));
    }

    if (!session) {
      return NextResponse.redirect(new URL(`${protocol}//${rootHost}/login`, request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!member || member.role !== "admin") {
      // If logged in but not admin, redirect to root homepage
      return NextResponse.redirect(new URL(`${protocol}//${rootHost}/`, request.url));
    }

    // Rewrite request to /admin subfolder
    return NextResponse.rewrite(new URL(`/admin${pathname}${search}`, request.url));
  }

  // B. Web Akademi Subdomain (akademi.panggungkreator.web.id)
  if (sub === "akademi") {
    if (pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL(`${protocol}//${rootHost}/login`, request.url));
      }

      const { data: member } = await supabase
        .from("members")
        .select("role, membership_tier, payment_status")
        .eq("id", session.user.id)
        .single();

      const isPaid =
        member?.payment_status === "paid" ||
        member?.membership_tier === "regular" ||
        member?.membership_tier === "mvp";
      const isAdmin = member?.role === "admin";

      if (!isPaid && !isAdmin) {
        // Rewrite to checkout page on the same akademi subdomain
        return NextResponse.rewrite(new URL(`/akademi/checkout${search}`, request.url));
      }
    }

    // Rewrite request to /akademi subfolder
    return NextResponse.rewrite(new URL(`/akademi${pathname}${search}`, request.url));
  }

  // C. Web Komunitas (panggungkreator.web.id)
  if (isRootDomain) {
    if (pathname === "/myprofile") {
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // If logged in and goes to login page via GET (page load), redirect based on role/tier
    if (pathname === "/login" && session && request.method === "GET") {
      const { data: member } = await supabase
        .from("members")
        .select("role, membership_tier")
        .eq("id", session.user.id)
        .single();

      if (member) {
        if (member.role === "admin") {
          const defaultAdminUrl = isLocalhost 
            ? `${protocol}//localhost${port}/admin`
            : `${protocol}//admin.${rootHost}`;
          const adminRedirectUrl = process.env.NEXT_PUBLIC_ADMIN_URL 
            ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/`
            : `${defaultAdminUrl}/`;
          return NextResponse.redirect(new URL(adminRedirectUrl, request.url));
        } else if (member.membership_tier !== "free") {
          const defaultAkademiUrl = isLocalhost
            ? `${protocol}//localhost${port}/akademi/dashboard`
            : `${protocol}//akademi.${rootHost}/dashboard`;
          const akademiRedirectUrl = process.env.NEXT_PUBLIC_AKADEMI_URL
            ? process.env.NEXT_PUBLIC_AKADEMI_URL
            : defaultAkademiUrl;
          return NextResponse.redirect(new URL(akademiRedirectUrl, request.url));
        } else {
          return NextResponse.redirect(new URL("/myprofile", request.url));
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
