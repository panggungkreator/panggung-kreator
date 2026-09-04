"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { SECTION_TITLES } from "@/app/(form)/form/member-priority/constants";
import { Section1Profile } from "@/app/(form)/form/member-priority/sections/Section1Profile";
import { Section2PublicSpeaking } from "@/app/(form)/form/member-priority/sections/Section2PublicSpeaking";
import { Section3PersonalBranding } from "@/app/(form)/form/member-priority/sections/Section3PersonalBranding";
import { Section4Career } from "@/app/(form)/form/member-priority/sections/Section4Career";
import { Section5Topic } from "@/app/(form)/form/member-priority/sections/Section5Topic";
import { Section6Commitment } from "@/app/(form)/form/member-priority/sections/Section6Commitment";
import { useOnboardingFormState, InitialOnboardingData } from "./useOnboardingFormState";
import { submitMemberOnboardingAction } from "@/lib/actions/onboarding-actions";
import { Sun, Moon, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OnboardingClientProps {
  initialData: InitialOnboardingData;
  tierName?: string;
}

export default function OnboardingClient({ initialData, tierName }: OnboardingClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
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

  const handleFormSubmit = async (payload: any) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await submitMemberOnboardingAction(payload);
      if (result.success) {
        toast.success("Profil dan data minat kamu berhasil disimpan!");
        // Arahkan kembali ke /myprofile dan tetap dalam status login
        window.location.href = "/myprofile";
      } else {
        setErrorMsg(result.error || "Gagal menyimpan data onboarding.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Submit onboarding error:", err);
      setErrorMsg("Terjadi kesalahan jaringan saat menyimpan data.");
      setIsLoading(false);
    }
  };

  const state = useOnboardingFormState(initialData, handleFormSubmit, setErrorMsg, isLoading);
  const { currentSection, handleNextSection, handlePrevSection, handleSubmit } = state;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-black selection:text-white bg-neutral-50 dark:bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div
        data-lenis-prevent
        className="max-w-2xl w-full p-8 md:p-12 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-xl dark:shadow-none relative animate-fade-in transition-colors duration-200"
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <Logo size="sm" isLink={false} className="text-black dark:text-white" />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full bg-[#27272a] p-1 transition-colors duration-200 ease-in-out focus:outline-none"
          >
            <span className="sr-only">Toggle Theme</span>
            <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <Sun size={12} className={`transition-opacity duration-200 ${theme === "light" ? "opacity-0" : "text-zinc-400 opacity-70"}`} />
              <Moon size={12} className={`transition-opacity duration-200 ${theme === "dark" ? "opacity-0" : "text-white opacity-90 fill-white"}`} />
            </span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                theme === "dark" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Welcome Banner */}
        <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold">
              ONBOARDING MEMBER {tierName ? `• TIER ${tierName.toUpperCase()}` : ""}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Lengkapi Profil & Minat Kamu
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Selamat bergabung di Panggung Kreator! Data ini kami gunakan untuk memetakan potensi karya, merekomendasikan mentor, serta menyusun roadmap pengembangan personal branding kamu.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border-l-4 border-[#bc151b] text-xs text-[#bc151b] dark:text-red-400 font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-zinc-900 dark:text-white">
          {/* STEP PROGRESS INDICATOR */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
              <span>{SECTION_TITLES[currentSection - 1].toUpperCase()}</span>
              <span>LANGKAH {currentSection} DARI 6</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-none overflow-hidden">
              <div
                className="bg-black dark:bg-white h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentSection / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* FORM SECTIONS */}
          {currentSection === 1 && (
            <Section1Profile
              fullName={state.fullName}
              setFullName={state.setFullName}
              birthDate={state.birthDate}
              setBirthDate={state.setBirthDate}
              address={state.address}
              setAddress={state.setAddress}
              whatsappNumber={state.whatsappNumber}
              setWhatsappNumber={state.setWhatsappNumber}
              email={state.email}
              setEmail={state.setEmail}
              instagramUsername={state.instagramUsername}
              setInstagramUsername={state.setInstagramUsername}
              tiktokUsername={state.tiktokUsername}
              setTiktokUsername={state.setTiktokUsername}
              youtubeUrl={state.youtubeUrl}
              setYoutubeUrl={state.setYoutubeUrl}
              linkedinUrl={state.linkedinUrl}
              setLinkedinUrl={state.setLinkedinUrl}
              occupation={state.occupation}
              setOccupation={state.setOccupation}
              fieldErrors={state.fieldErrors}
              handleFieldChange={state.handleFieldChange}
            />
          )}

          {currentSection === 2 && (
            <Section2PublicSpeaking
              psChallenges={state.psChallenges}
              togglePsChallenge={state.togglePsChallenge}
              confidenceScale={state.confidenceScale}
              setConfidenceScale={state.setConfidenceScale}
              nervousTrigger={state.nervousTrigger}
              setNervousTrigger={state.setNervousTrigger}
              fieldErrors={state.fieldErrors}
            />
          )}

          {currentSection === 3 && (
            <Section3PersonalBranding
              skillsToMaster={state.skillsToMaster}
              setSkillsToMaster={state.setSkillsToMaster}
              customSkillsToMaster={state.customSkillsToMaster}
              setCustomSkillsToMaster={state.setCustomSkillsToMaster}
              roleModel={state.roleModel}
              setRoleModel={state.setRoleModel}
              monetizationInterest={state.monetizationInterest}
              setMonetizationInterest={state.setMonetizationInterest}
              customMonetizationInterest={state.customMonetizationInterest}
              setCustomMonetizationInterest={state.setCustomMonetizationInterest}
              fieldErrors={state.fieldErrors}
            />
          )}

          {currentSection === 4 && (
            <Section4Career
              careerGoal={state.careerGoal}
              setCareerGoal={state.setCareerGoal}
              firstOpportunity={state.firstOpportunity}
              setFirstOpportunity={state.setFirstOpportunity}
              fieldErrors={state.fieldErrors}
            />
          )}

          {currentSection === 5 && (
            <Section5Topic
              mainTopic={state.mainTopic}
              setMainTopic={state.setMainTopic}
              customMainTopic={state.customMainTopic}
              setCustomMainTopic={state.setCustomMainTopic}
              mainMessage={state.mainMessage}
              setMainMessage={state.setMainMessage}
              targetAudience={state.targetAudience}
              setTargetAudience={state.setTargetAudience}
              expertDesire={state.expertDesire}
              setExpertDesire={state.setExpertDesire}
              fieldErrors={state.fieldErrors}
            />
          )}

          {currentSection === 6 && (
            <Section6Commitment
              activeCommunities={state.activeCommunities}
              setActiveCommunities={state.setActiveCommunities}
              careerObstacle={state.careerObstacle}
              setCareerObstacle={state.setCareerObstacle}
              timeCommitment={state.timeCommitment}
              setTimeCommitment={state.setTimeCommitment}
              fieldErrors={state.fieldErrors}
            />
          )}

          {/* STEP NAVIGATION & SUBMIT BUTTONS */}
          <div className="pt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
            {currentSection > 1 ? (
              <button
                type="button"
                onClick={handlePrevSection}
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-all cursor-pointer"
              >
                &larr; Kembali
              </button>
            ) : (
              <div />
            )}

            {currentSection < 6 ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-all flex items-center gap-2 cursor-pointer"
              >
                Lanjut &rarr;
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>Simpan & Selesai &rarr;</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
