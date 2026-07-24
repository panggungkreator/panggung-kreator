"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";
import StepEssential from "@/app/(form)/form/member-priority/StepEssential";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Lock, Sun, Moon } from "lucide-react";

function MemberPriorityRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  // Navigation Steps: 2 = Profile Onboarding (StepEssential), 3 = Success Screen
  const [step, setStep] = useState(2);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Theme initialization (Light mode default)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    const supabase = createClient();
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleOnboardingSuccess = async (onboardingData: any) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Hubungi API profile update kita untuk menyelesaikan onboarding
      const response = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingData),
      });

      const resJson = await response.json();
      if (!response.ok) {
        setErrorMsg(resJson.error || "Gagal menyimpan data kuesioner onboarding.");
      } else {
        setStep(3);
      }
    } catch (err: any) {
      console.error("Onboarding submit error:", err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] text-zinc-900 dark:text-white transition-colors duration-200">
        <svg className="animate-spin h-6 w-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-black selection:text-white bg-neutral-50 dark:bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div
        data-lenis-prevent
        className="max-w-2xl w-full p-8 md:p-12 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-xl dark:shadow-none relative animate-fade-in transition-colors duration-200"
      >
        {/* Top Header Row: Logo on left, Theme Switcher on right */}
        <div className="absolute top-6 left-6 right-6 md:top-8 md:left-8 md:right-8 z-10 flex items-center justify-between">
          <Logo size="sm" isLink={true} className="text-black dark:text-white" />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full bg-[#27272a] p-1 transition-colors duration-200 ease-in-out focus:outline-none"
          >
            <span className="sr-only">Toggle Theme</span>

            {/* Background Icons */}
            <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <Sun size={12} className={`transition-opacity duration-200 ${theme === "light" ? "opacity-0" : "text-zinc-400 opacity-70"}`} />
              <Moon size={12} className={`transition-opacity duration-200 ${theme === "dark" ? "opacity-0" : "text-white opacity-90 fill-white"}`} />
            </span>

            {/* Sliding Knob */}
            <span
              className={`pointer-events-none relative z-10 flex h-5 w-5 transform items-center justify-center rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md ${theme === "dark" ? "translate-x-[24px]" : "translate-x-0"
                }`}
            >
              {theme === "dark" && <Moon size={10} className="text-zinc-900 fill-zinc-900" />}
            </span>
          </button>
        </div>

        {/* Branding & Form Area */}
        <div className="w-full pt-10 md:pt-12">
          {!isAuthenticated ? (
            /* Unauthenticated state */
            <div className="w-full py-12 text-center space-y-6">
              <div className="mx-auto bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-zinc-600 dark:text-zinc-400 w-fit">
                <Lock size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Akses Diperlukan</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Silakan masuk atau buat akun Panggung Kreator Anda terlebih dahulu untuk dapat mengisi Formulir Pendaftaran Prioritas.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => router.push(`/login?next=/form/member-priority${referralCode ? `?ref=${referralCode}` : ""}`)}
                  className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors cursor-pointer"
                >
                  Masuk ke Akun Anda &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated states */
            <>
              {step === 2 && (
                <div className="mb-8 pt-2">
                  <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-3 text-zinc-900 dark:text-white">
                    Halo, <br />
                    <span className="not-italic font-sans font-black tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
                      Teman Sepanggung
                    </span>
                  </h2>
                </div>
              )}

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-red-600 dark:text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
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
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Step 2: Streamlined Onboarding Form */}
              {step === 2 && (
                <StepEssential
                  onSuccess={handleOnboardingSuccess}
                  errorMsg={errorMsg}
                  setErrorMsg={setErrorMsg}
                  isLoading={isLoading}
                  initialReferralCode={referralCode}
                />
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div className="w-full space-y-6 py-6 animate-fade-in text-zinc-900 dark:text-white">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-mono text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Priority Registration Success</span>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-3">
                    UYEAH
                  </h2>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans tracking-wide leading-relaxed max-w-md">
                    Selamat! Akun Panggung Kreator Anda telah terdaftar sebagai Member Priority. Silakan masuk untuk melengkapi profil portofolio Anda.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => router.push("/myprofile")}
                      className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors cursor-pointer"
                    >
                      &larr; Masuk ke Ruang Profil Anda
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemberPriorityRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <svg className="animate-spin h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    }>
      <MemberPriorityRegisterInner />
    </Suspense>
  );
}
