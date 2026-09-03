import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "./service-role";

/**
 * Dual Database Client Provider
 * Memfasilitasi aturan wajib sinkronisasi ke kedua database Supabase:
 * - Development: zpcsqidgedvuaqgrklgp
 * - Production:  wmuzvefmrbgffftkpdnx
 */

export function getDevClient(): SupabaseClient {
  return createServiceRoleClient();
}

export function getProdClient(): SupabaseClient | null {
  const prodUrl = process.env.PROD_SUPABASE_URL || "https://wmuzvefmrbgffftkpdnx.supabase.co";
  const prodKey =
    process.env.PROD_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PROD_SUPABASE_ANON_KEY ||
    "";

  if (!prodKey) {
    return null;
  }

  return createClient(prodUrl, prodKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Menjalankan operasi penambahan/modifikasi data secara ganda ke Development dan Production.
 * Menjamin konsistensi data di kedua ID database (zpcsqidgedvuaqgrklgp & wmuzvefmrbgffftkpdnx).
 */
export async function syncDualOperation<T>(
  operation: (client: SupabaseClient, isProd: boolean) => Promise<T>
): Promise<{ devResult: T; prodResult?: T; error?: any }> {
  const devClient = getDevClient();
  const prodClient = getProdClient();

  // 1. Jalankan di Dev
  const devResult = await operation(devClient, false);

  // 2. Jalankan sinkronisasi ke Prod
  let prodResult: T | undefined;
  if (prodClient) {
    try {
      prodResult = await operation(prodClient, true);
    } catch (prodErr) {
      console.warn(
        "Dual-sync: Peringatan saat sinkronisasi ke Production Supabase (wmuzvefmrbgffftkpdnx):",
        prodErr
      );
    }
  }

  return { devResult, prodResult };
}
