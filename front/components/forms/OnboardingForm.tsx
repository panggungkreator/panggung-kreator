"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, GraduationCap, Building2, User, UserCircle2, Star, MonitorPlay, Palette, PenTool, Hash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PillSelect } from "@/components/ui/PillSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { submitOnboardingData } from "@/lib/actions/checkout-actions";

const OCCUPATION_OPTIONS = [
  { label: "Mahasiswa / Pelajar", value: "Mahasiswa / Pelajar", icon: <GraduationCap size={18} /> },
  { label: "Karyawan / Profesional", value: "Karyawan / Profesional", icon: <Briefcase size={18} /> },
  { label: "Pengusaha / Founder", value: "Pengusaha / Founder", icon: <Building2 size={18} /> },
  { label: "Direktur / C-Level", value: "Direktur / C-Level", icon: <UserCircle2 size={18} /> },
  { label: "Kreator Konten", value: "Kreator Konten", icon: <MonitorPlay size={18} /> },
  { label: "Desainer / Seniman", value: "Desainer / Seniman", icon: <Palette size={18} /> },
  { label: "Penulis / Jurnalis", value: "Penulis / Jurnalis", icon: <PenTool size={18} /> },
  { label: "Influencer", value: "Influencer", icon: <Star size={18} /> },
  { label: "Lainnya", value: "Lainnya", icon: <Hash size={18} /> },
];

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    nickname: "",
    birthPlace: "",
    birthDate: "",
    whatsappNumber: "",
    instagramUsername: "",
    occupation: "",
    otherOccupation: "",
  });

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 0) {
      if (digits.startsWith("62")) {
        digits = "0" + digits.substring(2);
      } else if (!digits.startsWith("0")) {
        digits = "0" + digits;
      }
    }

    // Limit to max 13 digits
    digits = digits.slice(0, 13);

    // Format into 4-digit chunks separated by dash
    const chunks = [];
    for (let i = 0; i < digits.length; i += 4) {
      chunks.push(digits.slice(i, i + 4));
    }
    const formatted = chunks.join("-");

    updateForm("whatsappNumber", formatted);
  };

  const handleNext = async () => {
    setError("");
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      // Submit form
      setLoading(true);
      try {
        const finalOccupation =
          formData.occupation === "Lainnya" && formData.otherOccupation.trim() !== ""
            ? formData.otherOccupation
            : formData.occupation;

        const payload = {
          full_name: formData.fullName,
          stage_name: formData.nickname,
          birth_place: formData.birthPlace,
          birth_date: formData.birthDate,
          whatsapp_number: formData.whatsappNumber,
          instagram_username: formData.instagramUsername,
          occupation: finalOccupation,
        };

        const result = await submitOnboardingData(payload);
        if (result.success) {
          router.push("/dashboard");
        } else {
          setError(result.error || "Gagal menyimpan data. Silakan coba lagi.");
        }
      } catch (err) {
        setError("Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      setError("");
    }
  };

  const isStep1Valid = formData.fullName.trim() !== "" && formData.nickname.trim() !== "";

  const whatsappDigits = formData.whatsappNumber.replace(/\D/g, "");
  const isWhatsappValid = whatsappDigits.length >= 5 && whatsappDigits.length <= 13;
  const isStep2Valid = formData.birthPlace.trim() !== "" && formData.birthDate !== "" && isWhatsappValid;
  const isStep3Valid = formData.occupation !== "" &&
    (formData.occupation !== "Lainnya" || formData.otherOccupation.trim() !== "");

  const canProceed = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    return false;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Top Header & Progress */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className={`p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors ${step === 1 ? 'invisible' : 'visible'}`}
          >
            <ArrowLeft className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-gray-900" : "bg-gray-100"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-8 min-h-[400px]">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kenalan dulu yuk! 👋</h2>
              <p className="text-gray-500 text-sm">Beritahu kami nama lengkap dan nama panggilanmu.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <Input
                  placeholder="Misal: Budi Santoso"
                  value={formData.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan / Panggung</label>
                <Input
                  placeholder="Misal: Budi"
                  value={formData.nickname}
                  onChange={(e) => updateForm("nickname", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detail Kontak & Kelahiran</h2>
              <p className="text-gray-500 text-sm">Data ini membantu kami memberikan pengalaman yang lebih personal.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <Input
                    list="cities-datalist"
                    placeholder="Misal: Jakarta"
                    value={formData.birthPlace}
                    onChange={(e) => updateForm("birthPlace", e.target.value)}
                    autoFocus
                  />
                  <datalist id="cities-datalist">
                    <option value="Jakarta" />
                    <option value="Surabaya" />
                    <option value="Bandung" />
                    <option value="Medan" />
                    <option value="Semarang" />
                    <option value="Makassar" />
                    <option value="Palembang" />
                    <option value="Yogyakarta" />
                    <option value="Malang" />
                    <option value="Denpasar" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <DatePicker
                    value={formData.birthDate}
                    onChange={(val) => updateForm("birthDate", val)}
                    placeholder="Pilih tanggal lahir"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No Whatsapp</label>
                <Input
                  type="tel"
                  placeholder="Misal: 081234567890"
                  value={formData.whatsappNumber}
                  onChange={handleWhatsappChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ceritakan sedikit tentang kamu</h2>
              <p className="text-gray-500 text-sm">Apa kesibukan utamamu saat ini dan di mana kami bisa melihat karyamu?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Pekerjaan saat ini</label>
                <PillSelect
                  options={OCCUPATION_OPTIONS}
                  value={formData.occupation}
                  onChange={(val) => updateForm("occupation", val)}
                />

                {formData.occupation === "Lainnya" && (
                  <div className="mt-4 animate-in fade-in zoom-in-95 duration-200">
                    <Input
                      placeholder="Sebutkan pekerjaanmu..."
                      value={formData.otherOccupation}
                      onChange={(e) => updateForm("otherOccupation", e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username Instagram (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">@</span>
                  <Input
                    className="pl-8"
                    placeholder="username"
                    value={formData.instagramUsername}
                    onChange={(e) => updateForm("instagramUsername", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer & Actions */}
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-center rounded-b-3xl">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {loading ? (step === 3 ? "Sedang menyiapkan deskripsi tentang dirimu ..." : "Menyimpan...") : (step === 3 ? "Selesai" : "Lanjut")}
        </Button>
      </div>
    </div>
  );
}
