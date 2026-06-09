"use client";

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLink?: boolean;
}

export default function Logo({ className = '', size = 'md', isLink = true }: LogoProps) {
  // Tentukan dimensi berdasarkan parameter size
  let imgSizeClass = 'w-28 h-auto';
  let textClass = 'text-base';

  if (size === 'sm') {
    imgSizeClass = 'w-24 h-auto';
    textClass = 'text-sm sm:text-base';
  } else if (size === 'lg') {
    imgSizeClass = 'w-20 h-auto';
    textClass = 'text-lg';
  }

  const content = (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className={`${imgSizeClass} rounded-md flex items-center justify-center font-title font-bold text-base overflow-hidden`}>
        {/* Render logo hitam untuk light mode, logo putih untuk dark mode */}
        <img src="/logo-light.png" alt="Panggung Kreator Akademi Logo" className="w-full h-full object-cover block dark:hidden" />
        <img src="/logo-dark.png" alt="Panggung Kreator Akademi Logo" className="w-full h-full object-cover hidden dark:block" />
      </div>
      {/* <span className={`font-title font-bold ${textClass} tracking-wider uppercase hidden sm:inline-block transition-colors duration-300`}>
        Panggung Kreator Akademi
      </span> */}
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
