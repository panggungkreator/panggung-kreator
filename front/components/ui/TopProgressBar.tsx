"use client";

import React from "react";
import NextTopLoader from "nextjs-toploader";

export default function TopProgressBar() {
  return (
    <NextTopLoader
      color="var(--text-primary, #111111)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px rgba(0,0,0,0.25),0 0 5px rgba(0,0,0,0.15)"
      zIndex={99999}
      showAtBottom={false}
    />
  );
}
