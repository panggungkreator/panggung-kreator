import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | Panggung Kreator",
  description: "Syarat dan ketentuan penggunaan platform Panggung Kreator.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#121212] text-[#0A0A0A] dark:text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <Logo size="sm" isLink={true} />
          <Link
            href="/login"
            className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            [ SYARAT & KETENTUAN ]
          </span>
          <h1 className="text-3xl font-serif italic text-neutral-900 dark:text-white">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Terakhir diperbarui: 2 September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-6 text-zinc-700 dark:text-zinc-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              1. Ketentuan Akun
            </h2>
            <p>
              Dengan mendaftar akun di Panggung Kreator, Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi dan keamanan akun Anda.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              2. Kode Etik Komunitas
            </h2>
            <p>
              Setiap anggota diharapkan saling menghormati, menjaga etika berkarya, dan tidak melakukan aktivitas yang merugikan sesama kreator maupun platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              3. Hak Cipta & Kepemilikan Karya
            </h2>
            <p>
              Seluruh karya dan portofolio yang diunggah oleh kreator tetap merupakan hak cipta dan milik kreator yang bersangkutan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
