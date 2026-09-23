/**
 * Utility untuk membersihkan (delete/replace) file di Supabase Storage
 * secara otomatis guna mencegah penumpukan orphan files (storage bloat).
 */

export interface ParsedStorageTarget {
  bucket: string;
  path: string;
}

const KNOWN_BUCKETS = [
  "member-assets",
  "member-avatars",
  "portfolio-images",
  "portfolio-thumbnails",
  "gallery",
  "venues",
  "partners",
  "resources",
];

/**
 * Mengurai URL publik Supabase Storage menjadi nama bucket dan path file.
 * Mengabaikan URL eksternal (YouTube, link luar, dsb) secara aman.
 */
export function parseStorageUrl(url?: string | null): ParsedStorageTarget | null {
  if (!url || typeof url !== "string") return null;

  // Bersihkan query string (?t=123...) dan whitespace
  const cleanUrl = url.split("?")[0].trim();
  if (!cleanUrl) return null;

  // 1. Pola standar Supabase: /storage/v1/object/(public|sign)/{bucket}/{...path}
  const standardPattern = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/;
  const match = cleanUrl.match(standardPattern);
  if (match && match[1] && match[2]) {
    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  }

  // 2. Pola fallback berdasarkan nama bucket yang terdaftar
  for (const bucket of KNOWN_BUCKETS) {
    const marker = `/${bucket}/`;
    if (cleanUrl.includes(marker)) {
      const parts = cleanUrl.split(marker);
      const filePath = parts[parts.length - 1];
      if (filePath) {
        return {
          bucket,
          path: decodeURIComponent(filePath),
        };
      }
    }
  }

  return null;
}

/**
 * Menghapus satu atau banyak file dari Supabase Storage berdasarkan URL publiknya.
 * Mengelompokkan penghapusan per bucket dan mengeksekusi secara batch.
 */
export async function deleteStorageFiles(
  supabase: any,
  urls: (string | null | undefined)[]
): Promise<{ deleted: string[]; errors: any[] }> {
  if (!supabase || !urls || urls.length === 0) {
    return { deleted: [], errors: [] };
  }

  const bucketMap: Record<string, Set<string>> = {};

  for (const url of urls) {
    if (!url) continue;

    // Mendukung string tunggal maupun gabungan (comma-separated URLs)
    const subUrls = url.split(",").map((u) => u.trim());
    for (const subUrl of subUrls) {
      const parsed = parseStorageUrl(subUrl);
      if (parsed) {
        if (!bucketMap[parsed.bucket]) {
          bucketMap[parsed.bucket] = new Set();
        }
        bucketMap[parsed.bucket].add(parsed.path);
      }
    }
  }

  const deleted: string[] = [];
  const errors: any[] = [];

  for (const [bucket, pathSet] of Object.entries(bucketMap)) {
    const paths = Array.from(pathSet);
    if (paths.length === 0) continue;

    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.warn(`[Storage Cleanup] Gagal menghapus dari bucket "${bucket}":`, error);
        errors.push(error);
      } else {
        deleted.push(...paths);
      }
    } catch (err) {
      console.warn(`[Storage Cleanup] Exception saat menghapus dari "${bucket}":`, err);
      errors.push(err);
    }
  }

  return { deleted, errors };
}

/**
 * Helper ringkas untuk menghapus satu file saja
 */
export async function deleteStorageFile(
  supabase: any,
  url?: string | null
): Promise<boolean> {
  if (!url) return false;
  const res = await deleteStorageFiles(supabase, [url]);
  return res.deleted.length > 0;
}
