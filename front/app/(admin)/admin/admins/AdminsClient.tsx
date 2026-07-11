"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { COLOR_RANGERS, ColorRangerSlug, colorRangerStyle } from "@/lib/constants";
import { deleteAdminAction } from "@/lib/actions/admin-actions";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { toast } from "sonner";
import {
  User,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ShieldAlert,
  Loader2
} from "lucide-react";

interface AdminUser {
  id: string;
  memberId: string;
  name: string;
  email: string;
  whatsappNumber: string;
  label: string;
  color: string;
  status: "pending" | "active" | "revoked";
  created_at: string;
}

interface AdminsClientProps {
  initialAdmins: AdminUser[];
}

export default function AdminsClient({ initialAdmins }: AdminsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    const { id } = adminToDelete;
    setAdminToDelete(null);

    setDeletingId(id);
    setIsLoading(true);
    try {
      const res = await deleteAdminAction(id);
      if (!res.success) throw new Error(res.error);

      toast.success("Admin berhasil dihapus secara permanen!");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus admin: " + err.message);
    } finally {
      setIsLoading(false);
      setDeletingId(null);
    }
  };

  // Filtered dataset
  const filteredAdmins = useMemo(() => {
    return initialAdmins.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.whatsappNumber.includes(search);

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesColor = colorFilter === "all" || a.color === colorFilter;

      return matchesSearch && matchesStatus && matchesColor;
    });
  }, [initialAdmins, search, statusFilter, colorFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200/30">
            <CheckCircle2 size={10} /> Active
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/30">
            <Clock size={10} /> Pending
          </span>
        );
      case "revoked":
        return (
          <span className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-200/30">
            <XCircle size={10} /> Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ SYSTEM ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Kelola Admin & Hak Akses
          </h1>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 py-2">
        <div className="flex-1 max-w-md">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4 " />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau no WA..."
              className="bg-bg-well border border-gray-400 rounded-full py-2.5 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid Boxed Table of Admins */}
      <div className="bg-bg-card border border-border-default rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-600 dark:text-zinc-400 font-semibold bg-bg-well/30">
                <th className="py-4 px-6 border-b border-border-default/70">Nama</th>
                <th className="py-4 px-6 border-b border-border-default/70">Label Jabatan</th>
                <th className="py-4 px-6 border-b border-border-default/70">Email</th>
                <th className="py-4 px-6 border-b border-border-default/70">Color Ranger</th>
                <th className="py-4 px-6 border-b border-border-default/70">Status</th>
                <th className="py-4 px-6 border-b border-border-default/70">Terdaftar</th>
                <th className="py-4 px-6 border-b border-border-default/70 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data admin ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((adm) => {
                  const style = colorRangerStyle(adm.color as ColorRangerSlug);
                  const colorLabel = COLOR_RANGERS[adm.color as ColorRangerSlug]?.label || adm.color;

                  return (
                    <tr
                      key={adm.id}
                      className="hover:bg-bg-well/20 transition-colors group border-b border-border-default last:border-b-0"
                    >
                      <td className="py-4 px-6 font-bold text-text-primary">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <User size={12} className="text-text-secondary" />
                            <span>{adm.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">
                        {adm.label}
                      </td>
                      <td className="py-4 px-6 text-text-secondary font-medium">
                        {adm.email}
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        <span
                          className="inline-block text-[9px] font-bold px-2 py-0.5 rounded border max-w-fit uppercase tracking-wider"
                          style={style}
                        >
                          {colorLabel}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(adm.status)}
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {formatDate(adm.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/admins/${adm.id}`)}
                            className={`p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold transition-all`}
                            title="Atur Hak Akses & Detail"
                          >
                            <Eye size={13} />
                            <span>{adm.status === "pending" ? "Review" : "Detail"}</span>
                          </button>

                          <button
                            onClick={() => setAdminToDelete({ id: adm.id, name: adm.name })}
                            className="p-1.5 text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-lg cursor-pointer transition-all flex items-center justify-center min-w-[28px] min-h-[28px]"
                            title="Hapus Admin Permanen"
                            disabled={isLoading || deletingId === adm.id}
                          >
                            {deletingId === adm.id ? (
                              <Loader2 size={13} className="animate-spin text-rose-600 group-hover:text-white" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={!!adminToDelete}
        onOpenChange={(open) => !open && setAdminToDelete(null)}
        title="Hapus Admin"
        description={
          <>
            Apakah Anda yakin ingin menghapus data admin &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{adminToDelete?.name}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-500 font-bold">
              Seluruh hak akses privilege, data member, dan akun loginnya di Supabase Auth akan dibersihkan secara otomatis. Tindakan ini tidak dapat dibatalkan.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
