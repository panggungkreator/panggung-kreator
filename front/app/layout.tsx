import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panggung Kreator",
  description: "Platform Teman Sepanggung",
  icons: {
    icon: "/logo-dark.png",
  },
};

import SmoothScroll from "@/components/ui/SmoothScroll";
import PageTransitionLoader from "@/components/ui/PageTransitionLoader";
import ThemeScript from "@/components/ui/ThemeScript";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <PageTransitionLoader />
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
