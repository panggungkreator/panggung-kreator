"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Check if current hostname or path is for Admin portal
  const isHostAdmin =
    typeof window !== "undefined" &&
    (window.location.hostname.startsWith("admin.") ||
      window.location.hostname.includes("admin."));

  const isAdminRoute = pathname?.startsWith("/admin") || isHostAdmin;

  // Do not render full-screen transition overlay on Admin portal (Admin uses component/skeleton loading)
  if (isAdminRoute) {
    return null;
  }

  // Always refresh ScrollTrigger on pathname change to fix navigation layout rendering issues
  useEffect(() => {
    const timer = setTimeout(() => {
      // Recalculate ScrollTrigger markers for current page elements
      ScrollTrigger.refresh();
    }, 450); // layout settle buffer

    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle fading out the loader when pathname changes (meaning route change completed)
  useEffect(() => {
    if (overlayRef.current && isNavigatingRef.current) {
      const timer = setTimeout(() => {
        // Scroll to top of the page instantly
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });

        // Force final recalculation
        ScrollTrigger.refresh();

        // Fade out transition overlay
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.inOut",
          onComplete: () => {
            if (overlayRef.current) {
              overlayRef.current.style.pointerEvents = "none";
              overlayRef.current.style.visibility = "hidden";
            }
            document.body.style.overflow = "";
            isNavigatingRef.current = false;
          },
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept all internal Link / Anchor clicks for page transition
  useEffect(() => {
    function handleLinkClick(e: MouseEvent) {
      // Check for modifier keys or non-left click to preserve browser default options
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

      // Only handle internal routes (starts with / but not external, not hashes, not files)
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.includes("#") &&
        !target.getAttribute("target") &&
        !target.getAttribute("download");

      if (isInternal) {
        // Exclude admin pages from full screen transition loading overlay
        if (href.startsWith("/admin")) {
          return;
        }

        // If we are already on the same page, do nothing to prevent getting stuck in loading state
        if (href === pathname) {
          return;
        }

        e.preventDefault();

        isNavigatingRef.current = true;
        document.body.style.overflow = "hidden";

        if (overlayRef.current) {
          overlayRef.current.style.visibility = "visible";
          overlayRef.current.style.pointerEvents = "auto";

          // Fade in the transition overlay
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              // Trigger Next.js route change once overlay is fully visible
              router.push(href);
            },
          });
        }
      }
    }

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [router, pathname]);

  return (
    <div
      ref={overlayRef}
      style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
      className="fixed inset-0 bg-white dark:bg-[#2c2c2c] text-[#2c2c2c] dark:text-white z-[9999] flex items-center justify-center select-none"
    >
      <span className="font-sans text-[12px] uppercase tracking-[0.3em] font-black animate-pulse">
        loading ...
      </span>
    </div>
  );
}
