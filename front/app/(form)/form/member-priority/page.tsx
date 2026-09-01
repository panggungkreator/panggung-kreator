"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";
import StepEssential from "@/app/(form)/form/member-priority/StepEssential";
import { registerPriorityMemberAction } from "@/lib/actions/auth-actions";
import { scrollToFirstError } from "@/lib/formValidation";
import { CheckCircle2, Sun, Moon } from "lucide-react";

function MemberPriorityRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  // Navigation Steps: 2 = Profile Onboarding (StepEssential), 3 = Success Screen
  const [step, setStep] = useState(2);
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
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (errorMsg) {
      scrollToFirstError();
    }
  }, [errorMsg]);

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
      const result = await registerPriorityMemberAction(onboardingData);
      if (result.success) {
        setStep(3);
      } else {
        setErrorMsg(result.error || "Gagal menyimpan data pendaftaran.");
      }
    } catch (err: any) {
      console.error("Onboarding submit error:", err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="w-full space-y-6 py-4 animate-fade-in text-zinc-900 dark:text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>You&apos;re In! Registrasi Sukses 🎉</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight text-zinc-900 dark:text-white">
                Halo, Teman Sepanggung! <br />
                <span className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-200 text-xl lg:text-sm uppercase block mt-1">
                  Selamat Datang di Member Priority
                </span>
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed max-w-md">
                Formulirmu sudah tersimpan aman. Detailnya cek email kamu ya. Kamu akan mendapatkan update keseruan, info event & program terbaru Panggung Kreator.
              </p>

              <div className="pt-2">
                <Link
                  href="/"
                  className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  &larr; Kembali ke Beranda
                </Link>
              </div>
            </div>
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
