"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditor } from "./EditorContext";
import { Pencil } from "lucide-react";

interface EditProps {
  id: string;
  children: string; // Default text passed in the layout
}

export function Edit({ id, children }: EditProps) {
  const { isEditMode, getFieldVal, updateField } = useEditor();
  
  // Clean up any extra spacing or carriage returns in children
  const defaultText = typeof children === "string" ? children.trim() : "";
  const value = getFieldVal(id, defaultText);
  
  const [content, setContent] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);

  // Keep state in sync with context value if it changes
  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    
    const newText = (contentRef.current?.innerHTML || "").trim();
    if (newText !== value) {
      setIsSaving(true);
      const success = await updateField(id, newText);
      if (success) {
        setContent(newText);
      } else {
        // Revert on failure
        setContent(value);
        if (contentRef.current) {
          contentRef.current.innerHTML = value;
        }
      }
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setContent(value);
      if (contentRef.current) {
        contentRef.current.innerHTML = value;
      }
      contentRef.current?.blur();
    }
  };

  if (!isEditMode) {
    // Completely transparent wrapper that has no impact on styles, layout, flexbox, or grid items.
    return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  return (
    <span className="relative inline-block group/edit">
      <span
        ref={contentRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={() => setIsEditing(true)}
        onBlur={(e) => {
          // Avoid blurring if clicking the Save button itself
          if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest(".edit-save-btn")) {
            return;
          }
          handleBlur();
        }}
        onKeyDown={handleKeyDown}
        className={`outline-none transition-all rounded px-0.5 ${
          isEditing
            ? "ring-2 ring-amber-500 bg-black/5 dark:bg-white/5 cursor-text text-zinc-900 dark:text-white"
            : "hover:ring-2 hover:ring-amber-500/50 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        } ${isSaving ? "opacity-50 animate-pulse" : ""}`}
        style={{ display: "inline-block" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {isEditing && (
        <button
          className="edit-save-btn absolute -bottom-8 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-extrabold px-2.5 py-1 rounded shadow-lg flex items-center gap-1 z-[9999]"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevents browser blur from firing early
            handleBlur();
          }}
          title="Simpan Perubahan"
        >
          <Pencil size={10} /> Simpan
        </button>
      )}
    </span>
  );
}
