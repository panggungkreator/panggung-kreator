"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Expose Lenis instance type on window for global access
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Expose Lenis globally so any component can call window.__lenis.scrollTo()
    window.__lenis = lenis;

    // --- Sync Lenis ↔ GSAP ScrollTrigger ---
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.defaults({
      scroller: undefined, // use native window
    });

    ScrollTrigger.refresh();

    // --- Intercept ALL anchor-link clicks for smooth scroll ---
    // Only simple #id hashes are valid CSS selectors for querySelector.
    // Supabase auth redirects use hashes like #access_token=eyJ... which are NOT valid selectors.
    function isSimpleHashSelector(hash: string): boolean {
      return /^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(hash);
    }

    function handleAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!target) return;

      const hash = target.getAttribute("href");
      if (!hash || hash === "#" || !isSimpleHashSelector(hash)) return;

      try {
        const el = document.querySelector(hash);
        if (!el) return;

        e.preventDefault();

        // Use Lenis for silky smooth scroll to the target element
        lenis.scrollTo(el as HTMLElement, {
          offset: -90, // offset for fixed header height
          duration: 1.8,
          easing: (t) => 1 - Math.pow(1 - t, 4), // quartic ease-out — very smooth deceleration
        });

        // Update URL hash without jumping
        window.history.pushState(null, "", hash);
      } catch {
        // Silently ignore invalid selectors
      }
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });

    // --- Handle direct hash on page load (e.g. user visits /#gabung) ---
    function handleInitialHash() {
      const hash = window.location.hash;
      if (!hash || !isSimpleHashSelector(hash)) return;

      try {
        const el = document.querySelector(hash);
        if (!el) return;

        // Small delay to let layout settle before scrolling
        setTimeout(() => {
          lenis.scrollTo(el as HTMLElement, {
            offset: -90,
            duration: 2.0,
            easing: (t) => 1 - Math.pow(1 - t, 4),
          });
        }, 300);
      } catch {
        // Silently ignore invalid selectors
      }
    }

    handleInitialHash();

    // --- Dynamic Global Scroll Interception (Lenis Bypass) ---
    function handleGlobalScrollInterception(e: Event) {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (!target || target.nodeType !== 1) break;

        const style = window.getComputedStyle(target);
        const isScrollableY = (style.overflowY === "auto" || style.overflowY === "scroll") && target.scrollHeight > target.clientHeight;
        const isScrollableX = (style.overflowX === "auto" || style.overflowX === "scroll") && target.scrollWidth > target.clientWidth;

        if (isScrollableY || isScrollableX) {
          if (!target.hasAttribute("data-lenis-prevent")) {
            target.setAttribute("data-lenis-prevent", "true");
          }
          e.stopPropagation();
          break;
        }
        target = target.parentElement;
      }
    }

    document.addEventListener("wheel", handleGlobalScrollInterception, { capture: true, passive: false });
    document.addEventListener("touchmove", handleGlobalScrollInterception, { capture: true, passive: false });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      document.removeEventListener("wheel", handleGlobalScrollInterception, { capture: true });
      document.removeEventListener("touchmove", handleGlobalScrollInterception, { capture: true });
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
