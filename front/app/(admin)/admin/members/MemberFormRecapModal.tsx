"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  User,
  Mic,
  Sparkles,
  Target,
  Compass,
  Clock,
  Globe,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

function InstagramIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}

function LinkedinIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface MemberFormRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any | null;
}

export function MemberFormRecapModal({
  isOpen,
  onClose,
  member,
}: MemberFormRecapModalProps) {
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  // Normalize interests object (handles single object or array)
  const interests = Array.isArray(member.interests)
    ? member.interests[0] || null
    : member.interests || null;

  // Check whether member has actually submitted the StepEssential form
  const hasPsChallenges =
    Array.isArray(interests?.ps_challenges) && interests.ps_challenges.length > 0;
  const hasSkills = Boolean(interests?.skills_to_master);
  const hasGoals = Array.isArray(interests?.goals) && interests.goals.length > 0;
  const hasConfidence =
    interests?.confidence_scale !== null && interests?.confidence_scale !== undefined;
  const hasTopics =
    Array.isArray(interests?.content_topics) && interests.content_topics.length > 0;
  const hasMonetization = Boolean(interests?.monetization_interest);
  const hasRoleModel = Boolean(interests?.role_model);
  const hasNervous = Boolean(interests?.nervous_trigger);

  const isFormFilled =
    hasPsChallenges ||
    hasSkills ||
    hasGoals ||
    hasConfidence ||
    hasTopics ||
    hasMonetization ||
    hasRoleModel ||
    hasNervous;

  // Helpers
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWhatsappUrl = (phone?: string) => {
    if (!phone) return "";
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
    const name = member.stage_name || member.full_name || "Kak";
    const msg = encodeURIComponent(
      `Halo ${name}, salam dari Tim Panggung Kreator! Kami ingin mengonfirmasi pengisian form onboarding Priority Kakak.`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

  const handleCopyRecap = () => {
    if (!isFormFilled) {
      const summaryText = `[REKAP FORM MEMBER - BELUM DIISI]
Nama: ${member.full_name} (${member.stage_name || "-"})
Email: ${member.email || "-"}
No. WhatsApp: ${member.whatsapp_number || "-"}
Status Form Onboarding: BELUM DIISI
Tanggal Terdaftar: ${formatDate(member.created_at)}`;

      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast.success("Ringkasan berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const summaryText = `[REKAP JAWABAN FORM ONBOARDING - PANGGUNG KREATOR]
=========================================
1. PROFIL SINGKAT
- Nama Lengkap: ${member.full_name}
- Nama Panggung: ${member.stage_name || "-"}
- Tanggal Lahir: ${formatDate(member.birth_date)}
- Domisili / Alamat: ${member.address || member.city || "-"}
- No. WhatsApp: ${member.whatsapp_number}
- Email: ${member.email}
- Pekerjaan: ${member.occupation || "-"}
- Instagram: @${member.social_media?.instagram || member.instagram_username || "-"}
- TikTok: @${member.social_media?.tiktok || member.tiktok_username || "-"}

2. PUBLIC SPEAKING & CONFIDENCE
- Skala Percaya Diri: ${interests?.confidence_scale ?? "-"}/10
- Pemicu Nervous: ${interests?.nervous_trigger || "-"}
- Kendala Utama: ${interests?.ps_challenges?.join(", ") || "-"}

3. MINAT BELAJAR & MONETISASI
- Skill yang Ingin Dikuasai: ${interests?.skills_to_master || "-"}
- Panutan / Role Model: ${interests?.role_model || "-"}
- Minat Monetisasi: ${interests?.monetization_interest || "-"}

4. VISI & KARIER
- Target Karier (2-3 Thn): ${interests?.goals?.[0] || "-"}
- Peluang Impian Pertama: ${interests?.goals?.[1] || "-"}

5. TOPIK & PESAN UTAMA
- Topik Utama Konten: ${interests?.content_topics?.[0] || "-"}
- Pesan Utama: ${interests?.content_topics?.[1] || "-"}
- Target Audiens: ${interests?.target_audience || "-"}
- Keinginan Dikenal Ahli: ${interests?.expert_desire || "-"}

6. KOMITMEN & WAKTU
- Komunitas Aktif: ${interests?.active_communities || "-"}
- Kendala Terbesar Berkarya: ${interests?.career_obstacle || "-"}
- Komitmen Waktu: ${interests?.time_commitment || "-"}
=========================================`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast.success("Seluruh rekap jawaban berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="Rekap Jawaban Form Onboarding"
      subtitle={`Form Profiling & Kebutuhan Program (StepEssential) — ${member.stage_name || member.full_name}`}
      icon={<FileText className="w-5 h-5" />}
      headerRight={
        isFormFilled ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5 font-mono shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah Diisi</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5 font-mono shadow-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Diisi</span>
          </span>
        )
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-10 px-5 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyRecap}
              className="flex-1 sm:flex-initial h-10 px-4 text-xs font-bold rounded-xl bg-bg-well hover:bg-bg-well/80 border border-border-default text-text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? "Tersalin!" : "Salin Rekap Teks"}</span>
            </button>

            {member.whatsapp_number && (
              <a
                href={formatWhatsappUrl(member.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial h-10 px-4 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1 text-xs">
        {/* ═══ STATE: BELUM DIISI ═══ */}
        {!isFormFilled && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs">Member Ini Belum Mengisi Form Onboarding</p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  Data kuesioner evaluasi diri, kendala public speaking, target karier, dan preferensi program (StepEssential) belum tersedia di database.
                </p>
              </div>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="p-4 rounded-2xl bg-bg-well/50 border border-border-default space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                Ringkasan Akun Member Terdaftar
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-text-muted block">Nama Lengkap:</span>
                  <span className="font-bold text-text-primary text-xs">{member.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Username:</span>
                  <span className="font-mono font-bold text-text-primary text-xs">@{member.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Email:</span>
                  <span className="font-medium text-text-primary text-xs">{member.email || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">WhatsApp:</span>
                  <span className="font-mono font-medium text-text-primary text-xs">{member.whatsapp_number || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Tipe Member:</span>
                  <span className="font-bold text-text-primary uppercase text-xs">{member.membership_tier || "Regular"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Tgl Bergabung:</span>
                  <span className="font-medium text-text-primary text-xs">{formatDate(member.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg-well/30 border border-border-default/60 text-[11px] text-text-muted leading-relaxed">
              💡 <strong>Tips Admin:</strong> Kakak dapat mengirimkan tautan pendaftaran atau mengingatkan member melalui WhatsApp agar segera mengisi kuesioner profiling.
            </div>
          </div>
        )}

        {/* ═══ STATE: SUDAH DIISI (Renders 6 Sections Matching StepEssential.tsx) ═══ */}
        {isFormFilled && (
          <div className="space-y-4">
            {/* Bagian 1: Profil Singkat */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <User className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 1: Profil Singkat & Media Sosial</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Nama Lengkap:</span>
                  <span className="font-bold text-text-primary">{member.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Nama Panggung:</span>
                  <span className="font-semibold text-text-primary">{member.stage_name || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Tanggal Lahir:</span>
                  <span className="font-medium text-text-primary">{formatDate(member.birth_date)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Domisili / Alamat:</span>
                  <span className="font-medium text-text-primary">{member.address || member.city || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Pekerjaan / Kesibukan:</span>
                  <span className="font-medium text-text-primary">{member.occupation || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Newsletter:</span>
                  <span className="font-medium text-text-primary">
                    {member.subscribed_newsletter !== false ? "Ya, Berlangganan" : "Tidak"}
                  </span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-2 border-t border-border-default/40">
                <span className="text-[10px] text-text-muted block mb-1.5 font-bold uppercase tracking-wider">
                  Media Sosial
                </span>
                <div className="flex flex-wrap gap-2">
                  {(member.social_media?.instagram || member.instagram_username) && (
                    <span className="px-2.5 py-1 rounded-xl bg-bg-card border border-border-default text-[11px] font-semibold inline-flex items-center gap-1.5">
                      <InstagramIcon size={12} className="text-pink-500" />
                      <span>@{(member.social_media?.instagram || member.instagram_username).replace("@", "")}</span>
                    </span>
                  )}
                  {(member.social_media?.tiktok || member.tiktok_username) && (
                    <span className="px-2.5 py-1 rounded-xl bg-bg-card border border-border-default text-[11px] font-semibold inline-flex items-center gap-1.5">
                      <span className="font-bold text-sky-500">TikTok:</span>
                      <span>@{(member.social_media?.tiktok || member.tiktok_username).replace("@", "")}</span>
                    </span>
                  )}
                  {member.social_media?.youtube && (
                    <a
                      href={member.social_media.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-bg-card border border-border-default text-[11px] font-semibold hover:border-text-primary inline-flex items-center gap-1.5 text-red-500"
                    >
                      <YoutubeIcon size={12} />
                      <span>YouTube</span>
                    </a>
                  )}
                  {member.social_media?.linkedin && (
                    <a
                      href={member.social_media.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-bg-card border border-border-default text-[11px] font-semibold hover:border-text-primary inline-flex items-center gap-1.5 text-blue-500"
                    >
                      <LinkedinIcon size={12} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {!member.social_media?.instagram &&
                    !member.instagram_username &&
                    !member.social_media?.tiktok &&
                    !member.tiktok_username && (
                      <span className="text-text-muted text-[11px] italic">Tidak mencantumkan akun sosial media.</span>
                    )}
                </div>
              </div>
            </div>

            {/* Bagian 2: Tantangan & Kendala (Public Speaking) */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <Mic className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 2: Tantangan & Kendala (Public Speaking)</span>
              </div>

              <div className="space-y-3">
                {/* Confidence scale */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Skala Percaya Diri (1 - 10)</span>
                    <span className="font-mono font-black text-sm text-text-primary">
                      {interests?.confidence_scale ?? "-"}/10
                    </span>
                  </div>
                  {interests?.confidence_scale ? (
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, interests.confidence_scale * 10))}%` }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Nervous trigger */}
                {interests?.nervous_trigger && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                      Situasi Paling Membuat Nervous:
                    </span>
                    <p className="p-2.5 rounded-xl bg-bg-card border border-border-default/60 font-semibold text-text-primary">
                      {interests.nervous_trigger}
                    </p>
                  </div>
                )}

                {/* PS challenges */}
                {interests?.ps_challenges && interests.ps_challenges.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase block mb-1.5">
                      Kendala Utama yang Dihadapi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.ps_challenges.map((c: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[11px] font-medium"
                        >
                          • {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian 3: Minat Belajar & Panutan */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <Sparkles className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 3: Minat Belajar & Panutan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Skill Utama yang Ingin Dikuasai</span>
                  <p className="font-bold text-text-primary">{interests?.skills_to_master || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Sosok Creator / Speaker Panutan</span>
                  <p className="font-bold text-text-primary">{interests?.role_model || "-"}</p>
                </div>
                <div className="sm:col-span-2 p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Jalur Monetisasi yang Diminati</span>
                  <p className="font-bold text-text-primary">{interests?.monetization_interest || "-"}</p>
                </div>
              </div>
            </div>

            {/* Bagian 4: Visi & Karier */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <Target className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 4: Visi & Karier</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">
                    Target Karier Impian (2-3 Tahun ke Depan):
                  </span>
                  <p className="text-text-primary leading-relaxed">{interests?.goals?.[0] || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">
                    Peluang Impian Pertama yang Ingin Dikejar:
                  </span>
                  <p className="text-text-primary leading-relaxed">{interests?.goals?.[1] || "-"}</p>
                </div>
              </div>
            </div>

            {/* Bagian 5: Eksplorasi Topik & Pesan Utama */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <Compass className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 5: Eksplorasi Topik & Pesan Utama</span>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Topik Besar Konten</span>
                    <p className="font-bold text-text-primary">{interests?.content_topics?.[0] || "-"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Keinginan Dikenal Ahli</span>
                    <p className="font-bold text-text-primary">{interests?.expert_desire || "-"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">
                    Pesan Utama untuk Audiens:
                  </span>
                  <p className="text-text-primary leading-relaxed italic">
                    "{interests?.content_topics?.[1] || "-"}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Target Audiens yang Ingin Disapa:</span>
                  <p className="text-text-primary leading-relaxed">{interests?.target_audience || "-"}</p>
                </div>
              </div>
            </div>

            {/* Bagian 6: Komitmen & Waktu */}
            <div className="p-4 rounded-2xl bg-bg-well/40 border border-border-default space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-default/50 text-text-primary font-bold">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="text-xs uppercase tracking-wider">Bagian 6: Komitmen & Waktu</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Komunitas yang Diikuti Secara Aktif:</span>
                  <p className="text-text-primary font-medium">{interests?.active_communities || "-"}</p>
                </div>

                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Kendala Terbesar dalam Berkarya:</span>
                  <p className="text-text-primary leading-relaxed">{interests?.career_obstacle || "-"}</p>
                </div>

                <div className="p-3 rounded-xl bg-bg-card border border-border-default/60 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Komitmen Waktu Mentoring:</span>
                  <p className="font-bold text-text-primary">{interests?.time_commitment || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
