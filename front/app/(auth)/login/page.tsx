"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPasswordAction, signInWithGoogle } from "@/lib/actions/auth-actions";
import { clearStaleAuthStorage } from "@/lib/utils/url";
import Logo from "@/components/ui/Logo";
import { Eye, EyeOff } from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get("redirectTo");
  const messageParam = searchParams.get("message");
  const errorParam = searchParams.get("error");

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    // Bersihkan token basi di localStorage/sessionStorage agar tidak ada konflik multi-akun
    clearStaleAuthStorage();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithPasswordAction(emailOrUsername, password);
      if (result.success) {
        // Redirect menggunakan location.href agar middleware/proxy mengevaluasi session baru
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : "";

        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":") || hostname === "[::1]";
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || isIpAddress;

        let rootDomain = "panggungkreator.web.id";
        if (!isLocalhost) {
          const parts = hostname.split(".");
          if (parts.length >= 2) {
            if (hostname.endsWith(".web.id") && parts.length >= 3) {
              rootDomain = parts.slice(-3).join(".");
            } else {
              rootDomain = parts.slice(-2).join(".");
            }
          }
        } else {
          rootDomain = hostname;
        }

        const rootHost = isLocalhost ? `${hostname}${port}` : `${rootDomain}${port}`;

        let adminRedirectUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

        if (!adminRedirectUrl) {
          adminRedirectUrl = isLocalhost
            ? "/admin"
            : `${protocol}//admin.${rootHost}/`;
        }

        // Gunakan relative path /myprofile agar tidak terjadi cross-host/cross-port mismatch di perangkat mobile / IP LAN
        const userRedirectUrl = "/myprofile";

        const targetUrl = redirectToParam ? redirectToParam : userRedirectUrl;

        window.location.href = result.isAdmin ? adminRedirectUrl : targetUrl;

      } else {
        setError(result.error || "Terjadi kesalahan saat masuk.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Login client error:", err);
      setError("Gagal terhubung ke server.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle(redirectToParam || "/myprofile");
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) return;
      console.error("Google sign in error:", err);
      setError("Gagal menghubungkan ke Google.");
      setIsGoogleLoading(false);
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
          className="object-cover contrast-115 brightness-90 transition-all duration-700 "
          priority
        />
      </div>

      {/* Right Column - Branding & Form */}
      <div className="col-span-12 md:col-span-6 p-6 md:p-12 lg:p-16 flex flex-col justify-between bg-[#F9F9F9] dark:bg-[#121212] text-[#0A0A0A] dark:text-white h-full relative overflow-auto">
        {/* Logo at top-right corner */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <Logo size="sm" isLink={true} className="text-[#0A0A0A] dark:text-white" />
        </div>

        {/* Branding & Form Area */}
        <div className="my-auto max-w-sm w-full mx-auto md:mx-0 py-6">
          {/* Heading & Welcome Text */}
          <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-4 text-[#0A0A0A] dark:text-white">
            One Stage, <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
              One Progress
            </span>
          </h2>

          {messageParam && (
            <div className="my-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono flex items-start gap-2 rounded-none animate-fade-in">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  SUCCESS
                </span>
                {messageParam}
              </div>
            </div>
          )}

          {(error || errorParam) && (
            <div className="my-4 p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-[#bc151b] dark:text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
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
                {error || errorParam}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                EMAIL ATAU USERNAME
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="name@domain.com atau username"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                KATA SANDI
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pr-8 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[9px] font-mono tracking-wider uppercase text-zinc-400">
              <Link href="/forgot-password" className="hover:text-black dark:hover:text-white transition-colors">
                LUPA KATA SANDI?
              </Link>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-full self-start px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <>MASUK &rarr;</>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-mono">
                  <span className="bg-white dark:bg-[#0A0A0A] px-2 text-zinc-400">
                    ATAU
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.04.69-2.37 1.1-3.71 1.1-2.85 0-5.27-1.92-6.13-4.49H2.18v2.82C4 20.36 7.77 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.87 14.01c-.22-.66-.35-1.36-.35-2.01s.13-1.35.35-2.01V7.17H2.18C1.43 8.47 1 9.93 1 11.5s.43 3.03 1.18 4.33l3.69-2.82z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4 3.64 2.18 7.17l3.69 2.82C6.73 7.42 9.15 5.38 12 5.38z"
                    />
                  </svg>
                )}
                <span>Masuk dengan Google</span>
              </button>


              {/* <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-black dark:text-white font-bold hover:text-[#bc151b] dark:hover:text-[#bc151b] underline transition-colors"
                >
                  Daftar di sini
                </Link>
              </p> */}
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
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
