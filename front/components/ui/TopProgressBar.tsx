"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  PROGRESS_START_EVENT,
  PROGRESS_FINISH_EVENT,
  startProgress,
  finishProgress,
} from "@/lib/progress";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
  }, []);

  const handleFinish = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setIsFinishing(true);
    setProgress(100);

    // Fade out after bar reaches 100%
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setProgress(0);
        setIsFinishing(false);
      }, 300);
    }, 200);
  }, []);

  const handleStart = useCallback(() => {
    clearAllTimers();
    setIsFinishing(false);
    setVisible(true);

    setProgress((prev) => (prev > 0 && prev < 85 ? prev : 18));

    // Trickle animation up to 88% while waiting for skeleton / async data
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        if (prev < 40) return prev + Math.random() * 10 + 6;
        if (prev < 70) return prev + Math.random() * 5 + 2;
        if (prev < 85) return prev + Math.random() * 2 + 1;
        return prev + 0.3;
      });
    }, 180);

    // Safety timeout: automatically dismiss progress bar after 4 seconds to prevent getting stuck
    safetyTimeoutRef.current = setTimeout(() => {
      handleFinish();
    }, 4000);
  }, [clearAllTimers, handleFinish]);

  // Listen to custom progress events
  useEffect(() => {
    function onProgressStart() {
      handleStart();
    }

    function onProgressFinish(e: any) {
      const remainingLoaders = e?.detail?.count ?? 0;
      // Complete when all skeleton loaders are done or explicitly finished
      if (remainingLoaders <= 0) {
        handleFinish();
      }
    }

    window.addEventListener(PROGRESS_START_EVENT, onProgressStart);
    window.addEventListener(PROGRESS_FINISH_EVENT, onProgressFinish);

    return () => {
      window.removeEventListener(PROGRESS_START_EVENT, onProgressStart);
      window.removeEventListener(PROGRESS_FINISH_EVENT, onProgressFinish);
      clearAllTimers();
    };
  }, [handleStart, handleFinish, clearAllTimers]);

  // Global internal Link click interceptor for instant 0ms trigger on click
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.includes("#") &&
        !target.getAttribute("target") &&
        !target.getAttribute("download");

      if (isInternal) {
        const urlPath = href.split("?")[0].split("#")[0];
        const currentPath = window.location.pathname;

        if (urlPath !== currentPath) {
          startProgress();
        }
      }
    }

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  // When pathname changes, schedule a finish fallback if no skeleton keeps it active
  useEffect(() => {
    const settleTimer = setTimeout(() => {
      // If no skeleton is keeping it active, finish smoothly
      finishProgress();
    }, 300);

    return () => clearTimeout(settleTimer);
  }, [pathname]);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Background Track */}
      <div className="w-full h-full bg-transparent relative overflow-hidden">
        {/* Animated Progress Bar with glow effect */}
        <div
          className="h-full bg-text-primary dark:bg-zinc-100 shadow-[0_0_12px_rgba(0,0,0,0.5)] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: isFinishing ? "200ms" : "220ms",
          }}
        >
          {/* Subtle moving shimmer at the tip */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent transform translate-x-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
