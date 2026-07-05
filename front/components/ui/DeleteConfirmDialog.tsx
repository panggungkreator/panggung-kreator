"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmClassName?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Hapus",
  confirmClassName = "px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full cursor-pointer h-auto border-0 shadow-sm"
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[24px]">
        <DialogHeader className="pb-2 mb-0 border-b-0">
          <DialogTitle className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed px-1">
          {description}
        </div>

        <div className="flex flex-row justify-end gap-3 pt-4 px-1">
          <Button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer h-auto shadow-none"
          >
            Batal
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={confirmClassName}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
