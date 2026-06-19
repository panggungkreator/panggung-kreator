"use client";

import React, { createContext, useContext, useState } from "react";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";

export interface LandingSection {
  section_type: string;
  content: Record<string, any>;
  is_visible?: boolean;
}

interface EditorContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  sections: LandingSection[];
  getFieldVal: (id: string, defaultVal: string) => string;
  updateField: (id: string, newValue: string) => Promise<boolean>;
  isSaving: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  isAdmin,
  initialSections,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  initialSections: LandingSection[];
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState<LandingSection[]>(initialSections);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to split "sectionType.fieldKey"
  const parseId = (id: string) => {
    const parts = id.split(".");
    const sectionType = parts[0];
    const fieldKey = parts.slice(1).join(".");
    return { sectionType, fieldKey };
  };

  const getFieldVal = (id: string, defaultVal: string): string => {
    const { sectionType, fieldKey } = parseId(id);
    const sec = sections.find((s) => s.section_type === sectionType);
    if (sec && sec.content && sec.content[fieldKey] !== undefined) {
      return sec.content[fieldKey];
    }
    return defaultVal;
  };

  const updateField = async (id: string, newValue: string): Promise<boolean> => {
    const { sectionType, fieldKey } = parseId(id);
    
    // Find the section
    const sectionIndex = sections.findIndex((s) => s.section_type === sectionType);
    let updatedContent: Record<string, any> = {};
    
    if (sectionIndex > -1) {
      updatedContent = { ...sections[sectionIndex].content, [fieldKey]: newValue };
    } else {
      updatedContent = { [fieldKey]: newValue };
    }

    // Optimistically update local state
    const nextSections = [...sections];
    if (sectionIndex > -1) {
      nextSections[sectionIndex] = {
        ...nextSections[sectionIndex],
        content: updatedContent,
      };
    } else {
      nextSections.push({
        section_type: sectionType,
        content: updatedContent,
        is_visible: true,
      });
    }
    setSections(nextSections);

    // Call server action to save to DB
    setIsSaving(true);
    try {
      const res = await updateLandingSectionAction(sectionType, updatedContent);
      if (!res.success) {
        throw new Error(res.error || "Failed to update");
      }
      return true;
    } catch (err) {
      console.error(`Failed to save field ${id}:`, err);
      // Revert if saving fails
      setSections(sections);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditorContext.Provider
      value={{
        isAdmin,
        isEditMode,
        setIsEditMode,
        sections,
        getFieldVal,
        updateField,
        isSaving,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
