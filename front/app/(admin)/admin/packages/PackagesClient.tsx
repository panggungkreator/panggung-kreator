"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, GripVertical, Loader2, Star } from "lucide-react";
import { deletePackageAction, updatePackagesOrderAction, setDefaultPackageAction } from "@/lib/actions/package-actions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface PackagesClientProps {
  initialPackages: any[];
}

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
  const [packages, setPackages] = useState<any[]>(initialPackages);
  const [isMounted, setIsMounted] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state with props when data changes on server
  useEffect(() => {
    setPackages(initialPackages);
  }, [initialPackages]);

  const handleSetDefault = async (id: string) => {
    // Optimistic UI
    setPackages(packages.map(p => ({ ...p, is_default: p.id === id })));
    const { success, error } = await setDefaultPackageAction(id);
    if (!success) {
      alert("Gagal mengatur default: " + error);
      // It's hard to revert precisely without refetching, but let's just alert.
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus paket "${name}"?`)) {
      const { success, error } = await deletePackageAction(id);
      if (success) {
        setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      } else {
        alert(error || "Gagal menghapus paket");
      }
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Optimistic UI update
    const newPackages = Array.from(packages);
    const [reorderedItem] = newPackages.splice(sourceIndex, 1);
    newPackages.splice(destinationIndex, 0, reorderedItem);

    // Update local order_index values
    const orderedPackages = newPackages.map((pkg, index) => ({
      ...pkg,
      order_index: index + 1
    }));

    setPackages(orderedPackages);
    setIsUpdatingOrder(true);

    // Save to database
    const payload = orderedPackages.map(pkg => ({
      id: pkg.id,
      order_index: pkg.order_index
    }));

    const { success, error } = await updatePackagesOrderAction(payload);

    setIsUpdatingOrder(false);
    if (!success) {
      alert("Gagal memperbarui urutan paket: " + error);
      // Revert if failed
      setPackages(packages);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-8 text-zinc-800 dark:text-zinc-200">

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5 bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Data Paket (Pricing)</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs">Geser (Drag & Drop) untuk mengatur urutan paket di Landing Page</p>
          </div>
          {isUpdatingOrder && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Menyimpan urutan...
            </div>
          )}
        </div>
        <Link
          href="/admin/packages/create"
          className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc/90 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden flex-1 border border-zinc-200/70 dark:border-zinc-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 text-xs font-semibold">
                <th className="py-4 px-6 border-b border-r border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Urutan</th>
                <th className="py-4 px-6 border-b border-r border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Nama Paket</th>
                <th className="py-4 px-6 border-b border-r border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Harga</th>
                <th className="py-4 px-6 border-b border-r border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Status</th>
                <th className="py-4 px-6 border-b border-r border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Default</th>
                <th className="py-4 px-6 text-center border-b border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">Aksi</th>
              </tr>
            </thead>
            {isMounted ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="packages-table">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                      {packages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                            Belum ada data paket.
                          </td>
                        </tr>
                      ) : (
                        packages.map((pkg, index) => {
                          const isLastRow = index === packages.length - 1;
                          const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-zinc-100 dark:border-zinc-800/40 last:border-r-0 py-4 px-6 bg-white dark:bg-zinc-900/40`;

                          return (
                            <Draggable key={pkg.id} draggableId={pkg.id} index={index}>
                              {(provided, snapshot) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors group ${snapshot.isDragging ? 'shadow-xl shadow-red-500/10 z-50 relative' : ''}`}
                                >
                                  <td className={`${cellBorderClass} font-bold text-zinc-900 dark:text-white`}>
                                    <div className="flex items-center gap-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 -ml-2"
                                        title="Geser untuk mengatur urutan"
                                      >
                                        <GripVertical size={16} />
                                      </div>
                                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </td>
                                  <td className={cellBorderClass}>
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{pkg.name}</div>
                                    {pkg.subtitle && <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{pkg.subtitle}</div>}
                                  </td>
                                  <td className={cellBorderClass}>
                                    <div className="font-bold text-[#bc151b] text-sm">{pkg.price}</div>
                                    {pkg.original_price && <div className="text-xs text-zinc-400 dark:text-zinc-500 line-through mt-0.5">{pkg.original_price}</div>}
                                  </td>
                                  <td className={cellBorderClass}>
                                    {pkg.is_highlighted ? (
                                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200/20">
                                        Highlight
                                      </span>
                                    ) : (
                                      <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200/30">
                                        Reguler
                                      </span>
                                    )}
                                  </td>
                                  <td className={cellBorderClass}>
                                    {pkg.is_default ? (
                                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200/20 inline-flex items-center gap-1">
                                        Default
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleSetDefault(pkg.id)}
                                        className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-full transition-colors cursor-pointer"
                                      >
                                        Jadikan Default
                                      </button>
                                    )}
                                  </td>
                                  <td className={cellBorderClass}>
                                    <div className="flex items-center justify-center gap-2">
                                      <Link
                                        href={`/admin/packages/${pkg.id}/edit`}
                                        className="p-2 text-[#15803d] bg-[#dcfce7] dark:bg-emerald-950/30 hover:bg-[#bbf7d0] dark:hover:bg-emerald-950/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                        title="Edit Paket"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                      <button
                                        onClick={() => handleDelete(pkg.id, pkg.name)}
                                        className="p-2 text-[#b91c1c] bg-[#fee2e2] dark:bg-red-950/30 hover:bg-[#fecaca] dark:hover:bg-red-950/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                        title="Hapus Paket"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    Memuat data...
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
