"use client";

import React from "react";
import { Trash2, Clock } from "lucide-react";

export interface ModalConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
  type?: "delete" | "verify" | "default";
  confirmText?: string;
  cancelText?: string;
}

export const ModalConfirmation: React.FC<ModalConfirmationProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  isLoading = false,
  type = "default",
  confirmText,
  cancelText = "Batal",
}) => {
  if (!isOpen) return null;

  // Determine Icon and styles based on type
  let iconContainerClass = "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400";
  let IconComponent = Clock;
  let confirmBtnClass = "bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900";
  let defaultConfirmText = "Konfirmasi";

  if (type === "delete") {
    iconContainerClass = "bg-[#fee2e2] text-[#b91c1c]";
    IconComponent = Trash2;
    confirmBtnClass = "bg-[#b91c1c] hover:bg-[#991b1b] text-white";
    defaultConfirmText = "Hapus";
  } else if (type === "verify") {
    iconContainerClass = "bg-[#fef9c3] text-[#713f12]";
    IconComponent = Clock;
    confirmBtnClass = "bg-[#15803d] hover:bg-[#166534] text-white";
    defaultConfirmText = "Konfirmasi";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" 
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative bg-white dark:bg-zinc-900 rounded-none sm:rounded-[2rem] border-0 sm:border border-zinc-150 dark:border-white/5 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in p-6 sm:p-8 text-center">

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${iconContainerClass}`}>
          <IconComponent className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 font-title">
          {title}
        </h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 px-4 leading-relaxed">
          {description}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all w-full cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-3 text-sm font-bold rounded-full transition-all flex justify-center items-center gap-2 w-full cursor-pointer ${confirmBtnClass}`}
          >
            {isLoading ? "Memproses..." : (confirmText || defaultConfirmText)}
          </button>
        </div>
      </div>
    </div>
  );
};
