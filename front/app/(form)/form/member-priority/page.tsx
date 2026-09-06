"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";
import StepEssential from "@/app/(form)/form/member-priority/StepEssential";
import { registerPriorityMemberAction } from "@/lib/actions/auth-actions";
import { scrollToFirstError } from "@/lib/formValidation";
import { CheckCircle2, Sun, Moon, Mail, ArrowRight } from "lucide-react";

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
            <div className="w-full space-y-6 py-2 animate-fade-in text-zinc-900 dark:text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>You&apos;re In! Registrasi Sukses 🎉</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight text-zinc-900 dark:text-white">
                  Halo, Teman Sepanggung!
                </h2>
                <p className="not-italic font-sans font-black tracking-wide text-zinc-800 dark:text-zinc-200 text-lg lg:text-xl uppercase">
                  Selamat Datang di Member Priority
                </p>
              </div>

              {/* Informational Callout Box */}
              <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4 max-w-lg shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                      Langkah Selanjutnya: Cek Email untuk Akses Akun
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                      Formulirmu sudah tersimpan aman. Kami telah mengirimkan detail akun berupa <strong className="text-zinc-900 dark:text-white">Username</strong> dan <strong className="text-zinc-900 dark:text-white">Password</strong> ke alamat email kamu untuk masuk ke profil member.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <span className="text-sm leading-none mt-0.5 select-none">💡</span>
                  <p className="text-[11px] leading-relaxed font-medium">
                    Belum melihat email masuk? Silakan periksa folder <strong className="font-bold underline">Spam</strong> atau tab <strong className="font-bold underline">Promosi</strong> di email kamu.
                  </p>
                </div>
              </div>

              {/* Action Buttons Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 max-w-lg">
                <Link
                  href="/login"
                  className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-[#bc151b] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <span>Login ke Profil</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/80 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Kembali ke Beranda</span>
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
