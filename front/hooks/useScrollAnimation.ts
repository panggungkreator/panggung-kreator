"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEditor } from "@/components/editor/EditorContext";

export function useScrollAnimation() {
  const { isEditMode } = useEditor();

  useEffect(() => {
    // Disable entrance animations in editor mode to prevent breaking the editor DOM cursor
    if (isEditMode) {
      // Clear any existing scroll triggers
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Simple Fade-in Reveal Up
    const revealElements = document.querySelectorAll(".reveal-up");
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // 2. Child Element Stagger Reveal
    const staggerParents = document.querySelectorAll(".stagger-parent");
    staggerParents.forEach((parent) => {
      const children = parent.querySelectorAll(".stagger-child");
      if (children.length > 0) {
        gsap.fromTo(
          children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: parent,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    // 3. Word-by-Word Headline Reveal
    const wordElements = document.querySelectorAll(".reveal-words");
    wordElements.forEach((el) => {
      const text = el.textContent || "";
      if (!text.trim()) return;

      el.innerHTML = ""; // Clear text for splitting
      const words = text.split(/\s+/);
      
      words.forEach((word) => {
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(15px)";
        span.innerHTML = word + "&nbsp;";
        el.appendChild(span);
      });

      const spans = el.querySelectorAll("span");
      gsap.to(spans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Refresh ScrollTrigger to sync positioning
    ScrollTrigger.refresh();

    return () => {
      // Clean up ScrollTrigger instances on unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isEditMode]);
}
