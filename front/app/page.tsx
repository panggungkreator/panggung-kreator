"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Apakah cocok untuk pemula?",
      a: "Sangat cocok. Materi dibuat step by step bahkan untuk yang masih takut bicara."
    },
    {
      q: "Apakah harus sudah jago public speaking?",
      a: "Tidak. Justru tempat ini dibuat untuk belajar dan berkembang bersama."
    },
    {
      q: "Apakah hanya untuk mahasiswa?",
      a: "Tidak. Cocok untuk mahasiswa, pekerja muda, freelancer, content creator, dan siapa pun yang ingin berkembang lewat komunikasi."
    },
    {
      q: "Apakah ada praktik langsung?",
      a: "Ada. Karena komunikasi gak cukup dipelajari, tapi harus dilatih secara konsisten."
    },
    {
      q: "Apakah akan belajar personal branding juga?",
      a: "Yes. Karena hari ini kemampuan komunikasi + personal branding adalah kombinasi penting untuk membangun karir."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-white font-sans transition-colors duration-300 selection:bg-[#bc151b] selection:text-white overflow-x-hidden">
      {/* 1. Header/Navbar */}
      <Header isFixed={true} />

      {/* 2. Hero Section */}
      <section className="relative pt-36 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow Flare Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#bc151b]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#bc151b]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full bg-[#bc151b]/10 dark:bg-[#bc151b]/15 border border-[#bc151b]/20 dark:border-[#bc151b]/30 text-[#bc151b] text-xs md:text-sm font-semibold tracking-wider uppercase mb-6 animate-pulse">
            Bukan Sekadar Belajar Ngomong.
          </span>

          <h1 className="text-4xl md:text-7xl font-title font-bold tracking-tight text-zinc-900 dark:text-white uppercase leading-tight max-w-3xl mb-8">
            Tapi Belajar Gimana <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-[#bc151b]/70 to-[#bc151b] dark:from-white dark:via-red-200 dark:to-[#bc151b] underline decoration-[#bc151b] decoration-4">
              Cara Lo Didengar.
            </span>
          </h1>

          <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-2xl space-y-4 mb-10 text-center leading-relaxed">
            <p>Banyak orang punya potensi. Punya cerita. Punya skill. Punya mimpi besar.</p>
            <p>Tapi sayangnya… <span className="text-zinc-900 dark:text-white font-semibold">mereka gak pernah punya panggung.</span></p>
            <p>Ada yang takut bicara. Ada yang bingung mulai dari mana. Ada yang sebenarnya hebat… tapi gak pernah percaya diri buat tampil.</p>
            <p className="text-zinc-700 dark:text-zinc-300">Dan akhirnya? Potensi mereka cuma jadi <span className="italic">“niat”</span>.</p>
          </div>

          {/* Solution Highlight Box */}
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xs text-left mb-10 shadow-lg dark:shadow-xl transition-colors duration-300">
            <h3 className="font-title font-bold text-lg md:text-xl text-zinc-900 dark:text-white mb-4 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10 pb-2">
              Panggung Kreator Akademi hadir buat bantu lo:
            </h3>
            <ul className="space-y-3.5 text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
              {[
                "Berani bicara di depan orang",
                "Bangun personal branding yang kuat",
                "Punya panggung pertama lo sendiri",
                "Menciptakan panggung untuk karir impian lo sebagai performer, host, speaker, content creator, atau professional yang impactful."
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#bc151b] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-medium tracking-wide uppercase max-w-md border-t border-zinc-200 dark:border-white/10 pt-6 mb-8">
            Karena hari ini… Kesempatan sering datang bukan ke yang paling pintar. <br />
            <span className="text-zinc-900 dark:text-white font-bold">Tapi ke mereka yang berani tampil.</span>
          </p>

          <Link href="/checkout" className="px-10 py-5 text-lg font-bold text-white uppercase tracking-wider bg-[#bc151b] rounded-xl hover:bg-[#bc151b]/90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(188,21,27,0.4)]">
            DAFTAR SEKARANG
          </Link>
        </div>
      </section>

      {/* 3. Welcome Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/80 border-y border-zinc-200 dark:border-white/5 relative transition-colors duration-300">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#bc151b]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wide mb-4 text-zinc-900 dark:text-white">
              Welcome to <span className="text-[#bc151b]">Panggung Kreator Akademi</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
              Tempat dimana orang biasa belajar jadi versi terbaik dirinya lewat komunikasi.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-8 backdrop-blur-xs shadow-md dark:shadow-none transition-colors duration-300">
            <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base mb-6 text-center italic">
              Di sini lo gak cuma belajar teori public speaking. Lo akan belajar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
              {[
                "Cara ngomong tanpa blank",
                "Cara bikin orang tertarik dengerin lo",
                "Cara membangun rasa percaya diri",
                "Cara menyampaikan cerita yang relate",
                "Cara membangun personal branding yang autentik",
                "Cara menciptakan peluang lewat komunikasi"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-zinc-50 dark:bg-[#0a0a0a]/50 p-4 rounded-xl border border-zinc-200/60 dark:border-white/5 transition-colors duration-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#bc151b]" />
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-semibold uppercase tracking-wider border-t border-zinc-200 dark:border-white/5 pt-6">
              Karena di dunia sekarang… orang yang bisa menyampaikan value dirinya dengan baik, <span className="text-zinc-900 dark:text-white">akan punya peluang lebih besar.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why Struggle Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#bc151b]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
              Kenapa Banyak Orang <span className="text-[#bc151b] underline decoration-wavy decoration-2">Sulit Bertumbuh?</span>
            </h2>
            <p className="text-zinc-500 text-sm uppercase tracking-widest font-semibold">
              Apakah ini hambatan yang sering lo hadapi sehari-hari?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { title: "Takut Dinilai", desc: "Takut salah bicara dan selalu memikirkan kritik orang lain sebelum tampil." },
              { title: "Overthinking Saat Bicara", desc: "Terlalu memikirkan kata demi kata hingga akhirnya nge-blank di panggung." },
              { title: "Ngerasa Gak Cukup Bagus", desc: "Merasa minder dengan orang lain dan kurang mengapresiasi keunikan diri." },
              { title: "Bingung Mulai Personal Branding", desc: "Gak tahu harus mulai dari mana dan bagaimana menampilkan citra diri." },
              { title: "Punya Skill Tapi Gak Bisa Menjual", desc: "Hebat dalam teknis tapi kesulitan mempresentasikan nilai diri ke klien atau atasan." },
              { title: "Gak Punya Lingkungan Support", desc: "Berada di lingkungan toxic yang menjatuhkan ketika lo mencoba hal baru." }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl hover:border-[#bc151b]/40 hover:bg-[#bc151b]/5 dark:hover:bg-[#bc151b]/5 transition-all group shadow-xs dark:shadow-none">
                <div className="w-10 h-10 rounded-lg bg-[#bc151b]/10 flex items-center justify-center mb-4 group-hover:bg-[#bc151b]/20 transition-all">
                  <span className="text-[#bc151b] font-bold font-title">0{index + 1}</span>
                </div>
                <h3 className="font-title font-bold text-lg text-zinc-900 dark:text-white mb-2 uppercase group-hover:text-[#bc151b] transition-all">
                  {item.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center max-w-xl mx-auto bg-gradient-to-r from-zinc-100 via-[#bc151b]/5 to-zinc-100 dark:from-zinc-950 dark:via-[#bc151b]/10 dark:to-zinc-950 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl shadow-md dark:shadow-lg transition-colors duration-300">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider mb-2 font-medium">Padahal…</p>
            <h4 className="text-2xl md:text-3xl font-title font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
              Public Speaking Bukan Bakat.
            </h4>
            <p className="text-lg md:text-xl font-bold text-[#bc151b] uppercase">
              Public Speaking adalah Skill. <span className="text-zinc-600 dark:text-zinc-400 font-normal text-sm lowercase block mt-1">Dan skill bisa dilatih.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 5. What You Will Learn Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-white/5 relative transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#bc151b] text-xs font-bold uppercase tracking-widest block mb-3">
              Kurikulum Utama PKA
            </span>
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Apa yang Akan <span className="text-[#bc151b]">Lo Pelajari?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-zinc-900/55 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-[#bc151b]/35 transition-all shadow-md dark:shadow-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#bc151b]/10 border border-[#bc151b]/20 rounded-xl flex items-center justify-center text-xl text-[#bc151b] font-bold font-title">
                  1
                </div>
                <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase">
                  Confident Speaking
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-medium mb-6">
                Belajar ngomong lebih tenang, jelas, dan gak gampang blank.
              </p>
              <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Materi Pembelajaran:</p>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  {["Mengatasi Grogi", "Latihan Intonasi", "Latihan Artikulasi", "Teknik Tampil Pede"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc151b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-zinc-900/55 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-[#bc151b]/35 transition-all shadow-md dark:shadow-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#bc151b]/10 border border-[#bc151b]/20 rounded-xl flex items-center justify-center text-xl text-[#bc151b] font-bold font-title">
                  2
                </div>
                <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase">
                  Storytelling & Personal Branding
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-medium mb-6">
                Karena orang gak connect sama pencapaian lo. Orang connect sama cerita lo.
              </p>
              <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Materi Pembelajaran:</p>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  {["Cerita yang Relate", "Pengalaman Hidup", "Image Personal Kuat", "Tampil Autentik"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc151b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-zinc-900/55 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-[#bc151b]/35 transition-all shadow-md dark:shadow-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#bc151b]/10 border border-[#bc151b]/20 rounded-xl flex items-center justify-center text-xl text-[#bc151b] font-bold font-title">
                  3
                </div>
                <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase">
                  Performance & Stage Presence
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-medium mb-6">
                Belajar gimana caranya tampil lebih hidup dan punya “aura panggung”.
              </p>
              <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Sangat Cocok Untuk:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {["MC / Host Live", "Content Creator", "Speaker", "Performer", "Freelancer", "Mahasiswa", "Profesional Muda"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#bc151b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-zinc-900/55 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-[#bc151b]/35 transition-all shadow-md dark:shadow-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#bc151b]/10 border border-[#bc151b]/20 rounded-xl flex items-center justify-center text-xl text-[#bc151b] font-bold font-title">
                  4
                </div>
                <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase">
                  Communication for Career
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-medium mb-6">
                Karena komunikasi bisa membuka peluang karir impian lo.
              </p>
              <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Materi Pembelajaran:</p>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  {["Presentasi Impactful", "Pitching Ide Bisnis", "Networking Bisnis", "Menjual Value Diri"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc151b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Who is it for Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#bc151b]/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="max-w-4xl mx-auto z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
              Siapa yang <span className="text-[#bc151b]">Cocok Gabung?</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Panggung Kreator Akademi dirancang khusus untuk memfasilitasi kebutuhan pertumbuhan komunikasi lo.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 backdrop-blur-xs shadow-lg dark:shadow-xl transition-colors duration-300">
            <h3 className="font-title font-bold text-lg md:text-xl text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-center border-b border-zinc-200 dark:border-white/10 pb-3">
              Panggung Kreator Akademi cocok buat lo yang:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
              {[
                "Sering takut bicara depan umum",
                "Mau mulai bangun personal branding",
                "Mau lebih percaya diri",
                "Punya mimpi jadi content creator / speaker / performer",
                "Mau lebih jago presentasi",
                "Mau membangun relasi & peluang karir",
                "Ingin bertumbuh bareng lingkungan positif"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-zinc-50 dark:bg-[#0a0a0a]/30 p-4 rounded-xl border border-zinc-200 dark:border-white/5 hover:border-[#bc151b]/35 transition-all">
                  <div className="w-6 h-6 rounded-full bg-[#bc151b]/15 border border-[#bc151b]/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#bc151b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Not Just a Class Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-white/5 relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider mb-3 block">
            This Is More Than A Course
          </span>
          <h2 className="text-3xl md:text-6xl font-title font-bold uppercase tracking-tight text-zinc-900 dark:text-white mb-6">
            Ini Bukan Sekadar Kelas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc151b] to-red-400">
              Ini Tempat Lo Bertumbuh.
            </span>
          </h2>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed space-y-4 max-w-2xl mx-auto mb-12">
            <p>Di Panggung Kreator Akademi, lo akan ketemu banyak orang yang juga sedang berproses.</p>
            <p>Karena kadang… <span className="text-zinc-950 dark:text-white font-semibold">yang bikin kita berkembang bukan cuma materi. Tapi lingkungan.</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Support Proses Lo", desc: "Mendukung setiap langkah kecil perkembangan komunikasimu." },
              { title: "Gak Nge-Judge", desc: "Bebas dari penghakiman atau rasa malu saat kamu masih belajar." },
              { title: "Kasih Ruang Berkembang", desc: "Memberi panggung penuh untuk mencoba, gagal, dan mencoba lagi." },
              { title: "Bikin Berani Tampil", desc: "Mendorong batas kepercayaan dirimu hingga siap bersinar." }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-zinc-900/35 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center shadow-xs dark:shadow-none">
                <div className="w-12 h-12 rounded-full bg-[#bc151b]/10 border border-[#bc151b]/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#bc151b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="font-title font-bold text-base uppercase text-zinc-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 6-Month Vision Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
        <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-[#bc151b]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wide mb-6 text-zinc-900 dark:text-white">
            Bayangin Kalau <span className="text-[#bc151b]">6 Bulan Dari Sekarang…</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base mb-10 max-w-xl mx-auto">
            Sebuah perubahan nyata yang akan lo rasakan setelah konsisten melatih kemampuan komunikasimu:
          </p>

          <div className="max-w-xl mx-auto text-left space-y-4 mb-12">
            {[
              "Lebih pede ngomong di depan umum",
              "Lebih jelas menyampaikan isi kepala",
              "Mulai dikenal karena value lo",
              "Punya personal branding yang kuat",
              "Berani tampil depan publik tanpa ragu",
              "Punya circle yang suportif dan bertumbuh",
              "Mulai membuka peluang karir dari skill komunikasi"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-white/5 hover:border-[#bc151b]/30 transition-all shadow-xs">
                <span className="text-[#bc151b] font-title font-bold text-sm">✓</span>
                <span className="text-zinc-700 dark:text-zinc-200 text-sm md:text-base font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="inline-block py-4 px-8 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl mb-8 transition-colors duration-300">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Dan semua itu… dimulai dari satu keputusan kecil: <span className="text-zinc-900 dark:text-white font-bold uppercase tracking-wide text-base ml-1">Berani mulai.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 9. Facilities & Bonuses Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-white/5 relative transition-colors duration-300">
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#bc151b]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
              Fasilitas & <span className="text-[#bc151b]">Bonus Member</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Ekosistem belajar super lengkap untuk menunjang penuh perjalanan karir dan rasa percaya diri lo.
            </p>
          </div>

          {/* Grid Layout: Left Facilities, Right Bonuses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Facilities column */}
            <div>
              <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-2.5 h-6 bg-[#bc151b] rounded-full" />
                Fasilitas yang Akan Lo Dapatkan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Live Class & Mentoring",
                  "Komunitas Supportive",
                  "Materi Public Speaking",
                  "Materi Personal Branding",
                  "Latihan Performance",
                  "Networking Circle",
                  "Challenge & Praktik",
                  "Ruang Tampil & Open Mic",
                  "Feedback & Evaluasi",
                  "Akses Rekaman Pembelajaran"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-zinc-200 dark:border-white/5 shadow-xs dark:shadow-none">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonuses column */}
            <div>
              <h3 className="font-title font-bold text-xl md:text-2xl text-[#bc151b] uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-2.5 h-6 bg-zinc-900 dark:bg-white rounded-full transition-colors duration-300" />
                Bonus Khusus Member
              </h3>
              <div className="space-y-3">
                {[
                  { title: "E-Book Public Speaking", badge: "Premium Guide" },
                  { title: "Template Personal Branding", badge: "Workbook" },
                  { title: "Framework Storytelling", badge: "Quick Script" },
                  { title: "Circle Networking", badge: "Exclusive Access" },
                  { title: "Kesempatan Tampil di Event Panggung Kreator", badge: "Real Stage Opportunity" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-[#bc151b]/20 hover:border-[#bc151b]/50 transition-all shadow-xs dark:shadow-none">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎁</span>
                      <span className="text-zinc-900 dark:text-white text-sm md:text-base font-bold uppercase tracking-wide">{item.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#bc151b] bg-[#bc151b]/10 border border-[#bc151b]/25 px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Testimonials / Social Proof Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider block mb-3">
              Social Proof & Alumni Voice
            </span>
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Mereka Juga Pernah Ada <br className="sm:hidden" />
              Di <span className="text-[#bc151b]">Posisi Lo Sekarang.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Dulu gue takut ngomong depan orang. Sekarang jadi lebih pede presentasi di kampus.",
              "Awalnya cuma pengen belajar ngomong, ternyata jadi lebih ngerti personal branding.",
              "Yang paling berharga bukan cuma ilmunya, tapi lingkungannya.",
              "Gue jadi lebih berani tampil dan mulai bikin konten sendiri."
            ].map((quote, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900/35 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-[#bc151b]/35 transition-all shadow-xs dark:shadow-none">
                <div className="mb-6">
                  <span className="text-4xl text-[#bc151b] font-serif leading-none block mb-2">“</span>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base italic leading-relaxed">
                    {quote}
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-zinc-200 dark:border-white/5 pt-4">
                  <div className="w-9 h-9 rounded-full bg-[#bc151b]/20 flex items-center justify-center text-xs font-bold font-title text-white">
                    M
                  </div>
                  <div>
                    <p className="text-zinc-900 dark:text-white text-xs font-bold">Member PKA</p>
                    <p className="text-zinc-500 text-[10px]">Verified Alumni</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Closing Section */}
      <section className="py-28 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 relative overflow-hidden text-center transition-colors duration-300">
        {/* Abstract Backdrop Flare */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bc151b]/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-6xl font-title font-bold uppercase tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Dunia gak selalu butuh orang paling sempurna. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#bc151b]">
              Tapi dunia butuh orang yang berani tampil.
            </span>
          </h2>

          <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed space-y-4 max-w-2xl mx-auto mb-10">
            <p>Kalau lo terus nunggu pede dulu… <span className="text-zinc-900 dark:text-white font-semibold">mungkin lo gak akan pernah mulai.</span></p>
            <p>Tapi kalau lo mulai sekarang, siapa tau ini jadi awal perjalanan besar lo.</p>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">Karena semua performer hebat… pernah punya panggung pertama.</p>
            <p className="text-[#bc151b] font-bold uppercase tracking-wide text-lg">Dan mungkin, hari ini adalah awal panggung lo.</p>
          </div>

          <Link href="/checkout" className="px-12 py-5 text-xl font-bold text-white uppercase tracking-wider bg-[#bc151b] rounded-xl hover:bg-[#bc151b]/90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(188,21,27,0.4)]">
            DAFTAR SEKARANG
          </Link>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider block mb-3">
              FAQ (Frequently Asked Questions)
            </span>
            <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Pertanyaan yang <span className="text-[#bc151b]">Sering Diajukan</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-zinc-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-900/40 overflow-hidden transition-all shadow-xs dark:shadow-none">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 text-left font-semibold text-sm md:text-base flex justify-between items-center hover:bg-[#bc151b]/5 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="text-zinc-800 dark:text-white font-title tracking-wide uppercase">{faq.q}</span>
                  <svg className={`w-5 h-5 text-[#bc151b] transform transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === i && (
                  <div className="px-6 py-5 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-black/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Final Tagline & Footer */}
      <section className="py-20 px-6 md:px-12 bg-zinc-100 dark:bg-black border-t border-zinc-200 dark:border-white/5 text-center relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="w-auto h-auto rounded-xl flex items-center justify-center font-title font-bold text-white text-lg mx-auto mb-6">
            <img src="/logo-light.png" alt="Panggung Kreator Akademi Logo" className="w-36 h-full object-cover block dark:hidden" />
            <img src="/logo-dark.png" alt="Panggung Kreator Akademi Logo" className="w-full h-full object-cover hidden dark:block" />
          </div>
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase text-zinc-900 dark:text-white tracking-widest mb-4">
            Panggung Kreator Akademi
          </h2>
          <h3 className="text-lg md:text-xl font-medium text-zinc-600 dark:text-[#bc151b] uppercase tracking-wide max-w-2xl mx-auto mb-12">
            Bicara Bukan Sekadar Skill. <br className="sm:hidden" />
            Tapi Jalan Untuk Membuka Banyak Panggung Dalam Hidup Lo.
          </h3>

          <div className="flex flex-col md:flex-row justify-between items-center border-t border-zinc-200 dark:border-white/5 pt-8 text-xs text-zinc-500 transition-colors">
            <p>© 2026 Panggung Kreator Akademi. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 font-medium">
              <a href="#" className="text-zinc-500 hover:text-[#bc151b] dark:text-zinc-400 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-zinc-500 hover:text-[#bc151b] dark:text-zinc-400 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-zinc-500 hover:text-[#bc151b] dark:text-zinc-400 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
