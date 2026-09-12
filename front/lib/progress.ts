"use client";

// Simple global event-based progress manager that syncs with Next.js Suspense / Skeleton states
export const PROGRESS_START_EVENT = "app:progress-start";
export const PROGRESS_FINISH_EVENT = "app:progress-finish";

let activeLoaders = 0;

export function startProgress() {
  if (typeof window === "undefined") return;
  activeLoaders++;
  window.dispatchEvent(new CustomEvent(PROGRESS_START_EVENT, { detail: { count: activeLoaders } }));
}

export function finishProgress() {
  if (typeof window === "undefined") return;
  activeLoaders = Math.max(0, activeLoaders - 1);
  window.dispatchEvent(new CustomEvent(PROGRESS_FINISH_EVENT, { detail: { count: activeLoaders } }));
}

export function forceFinishProgress() {
  if (typeof window === "undefined") return;
  activeLoaders = 0;
  window.dispatchEvent(new CustomEvent(PROGRESS_FINISH_EVENT, { detail: { count: 0, force: true } }));
}

export function getActiveLoadersCount() {
  return activeLoaders;
}
