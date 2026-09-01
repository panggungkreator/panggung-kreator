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
