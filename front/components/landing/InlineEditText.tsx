"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { Pencil } from "lucide-react";

interface InlineEditTextProps {
  tagName?: React.ElementType;
  className?: string;
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  allowHtml?: boolean;
}

export function InlineEditText({ 
  tagName: Tag = "span", 
  className = "", 
  value, 
  onSave,
  allowHtml = false 
}: InlineEditTextProps) {
  const { isEditMode } = useLandingCMS();
  const [content, setContent] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  // Sync internal state if prop value changes externally
  useEffect(() => {
    setContent(value || "");
  }, [value]);

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    
    const newContent = allowHtml 
      ? contentRef.current?.innerHTML || "" 
      : contentRef.current?.innerText || "";
      
    if (newContent !== value) {
      setIsSaving(true);
      try {
        await onSave(newContent);
        setContent(newContent);
      } catch (err) {
        console.error("Failed to save", err);
        // Revert on failure
        setContent(value);
        if (contentRef.current) {
          if (allowHtml) contentRef.current.innerHTML = value;
          else contentRef.current.innerText = value;
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent newline if we just want to save on enter
      // e.preventDefault();
      // handleBlur(); // Optional: uncomment if Enter should save and blur
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setContent(value);
      if (contentRef.current) {
        if (allowHtml) contentRef.current.innerHTML = value;
        else contentRef.current.innerText = value;
      }
      contentRef.current?.blur();
    }
  };

  if (!isEditMode) {
    if (allowHtml) {
      return <Tag className={className} dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return <Tag className={className}>{content}</Tag>;
  }

  return (
    <div className={`relative inline-block ${className.includes('block') ? 'w-full block' : ''}`}>
      <Tag
        ref={contentRef}
        className={`relative outline-none transition-all w-full ${className} ${
          isEditing 
            ? "ring-2 ring-[#bc151b] ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950 rounded-sm bg-black/5 dark:bg-white/5 cursor-text" 
            : "hover:ring-2 hover:ring-[#bc151b]/50 hover:ring-offset-2 hover:rounded-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        } ${isSaving ? "opacity-50" : ""}`}
        contentEditable={isEditMode}
        suppressContentEditableWarning={true}
        onFocus={() => setIsEditing(true)}
        onBlur={(e: any) => {
          // Hanya blur jika kliknya BUKAN ke tombol save
          if (e.relatedTarget && e.relatedTarget.closest('.inline-save-btn')) {
            return;
          }
          handleBlur();
        }}
        onKeyDown={handleKeyDown}
        title="Klik untuk mengedit"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {isEditing && (
        <button
          className="inline-save-btn absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#bc151b] text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg flex items-center gap-1 z-50 hover:bg-red-700 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault(); // Mencegah onBlur pada input
            handleBlur();
          }}
          title="Simpan Perubahan"
        >
          <Pencil size={12} /> Simpan
        </button>
      )}
    </div>
  );
}
