"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Link from "next/link";
import { createPackageAction, updatePackageAction } from "@/lib/actions/package-actions";

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
    price: initialData?.price || "",
    original_price: initialData?.original_price || "",
    is_highlighted: initialData?.is_highlighted || false,
    cta_text: initialData?.cta_text || "DAFTAR SEKARANG",
    order_index: initialData?.order_index || 1,
  });

  const [benefits, setBenefits] = useState<Array<{ text: string; isIncluded: boolean }>>(
    initialData?.benefits || []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/packages"
          className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {initialData ? "Edit Paket" : "Tambah Paket Baru"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Konfigurasi harga dan benefit untuk landing page</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 md:p-8 rounded-2xl shadow-sm">
        <div className="space-y-8">
          {/* Bagian Atas: Informasi Dasar */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-[#bc151b] flex items-center justify-center font-bold text-sm">1</div>
              Informasi Utama
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nama Paket <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Misal: Basic, Advanced"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bc151b]/50 text-zinc-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Deskripsi / Subtitle (Opsional)
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Misal: Bayar sekali, untuk selamanya"
                  rows={2}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bc151b]/50 text-zinc-900 dark:text-white resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Harga Promo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Rp 349.000"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bc151b]/50 text-zinc-900 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Harga Coret (Asli)
                  </label>
                  <input
                    type="text"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    placeholder="Rp 599.000"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bc151b]/50 text-zinc-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Teks Tombol (CTA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cta_text"
                    required
                    value={formData.cta_text}
                    onChange={handleChange}
                    placeholder="JOIN SEKARANG"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bc151b]/50 text-zinc-900 dark:text-white uppercase transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 p-5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <input
                  type="checkbox"
                  id="is_highlighted"
                  name="is_highlighted"
                  checked={formData.is_highlighted}
                  onChange={handleChange}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="is_highlighted" className="text-sm font-bold text-amber-800 dark:text-amber-400 cursor-pointer select-none">
                  Highlight Paket Ini? (Tampil di tengah, ukuran lebih besar, border merah)
                </label>
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-white/10 my-8" />

          {/* Bagian Bawah: Daftar Benefit */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-[#bc151b] flex items-center justify-center font-bold text-sm">2</div>
                Daftar Benefit
              </h2>
            </div>

            {isMounted && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="benefits-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {benefits.map((benefit, index) => (
                        <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-4 bg-zinc-50 dark:bg-[#2c2c2c] border ${snapshot.isDragging ? 'border-[#bc151b] shadow-lg shadow-red-500/10' : 'border-zinc-200 dark:border-white/10'} p-4 rounded-xl group relative transition-all hover:border-zinc-300 dark:hover:border-white/20`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 -ml-2 shrink-0"
                                title="Geser untuk mengatur urutan"
                              >
                                <GripVertical size={20} />
                              </div>

                              <div className="flex flex-col gap-1.5 items-center shrink-0">
                                <label className="text-[10px] text-zinc-400 font-bold uppercase text-center w-full">Dapat?</label>
                                <input
                                  type="checkbox"
                                  checked={benefit.isIncluded}
                                  onChange={(e) => handleBenefitChange(index, "isIncluded", e.target.checked)}
                                  className="w-5 h-5 accent-[#bc151b] cursor-pointer"
                                  title="Centang jika materi/benefit ini didapatkan"
                                />
                              </div>

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={benefit.text}
                                  onChange={(e) => handleBenefitChange(index, "text", e.target.value)}
                                  placeholder="Nama materi/benefit..."
                                  className="w-full bg-transparent border-none focus:outline-none text-base text-zinc-900 dark:text-white"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveBenefit(index)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-opacity shrink-0"
                                title="Hapus benefit ini"
                              >
                                <Trash2 size={18} />
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
              <div className="text-center text-sm text-zinc-500 py-10 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-[#2c2c2c]">
                Belum ada benefit. Klik "Tambah Benefit" untuk memulai.
              </div>
            )}

            <button
              type="button"
              onClick={handleAddBenefit}
              className="w-full py-4 mt-2 border-2 border-dashed border-zinc-200 dark:border-white/10 text-sm text-zinc-500 hover:text-[#bc151b] hover:border-[#bc151b]/50 hover:bg-red-50/50 dark:hover:bg-red-500/5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
            >
              <Plus size={18} /> Tambah Benefit
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#bc151b] hover:bg-[#bc151b]/90 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(188,21,27,0.3)]"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Menyimpan...</span>
          ) : (
            <>
              <Save size={20} />
              Simpan Paket
            </>
          )}
        </button>
      </div>
    </form>
  );
}
