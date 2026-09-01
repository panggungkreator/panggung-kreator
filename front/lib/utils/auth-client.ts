import { createClient } from "@/lib/supabase/client";
import { signout } from "@/lib/actions/auth-actions";
import { clearStaleAuthStorage } from "@/lib/utils/url";

/**
 * Fungsi Logout Komprehensif (Self-Healing Sign Out):
 * 1. Membersihkan localStorage & sessionStorage di browser.
 * 2. Mengakhiri sesi Supabase Auth client-side global.
 * 3. Memanggil Server Action untuk menghapus seluruh Cookie HTTP-only server dengan maxAge: 0.
 * 4. Melakukan hard reload URL ke /login (menghapus cache router Next.js in-memory).
 */
export async function performCompleteSignOut(redirectTo: string = "/login") {
  try {
    // A. Bersihkan local/session storage di browser
    clearStaleAuthStorage();

    // B. Signout client-side via Supabase SDK
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" }).catch(console.warn);

    // C. Bersihkan ulang storage setelah client signout
    clearStaleAuthStorage();

    // D. Panggil server action untuk menghapus HTTP-only cookies
    await signout().catch(console.warn);
  } catch (err) {
    console.warn("Signout client error:", err);
  } finally {
    // E. Hard reload redirect agar Next.js client router cache bersih 100%
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }
}
