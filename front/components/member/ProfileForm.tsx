"use client";

import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import { MemberProfile, PrimaryInterest } from "@/lib/types/member";
import { createClient } from "@/lib/supabase/client";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // sonner is used for toasts
import { Award, Briefcase, Camera, Check, Globe, Link as LinkIcon, Lock, Sparkles, User, Video } from "lucide-react";

interface ProfileFormProps {
  member: MemberProfile;
  onSave: () => void;
}

const INTEREST_OPTIONS = [
  { value: 'public_speaking', label: '🎤 Public Speaking', desc: 'Bicara didepan umum', color: '#10B981' },
  { value: 'mc_host', label: '🎙️ MC / Host', desc: 'Memandu acara', color: '#3B82F6' },
  { value: 'voice_over', label: '🔊 Voice Over', desc: 'Pengisi suara', color: '#EF4444' },
  { value: 'content_creator', label: '🎬 Content Creator', desc: 'Pembuat konten', color: '#EC4899' },
  { value: 'personal_branding', label: '✨ Personal Brand', desc: 'Branding diri', color: '#F59E0B' },
  { value: 'live_host', label: '📱 Live Host', desc: 'Host streaming', color: '#8B5CF6' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Pemula', desc: 'Baru mulai belajar & mencari tahu' },
  { value: 'intermediate', label: 'Menengah', desc: 'Sudah punya pengalaman / pernah praktik' },
  { value: 'advanced', label: 'Lanjutan', desc: 'Sudah aktif bekerja secara profesional' },
];

const OCCUPATION_OPTIONS = [
  { value: "content_creator", label: "Content Creator" },
  { value: "student", label: "Mahasiswa / Pelajar" },
  { value: "employee", label: "Karyawan / Karyawati" },
  { value: "founder", label: "Pengusaha / Founder" },
  { value: "influencer", label: "Influencer" },
  { value: "other", label: "Lainnya" },
];

export default function ProfileForm({ member, onSave }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<"bio" | "social" | "goals">("bio");
  const [isLoading, setIsLoading] = useState(false);

  // --- FORM STATES ---
  // Section A: Bio & Data Diri
  const [fullName, setFullName] = useState(member.full_name || "");
  const [stageName, setStageName] = useState(member.stage_name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(member.whatsapp_number || "");
  const [city, setCity] = useState(member.city || "");
  const [occupation, setOccupation] = useState(member.occupation || "other");
  const [description, setDescription] = useState(member.description || "");
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  // Section B: Sosial Media & Tautan
  const [instagramUsername, setInstagramUsername] = useState(member.instagram_username || "");
  const [tiktokUsername, setTiktokUsername] = useState(member.tiktok_username || "");
  const [youtubeUrl, setYoutubeUrl] = useState(member.youtube_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(member.portfolio_url || "");

  // Section C: Minat & Goals Lanjutan
  const [selectedInterests, setSelectedInterests] = useState<string[]>(member.interests?.primary_interests || []);
  const [experienceLevel, setExperienceLevel] = useState<string>(member.interests?.experience_level || "beginner");
  const [goals, setGoals] = useState<string[]>(member.interests?.goals || []);
  const [contentTopics, setContentTopics] = useState<string[]>(member.interests?.content_topics || []);
  const [availability, setAvailability] = useState<string>(member.interests?.availability || "flexible");
  const [learningPreference, setLearningPreference] = useState<string[]>(member.interests?.learning_preference || []);
  const [subscribedNewsletter, setSubscribedNewsletter] = useState(member.subscribed_newsletter ?? true);

  const toggleInterest = (val: string) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleGoal = (val: string) => {
    setGoals((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleTopic = (val: string) => {
    setContentTopics((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const togglePreference = (val: string) => {
    setLearningPreference((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleaned = e.target.value.replace(/\D/g, "");
    if (cleaned.length > 0 && cleaned[0] !== '0') cleaned = '0' + cleaned;
    cleaned = cleaned.slice(0, 13);
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));
    if (cleaned.length > 8) parts.push(cleaned.slice(8, 13));
    setWhatsappNumber(parts.join("-"));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formatYoutubeUrl = (url: string): string => {
      const trimmed = (url || "").trim();
      if (!trimmed || trimmed === "-") return "-";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (trimmed.startsWith("youtube.com") || trimmed.startsWith("www.youtube.com")) {
        return `https://${trimmed}`;
      }
      if (trimmed.startsWith("@")) {
        return `https://youtube.com/${trimmed}`;
      }
      if (!trimmed.includes(".")) {
        return `https://youtube.com/@${trimmed}`;
      }
      return `https://${trimmed}`;
    };

    const formatLinkedinUrl = (url: string): string => {
      const trimmed = (url || "").trim();
      if (!trimmed || trimmed === "-") return "-";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (trimmed.startsWith("linkedin.com") || trimmed.startsWith("www.linkedin.com")) {
        return `https://${trimmed}`;
      }
      if (trimmed.startsWith("in/")) {
        return `https://linkedin.com/${trimmed}`;
      }
      if (!trimmed.includes(".")) {
        return `https://linkedin.com/in/${trimmed}`;
      }
      return `https://${trimmed}`;
    };

    const formatWebsiteUrl = (url: string): string => {
      const trimmed = (url || "").trim();
      if (!trimmed || trimmed === "-") return "-";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    const cleanYoutube = formatYoutubeUrl(youtubeUrl);
    const cleanLinkedin = formatLinkedinUrl(linkedinUrl);
    const cleanPortfolio = formatWebsiteUrl(portfolioUrl);

    let finalAvatarUrl: string | null = avatarUrl;

    try {
      const supabase = createClient();

      // 1. Upload foto baru jika ada file yang dipilih di penampungan sementara
      if (pendingAvatarFile) {
        // Hapus file avatar lama di Supabase Storage untuk member ini
        try {
          const { data: existingFiles } = await supabase.storage
            .from("member-avatars")
            .list(member.id);

          if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map((f: any) => `${member.id}/${f.name}`);
            await supabase.storage.from("member-avatars").remove(filesToRemove);
          }
        } catch (cleanupErr) {
          console.warn("Cleanup old avatar error:", cleanupErr);
        }

        // Kompresi dan upload avatar baru
        const compressedFile = await compressImageForTarget(pendingAvatarFile, "avatar");
        const fileName = `avatar_${Date.now()}.webp`;
        const path = `${member.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("member-avatars")
          .upload(path, compressedFile, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Gagal mengunggah foto profil: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("member-avatars").getPublicUrl(path);

        finalAvatarUrl = `${publicUrl}?t=${Date.now()}`;
      } else if (isAvatarRemoved) {
        // Jika user menghapus foto profilnya
        try {
          const { data: existingFiles } = await supabase.storage
            .from("member-avatars")
            .list(member.id);

          if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map((f: any) => `${member.id}/${f.name}`);
            await supabase.storage.from("member-avatars").remove(filesToRemove);
          }
        } catch (cleanupErr) {
          console.warn("Cleanup avatar error:", cleanupErr);
        }
        finalAvatarUrl = null;
      }

      const response = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            full_name: fullName,
            stage_name: stageName,
            whatsapp_number: whatsappNumber,
            city,
            occupation,
            description,
            avatar_url: finalAvatarUrl,
            instagram_username: instagramUsername,
            tiktok_username: tiktokUsername,
            youtube_url: cleanYoutube,
            linkedin_url: cleanLinkedin,
            portfolio_url: cleanPortfolio,
            subscribed_newsletter: subscribedNewsletter,
          },
          interests: {
            primary_interests: selectedInterests,
            experience_level: experienceLevel,
            goals,
            content_topics: contentTopics,
            availability,
            learning_preference: learningPreference,
          }
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        let message = "Gagal memperbarui profil.";
        
        if (err.error) {
          if (typeof err.error === "string") {
            message = err.error;
          } else if (typeof err.error === "object") {
            const fieldErrors = err.error.fieldErrors || {};
            const messages = Object.entries(fieldErrors)
              .map(([field, msgs]: [string, any]) => {
                const fieldName = field.replace(/_/g, " ").toUpperCase();
                return `${fieldName}: ${msgs.join(", ")}`;
              });
            
            const formErrors = err.error.formErrors || [];
            if (formErrors.length > 0) {
              messages.push(...formErrors);
            }
            
            if (messages.length > 0) {
              message = messages.join(" | ");
            }
          }
        }
        throw new Error(message);
      }

      // Reset pending file
      setPendingAvatarFile(null);
      setIsAvatarRemoved(false);

      toast.success("Profil Anda berhasil diperbarui!");
      onSave();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-none">
      {/* TABS HEADER */}
      <div className="flex border-b border-zinc-250 dark:border-zinc-800">
        {(["bio", "social", "goals"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[10px] font-mono uppercase tracking-widest border-r last:border-r-0 border-zinc-250 dark:border-zinc-800 transition-all cursor-pointer ${activeTab === tab
              ? "bg-neutral-50 dark:bg-zinc-900/50 font-bold border-b-2 border-black dark:border-white text-black dark:text-white"
              : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
          >
            {tab === "bio" ? "[ 01. BIO & DATA DIRI ]" : tab === "social" ? "[ 02. SOSIAL & PORTFOLIO ]" : "[ 03. MINAT & GOALS ]"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
        {/* TAB 1: BIO & DATA DIRI */}
        {activeTab === "bio" && (
          <div className="space-y-6 animate-fade-in">
            {/* FOTO PROFIL */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <ImageUploader
                memberId={member.id}
                target="avatar"
                mode="deferred"
                initialImageUrl={avatarUrl}
                onUploadSuccess={setAvatarUrl}
                onFileSelect={(file) => {
                  setPendingAvatarFile(file);
                  if (file === null) {
                    setIsAvatarRemoved(true);
                  } else {
                    setIsAvatarRemoved(false);
                  }
                }}
              />
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block">FOTO PROFIL</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block max-w-sm">
                  Kompresi WebP otomatis dilakukan setelah upload (target &lt;200KB). Foto ini akan digunakan di halaman talent showcase.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  NAMA LENGKAP *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  NAMA PANGGUNG *
                </label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  NO. WHATSAPP *
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={handleWhatsappChange}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  KOTA DOMISILI
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  PROFESI UTAMA *
                </label>
                <Select value={occupation} onValueChange={setOccupation}>
                  <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 py-1.5 px-0 h-auto text-sm font-normal rounded-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
                    <SelectValue placeholder="Pilih Profesi" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 dark:text-white rounded-none p-1">
                    {OCCUPATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                BIO / DESKRIPSI SINGKAT
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Ceritakan sedikit tentang karya, pilar, dan kepribadianmu..."
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 p-3 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors h-24 resize-none"
              />
              <span className="text-[9px] font-mono text-zinc-450 float-right mt-1">
                {description.length}/500 KARAKTER
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: SOSIAL & TAUTAN PORTFOLIO */}
        {activeTab === "social" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  USERNAME INSTAGRAM
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1.5 text-xs text-zinc-400">@</span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pl-4 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  USERNAME TIKTOK
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1.5 text-xs text-zinc-400">@</span>
                  <input
                    type="text"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pl-4 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  LINK CHANNEL YOUTUBE
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/c/yourchannel"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  LINK PROFILE LINKEDIN
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                TAUTAN WEBSITE LAIN / PORTFOLIO UTAMA
              </label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://mywebsite.com"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>
        )}

        {/* TAB 3: MINAT & GOALS */}
        {activeTab === "goals" && (
          <div className="space-y-6 animate-fade-in">
            {/* Minat Utama */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                PILIH MINAT UTAMAMU * (Bisa pilih lebih dari 1)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = selectedInterests.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleInterest(item.value)}
                      className={`relative flex items-center space-x-2 px-3 py-2 border text-[11px] uppercase font-mono tracking-wider transition-all outline-none rounded-none cursor-pointer ${isSelected
                        ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-black border-black dark:border-white font-bold"
                        : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tingkat Pengalaman */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                TINGKAT PENGALAMAN *
              </label>
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experienceLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExperienceLevel(opt.value)}
                      className={`flex-1 p-3 border text-left rounded-none transition-all cursor-pointer ${isSelected
                        ? "border-black dark:border-white bg-[#0A0A0A]/5 dark:bg-white/5"
                        : "border-zinc-300 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      <span className="text-xs font-bold block">{opt.label}</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-450 leading-tight block mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal Utama */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                APA GOAL UTAMAMU BERGABUNG?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: 'self_learning', label: 'Mengembangkan Diri / Belajar Hal Baru' },
                  { value: 'professional_career', label: 'Membangun Karier Profesional' },
                  { value: 'business', label: 'Mendukung Bisnis yang Sedang Berjalan' },
                  { value: 'social_media', label: 'Membuat Konten Media Sosial secara Serius' }
                ].map((g) => {
                  const isSelected = goals.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleGoal(g.value)}
                      className={`flex items-center justify-between p-3 border text-left text-xs rounded-none transition-all cursor-pointer ${isSelected
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-800/50 font-bold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      <span>{g.label}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ketersediaan Sesi Mentoring */}
            <div className="space-y-2 max-w-sm">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                KAPAN WAKTU LUANG TERBAIKMU UNTUK SESI KELAS?
              </label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 py-1.5 px-0 h-auto text-xs font-normal rounded-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
                  <SelectValue placeholder="Pilih Waktu" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none p-1">
                  <SelectItem value="morning" className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">Pagi Hari</SelectItem>
                  <SelectItem value="afternoon" className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">Siang Hari</SelectItem>
                  <SelectItem value="evening" className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">Sore Hari</SelectItem>
                  <SelectItem value="night" className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">Malam Hari</SelectItem>
                  <SelectItem value="flexible" className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">Fleksibel (Kapan Saja)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* BOTTOM SAVE BAR */}
        <div className="pt-4 border-t border-zinc-250 dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-12 py-3 bg-[#0A0A0A] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-[10px] uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>Simpan Perubahan &rarr;</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
