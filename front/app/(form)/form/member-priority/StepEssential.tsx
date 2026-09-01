"use client";

import React, { useEffect } from "react";
import { usePriorityFormState } from "./usePriorityFormState";
import { SECTION_TITLES } from "./constants";
import { Section1Profile } from "./sections/Section1Profile";
import { Section2PublicSpeaking } from "./sections/Section2PublicSpeaking";
import { Section3PersonalBranding } from "./sections/Section3PersonalBranding";
import { Section4Career } from "./sections/Section4Career";
import { Section5Topic } from "./sections/Section5Topic";
import { Section6Commitment } from "./sections/Section6Commitment";

interface StepEssentialProps {
  onSuccess: (data: any) => void;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  isLoading: boolean;
  initialReferralCode?: string | null;
}

export default function StepEssential({
  onSuccess,
  errorMsg,
  setErrorMsg,
  isLoading,
  initialReferralCode,
}: StepEssentialProps) {
  const state = usePriorityFormState(onSuccess, setErrorMsg, isLoading, errorMsg);
  const { currentSection, handleNextSection, handlePrevSection, handleSubmit } = state;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  return (
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
              <>Kirim &rarr;</>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
