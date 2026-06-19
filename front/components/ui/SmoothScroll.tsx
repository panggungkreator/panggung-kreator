"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize smooth scroll on non-touch devices or globally based on preferences
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom cinematic ease
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger if GSAP is loaded
    // This allows ScrollTrigger to be perfectly synchronized with the smooth scroll
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        lenis.on("scroll", ScrollTrigger.update);
        
        ScrollTrigger.scrollerProxy(document.body, {
          scrollTop(value) {
            return arguments.length ? lenis.scrollTo(value as number, { immediate: true }) : lenis.scroll;
          },
          getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
          },
        });
        
        ScrollTrigger.addEventListener("refresh", () => lenis.resize());
        ScrollTrigger.refresh();
      });
    });

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}
