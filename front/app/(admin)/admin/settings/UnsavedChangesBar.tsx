"use client";

import React from "react";
import { AlertCircle, Save, RotateCcw, Loader2 } from "lucide-react";

interface UnsavedChangesBarProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesBar({
  hasChanges,
  isSaving,
  onSave,
  onDiscard,
}: UnsavedChangesBarProps) {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl animate-slide-up">
      <div className="bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-700/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-xs font-bold">Perubahan Belum Disimpan</p>
            <p className="text-[11px] text-zinc-400">
              Anda memiliki perubahan form yang belum disimpan di tab ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={13} />
            <span>Buang</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
