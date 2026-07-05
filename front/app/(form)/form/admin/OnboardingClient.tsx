"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLOR_RANGERS, ColorRangerSlug } from "@/lib/constants";
import { submitAdminOnboardingAction, getTakenColorsAction } from "@/lib/actions/admin-actions";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";
import { CheckCircle2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface OnboardingClientProps {
  initialTakenColors: { color: string; fullName: string }[];
}

export default function OnboardingClient({ initialTakenColors }: OnboardingClientProps) {
  const router = useRouter();
  const [takenColors, setTakenColors] = useState(initialTakenColors);

  useEffect(() => {
    const supabase = createClient();

    const fetchLatestTakenColors = async () => {
      const res = await getTakenColorsAction();
      if (res.success && res.data) {
        setTakenColors(res.data);
      }
    };

    // Listen to real-time database updates on the admin_roles table
    const channel = supabase
      .channel("admin-roles-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_roles",
        },
        () => {
          fetchLatestTakenColors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Form State
  const [fullName, setFullName] = useState("");
  const [stageName, setStageName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [occupation, setOccupation] = useState("content_creator");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorRangerSlug | "">("");

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/\D/g, "");

    // Pastikan diawali dengan 0
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '0' + cleaned;
    }

    // Batasi maks 13 digit angka
    cleaned = cleaned.slice(0, 13);

    // Sisipkan dash (-) setiap 4 digit
    const parts = [];
    if (cleaned.length > 0) {
      parts.push(cleaned.slice(0, 4));
    }
    if (cleaned.length > 4) {
      parts.push(cleaned.slice(4, 8));
    }
    if (cleaned.length > 8) {
      parts.push(cleaned.slice(8, 13));
    }

    setWhatsappNumber(parts.join("-"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor) {
      setErrorMsg("Silakan pilih identitas warna Color Rangers Anda!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await submitAdminOnboardingAction({
        fullName,
        stageName,
        email,
        whatsappNumber,
        occupation,
        instagramUsername: instagramUsername || undefined,
        tiktokUsername: tiktokUsername || undefined,
        username,
        color: selectedColor
      });

      if (!res.success) {
        setErrorMsg(res.error || "Terjadi kesalahan saat pendaftaran.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-black selection:text-white bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
        <div
          data-lenis-prevent
          className="max-w-2xl w-full p-8 md:p-12 bg-[#121212] border border-zinc-800 text-white relative animate-fade-in"
        >
          {/* Logo at top-right corner */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
            <Logo size="sm" isLink={true} className="text-white" />
          </div>

          <div className="w-full space-y-6 py-6">
            <div className="flex items-center gap-2 text-green-400 font-mono text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Registration Success</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-3 text-white">
              UYEAH
            </h2>
            <p className="text-xs text-zinc-400 font-sans tracking-wide leading-relaxed max-w-md">
              Yuhuu, Wilujeung Sumping <span className="text-white">{selectedColor ? COLOR_RANGERS[selectedColor].label : ""}</span>! <br /> Bentar yak, tunggu admin super acc punya lu, atau kalo gak bilang aja di <strong className="text-white">Grup Founder Rangers</strong> kalo lu udah daftar.
            </p>

            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-3 bg-white text-black hover:bg-[#bc151b] hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                &larr; Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-black selection:text-white bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
      <div
        data-lenis-prevent
        className="max-w-4xl w-full p-8 md:p-12 bg-[#121212] border border-zinc-800 text-white relative"
      >
        {/* Logo at top-right corner */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <Logo size="sm" isLink={true} className="text-white" />
        </div>

        {/* Branding & Form Area */}
        <div className="w-full">
          <h2 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-tight mb-3 text-white">
            Halo, <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-300 uppercase">
              Para Rangers
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans tracking-wide leading-relaxed mb-8 max-w-xs">
            #OneStageOneProgress
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-red-400 font-mono flex items-start gap-2 rounded-none animate-fade-in">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  ERROR_DETECTED
                </span>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  NAMA LENGKAP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  NAMA PANGGUNG *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Budi Kreator"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="budiganteng"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                />
              </div>


            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  NO. WHATSAPP *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812-3456-7890"
                  value={whatsappNumber}
                  onChange={handleWhatsappChange}
                  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  PROFESI UTAMA *
                </label>
                <div>
                  <Select value={occupation} onValueChange={setOccupation}>
                    <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-700 py-1.5 px-0 h-auto text-sm rounded-none focus:outline-none focus:ring-0 focus:border-white transition-colors text-white appearance-none cursor-pointer flex items-center justify-between shadow-none">
                      <SelectValue placeholder="Pilih Profesi Utama" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border border-zinc-800 text-white rounded-none p-1">
                      <SelectItem value="content_creator" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Content Creator</SelectItem>
                      <SelectItem value="student" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Mahasiswa / Pelajar</SelectItem>
                      <SelectItem value="employee" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Karyawan / Karyawati</SelectItem>
                      <SelectItem value="founder" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Pengusaha / Founder</SelectItem>
                      <SelectItem value="influencer" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Influencer</SelectItem>
                      <SelectItem value="other" className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  INSTAGRAM USERNAME (OPSIONAL)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1.5 text-xs text-zinc-400">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-700 py-1.5 pl-4 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1">
                  TIKTOK USERNAME (OPSIONAL)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1.5 text-xs text-zinc-400">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-700 py-1.5 pl-4 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Color Rangers Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase block">
                  PILIH IDENTITAS WARNA (COLOR RANGERS) *
                </label>
                <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-wider">EKSKLUSIF</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(COLOR_RANGERS).map(([slug, colorObj]) => {
                  const isTakenObj = takenColors.find(t => t.color === slug);
                  const isTaken = !!isTakenObj;
                  const isSelected = selectedColor === slug;

                  return (
                    <button
                      key={slug}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedColor(slug as ColorRangerSlug)}
                      className={`relative flex items-center space-x-2 px-3 py-2 border text-[11px] uppercase font-mono tracking-wider transition-all outline-none rounded-none cursor-pointer ${isTaken
                        ? "bg-zinc-900/50 border-zinc-800 text-zinc-750 cursor-not-allowed opacity-50"
                        : isSelected
                          ? "bg-white text-black border-white font-bold"
                          : "bg-transparent border-zinc-700 text-zinc-500 hover:border-white hover:text-white"
                        }`}
                      title={isTaken ? `Sudah digunakan oleh ${isTakenObj.fullName}` : colorObj.label}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                      <span className="truncate">{colorObj.label}</span>
                      {isTaken && (
                        <span className="absolute top-0.5 right-0.5 text-[6px] text-[#bc151b] font-bold bg-[#bc151b]/10 px-0.5">
                          TAKEN
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto self-end px-12 py-4 bg-white text-black hover:bg-[#bc151b] hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>Join Rangers  &rarr;</>
                )}
              </button>

              <p className="text-[11px] text-zinc-500 font-sans text-right">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-white font-bold hover:text-[#bc151b] underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
