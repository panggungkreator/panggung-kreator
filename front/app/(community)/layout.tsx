import React from "react";
import Header from "@/components/community/Header";
import Footer from "@/components/community/Footer";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-[#2c2c2c] dark:bg-[#2c2c2c] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-sans selection:bg-[#2c2c2c] selection:text-white dark:selection:bg-white dark:selection:text-[#2c2c2c]">
      {/* Kustom Header Web Komunitas */}
      <Header />

      {/* Konten Halaman */}
      <main className="flex-grow pt-[80px]">
        {children}
      </main>

      {/* Kustom Footer Web Komunitas */}
      <Footer />
    </div>
  );
}
