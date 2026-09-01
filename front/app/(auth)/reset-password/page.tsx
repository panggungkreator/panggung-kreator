"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { clearStaleAuthStorage } from "@/lib/utils/url";
import { resetPasswordAction } from "@/lib/actions/auth-actions";

function ResetPasswordContent() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      // 1. Cek parameter error dari URL (misal dari /auth/confirm)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const errParam = params.get("error");
        if (errParam) {
          setError(errParam);
          setHasRecoverySession(false);
          return;
        }
      }

      // 2. Cek apakah ada sesi aktif di cookie / client (user / session)
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const hasHash = typeof window !== "undefined" && (
        window.location.hash.includes("access_token=") ||
        window.location.hash.includes("type=recovery")
      );

      if (user || session || hasHash) {
        setHasRecoverySession(true);
      } else {
        // Otomatis bersihkan stale local storage token yang korup dari sesi terdahulu
        clearStaleAuthStorage();

        // Beri toleransi sebentar untuk penanganan event auth
        setTimeout(async () => {
          const { data: { user: delayedUser } } = await supabase.auth.getUser();
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (delayedUser || delayedSession) {
            setHasRecoverySession(true);
          } else {
            setHasRecoverySession(false);
          }
        }, 1200);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session) || (event === "TOKEN_REFRESHED" && session)) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      // Panggil Server Action untuk mengupdate password menggunakan sesi HTTP server
      const result = await resetPasswordAction(newPassword);

      if (result.success) {
        document.cookie = "sb-recovery-mode=; path=/; max-age=0;";
        clearStaleAuthStorage();
        setIsSuccess(true);
        toast.success("Password baru berhasil disimpan!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      if (result.error?.toLowerCase().includes("auth session missing")) {
        setError("Sesi reset password tidak ditemukan atau telah kedaluwarsa. Silakan minta link reset password baru.");
        setHasRecoverySession(false);
      } else {
        setError(result.error || "Gagal memperbarui password.");
      }
    } catch (err: any) {
      console.error("Reset password client error:", err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans selection:bg-black selection:text-white bg-[#F9F9F9] dark:bg-[#121212] text-[#0A0A0A] dark:text-white flex flex-col justify-between p-6 md:p-12 relative overflow-auto">
      {/* Top Bar with Logo */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Logo size="sm" isLink={true} className="text-[#0A0A0A] dark:text-white" />
      </div>

      {/* Form Container (Centered Horizontally & Vertically) */}
      <div className="my-auto max-w-md w-full mx-auto py-8 px-6 sm:px-8 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-1">
            [ KEAMANAN AKUN ]
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight text-[#0A0A0A] dark:text-white">
            Password <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
              Baru Akun
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-sans leading-relaxed">
            Masukkan password baru Anda. Pastikan password kuat dan berbeda dari password sebelumnya.
          </p>
        </div>

        {hasRecoverySession === false && !isSuccess && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-xs text-amber-900 dark:text-amber-300 font-sans space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  Sesi Reset Password Kedaluwarsa / Tidak Ditemukan ⚠️
                </h4>
                <p className="mt-1 leading-relaxed text-[11px]">
                  Link pemulihan password yang Anda buka telah kedaluwarsa atau token tidak ditemukan. Silakan buat permintaan reset password baru.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
              <span></span>
              <Link
                href="/forgot-password"
                className="font-bold text-amber-950 dark:text-amber-200 hover:underline flex items-center gap-1"
              >
                Minta Link Baru &rarr;
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-[#bc151b] dark:text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                UPDATE_FAILED
              </span>
              {error}
            </div>
          </div>
        )}

        {hasRecoverySession === null ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center animate-fade-in">
            <svg className="animate-spin h-6 w-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              Memverifikasi sesi pemulihan...
            </span>
          </div>
        ) : isSuccess ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-xs text-emerald-800 dark:text-emerald-300 font-sans space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Password Berhasil Diperbarui! 🔒
                </h4>
                <p className="mt-1 leading-relaxed text-[11px]">
                  Sandi akun Anda baru saja diperbarui. Mengalihkan Anda secara otomatis ke halaman login...
                </p>
              </div>
            </div>
          </div>
        ) : hasRecoverySession === false ? (
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PASSWORD BARU */}
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                PASSWORD BARU (MIN. 8 KARAKTER)
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 pr-8 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showNew ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD BARU */}
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                KONFIRMASI PASSWORD BARU
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 pr-8 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-3 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white dark:text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>SIMPAN PASSWORD BARU &rarr;</>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Batal & Kembali ke Login</span>
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-md w-full mx-auto text-[9px] text-zinc-400 font-mono tracking-wider uppercase gap-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
