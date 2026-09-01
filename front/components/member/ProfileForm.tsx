"use client";

import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import ChangePasswordModal from "./ChangePasswordModal";
import { MemberProfile, PrimaryInterest } from "@/lib/types/member";
import { createClient } from "@/lib/supabase/client";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // sonner is used for toasts
import { Lock, Check } from "lucide-react";
import { DateBirthLine } from "@/components/ui/style-line/DateBirthLine";
import { MultiSelectLine } from "@/components/ui/style-line/MultiSelectLine";
import { ScaleSelectorLine } from "@/components/ui/style-line/ScaleSelectorLine";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";
import {
  PS_CHALLENGE_OPTIONS,
  NERVOUS_TRIGGER_OPTIONS,
  SKILLS_TO_MASTER_OPTIONS,
  MONETIZATION_OPTIONS,
  EXPERT_DESIRE_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
} from "@/app/(form)/form/member-priority/constants";

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

const GOAL_OPTIONS = [
  { value: 'self_learning', label: '🌱 Mengembangkan Diri & Belajar Skill Baru' },
  { value: 'professional_career', label: '🎤 Membangun Karier Profesional / Public Speaker' },
  { value: 'business', label: '📈 Mendukung Bisnis & Penjualan yang Sedang Berjalan' },
  { value: 'social_media', label: '🎬 Membuat Konten Media Sosial & Personal Brand' },
  { value: 'monetization', label: '💰 Mengakselerasi Monetisasi (Affiliate / Endorse / Digital)' },
  { value: 'networking', label: '🤝 Membangun Jejaring & Kolaborasi Sesama Kreator' },
];

const TOPIC_PRESETS = [
  "Bisnis & Pemasaran",
  "Pengembangan Diri",
  "Karir & Produktivitas",
  "Keuangan & Investasi",
  "Sains & Teknologi",
  "Edukasi & Bahasa",
  "Seni, Musik & Hiburan",
  "Lifestyle & Daily Vlog",
  "Kesehatan & Olahraga",
  "Spiritualitas & Religi",
];

const LEARNING_PREFERENCE_OPTIONS = [
  { value: "live_class", label: "💻 Live Interactive Class (Zoom/GMeet)" },
  { value: "mentoring_1on1", label: "🎯 Mentoring & Feedback 1-on-1" },
  { value: "practical_workshop", label: "🎤 Workshop & Latihan Praktik Direct" },
  { value: "content_review", label: "🎬 Bedah Konten & Review Portofolio" },
  { value: "community_sharing", label: "👥 Sharing Session & Diskusi Komunitas" },
];

