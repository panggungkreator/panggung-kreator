"use client";

import React, { ReactNode } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { Edit2, EyeOff } from "lucide-react";

interface EditableSectionProps {
  id: string;
  isVisible: boolean;
  children: ReactNode;
}

export function EditableSection({ id, isVisible, children }: EditableSectionProps) {
  const { isEditMode, setActiveSectionId, activeSectionId } = useLandingCMS();
  const isEditingThis = activeSectionId === id;

  // Jika tidak dalam edit mode dan section disembunyikan, tidak render apapun
  if (!isEditMode && !isVisible) return null;

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`relative group rounded-xl transition-all duration-300
        ${isEditingThis ? "ring-2 ring-[#bc151b] z-40 bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"}
        ${!isVisible ? "opacity-50 grayscale" : ""}
      `}
    >
      {/* Edit Overlay */}
      <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 transition-opacity duration-200
        ${isEditingThis ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
      `}>
        {!isVisible && (
          <div className="bg-amber-500/90 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 shadow-lg backdrop-blur-md">
            <EyeOff size={14} /> Tersembunyi
          </div>
        )}
        <button
          onClick={() => setActiveSectionId(id)}
          className="bg-[#bc151b] text-white p-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Edit2 size={16} />
          <span className="text-sm font-medium pr-1">Edit {id}</span>
        </button>
      </div>

      <div className={`pointer-events-none transition-opacity ${isEditingThis ? "opacity-80" : ""}`}>
        {children}
      </div>
    </div>
  );
}
