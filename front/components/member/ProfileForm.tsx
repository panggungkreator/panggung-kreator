"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ImageUploader from "./ImageUploader";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeUsernameModal from "./ChangeUsernameModal";
import ExperienceManager from "./ExperienceManager";
import PortfolioManager from "./PortfolioManager";
import AchievementsManager from "./AchievementsManager";
import { MemberProfile } from "@/lib/types/member";
import { createClient } from "@/lib/supabase/client";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { toast } from "sonner";
import {
  Lock,
  User,
  Briefcase,
  Sparkles,
  Award,
  ChevronRight,
  Loader2,
  Share2,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { DateBirthLine } from "@/components/ui/style-line/DateBirthLine";

interface ProfileFormProps {
  member: MemberProfile;
  onSave?: () => void;
}

export default function ProfileForm({ member, onSave }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeUsernameOpen, setIsChangeUsernameOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"identitas" | "pengalaman" | "karya" | "prestasi">("identitas");

  // --- FORM STATES (IDENTITAS & SOSIAL) ---
  const [fullName, setFullName] = useState(member.full_name || "");
  const [stageName, setStageName] = useState(member.stage_name || "");
  const [username, setUsername] = useState(member.username || "");
  const [usernameChangesCount, setUsernameChangesCount] = useState(member.username_changes_count ?? 0);
  const [lastUsernameChange, setLastUsernameChange] = useState<string | null>(member.last_username_change ?? null);
  const [whatsappNumber, setWhatsappNumber] = useState(member.whatsapp_number || "");
  const [birthDate, setBirthDate] = useState(member.birth_date || "");
  const [address, setAddress] = useState(member.address || "");
  const [occupation, setOccupation] = useState(member.occupation || "");
  const [description, setDescription] = useState(member.description || "");
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = "auto";
      descriptionTextareaRef.current.style.height = `${Math.max(84, descriptionTextareaRef.current.scrollHeight)}px`;
    }
  }, [description, activeSection]);
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [subscribedNewsletter, setSubscribedNewsletter] = useState(member.subscribed_newsletter ?? true);

  // Sosial Media
  const [instagramUsername, setInstagramUsername] = useState(member.social_media?.instagram || "");
  const [tiktokUsername, setTiktokUsername] = useState(member.social_media?.tiktok || "");
  const [youtubeUrl, setYoutubeUrl] = useState(member.social_media?.youtube || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.social_media?.linkedin || "");
  const [portfolioUrl, setPortfolioUrl] = useState(member.portfolio_url || "");

  // Username change cooldown
  let isCoolingDown = false;
  let daysRemaining = 0;
  if (lastUsernameChange) {
    const lastChangeTime = new Date(lastUsernameChange).getTime();
    const diffDays = (Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24);
    if (diffDays < 14) {
      isCoolingDown = true;
      daysRemaining = Math.ceil(14 - diffDays);
    }
  }

  // Check if form is dirty (has unsaved changes)
  const isDirty = useMemo(() => {
    return (
      fullName !== (member.full_name || "") ||
      stageName !== (member.stage_name || "") ||
      whatsappNumber !== (member.whatsapp_number || "") ||
      birthDate !== (member.birth_date || "") ||
      address !== (member.address || "") ||
      occupation !== (member.occupation || "") ||
      description !== (member.description || "") ||
      instagramUsername !== (member.social_media?.instagram || "") ||
      tiktokUsername !== (member.social_media?.tiktok || "") ||
      youtubeUrl !== (member.social_media?.youtube || "") ||
      linkedinUrl !== (member.social_media?.linkedin || "") ||
      portfolioUrl !== (member.portfolio_url || "") ||
      subscribedNewsletter !== (member.subscribed_newsletter ?? true) ||
      pendingAvatarFile !== null ||
      isAvatarRemoved
    );
  }, [
    fullName,
    stageName,
    whatsappNumber,
    birthDate,
    address,
    occupation,
    description,
    instagramUsername,
    tiktokUsername,
    youtubeUrl,
    linkedinUrl,
    portfolioUrl,
    subscribedNewsletter,
    pendingAvatarFile,
    isAvatarRemoved,
    member,
  ]);

  const handleResetForm = () => {
    setFullName(member.full_name || "");
    setStageName(member.stage_name || "");
    setWhatsappNumber(member.whatsapp_number || "");
    setBirthDate(member.birth_date || "");
    setAddress(member.address || "");
    setOccupation(member.occupation || "");
    setDescription(member.description || "");
    setAvatarUrl(member.avatar_url || "");
    setPendingAvatarFile(null);
    setIsAvatarRemoved(false);
    setInstagramUsername(member.social_media?.instagram || "");
    setTiktokUsername(member.social_media?.tiktok || "");
    setYoutubeUrl(member.social_media?.youtube || "");
    setLinkedinUrl(member.social_media?.linkedin || "");
    setPortfolioUrl(member.portfolio_url || "");
    setSubscribedNewsletter(member.subscribed_newsletter ?? true);
    toast.info("Perubahan identitas dibatalkan.");
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleaned = e.target.value.replace(/\D/g, "");
    if (cleaned.length > 0 && cleaned[0] !== "0") cleaned = "0" + cleaned;
    cleaned = cleaned.slice(0, 13);
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));
    if (cleaned.length > 8) parts.push(cleaned.slice(8, 13));
    setWhatsappNumber(parts.join("-"));
  };

  const scrollToSection = (id: string, sectionKey: typeof activeSection) => {
    setActiveSection(sectionKey);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !stageName.trim() || !whatsappNumber.trim()) {
      toast.error("Nama Lengkap, Nama Panggung, dan No. WhatsApp wajib diisi.");
      return;
    }

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
      return `https://${trimmed}`;
    };

    const formatWebsiteUrl = (url: string): string => {
      const trimmed = (url || "").trim();
      if (!trimmed || trimmed === "-") return "-";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    let finalAvatarUrl: string | null = avatarUrl;

    try {
      const supabase = createClient();

      if (pendingAvatarFile) {
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
            full_name: fullName.trim(),
            stage_name: stageName.trim(),
            whatsapp_number: whatsappNumber.trim(),
            birth_date: birthDate || null,
            address: address.trim() || null,
            occupation: occupation.trim() || null,
            description: description.trim() || null,
            avatar_url: finalAvatarUrl,
            social_media: {
              instagram: instagramUsername.trim() || null,
              tiktok: tiktokUsername.trim() || null,
              youtube: formatYoutubeUrl(youtubeUrl),
              linkedin: formatLinkedinUrl(linkedinUrl),
            },
            portfolio_url: formatWebsiteUrl(portfolioUrl),
            subscribed_newsletter: subscribedNewsletter,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal memperbarui data profil.");
      }

      setPendingAvatarFile(null);
      setIsAvatarRemoved(false);
      toast.success("Profil Anda berhasil diperbarui!");
      if (onSave) onSave();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const navSections = [
    { key: "identitas" as const, id: "section-identitas", label: "Identitas", icon: User },
    { key: "pengalaman" as const, id: "section-pengalaman", label: "Jam Terbang", icon: Briefcase },
    { key: "karya" as const, id: "section-karya", label: "Karya", icon: Sparkles },
    { key: "prestasi" as const, id: "section-prestasi", label: "Prestasi", icon: Award },
  ];

  return (
    <div className="space-y-10 pb-20 relative">
      {/* ═══ STICKY ANCHOR NAV (SCROLLSPY) ═══ */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-[#151B18]/95 backdrop-blur-md border border-[#212121]/10 dark:border-white/10 rounded-2xl p-1.5 shadow-2xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {navSections.map((sec, idx) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => scrollToSection(sec.id, sec.key)}
                className={`flex-1 min-w-[110px] py-2 px-3 text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                  isActive
                    ? "bg-[#212121] dark:bg-white text-white dark:text-[#212121] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-[#212121] dark:hover:text-white hover:bg-[#F6F5FA] dark:hover:bg-neutral-800"
                }`}
              >
                <Icon size={13} />
                <span>{`0${idx + 1}. ${sec.label}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ SECTION 1: IDENTITAS & DATA DIRI (#section-identitas) ═══ */}
      <section
        id="section-identitas"
        className="bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xs"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-[#212121]/10 dark:border-white/10">
          <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#212121] dark:text-white flex items-center justify-center font-bold text-xs font-mono">
            1
          </span>
          <h2 className="text-sm font-bold text-[#212121] dark:text-white uppercase tracking-wider">
            Informasi Utama Talent
          </h2>
        </div>

        {/* FOTO PROFIL */}
        <div className="flex flex-col items-center justify-center text-center gap-3 py-4 border-b border-[#212121]/10 dark:border-white/10">
          <div className="relative">
            <ImageUploader
              memberId={member.id}
              target="avatar"
              mode="deferred"
              initialImageUrl={avatarUrl}
              onUploadSuccess={setAvatarUrl}
              onFileSelect={(file) => {
                setPendingAvatarFile(file);
                setIsAvatarRemoved(file === null);
              }}
            />
          </div>
          <div className="space-y-1 max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider block text-neutral-900 dark:text-white">
              Foto Profil Kreator
            </span>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Gunakan foto portrait resolusi tinggi berlatar bersih atau saat perform di panggung. Ukuran maks. 2MB (otomatis dikompresi ke WebP).
            </p>
          </div>
        </div>

        {/* DATA AKUN & KEAMANAN (EMAIL LOCKED, USERNAME MODAL) */}
        <div className="border border-[#212121]/10 dark:border-white/10 bg-[#F6F5FA] dark:bg-[#1E2622] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#212121] dark:text-white">
              Kredensial Akun & Keamanan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            {/* EMAIL (DISABLED + LOCKED) */}
            <div className="p-3.5 bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 rounded-xl space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Email Akun
                </span>
                <span className="text-[9px] font-mono text-neutral-400 flex items-center gap-1">
                  <Lock size={10} /> Terkunci
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-[#212121] dark:text-neutral-200">
                {member.email || "-"}
              </p>
              <span className="text-[9px] text-neutral-400 block pt-0.5">
                Saat ini email tidak dapat diubah secara mandiri.
              </span>
            </div>

            {/* USERNAME (INTERACTIVE BUTTON / COOLDOWN) */}
            <button
              type="button"
              onClick={() => setIsChangeUsernameOpen(true)}
              className="p-3.5 bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 rounded-xl space-y-1 text-left group hover:border-[#212121]/40 dark:hover:border-white/40 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors">
                  Username
                </span>
                <ChevronRight size={13} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="font-mono text-xs font-bold text-[#212121] dark:text-white">
                @{username || "-"}
              </p>
              <span className="text-[9px] text-neutral-500 block pt-0.5">
                {isCoolingDown
                  ? `Jeda 14 hari aktif (${daysRemaining} hari lagi)`
                  : "Ketuk untuk mengajukan ubah username"}
              </span>
            </button>
          </div>
        </div>

        {/* INPUT DATA DIRI UTAMA */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Misal: Ahmad Zaki"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Nama Panggung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Misal: Zaki Speaks"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                No. WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={handleWhatsappChange}
                placeholder="0812-3456-7890"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Profesi Utama (Opsional)
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Misal: MC / Public Speaker / Content Creator"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Tanggal Lahir (Opsional)
              </label>
              <DateBirthLine
                value={birthDate}
                onChange={setBirthDate}
                placeholder="Pilih Tanggal Lahir"
                variant="box"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Domisili / Alamat Kota (Opsional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Misal: Jakarta Selatan, DKI Jakarta"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Bio / Deskripsi Singkat (Opsional)
            </label>
            <textarea
              ref={descriptionTextareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Ceritakan persona panggungmu, pengalaman singkat, atau nilai unik yang kamu tawarkan..."
              className="w-full min-h-[84px] p-3 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 resize-none transition-[border-color,background-color] leading-relaxed overflow-hidden"
            />
            <span className="text-[9px] font-mono text-neutral-400 float-right mt-1">
              {description.length}/500 KARAKTER
            </span>
          </div>
        </div>

        {/* SOSIAL MEDIA & JEJARING */}
        <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Tautan Jejaring Sosial & Portfolio Web
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                Instagram (Opsional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-neutral-400 font-mono">@</span>
                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="username"
                  className="w-full h-10 pl-8 pr-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                TikTok (Opsional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-neutral-400 font-mono">@</span>
                <input
                  type="text"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  placeholder="username"
                  className="w-full h-10 pl-8 pr-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                YouTube Channel / Handle (Opsional)
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="youtube.com/@handle"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                LinkedIn (Opsional)
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Website / Portofolio Eksternal (Opsional)
            </label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://mywebsite.com"
              className="w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white text-xs font-medium text-[#212121] dark:text-white placeholder:text-neutral-400 transition-all"
            />
          </div>
        </div>

        {/* Section 1 Direct Save Button */}
        <div className="pt-4 border-t border-[#212121]/10 dark:border-white/10 flex justify-end gap-3">
          <button
            type="button"
            disabled={!isDirty}
            onClick={handleResetForm}
            className="h-10 px-5 text-xs font-bold rounded-xl text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoading || !isDirty}
            onClick={() => handleSaveProfile()}
            className="h-10 px-6 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {isLoading ? (
              <span className="animate-pulse flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span>Simpan Identitas</span>
            )}
          </button>
        </div>
      </section>

      {/* ═══ SECTION 2: JAM TERBANG & PENGALAMAN (#section-pengalaman) ═══ */}
      <section
        id="section-pengalaman"
        className="rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] p-5 sm:p-7 space-y-4 shadow-2xs"
      >
        <ExperienceManager memberId={member.id} />
      </section>

      {/* ═══ SECTION 3: KARYA & PORTOFOLIO (#section-karya) ═══ */}
      <section
        id="section-karya"
        className="rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] p-5 sm:p-7 space-y-4 shadow-2xs"
      >
        <PortfolioManager memberId={member.id} />
      </section>

      {/* ═══ SECTION 4: PRESTASI & SERTIFIKASI (#section-prestasi) ═══ */}
      <section
        id="section-prestasi"
        className="rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] p-5 sm:p-7 space-y-4 shadow-2xs"
      >
        <AchievementsManager memberId={member.id} />
      </section>

      {/* ═══ STICKY SAVE BAR (FLOATING NOTIFICATION WHEN FORM IS DIRTY) ═══ */}
      {isDirty && (
        <div className="fixed bottom-4 inset-x-4 sm:max-w-2xl sm:mx-auto z-40 bg-[#212121] text-white dark:bg-white dark:text-[#212121] px-4 py-3 rounded-2xl border border-white/10 dark:border-black/10 shadow-2xl flex items-center justify-between gap-3 animate-slide-up backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#EFF0A3] shrink-0" />
            <span className="text-[11px] font-mono font-medium">
              Ada perubahan profil yang belum disimpan.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 hover:text-white dark:hover:text-[#212121] rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} /> Batal
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSaveProfile()}
              className="px-4 py-1.5 bg-white text-[#212121] dark:bg-[#212121] dark:text-white font-bold text-[10px] font-mono uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check size={12} />}
              <span>Simpan Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ChangeUsernameModal
        isOpen={isChangeUsernameOpen}
        onClose={() => setIsChangeUsernameOpen(false)}
        currentUsername={username}
        usernameChangesCount={usernameChangesCount}
        lastUsernameChange={lastUsernameChange}
        onSuccess={(newU, newCount, newLast) => {
          setUsername(newU);
          setUsernameChangesCount(newCount);
          setLastUsernameChange(newLast);
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
