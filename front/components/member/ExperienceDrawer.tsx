"use client";

import React, { useState, useEffect } from "react";
import { MemberExperience } from "@/lib/types/member";
import { Modal } from "@/components/ui/Modal";
import { DateBirthLine } from "@/components/ui/style-line/DateBirthLine";
import { useModalValidation, FieldError } from "@/hooks/useModalValidation";
import { toast } from "sonner";
import { Briefcase, Building, MapPin, Loader2 } from "lucide-react";

type ExperienceFields = "role" | "institution" | "startDate" | "endDate";

interface ExperienceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: MemberExperience | null;
  onSuccess: (saved: MemberExperience) => void;
}

export default function ExperienceDrawer({
  isOpen,
  onClose,
  experienceToEdit,
  onSuccess,
}: ExperienceDrawerProps) {
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    errors,
    validate,
    clearError,
    resetErrors,
    getInputClassName,
    createChangeHandler,
  } = useModalValidation<ExperienceFields>();

  useEffect(() => {
    if (isOpen) {
      resetErrors();
      if (experienceToEdit) {
        setRole(experienceToEdit.role || "");
        setInstitution(experienceToEdit.institution || "");
        setLocation(experienceToEdit.location || "");
        setStartDate(experienceToEdit.start_date || "");
        setEndDate(experienceToEdit.end_date || "");
        setIsCurrent(experienceToEdit.is_current || false);
        setDescription(experienceToEdit.description || "");
      } else {
        setRole("");
        setInstitution("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setIsCurrent(false);
        setDescription("");
      }
    }
  }, [isOpen, experienceToEdit, resetErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate({
      role: { value: role, required: "Peran / posisi wajib diisi." },
      institution: { value: institution, required: "Nama acara / instansi wajib diisi." },
      startDate: { value: startDate, required: "Tanggal mulai wajib dipilih." },
      endDate: {
        value: endDate,
        custom: (val) =>
          !isCurrent && val && startDate && val < startDate
            ? "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
            : null,
      },
    });

    if (!isValid) return;

    setIsLoading(true);
    try {
      const isEditing = !!experienceToEdit;
      const url = isEditing
        ? `/api/member/experience/${experienceToEdit.id}`
        : "/api/member/experience";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        role: role.trim(),
        institution: institution.trim(),
        location: location.trim() || null,
        start_date: startDate,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
        description: description.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || json.error || "Gagal menyimpan pengalaman.");
      }

      const { data } = await res.json();
      toast.success(
        isEditing
          ? "Pengalaman berhasil diperbarui."
          : "Pengalaman baru berhasil ditambahkan."
      );
      onSuccess(data);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<Briefcase className="w-5 h-5 text-text-primary" />}
      title={experienceToEdit ? "Edit Jam Terbang" : "Tambah Jam Terbang"}
      subtitle={
        experienceToEdit
          ? "Perbarui rincian riwayat peran atau acara yang pernah Anda tangani."
          : "Catat riwayat acara, panggung, atau pengalaman profesional Anda."
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="experience-form"
            disabled={isLoading}
            className="px-5 py-2.5 bg-text-primary text-bg-page hover:opacity-90 font-medium text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{experienceToEdit ? "Simpan Perubahan" : "Simpan Jam Terbang"}</span>
          </button>
        </div>
      }
    >
      <form id="experience-form" noValidate onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Role / Posisi */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Peran / Posisi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={createChangeHandler("role", setRole)}
            placeholder="Misal: Master of Ceremony, Moderator, Keynote Speaker..."
            className={getInputClassName("role")}
          />
          <FieldError error={errors.role} />
        </div>

        {/* Institution / Event / Company */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Nama Acara / Instansi / Klien <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              value={institution}
              onChange={createChangeHandler("institution", setInstitution)}
              placeholder="Misal: Youth Innovation Summit 2024 / Kemendikbud..."
              className={getInputClassName(
                "institution",
                "w-full bg-bg-well/60 border py-2 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
              )}
            />
          </div>
          <FieldError error={errors.institution} />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Lokasi (Opsional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Misal: Jakarta Convention Center / Hybrid / Online"
              className="w-full bg-bg-well/60 border border-border-default py-2 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
        </div>

        {/* Time Period */}
        <div className="pt-2 border-t border-border-default/60 space-y-3">
          <span className="block text-xs font-medium text-text-secondary">
            Periode Waktu <span className="text-red-500">*</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <DateBirthLine
                value={startDate}
                onChange={(val) => {
                  setStartDate(val);
                  clearError("startDate");
                  if (endDate && val > endDate) {
                    setEndDate(val);
                  }
                }}
                error={errors.startDate}
                placeholder="Pilih Tanggal Mulai"
                title="PILIH TANGGAL MULAI"
                variant="box"
                maxDate={endDate || undefined}
                allowFuture={true}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Tanggal Selesai {!isCurrent && <span className="text-text-tertiary font-normal">(Opsional)</span>}
              </label>
              <DateBirthLine
                value={isCurrent ? "" : endDate}
                onChange={(val) => {
                  setEndDate(val);
                  clearError("endDate");
                  if (startDate && val < startDate) {
                    setStartDate(val);
                  }
                }}
                error={errors.endDate}
                placeholder={isCurrent ? "Sedang Berlangsung" : "Pilih Tanggal Selesai"}
                title="PILIH TANGGAL SELESAI"
                variant="box"
                minDate={startDate || undefined}
                allowFuture={true}
                disabled={isCurrent}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border-default/70 bg-bg-well/30 hover:bg-bg-well/60 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) setEndDate("");
              }}
              className="w-4 h-4 accent-text-primary rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-medium text-text-primary">Masih Berlangsung</span>
              <span className="text-text-tertiary ml-1.5">(Peran atau posisi aktif saat ini)</span>
            </div>
          </label>
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-border-default/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-secondary">
              Deskripsi Tugas & Pencapaian (Opsional)
            </label>
            <span className="text-[10px] text-text-tertiary font-mono">
              {description.length}/500
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Jelaskan peran Anda, skala audiens, atau pencapaian kunci dari kegiatan ini..."
            className="w-full bg-bg-well/60 border border-border-default p-3 text-xs rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none leading-relaxed"
          />
        </div>
      </form>
    </Modal>
  );
}
