"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ImageUploader from "@/components/member/ImageUploader";
import { DateBirthLine } from "@/components/ui/style-line/DateBirthLine";
import { MemberProfile } from "@/lib/types/member";
import { createClient } from "@/lib/supabase/client";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { toast } from "sonner";
import {
  Loader2,
  RotateCcw,
  Check,
} from "lucide-react";

interface GeneralInfoPanelProps {
  member: MemberProfile;
  onSaved?: (updatedMember?: Partial<MemberProfile>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  saveTriggerRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  discardTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export default function GeneralInfoPanel({
  member,
  onSaved,
  onDirtyChange,
  saveTriggerRef,
  discardTriggerRef,
}: GeneralInfoPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

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
  const [subscribedNewsletter, setSubscribedNewsletter] = useState(
    member.subscribed_newsletter ?? true
  );

  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = "auto";
      descriptionTextareaRef.current.style.height = `${Math.max(
        84,
        descriptionTextareaRef.current.scrollHeight
      )}px`;
    }
  }, [description]);

  const isDirty = useMemo(() => {
    return (
      fullName !== (member.full_name || "") ||
      stageName !== (member.stage_name || "") ||
      whatsappNumber !== (member.whatsapp_number || "") ||
      birthDate !== (member.birth_date || "") ||
      address !== (member.address || "") ||
      occupation !== (member.occupation || "") ||
      description !== (member.description || "") ||
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
    subscribedNewsletter,
    pendingAvatarFile,
    isAvatarRemoved,
    member,
  ]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleResetForm = useCallback(() => {
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
    setSubscribedNewsletter(member.subscribed_newsletter ?? true);
    toast.info("Perubahan informasi pribadi dibatalkan.");
  }, [member]);

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

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !stageName.trim() || !whatsappNumber.trim()) {
      toast.error("Nama Lengkap, Nama Panggung, dan No. WhatsApp wajib diisi.");
      return;
    }

    setIsLoading(true);
    let finalAvatarUrl: string | null = avatarUrl;

    try {
      const supabase = createClient();

      if (pendingAvatarFile) {
        try {
          const { data: existingFiles } = await supabase.storage
            .from("member-avatars")
            .list(member.id);

          if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(
              (f: any) => `${member.id}/${f.name}`
            );
            await supabase.storage.from("member-avatars").remove(filesToRemove);
          }
        } catch (cleanupErr) {
          console.warn("Cleanup old avatar error:", cleanupErr);
        }

        const compressedFile = await compressImageForTarget(
          pendingAvatarFile,
          "avatar"
        );
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
            const filesToRemove = existingFiles.map(
              (f: any) => `${member.id}/${f.name}`
            );
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
            subscribed_newsletter: subscribedNewsletter,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal memperbarui informasi pribadi.");
      }

      setPendingAvatarFile(null);
      setIsAvatarRemoved(false);
      setAvatarUrl(finalAvatarUrl || "");
      toast.success("Informasi pribadi berhasil disimpan!");
      if (onSaved) {
        onSaved({
          full_name: fullName.trim(),
          stage_name: stageName.trim(),
          whatsapp_number: whatsappNumber.trim(),
          birth_date: birthDate || null,
          address: address.trim() || null,
          occupation: occupation.trim() || null,
          description: description.trim() || null,
          avatar_url: finalAvatarUrl,
          subscribed_newsletter: subscribedNewsletter,
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }, [
    fullName,
    stageName,
    whatsappNumber,
    birthDate,
    address,
    occupation,
    description,
    avatarUrl,
    pendingAvatarFile,
    isAvatarRemoved,
    subscribedNewsletter,
    member.id,
    onSaved,
  ]);

  useEffect(() => {
    if (saveTriggerRef) {
      saveTriggerRef.current = handleSave;
    }
    if (discardTriggerRef) {
      discardTriggerRef.current = handleResetForm;
    }
  }, [saveTriggerRef, discardTriggerRef, handleSave, handleResetForm]);

  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* SECTION HEADER */}
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">
          Informasi Utama Talent
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Perbarui foto profil, nama resmi, kontak WhatsApp aktif, serta domisili Anda.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AVATAR CANVAS UPLOADER */}
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2 pb-4 border-b border-border-default/60">
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
            <span className="text-xs font-bold uppercase tracking-wider block text-text-primary">
              Foto Profil Kreator
            </span>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Gunakan foto portrait resolusi tinggi berlatar bersih atau saat perform di panggung. Ukuran maks. 2MB (otomatis dikompresi ke WebP).
            </p>
          </div>
        </div>

        {/* IDENTITY INPUT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* NAMA LENGKAP */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Bagas Teguh Pratistia"
              required
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-sans placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* NAMA PANGGUNG */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Nama Panggung *
            </label>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Contoh: Bagas Kawan"
              required
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-sans placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* NO. WHATSAPP */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              No. WhatsApp *
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={handleWhatsappChange}
              placeholder="0812-3456-7890"
              required
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* TANGGAL LAHIR */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Tanggal Lahir
            </label>
            <DateBirthLine
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Pilih Tanggal Lahir"
              variant="box"
            />
          </div>

          {/* DOMISILI / ALAMAT */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Domisili / Kota Asal
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jakarta Selatan"
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-sans placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* PEKERJAAN / PROFESI */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Profesi / Peran Utama
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Contoh: Master of Ceremony (MC) & Host"
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-sans placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* BIO / DESKRIPSI SINGKAT */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-text-secondary mb-1.5 font-bold">
              Bio / Ringkasan Diri
            </label>
            <textarea
              ref={descriptionTextareaRef}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan secara singkat keahlian, minat, atau rekam jejak Anda sebagai talent/kreator..."
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-sans placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all resize-none leading-relaxed"
            />
          </div>

          {/* NEWSLETTER PREFERENCE */}
          {/* <div className="sm:col-span-2 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={subscribedNewsletter}
                onChange={(e) => setSubscribedNewsletter(e.target.checked)}
                className="w-4 h-4 rounded-md border-border-default text-text-primary focus:ring-text-primary cursor-pointer accent-text-primary"
              />
              <span className="text-xs font-sans text-text-primary">
                Langganan Newsletter Informasi & Event Komunitas Panggung Kreator
              </span>
            </label>
          </div> */}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-4 border-t border-border-default/60">
          <button
            type="button"
            onClick={handleResetForm}
            disabled={!isDirty || isLoading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <RotateCcw size={13} />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer bg-text-primary text-bg-card hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
