"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f3f8] dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 selection:bg-[#1a1a2e] dark:selection:bg-zinc-800 selection:text-white">
      {/* Sidebar Navigation */}
      <aside
        className={`${isExpanded ? 'w-64' : 'w-24'} flex-shrink-0 flex flex-col py-8 px-4 transition-all duration-300 relative z-0`}
      >

        {/* Navigation Middle Pill Container */}
        <div className="flex-1 flex flex-col justify-center mb-12">
          <nav className="bg-white dark:bg-zinc-900 rounded-[2rem] py-4 shadow-sm dark:shadow-none border border-zinc-100 dark:border-white/5 flex flex-col gap-2 w-full overflow-hidden items-center">
            {/* Dashboard Nav Item */}
            <Link
              href="/admin"
              className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${pathname === '/admin' || pathname === '/admin/'
                ? 'bg-[#1a1a2e] text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                } ${isExpanded
                  ? 'px-4 py-3 mx-2 w-[calc(100%-16px)] justify-start'
                  : 'w-12 h-12 justify-center'
                }`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3l8 6v12h-5v-7H9v7H4V9l8-6z" />
                </svg>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'ml-3 opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                Dashboard
              </span>
            </Link>

            {/* Voucher Nav Item */}
            <Link
              href="/admin/vouchers"
              className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${pathname.includes('/vouchers')
                ? 'bg-[#1a1a2e] text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                } ${isExpanded
                  ? 'px-4 py-3 mx-2 w-[calc(100%-16px)] justify-start'
                  : 'w-12 h-12 justify-center'
                }`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'ml-3 opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                Data Voucher
              </span>
            </Link>

            {/* Packages Nav Item */}
            <Link
              href="/admin/packages"
              className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${pathname.includes('/packages')
                ? 'bg-[#1a1a2e] text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                } ${isExpanded
                  ? 'px-4 py-3 mx-2 w-[calc(100%-16px)] justify-start'
                  : 'w-12 h-12 justify-center'
                }`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'ml-3 opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                Data Paket
              </span>
            </Link>

          </nav>
        </div>

      </aside>

      <main className="flex-1 w-full h-full bg-white dark:bg-zinc-950 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-y-auto relative z-10 dark:border-white/5">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
