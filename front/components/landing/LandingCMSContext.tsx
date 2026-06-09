"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type LandingCMSContextType = {
  isAdmin: boolean;
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
};

const LandingCMSContext = createContext<LandingCMSContextType | undefined>(undefined);

export function LandingCMSProvider({ children, isAdmin }: { children: ReactNode; isAdmin: boolean }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  return (
    <LandingCMSContext.Provider value={{
      isAdmin,
      isEditMode,
      setIsEditMode,
      activeSectionId,
      setActiveSectionId
    }}>
      {children}
    </LandingCMSContext.Provider>
  );
}

export function useLandingCMS() {
  const context = useContext(LandingCMSContext);
  if (context === undefined) {
    throw new Error("useLandingCMS must be used within a LandingCMSProvider");
  }
  return context;
}
