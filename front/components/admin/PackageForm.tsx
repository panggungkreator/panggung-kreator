"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Link from "next/link";
import { createPackageAction, updatePackageAction } from "@/lib/actions/package-actions";

const formatRupiah = (value: string) => {
  const numberString = value.replace(/\D/g, "");
  if (!numberString) return "";
  const formattedNumber = new Intl.NumberFormat("id-ID").format(parseInt(numberString, 10));
  return `Rp ${formattedNumber}`;
};

export default function PackageForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    subtitle: initialData?.subtitle || "",
    price: initialData?.price ? formatRupiah(String(initialData.price)) : "",
    original_price: initialData?.original_price ? formatRupiah(String(initialData.original_price)) : "",
    is_highlighted: initialData?.is_highlighted || false,
    cta_text: initialData?.cta_text || "DAFTAR SEKARANG",
    order_index: initialData?.order_index || 1,
  });

  const [benefits, setBenefits] = useState<Array<{ text: string; isIncluded: boolean }>>(
    initialData?.benefits || []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    if (name === "price" || name === "original_price") {
      processedValue = formatRupiah(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : processedValue,
    }));
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, { text: "", isIncluded: false }]);
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = [...benefits];
    newBenefits.splice(index, 1);
    setBenefits(newBenefits);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBenefits = [...benefits];
    const temp = newBenefits[index];
    newBenefits[index] = newBenefits[index - 1];
    newBenefits[index - 1] = temp;
    setBenefits(newBenefits);
  };

  const handleMoveDown = (index: number) => {
    if (index === benefits.length - 1) return;
    const newBenefits = [...benefits];
    const temp = newBenefits[index];
    newBenefits[index] = newBenefits[index + 1];
    newBenefits[index + 1] = temp;
    setBenefits(newBenefits);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newBenefits = Array.from(benefits);
    const [reorderedItem] = newBenefits.splice(result.source.index, 1);
    newBenefits.splice(result.destination.index, 0, reorderedItem);
    setBenefits(newBenefits);
  };

  const handleBenefitChange = (index: number, key: string, value: any) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { ...newBenefits[index], [key]: value };
    setBenefits(newBenefits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      benefits,
    };

    let success, error;
    if (initialData?.id) {
      const res = await updatePackageAction(initialData.id, payload);
      success = res.success;
      error = res.error;
    } else {
      const res = await createPackageAction(payload);
      success = res.success;
      error = res.error;
    }

    setIsSubmitting(false);

    if (success) {
      router.push("/admin/packages");
    } else {
      alert(error || "Terjadi kesalahan saat menyimpan paket.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border-default/60">
        <Link
          href="/admin/packages"
          className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors shrink-0 cursor-pointer"
          title="Kembali ke Daftar Paket"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ PENGATURAN PAKET PRICING ]
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            {initialData ? "Edit Paket Harga" : "Tambah Paket Baru"}
          </h1>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-transparent sm:bg-bg-card border-0 sm:border border-border-default/70 p-1 sm:p-8 rounded-none sm:rounded-3xl shadow-none sm:shadow-xs space-y-8">
        {/* Section 1: Informasi Utama */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/40">
            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-text-primary flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Informasi Utama Paket
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Nama Paket <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Misal: Basic, Regular, Priority"
                className="w-full h-10 px-3.5 bg-bg-well/50 border border-border-default rounded-xl focus:outline-none focus:border-text-primary text-xs font-medium text-text-primary placeholder:text-text-muted transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Deskripsi / Subtitle (Opsional)
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Misal: Bayar sekali, akses selamanya untuk komunitas"
                rows={2}
                className="w-full p-3 bg-bg-well/50 border border-border-default rounded-xl focus:outline-none focus:border-text-primary text-xs font-medium text-text-primary placeholder:text-text-muted resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                  Harga Promo / Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Rp 349.000"
                  className="w-full h-10 px-3.5 bg-bg-well/50 border border-border-default rounded-xl focus:outline-none focus:border-text-primary text-xs font-medium text-text-primary placeholder:text-text-muted transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                  Harga Coret / Asli (Opsional)
                </label>
                <input
                  type="text"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  placeholder="Rp 599.000"
                  className="w-full h-10 px-3.5 bg-bg-well/50 border border-border-default rounded-xl focus:outline-none focus:border-text-primary text-xs font-medium text-text-primary placeholder:text-text-muted transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Teks Tombol CTA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cta_text"
                required
                value={formData.cta_text}
                onChange={handleChange}
                placeholder="DAFTAR SEKARANG"
                className="w-full h-10 px-3.5 bg-bg-well/50 border border-border-default rounded-xl focus:outline-none focus:border-text-primary text-xs font-medium text-text-primary placeholder:text-text-muted uppercase transition-all"
              />
            </div>

            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
              <input
                type="checkbox"
                id="is_highlighted"
                name="is_highlighted"
                checked={formData.is_highlighted}
                onChange={handleChange}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="is_highlighted" className="text-xs font-semibold text-amber-700 dark:text-amber-400 cursor-pointer select-none">
                Highlight Paket Ini? (Tampil lebih menonjol di Landing Page)
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Daftar Benefit */}
        <div className="space-y-4 pt-4 border-t border-border-default/40">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/40">
            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-text-primary flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Daftar Benefit & Fasilitas
            </h2>
          </div>

          {isMounted && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="benefits-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2.5"
                  >
                    {benefits.map((benefit, index) => (
                      <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 bg-bg-well/40 border ${
                              snapshot.isDragging ? 'border-zinc-400 dark:border-zinc-500 shadow-lg' : 'border-border-default/70'
                            } p-3 rounded-xl group relative transition-all`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1 shrink-0"
                              title="Geser untuk mengatur urutan"
                            >
                              <GripVertical size={16} />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="checkbox"
                                checked={benefit.isIncluded}
                                onChange={(e) => handleBenefitChange(index, "isIncluded", e.target.checked)}
                                className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                title="Centang jika materi/benefit ini didapatkan"
                              />
                            </div>

                            <div className="flex-1">
                              <input
                                type="text"
                                value={benefit.text}
                                onChange={(e) => handleBenefitChange(index, "text", e.target.value)}
                                placeholder="Nama fasilitas / materi benefit..."
                                className="w-full bg-transparent border-none focus:outline-none text-xs font-medium text-text-primary placeholder:text-text-muted"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveBenefit(index)}
                              className="text-red-500 opacity-60 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-opacity shrink-0 cursor-pointer"
                              title="Hapus benefit ini"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {benefits.length === 0 && (
            <div className="text-center text-xs text-text-muted py-8 border border-dashed border-border-default rounded-xl bg-bg-well/30">
              Belum ada benefit. Klik "+ Tambah Benefit" di bawah untuk menambahkan fasilitas paket.
            </div>
          )}

          <button
            type="button"
            onClick={handleAddBenefit}
            className="w-full py-2.5 border border-dashed border-border-default text-xs text-text-secondary hover:text-text-primary hover:border-text-primary hover:bg-bg-well/50 rounded-xl font-bold flex justify-center items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Benefit</span>
          </button>
        </div>

        {/* Action Button Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-default/60">
          <Link
            href="/admin/packages"
            className="h-10 px-5 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors flex items-center justify-center cursor-pointer"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <Save size={15} />
                <span>Simpan Paket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
