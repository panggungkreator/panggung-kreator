"use client";

import { useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations() {
  // Track all created ScrollTrigger instances for cleanup
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const animatedElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Cleanup all scroll triggers on unmount to prevent memory leaks
    return () => {
      triggersRef.current.forEach((st) => st.kill());
      triggersRef.current = [];

      // Clear data-animated attribute and reset inline styles
      animatedElementsRef.current.forEach((el) => {
        if (el) {
          el.removeAttribute("data-animated");
          el.style.opacity = "";
          el.style.transform = "";
          el.style.willChange = "";
        }
      });
      animatedElementsRef.current = [];
    };
  }, []);

  /**
   * Fade-up entrance: element glides upward from opacity 0 to 1.
   * Reverses when scrolling back up so the animation replays on re-entry.
   */
  const fadeUp = useCallback((element: HTMLElement | null, delay = 0, y = 50, duration = 1) => {
    if (!element || typeof window === "undefined") return;
    if (element.getAttribute("data-animated")) return;
    element.setAttribute("data-animated", "true");
    animatedElementsRef.current.push(element);
    
    element.style.willChange = "transform, opacity";
    gsap.set(element, { opacity: 0, y });

    const tween = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power3.out",
      paused: true,
    });

    const st = ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      end: "top 20%",
      onEnter: () => tween.play(),
      onLeaveBack: () => tween.reverse(),
      invalidateOnRefresh: true,
    });

    triggersRef.current.push(st);
  }, []);

  /**
   * Text reveal: splits text into individual characters that slide up
   * from behind a clipping mask. Very cinematic headline treatment.
   * Reverses cleanly on scroll-back.
   */
  const textReveal = useCallback((element: HTMLElement | null, delay = 0) => {
    if (!element || typeof window === "undefined") return;
    if (element.getAttribute("data-animated")) return;
    element.setAttribute("data-animated", "true");
    animatedElementsRef.current.push(element);

    // Copy child nodes before clearing HTML
    const childNodes = Array.from(element.childNodes);
    element.innerHTML = "";
    element.style.opacity = "1"; // ensure container is visible

    const allCharSpans: HTMLSpanElement[] = [];

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || "";
        const words = text.split(/(\s+)/);

        words.forEach((word) => {
          if (word.trim() === "") {
            // Append whitespace as a text node to preserve space
            element.appendChild(document.createTextNode(word));
          } else {
            const wordSpan = document.createElement("span");
            wordSpan.className = "inline-block whitespace-nowrap overflow-hidden py-[0.15em] -my-[0.15em]";

            const chars = word.split("");
            chars.forEach((char) => {
              const charSpan = document.createElement("span");
              charSpan.innerText = char;
              charSpan.className = "inline-block will-change-transform";
              charSpan.style.transform = "translateY(120%)";
              wordSpan.appendChild(charSpan);
              allCharSpans.push(charSpan);
            });

            element.appendChild(wordSpan);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const htmlElement = node as HTMLElement;
        if (htmlElement.tagName === "BR") {
          element.appendChild(document.createElement("br"));
          return;
        }
        const text = htmlElement.innerText;
        const className = htmlElement.className;

        // Create container span preserving original classes (like highlight-stabilo)
        const containerSpan = document.createElement("span");
        containerSpan.className = className;

        const words = text.split(/(\s+)/);

        words.forEach((word) => {
          if (word.trim() === "") {
            containerSpan.appendChild(document.createTextNode(word));
          } else {
            const wordSpan = document.createElement("span");
            wordSpan.className = "inline-block whitespace-nowrap overflow-hidden py-[0.15em] -my-[0.15em]";

            const chars = word.split("");
            chars.forEach((char) => {
              const charSpan = document.createElement("span");
              charSpan.innerText = char;
              charSpan.className = "inline-block will-change-transform";
              charSpan.style.transform = "translateY(120%)";
              wordSpan.appendChild(charSpan);
              allCharSpans.push(charSpan);
            });

            containerSpan.appendChild(wordSpan);
          }
        });

        element.appendChild(containerSpan);
      }
    });

    // Create a single timeline for the entire text reveal
    const tl = gsap.timeline({ paused: true });
    tl.to(allCharSpans, {
      y: 0,
      duration: 0.9,
      stagger: 0.018,
      delay,
      ease: "power4.out",
    });

    const st = ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      end: "top 20%",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      invalidateOnRefresh: true,
    });

    triggersRef.current.push(st);
  }, []);

  /**
   * Parallax: element moves slower than scroll speed, creating depth.
   * Uses scrub: 1.2 for buttery smooth interpolation between scroll positions.
   */
  const parallax = useCallback((element: HTMLElement | null, speed = 0.15) => {
    if (!element || typeof window === "undefined") return;
    if (element.getAttribute("data-animated")) return;
    element.setAttribute("data-animated", "true");
    animatedElementsRef.current.push(element);

    element.style.willChange = "transform";
    const st = ScrollTrigger.create({
      trigger: element.parentElement || element,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2, // 1.2 seconds of smoothing lag — feels premium
      invalidateOnRefresh: true,
      animation: gsap.fromTo(
        element,
        { yPercent: -12 * speed * 10 },
        { yPercent: 12 * speed * 10, ease: "none" }
      ),
    });

    triggersRef.current.push(st);
  }, []);

  /**
   * Counter-up: numeric value animates from 0 to target.
   * Reverses back to 0 when scrolling away for re-trigger effect.
   */
  const counterUp = useCallback((element: HTMLElement | null, targetValue: number, suffix = "", duration = 2.5) => {
    if (!element || typeof window === "undefined") return;
    if (element.getAttribute("data-animated")) return;
    element.setAttribute("data-animated", "true");
    animatedElementsRef.current.push(element);

    const obj = { value: 0 };

    const tween = gsap.to(obj, {
      value: targetValue,
      duration,
      ease: "power2.out",
      paused: true,
      onUpdate: () => {
        element.innerText = Math.floor(obj.value).toLocaleString() + suffix;
      },
    });

    const st = ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      onEnter: () => tween.restart(),
      onLeaveBack: () => {
        tween.pause(0);
        obj.value = 0;
        element.innerText = "0" + suffix;
      },
      invalidateOnRefresh: true,
    });

    triggersRef.current.push(st);
  }, []);

  /**
   * Stagger entrance: multiple elements enter sequentially with slight
   * overlap, creating a cascading reveal that reverses on scroll-back.
   */
  const staggerIn = useCallback((elements: (HTMLElement | null)[], staggerDelay = 0.1, y = 40) => {
    if (typeof window === "undefined") return;
    const validElements = elements.filter((el): el is HTMLElement => el !== null);
    if (validElements.length === 0) return;

    if (validElements[0].getAttribute("data-animated")) return;
    validElements.forEach((el) => {
      el.setAttribute("data-animated", "true");
      el.style.willChange = "transform, opacity";
      animatedElementsRef.current.push(el);
    });

    // Set initial state
    gsap.set(validElements, { opacity: 0, y });

    const tl = gsap.timeline({ paused: true });
    tl.to(validElements, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: staggerDelay,
      ease: "power3.out",
    });

    const st = ScrollTrigger.create({
      trigger: validElements[0],
      start: "top 88%",
      end: "top 20%",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      invalidateOnRefresh: true,
    });

    triggersRef.current.push(st);
  }, []);

  /**
   * Line reveal: a horizontal border line scales from 0 to full width,
   * driven smoothly by scroll position (scrub).
   */
  const lineReveal = useCallback((element: HTMLElement | null) => {
    if (!element || typeof window === "undefined") return;
    if (element.getAttribute("data-animated")) return;
    element.setAttribute("data-animated", "true");
    animatedElementsRef.current.push(element);

    element.style.willChange = "transform";
    gsap.set(element, { scaleX: 0, transformOrigin: "left center" });

    const st = ScrollTrigger.create({
      trigger: element,
      start: "top 90%",
      end: "top 50%",
      scrub: 1,
      invalidateOnRefresh: true,
      animation: gsap.to(element, { scaleX: 1, ease: "none" }),
    });

    triggersRef.current.push(st);
  }, []);

  return { fadeUp, textReveal, parallax, counterUp, staggerIn, lineReveal };
}
