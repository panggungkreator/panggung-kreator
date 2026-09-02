import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | Panggung Kreator",
  description: "Kebijakan privasi dan perlindungan data pengguna Panggung Kreator.",
};

export default function PrivacyPage() {
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
            [ KEBIJAKAN PRIVASI ]
          </span>
          <h1 className="text-3xl font-serif italic text-neutral-900 dark:text-white">
            Kebijakan Privasi Panggung Kreator
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Terakhir diperbarui: 2 September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-6 text-zinc-700 dark:text-zinc-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              1. Pengumpulan Data
            </h2>
            <p>
              Panggung Kreator menghormati privasi Anda. Kami hanya mengumpulkan informasi yang diperlukan untuk menyediakan layanan komunitas, keanggotaan akademi, dan autentikasi akun secara aman.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              2. Penggunaan Informasi
            </h2>
            <p>
              Informasi seperti alamat email, nama pengguna, dan portofolio digunakan secara eksklusif untuk memverifikasi identitas, memproses keanggotaan, dan mengirimkan notifikasi keamanan terkait akun Anda.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">
              3. Keamanan Data
            </h2>
            <p>
              Kami menerapkan standar keamanan industri dan enkripsi data untuk memastikan kredensial serta data pribadi Anda terlindungi dari akses tanpa izin.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