export default function ProfileForm({ member, onSave }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<"bio" | "social" | "goals" | "persona">("bio");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // --- FORM STATES ---
  // Section A: Bio & Data Diri
  const [fullName, setFullName] = useState(member.full_name || "");
  const [stageName, setStageName] = useState(member.stage_name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(member.whatsapp_number || "");
  const [birthDate, setBirthDate] = useState(member.birth_date || "");
  const [address, setAddress] = useState(member.address || "");
  const [occupation, setOccupation] = useState(member.occupation || "");
  const [description, setDescription] = useState(member.description || "");
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  // Section B: Sosial Media & Tautan
  const [instagramUsername, setInstagramUsername] = useState(member.social_media?.instagram || "");
  const [tiktokUsername, setTiktokUsername] = useState(member.social_media?.tiktok || "");
  const [youtubeUrl, setYoutubeUrl] = useState(member.social_media?.youtube || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.social_media?.linkedin || "");
  const [portfolioUrl, setPortfolioUrl] = useState(member.portfolio_url || "");

  // Section C: Minat & Goals Lanjutan
  const [selectedInterests, setSelectedInterests] = useState<string[]>(member.interests?.primary_interests || []);
  const [experienceLevel, setExperienceLevel] = useState<string>(member.interests?.experience_level || "beginner");
  const [goals, setGoals] = useState<string[]>(member.interests?.goals || []);
  const [contentTopics, setContentTopics] = useState<string[]>(member.interests?.content_topics || []);
  const [availability, setAvailability] = useState<string>(member.interests?.availability || "flexible");
  const [learningPreference, setLearningPreference] = useState<string[]>(member.interests?.learning_preference || []);
  const [subscribedNewsletter, setSubscribedNewsletter] = useState(member.subscribed_newsletter ?? true);

  // Section D: Public Speaking & Persona
  const initialStm = member.interests?.skills_to_master || "";
  const isStmInOptions = SKILLS_TO_MASTER_OPTIONS.includes(initialStm);

  const initialMi = member.interests?.monetization_interest || "";
  const isMiInOptions = MONETIZATION_OPTIONS.includes(initialMi);

  const [psChallenges, setPsChallenges] = useState<string[]>(member.interests?.ps_challenges || []);
  const [confidenceScale, setConfidenceScale] = useState<number | null>(member.interests?.confidence_scale ?? 5);
  const [nervousTrigger, setNervousTrigger] = useState<string>(member.interests?.nervous_trigger || "");
  const [skillsToMaster, setSkillsToMaster] = useState<string>(
    initialStm ? (isStmInOptions ? initialStm : "Lainnya") : ""
  );
  const [customSkillsToMaster, setCustomSkillsToMaster] = useState<string>(
    initialStm && !isStmInOptions ? initialStm : ""
  );
  const [roleModel, setRoleModel] = useState<string>(member.interests?.role_model || "");
  const [monetizationInterest, setMonetizationInterest] = useState<string>(
    initialMi ? (isMiInOptions ? initialMi : "Lainnya") : ""
  );
  const [customMonetizationInterest, setCustomMonetizationInterest] = useState<string>(
    initialMi && !isMiInOptions ? initialMi : ""
  );
  const [targetAudience, setTargetAudience] = useState<string>(member.interests?.target_audience || "");
  const [expertDesire, setExpertDesire] = useState<string>(member.interests?.expert_desire || "");
  const [careerObstacle, setCareerObstacle] = useState<string>(member.interests?.career_obstacle || "");
  const [activeCommunities, setActiveCommunities] = useState<string>(member.interests?.active_communities || "");
  const [timeCommitment, setTimeCommitment] = useState<string>(member.interests?.time_commitment || "");

  const togglePsChallenge = (val: string) => {
    setPsChallenges((prev) => {
      if (prev.includes(val)) return prev.filter((item) => item !== val);
      if (prev.length >= 3) return prev;
      return [...prev, val];
    });
  };

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
            birth_date: birthDate || null,
            address: address || null,
            occupation,
            description,
            avatar_url: finalAvatarUrl,
            social_media: {
              instagram: instagramUsername || null,
              tiktok: tiktokUsername || null,
              youtube: cleanYoutube,
              linkedin: cleanLinkedin,
            },
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
            ps_challenges: psChallenges,
            confidence_scale: confidenceScale,
            nervous_trigger: nervousTrigger || null,
            skills_to_master: skillsToMaster === "Lainnya" ? (customSkillsToMaster || "Lainnya") : (skillsToMaster || null),
            role_model: roleModel || null,
            monetization_interest: monetizationInterest === "Lainnya" ? (customMonetizationInterest || "Lainnya") : (monetizationInterest || null),
            target_audience: targetAudience || null,
            expert_desire: expertDesire || null,
            career_obstacle: careerObstacle || null,
            active_communities: activeCommunities || null,
            time_commitment: timeCommitment || null,
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

            {/* READ-ONLY ACCOUNT & SECURITY PANEL */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-neutral-50/70 dark:bg-zinc-900/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <Lock className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  Data Akun & Keamanan (Read-Only)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* EMAIL */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    EMAIL AKUN
                  </span>
                  <p className="font-mono font-medium text-black dark:text-white truncate">
                    {member.email || "-"}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">Dikelola oleh sistem otentikasi.</span>
                </div>

                {/* USERNAME */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    USERNAME
                  </span>
                  <p className="font-mono font-medium text-black dark:text-white truncate">
                    @{member.username || "-"}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">Hubungi admin untuk perubahan username.</span>
                </div>

                {/* MEMBERSHIP TIER */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    MEMBERSHIP TIER
                  </span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                    {member.membership_tier?.toUpperCase() || "FREE"}
                  </span>
                </div>

                {/* KODE REFERRAL */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    KODE REFERRAL / AFILIASI
                  </span>
                  <p className="font-mono font-bold text-black dark:text-white">
                    {member.affiliate_code || "-"}
                  </p>
                </div>
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
                  PROFESI UTAMA
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Content Creator, Mahasiswa, Pengusaha..."
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <DateBirthLine
                  label="TANGGAL LAHIR"
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="Pilih Tanggal Lahir"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                ALAMAT LENGKAP
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat tempat tinggal / jalan, kecamatan, kabupaten..."
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
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
            {/* Instagram & TikTok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  INSTAGRAM
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
                  TIKTOK
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

            {/* YouTube & LinkedIn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  YOUTUBE
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Channel / @handle"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  LINKEDIN
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Portfolio / Website */}
            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                TAUTAN WEBSITE / PORTFOLIO UTAMA
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
          <div className="space-y-8 animate-fade-in">
            {/* 01. Minat Utama */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                01. PILIH MINAT & PILAR UTAMAMU * (Bisa pilih lebih dari 1)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = selectedInterests.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleInterest(item.value)}
                      className={`relative flex items-center space-x-2 px-3 py-2.5 border text-[11px] uppercase font-mono tracking-wider transition-all outline-none rounded-none cursor-pointer ${isSelected
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

            {/* 02. Tingkat Pengalaman */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                02. TINGKAT PENGALAMAN & KEMATANGAN *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experienceLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExperienceLevel(opt.value)}
                      className={`flex-1 p-3.5 border text-left rounded-none transition-all cursor-pointer ${isSelected
                        ? "border-black dark:border-white bg-[#0A0A0A]/5 dark:bg-white/5 font-bold"
                        : "border-zinc-300 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      <span className="text-xs font-mono uppercase block">{opt.label}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-tight block mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03. Goal Utama */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                03. APA GOAL UTAMAMU BERGABUNG DI PANGGUNG KREATOR?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_OPTIONS.map((g) => {
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
                      <span className="leading-snug">{g.label}</span>
                      {isSelected && <Check size={14} className="flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 04. Topik Konten Favorit */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                04. TOPIK KONTEN & PEMINATAN BAHASAN
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_PRESETS.map((topic) => {
                  const isSelected = contentTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-all rounded-none cursor-pointer ${isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-bold"
                        : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      {isSelected ? `✓ ${topic}` : topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 05. Preferensi Metode Belajar */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                05. PREFERENSI & METODE BELAJAR
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LEARNING_PREFERENCE_OPTIONS.map((pref) => {
                  const isSelected = learningPreference.includes(pref.value);
                  return (
                    <button
                      key={pref.value}
                      type="button"
                      onClick={() => togglePreference(pref.value)}
                      className={`flex items-center justify-between p-3 border text-left text-xs rounded-none transition-all cursor-pointer ${isSelected
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-800/50 font-bold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                        }`}
                    >
                      <span>{pref.label}</span>
                      {isSelected && <Check size={14} className="flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 06. Skill Fokus & Target Audiens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <RadioGroupLine
                id="skillsToMaster"
                label="SKILL FOKUS YANG INGIN DIKUASAI"
                options={SKILLS_TO_MASTER_OPTIONS}
                value={skillsToMaster}
                onValueChange={setSkillsToMaster}
                customValue={customSkillsToMaster}
                onCustomChange={setCustomSkillsToMaster}
                customPlaceholder="Tuliskan skill lainnya..."
                idPrefix="stm_t3"
              />

              <InputLine
                id="targetAudience"
                name="targetAudience"
                label="TARGET AUDIENS UTAMA KREATOR"
                placeholder="Contoh: Mahasiswa, Gen Z, Professional..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* 07. Jalur Monetisasi & Ketersediaan Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <RadioGroupLine
                id="monetizationInterest"
                label="JALUR MONETISASI YANG DIMINATI"
                options={MONETIZATION_OPTIONS}
                value={monetizationInterest}
                onValueChange={setMonetizationInterest}
                customValue={customMonetizationInterest}
                onCustomChange={setCustomMonetizationInterest}
                customPlaceholder="Tuliskan jalur monetisasi..."
                idPrefix="mi_t3"
              />

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
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
          </div>
        )}

        {/* TAB 4: PUBLIC SPEAKING & PERSONA */}
        {activeTab === "persona" && (
          <div className="space-y-8 animate-fade-in">
            {/* SUB-SEKSI 1: TANTANGAN & DIAGNOSIS PUBLIC SPEAKING */}
            <div className="space-y-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                [ 01. TANTANGAN & DIAGNOSIS PUBLIC SPEAKING ]
              </span>

              <MultiSelectLine
                id="psChallenges"
                label="APA KENDALA TERBESAR YANG KAMU RASAKAN SAAT HARUS BICARA DI DEPAN UMUM? (PILIH MAKSIMAL 3)"
                options={PS_CHALLENGE_OPTIONS}
                selected={psChallenges}
                onToggle={togglePsChallenge}
                maxSelect={3}
                showRemaining
              />

              <div className="pt-4">
                <ScaleSelectorLine
                  id="confidenceScale"
                  label="DALAM SKALA 1-10, SEBERAPA PERCAYA DIRI KAMU SAAT INI JIKA DIMINTA BICARA MENDADAK?"
                  min={1}
                  max={10}
                  value={confidenceScale}
                  onChange={setConfidenceScale}
                  minLabel="1 (SANGAT RAGU)"
                  maxLabel="10 (SANGAT YAKIN)"
                />
              </div>

              <div className="pt-4">
                <RadioGroupLine
                  id="nervousTrigger"
                  label="MANA YANG LEBIH BIKIN KAMU GEMETAR BAIK SEBELUM TAMPIL MAUPUN PADA SAAT TAMPIL?"
                  options={NERVOUS_TRIGGER_OPTIONS}
                  value={nervousTrigger}
                  onValueChange={setNervousTrigger}
                  idPrefix="nt_pf"
                />
              </div>
            </div>

            {/* SUB-SEKSI 2: PERSONAL BRANDING & MONETISASI */}
            <div className="space-y-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                [ 02. PERSONAL BRANDING & MONETISASI ]
              </span>

              <RadioGroupLine
                id="skillsToMaster"
                label="SKILL APA YANG PALING INGIN KAMU KUASAI SAAT INI?"
                options={SKILLS_TO_MASTER_OPTIONS}
                value={skillsToMaster}
                onValueChange={setSkillsToMaster}
                customValue={customSkillsToMaster}
                onCustomChange={setCustomSkillsToMaster}
                customPlaceholder="Tuliskan skill lainnya..."
                idPrefix="stm_pf"
              />

              <div className="pt-4">
                <InputLine
                  id="roleModel"
                  name="roleModel"
                  label="SIAPA SOSOK PUBLIC SPEAKER ATAU CONTENT CREATOR YANG JADI PANUTAN KAMU SAAT INI?"
                  placeholder="Contoh: Raditya Dika, Merry Riana, GaryVee, dll."
                  value={roleModel}
                  onChange={(e) => setRoleModel(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <RadioGroupLine
                  id="monetizationInterest"
                  label="JALUR MONETISASI APA YANG PALING KAMU MINATI?"
                  options={MONETIZATION_OPTIONS}
                  value={monetizationInterest}
                  onValueChange={setMonetizationInterest}
                  customValue={customMonetizationInterest}
                  onCustomChange={setCustomMonetizationInterest}
                  customPlaceholder="Tuliskan jalur monetisasi lainnya..."
                  idPrefix="mi_pf"
                />
              </div>
            </div>

            {/* SUB-SEKSI 3: EKSPLORASI TOPIK & AUDIENS */}
            <div className="space-y-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                [ 03. EKSPLORASI TOPIK & AUDIENS ]
              </span>

              <InputLine
                id="targetAudience"
                name="targetAudience"
                label="SIAPA TARGET AUDIENS YANG PALING INGIN KAMU SAPA MELALUI KONTEN ATAU BICARAMU?"
                placeholder="Contoh: Mahasiswa tingkat akhir, Ibu rumah tangga berbisnis, Gen Z, dll."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />

              <div className="pt-4">
                <RadioGroupLine
                  id="expertDesire"
                  label="SEBERAPA BESAR KEINGINANMU UNTUK DIKENAL SEBAGAI 'AHLI' DI BIDANG TERSEBUT?"
                  options={EXPERT_DESIRE_OPTIONS}
                  value={expertDesire}
                  onValueChange={setExpertDesire}
                  idPrefix="ed_pf"
                />
              </div>
            </div>

            {/* SUB-SEKSI 4: KOMITMEN & KOMUNITAS */}
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                [ 04. KOMITMEN & KOMUNITAS ]
              </span>

              <TextareaLine
                id="activeCommunities"
                name="activeCommunities"
                label="KOMUNITAS APA SAJA YANG KAMU IKUTI SECARA AKTIF SELAIN DI PANGGUNG KREATOR?"
                rows={2}
                placeholder="Tuliskan nama komunitas..."
                value={activeCommunities}
                onChange={(e) => setActiveCommunities(e.target.value)}
              />

              <div className="pt-4">
                <TextareaLine
                  id="careerObstacle"
                  name="careerObstacle"
                  label="APA KENDALA TERBESAR KAMU SAAT INI DALAM BERKARYA/MEMBANGUN KARIR TERMASUK MEWUJUDKAN IMPIAN?"
                  rows={2}
                  placeholder="Ceritakan kendala terbesarmu saat ini..."
                  value={careerObstacle}
                  onChange={(e) => setCareerObstacle(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <RadioGroupLine
                  id="timeCommitment"
                  label="KALAU PANGGUNG KREATOR MENGADAKAN SESI MENTORING ATAU SHARING INTENSIF BUAT BAHAS SEMUA KENDALA KAMU, SEBERAPA BESAR WAKTU YANG SIAP KAMU LUANGKAN?"
                  options={TIME_COMMITMENT_OPTIONS}
                  value={timeCommitment}
                  onValueChange={setTimeCommitment}
                  idPrefix="tc_pf"
                />
              </div>
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

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
