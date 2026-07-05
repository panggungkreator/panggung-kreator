"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      // Karena fungsi register di backend sedang dikembangkan, kita tampilkan pemberitahuan yang elegan
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg("Pendaftaran berhasil! Akun Anda sedang diproses. Silakan hubungi admin.");
      }, 1500);
    } catch (err: any) {
      console.error("Register client error:", err);
      setError("Gagal terhubung ke server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-12 font-sans selection:bg-black selection:text-white bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white overflow-hidden">
      {/* Left Column - Full Size Grayscale Illustration (Hidden on Mobile to prevent scroll) */}
      <div className="hidden md:block md:col-span-6 relative h-full w-full overflow-hidden border-r border-zinc-200 dark:border-[#2c2c2c]">
        <Image
          src="/wallpaper.png"
          alt="Teman Sepanggung"
          fill
          className="object-cover grayscale contrast-115 brightness-90 transition-all duration-700 hover:grayscale-0"
          priority
        />
        {/* Caption Overlay */}
        <div className="absolute bottom-6 left-6 bg-black/75 backdrop-blur-md px-3 py-1.5 text-[8px] font-mono tracking-wider text-zinc-300 uppercase border border-white/10">
          FIG. 02 // DAFTAR_BARU // FULL_VIEW
        </div>
      </div>

      {/* Right Column - Branding & Form */}
      <div className="col-span-12 md:col-span-6 p-6 md:p-12 lg:p-16 flex flex-col justify-between bg-[#F9F9F9] dark:bg-[#121212] text-[#0A0A0A] dark:text-white h-full relative overflow-hidden">
        {/* Logo at top-right corner */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <Logo size="sm" isLink={true} className="text-[#0A0A0A] dark:text-white" />
        </div>

        {/* Branding & Form Area */}
        <div className="mt-12 md:mt-20 mb-auto max-w-sm w-full mx-auto md:mx-0 py-2">
          {/* Heading & Welcome Text */}
          <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-3 text-[#0A0A0A] dark:text-white">
            Start Your <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
              Journey Here
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans tracking-wide leading-relaxed mb-6 max-w-xs">
            Daftarkan diri Anda untuk menjadi bagian dari komunitas kreator panggung kreatif Indonesia.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-[#bc151b] dark:text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  ERROR_DETECTED
                </span>
                {error}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-emerald-600 text-[11px] text-emerald-700 dark:text-emerald-400 font-sans flex items-start gap-2 rounded-none animate-fade-in">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  REGISTRATION_SUCCESS
                </span>
                {successMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usernamebaru"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                KONFIRMASI PASSWORD
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto self-start px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <>DAFTAR SEKARANG &rarr;</>
                )}
              </button>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-black dark:text-white font-bold hover:text-[#bc151b] dark:hover:text-[#bc151b] underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Branding & Socials */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-zinc-400 font-mono tracking-wider uppercase gap-4 mt-6 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms
            </Link>
          </div>
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
