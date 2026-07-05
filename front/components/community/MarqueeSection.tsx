"use client";

import React from "react";

export default function MarqueeSection() {
  const items = [
    "PUBLIC SPEAKING",
    "CONTENT CREATION",
    "PERSONAL BRANDING",
    "1 STAGE 1 PROGRESS",
    "OPEN MIC WEEKLY",
    "MC PRACTICE",
    "VOICE OVER CHALLENGE",
    "NETWORKING SESSION",
    "CONTENT CREATOR CLASS",
    "SHARING SESSION",
  ];

  // Repeat the items list to ensure seamless looping coverage
  const marqueeText = [...items, ...items, ...items].join("   •   ");

  return (
    <section className="relative overflow-hidden w-full bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c] py-5 border-b border-[#2c2c2c] dark:border-white select-none z-20">
      <style>{`
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-custom {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-loop 35s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="w-full overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-custom text-xs md:text-sm font-black tracking-[0.3em] uppercase">
          {marqueeText}   •   {marqueeText}
        </div>
      </div>
    </section>
  );
}
