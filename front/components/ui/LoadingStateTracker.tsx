"use client";

import { useEffect } from "react";
import { startProgress, finishProgress } from "@/lib/progress";

export default function LoadingStateTracker() {
  useEffect(() => {
    // Dipanggil saat skeleton / loading.tsx di-mount oleh Suspense
    startProgress();

    // Dipanggil tepat saat skeleton / loading.tsx selesai dan digantikan konten halaman nyata
    return () => {
      finishProgress();
    };
  }, []);

  return null;
}
