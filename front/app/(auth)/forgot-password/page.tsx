"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { requestPasswordResetAction } from "@/lib/actions/auth-actions";
import { ArrowLeft, CheckCircle2, AlertCircle, Mail } from "lucide-react";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessEmail(null);

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestPasswordResetAction(email);
      if (result.success && result.email) {
        setSuccessEmail(result.email);
      } else {
        setError(result.error || "Gagal memproses permintaan reset password.");
      }
    } catch (err: any) {
      console.error("Forgot password client error:", err);
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
            Reset <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
              Kata Sandi
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-sans leading-relaxed">
            Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan link verifikasi untuk membuat password baru.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-[#bc151b] dark:text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                RESET_FAILED
              </span>
              {error}
            </div>
          </div>
        )}

        {successEmail ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-xs text-emerald-800 dark:text-emerald-300 font-sans space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Email Verifikasi Terkirim! 📧
                </h4>
                <p className="mt-1 leading-relaxed text-[11px]">
                  Link instruksi reset password telah dikirim ke <strong>{successEmail}</strong>. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
              <span>Link berlaku terbatas</span>
              <Link
                href="/login"
                className="font-bold text-emerald-900 dark:text-emerald-200 hover:underline"
              >
                Kembali ke Login &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                EMAIL AKUN
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 pr-8 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                  required
                />
                <Mail className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                  <>KIRIM LINK RESET &rarr;</>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali ke Halaman Login</span>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
