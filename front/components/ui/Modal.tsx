"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
  contentClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  children,
  footer,
  maxWidth = "max-w-lg",
  className,
  contentClassName,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 overflow-y-auto max-h-[90vh] scrollbar-thin",
          maxWidth,
          className
        )}
      >
        {(title || icon || subtitle || headerRight) && (
          <DialogHeader className="flex flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-150 dark:border-zinc-800/80 shrink-0 space-y-0 text-left">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-base shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-title tracking-tight normal-case">
                    {title}
                  </DialogTitle>
                )}
                {subtitle && (
                  <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                    {subtitle}
                  </DialogDescription>
                )}
              </div>
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </DialogHeader>
        )}

        {children && <div className={cn("space-y-3", contentClassName)}>{children}</div>}

        {footer && <div className="pt-3 mt-1 shrink-0 border-t border-zinc-150 dark:border-zinc-800/80">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}

export function ModalSection({
  title,
  titleColor = "text-zinc-500 dark:text-zinc-400",
  children,
  className,
}: {
  title?: string;
  titleColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-zinc-50/80 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80",
        className
      )}
    >
      {title && (
        <h4
          className={cn(
            "font-semibold mb-2.5 uppercase tracking-wider text-[10px]",
            titleColor
          )}
        >
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}
