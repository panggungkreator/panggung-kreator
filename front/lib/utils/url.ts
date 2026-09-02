/**
 * Helper terpusat untuk mendapatkan Public Origin URL secara akurat,
 * baik di lingkungan Localhost maupun Production di belakang Reverse Proxy (Nginx / Cloudflare / PM2 / Vercel).
 */
export function getPublicOrigin(
  request?: Request | null,
  headersList?: Headers | null
): string {
  let host: string | null = null;
  let proto: string | null = null;

  if (request) {
    host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    proto = request.headers.get("x-forwarded-proto");
  } else if (headersList) {
    host = headersList.get("x-forwarded-host") || headersList.get("host");
    proto = headersList.get("x-forwarded-proto");
  }

  // Jika Host berasal dari domain publik (bukan localhost / 127.0.0.1)
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    const protocol = proto || "https";
    return `${protocol}://${host}`;
  }

  // Cek variabel lingkungan NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "");
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl;
    }
  }

  // Fallback dari request.url jika tersedia
  if (request) {
    try {
      const u = new URL(request.url);
      if (!u.hostname.includes("localhost") && !u.hostname.includes("127.0.0.1")) {
        return u.origin;
      }
    } catch (_) {}
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Membersihkan token/sesi auth yang sudah kedaluwarsa atau korup dari localStorage & sessionStorage.
 * Mencegah konflik token lama saat alur reset password / pemulihan akun dilakukan.
 */
export function clearStaleAuthStorage() {
  if (typeof window === "undefined") return;

  try {
    // 1. Bersihkan kunci Supabase dari localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase.auth")) {
        localStorage.removeItem(key);
      }
    });

    // 2. Bersihkan kunci Supabase dari sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase.auth")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn("Auth storage cleanup warning:", e);
  }
}

/**
 * Helper untuk mendapatkan cookie domain yang seragam di seluruh aplikasi.
 */
export function getCookieDomain(host?: string | null): string | undefined {
  if (!host) return undefined;
  const cleanHost = host.split(":")[0];
  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.endsWith(".localhost");
  if (isLocalhost) return undefined;

  const parts = cleanHost.split(".");
  if (parts.length >= 2) {
    if (cleanHost.endsWith(".web.id") && parts.length >= 3) {
      return `.${parts.slice(-3).join(".")}`;
    } else {
      return `.${parts.slice(-2).join(".")}`;
    }
  }
  return undefined;
}

