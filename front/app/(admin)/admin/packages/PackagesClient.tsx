"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
  Star,
  CheckCircle,
  Package,
  Sparkles,
} from "lucide-react";
import { deletePackageAction, updatePackagesOrderAction, setDefaultPackageAction } from "@/lib/actions/package-actions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { toast } from "sonner";
import AdminPagination from "@/components/admin/AdminPagination";

interface PackagesClientProps {
  initialPackages: any[];
  paginationLimit?: number;
}

export default function PackagesClient({
  initialPackages,
  paginationLimit = 10,
}: PackagesClientProps) {
  const [packages, setPackages] = useState<any[]>(initialPackages);
  const [isMounted, setIsMounted] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<{ id: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;
  const totalPages = Math.max(1, Math.ceil(packages.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(packages.length, startIndex + limit);
  const paginatedPackages = useMemo(() => {
    return packages.slice(startIndex, endIndex);
  }, [packages, startIndex, endIndex]);

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
      toast.error("Gagal mengatur default: " + error);
    } else {
      toast.success("Paket default berhasil diperbarui.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    const { id, name } = packageToDelete;
    const { success, error } = await deletePackageAction(id);
    if (success) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      toast.success(`Paket "${name}" berhasil dihapus.`);
    } else {
      toast.error(error || "Gagal menghapus paket.");
    }
    setPackageToDelete(null);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const globalSourceIndex = startIndex + sourceIndex;
    const globalDestinationIndex = startIndex + destinationIndex;

    // Optimistic UI update
    const newPackages = Array.from(packages);
    const [reorderedItem] = newPackages.splice(globalSourceIndex, 1);
    newPackages.splice(globalDestinationIndex, 0, reorderedItem);

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
      toast.error("Gagal memperbarui urutan paket: " + error);
      // Revert if failed
      setPackages(packages);
    } else {
      toast.success("Urutan paket berhasil disimpan.");
    }
  };

  const defaultPackage = packages.find(p => p.is_default);
  const highlightedCount = packages.filter(p => p.is_highlighted).length;

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/60">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ DATA PAKET & PRICING ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Manajemen Paket Harga
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isUpdatingOrder && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Menyimpan urutan...</span>
            </div>
          )}
          <Link
            href="/admin/packages/create"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-xs cursor-pointer tracking-wider shrink-0"
          >
            <Plus size={14} />
            <span>Tambah Paket</span>
          </Link>
        </div>
      </div>

      {/* Horizontal Scrollable Capsule Pills for Summary Stats */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Pill 1: Total Paket */}
        <div className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] shadow-xs dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 select-none">
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span>Total Paket</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-[#0369a1] dark:text-sky-300 shadow-2xs">
            {packages.length}
          </span>
        </div>

        {/* Pill 2: Paket Highlight */}
        <div className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#fef9c3] text-[#854d0e] border border-[#fde047] shadow-xs dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800 select-none">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Highlight</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-[#854d0e] dark:text-yellow-300 shadow-2xs">
            {highlightedCount}
          </span>
        </div>

        {/* Pill 3: Paket Default */}
        <div className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#dcfce7] text-[#15803d] border border-[#86efac] shadow-xs dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 select-none">
          <Star className="w-3.5 h-3.5 shrink-0 fill-current" />
          <span>Default: {defaultPackage ? defaultPackage.name : "-"}</span>
        </div>
      </div>

      {/* Info Reorder Helper */}
      <p className="text-xs text-text-muted font-medium px-1">
        <span className="font-semibold text-text-secondary">Petunjuk:</span> Tarik dan lepas (Drag & Drop) baris untuk mengubah urutan tampilan paket di Landing Page.
      </p>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default/70 bg-bg-well/50">
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Urutan</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Nama Paket</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Harga</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Status</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Default</th>
                <th className="py-3.5 px-5 text-center uppercase tracking-wider font-bold">Aksi</th>
              </tr>
            </thead>
            {isMounted ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="packages-table">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-border-default/40">
                      {packages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-text-muted">
                            Belum ada data paket.
                          </td>
                        </tr>
                      ) : (
                        paginatedPackages.map((pkg, index) => (
                          <Draggable key={pkg.id} draggableId={pkg.id} index={index}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`hover:bg-bg-well/30 transition-colors group ${snapshot.isDragging ? 'shadow-xl shadow-red-500/10 z-50 bg-bg-well' : ''}`}
                              >
                                <td className="py-3.5 px-5 border-r border-border-default/40 font-bold text-text-primary">
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1 -ml-2"
                                      title="Geser untuk mengatur urutan"
                                    >
                                      <GripVertical size={16} />
                                    </div>
                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-bg-well text-xs font-bold text-text-secondary font-mono">
                                      {startIndex + index + 1}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-5 border-r border-border-default/40">
                                  <div>
                                    <div className="font-bold text-text-primary text-sm">{pkg.name}</div>
                                    {pkg.subtitle && <div className="text-[10px] text-text-muted font-medium mt-0.5">{pkg.subtitle}</div>}
                                  </div>
                                </td>
                                <td className="py-3.5 px-5 border-r border-border-default/40 font-bold text-text-primary">
                                  <div>{pkg.price}</div>
                                  {pkg.original_price && <div className="text-[10px] text-text-muted line-through font-normal">{pkg.original_price}</div>}
                                </td>
                                <td className="py-3.5 px-5 border-r border-border-default/40">
                                  {pkg.is_highlighted ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 uppercase tracking-wider">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                      Highlight
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-500/20 uppercase tracking-wider">
                                      Reguler
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 border-r border-border-default/40">
                                  {pkg.is_default ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <Star className="w-3 h-3 fill-current" />
                                      Default
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleSetDefault(pkg.id)}
                                      className="text-[10px] font-semibold text-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1 border border-dashed border-border-default rounded-full hover:border-emerald-500/50 transition-colors cursor-pointer"
                                    >
                                      Jadikan Default
                                    </button>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Link
                                      href={`/admin/packages/${pkg.id}/edit`}
                                      className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                      title="Edit Paket"
                                    >
                                      <Edit size={14} />
                                    </Link>
                                    <button
                                      onClick={() => setPackageToDelete({ id: pkg.id, name: pkg.name })}
                                      className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Hapus Paket"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-text-muted" />
                    Memuat data paket...
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS WITH DRAG & DROP (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden">
        {isMounted ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="packages-mobile-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3.5">
                  {packages.length === 0 ? (
                    <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">Belum ada data paket.</p>
                    </div>
                  ) : (
                    paginatedPackages.map((pkg, index) => (
                      <Draggable key={pkg.id} draggableId={pkg.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white dark:bg-[#121212] border border-border-default/70 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between ${snapshot.isDragging ? 'shadow-2xl border-zinc-400 dark:border-zinc-500 scale-[1.02] z-50' : ''
                              }`}
                          >
                            {/* Card Top: Order handle & Status Badges */}
                            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-default/40">
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-text-muted hover:text-text-primary p-1 -ml-1 cursor-grab active:cursor-grabbing rounded-lg bg-bg-well"
                                  title="Geser untuk mengatur urutan"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-bg-well text-[10px] font-bold font-mono text-text-secondary">
                                  #{startIndex + index + 1}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {pkg.is_highlighted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 uppercase tracking-wider">
                                    Highlight
                                  </span>
                                )}
                                {pkg.is_default ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    Default
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefault(pkg.id)}
                                    className="text-[10px] font-semibold text-text-muted hover:text-emerald-600 px-2.5 py-0.5 border border-dashed border-border-default rounded-full transition-colors cursor-pointer"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Card Middle: Name & Price */}
                            <div className="my-3">
                              <h3 className="text-base font-black tracking-tight text-text-primary leading-tight">
                                {pkg.name}
                              </h3>
                              {pkg.subtitle && (
                                <p className="text-xs text-text-secondary mt-0.5 font-medium">{pkg.subtitle}</p>
                              )}
                              <div className="mt-2.5 flex items-baseline gap-2">
                                <span className="text-lg font-black text-text-primary">{pkg.price}</span>
                                {pkg.original_price && (
                                  <span className="text-xs text-text-muted line-through font-medium">{pkg.original_price}</span>
                                )}
                              </div>
                            </div>

                            {/* Card Bottom: Actions */}
                            <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-text-muted font-medium">
                                Tombol CTA: <strong className="text-text-secondary font-mono">{pkg.cta_text || "DAFTAR"}</strong>
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Link
                                  href={`/admin/packages/${pkg.id}/edit`}
                                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                                  title="Edit Paket"
                                >
                                  <Edit size={13} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setPackageToDelete({ id: pkg.id, name: pkg.name })}
                                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                                  title="Hapus Paket"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="p-8 text-center text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-text-muted" />
            Memuat data paket...
          </div>
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={packages.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="paket"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Left Info Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400">
            <Package className="w-4 h-4 text-zinc-300" />
            <span className="font-semibold text-zinc-300">{packages.length} Paket</span>
          </div>

          {/* Right Action Button: Tambah Paket */}
          <Link
            href="/admin/packages/create"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Tambah Paket Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </Link>
        </div>
      </div>

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!packageToDelete}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Paket Harga"
        description={`Apakah Anda yakin ingin menghapus paket "${packageToDelete?.name}"? Paket ini tidak akan ditampilkan lagi pada landing page.`}
      />
    </div>
  );
}

