"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { COLOR_RANGERS, ColorRangerSlug, colorRangerStyle } from "@/lib/constants";
import { saveAdminPermissionsAction, approveAdminAction } from "@/lib/actions/admin-actions";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Compass,
  Globe,
  Shield,
  CheckCircle,
  Loader2,
  Lock,
  Save,
  CheckSquare,
  XCircle
} from "lucide-react";

interface AdminDetailClientProps {
  admin: {
    id: string;
    label: string | null;
    color: string;
    status: "pending" | "active" | "revoked";
    created_at: string;
    members: {
      id: string;
      full_name: string;
      email: string;
      whatsapp_number: string;
      instagram_username: string | null;
      tiktok_username: string | null;
      occupation: string;
    };
  };
  groups: {
    id: string;
    name: string;
    slug: string;
  }[];
  items: {
    id: string;
    group_id: string;
    name: string;
    slug: string;
    available_actions: string[];
  }[];
  actions: {
    id: string;
    name: string;
    slug: string;
  }[];
  initialPermissions: {
    privilege_item_id: string;
    action_id: string;
  }[];
}

export default function AdminDetailClient({
  admin,
  groups,
  items,
  actions,
  initialPermissions
}: AdminDetailClientProps) {
  const router = useRouter();

  // Component States
  const [label, setLabel] = useState(admin.label || "");
  const [permissions, setPermissions] = useState<string[]>(
    initialPermissions.map(p => `${p.privilege_item_id}:${p.action_id}`)
  );

  // Loading & Action States
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [status, setStatus] = useState(admin.status);

  // Custom Confirmation Dialog States
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);

  // Group items by group_id
  const itemsByGroup = React.useMemo(() => {
    const map: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!map[item.group_id]) {
        map[item.group_id] = [];
      }
      map[item.group_id].push(item);
    });
    return map;
  }, [items]);

  const handleCheckboxChange = (itemId: string, actionId: string, checked: boolean) => {
    const key = `${itemId}:${actionId}`;
    if (checked) {
      setPermissions(prev => [...prev, key]);
    } else {
      setPermissions(prev => prev.filter(k => k !== key));
    }
  };

  const handleSavePermissions = () => {
    setIsSaveConfirmOpen(true);
  };

  const executeSavePermissions = async () => {
    setIsSaving(true);
    try {
      const rows = permissions.map(p => {
        const [privilege_item_id, action_id] = p.split(":");
        return { privilege_item_id, action_id };
      });

      const res = await saveAdminPermissionsAction(admin.id, rows);
      if (res.success) {
        toast.success("Hak akses permission berhasil disimpan.");
        router.push("/admin/admins");
        router.refresh();
      } else {
        toast.error("Gagal menyimpan permission: " + res.error);
      }
    } catch (err: any) {
      toast.error("Kesalahan koneksi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAdmin = () => {
    if (!label.trim()) {
      toast.warning("Silakan isi Label Jabatan admin terlebih dahulu!");
      return;
    }
    setIsApproveConfirmOpen(true);
  };

  const executeApproveAdmin = async () => {
    setIsApproving(true);
    try {
      // 1. Simpan label jabatan dan approve
      const res = await approveAdminAction(admin.id, label.trim());
      if (res.success) {
        // 2. Simpan juga permissions yang sedang dicentang
        const rows = permissions.map(p => {
          const [privilege_item_id, action_id] = p.split(":");
          return { privilege_item_id, action_id };
        });

        await saveAdminPermissionsAction(admin.id, rows);

        toast.success("Admin berhasil disetujui & email kredensial login telah dikirim!");
        setStatus("active");

        // Redirect ke list page admins
        router.push("/admin/admins");
        router.refresh();
      } else {
        toast.error("Gagal menyetujui admin: " + res.error);
      }
    } catch (err: any) {
      toast.error("Kesalahan koneksi: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  // Color theme helpers
  const styleColor = colorRangerStyle(admin.color as ColorRangerSlug);
  const colorLabel = COLOR_RANGERS[admin.color as ColorRangerSlug]?.label || admin.color;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/admins"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Admin</span>
        </Link>
      </div>

      {/* Main Grid: Info Profile & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase" style={styleColor}>
                {colorLabel}
              </span>
              <h2 className="text-xl font-bold text-text-primary mt-2">{admin.members.full_name}</h2>
              <p className="text-xs text-text-muted mt-0.5">Identitas & Profil Calon Admin</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center">
              {status === "active" && (
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Active
                </span>
              )}
              {status === "pending" && (
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Lock size={12} /> Pending Review
                </span>
              )}
              {status === "revoked" && (
                <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <XCircle size={12} /> Access Revoked
                </span>
              )}
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Email</span>
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Mail size={13} className="text-text-secondary" />
                <span>{admin.members.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Nomor WhatsApp</span>
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Phone size={13} className="text-text-secondary" />
                <span>{admin.members.whatsapp_number}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Profesi</span>
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Compass size={13} className="text-text-secondary" />
                <span className="capitalize">{admin.members.occupation.replace("_", " ")}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Media Sosial</span>
              <div className="flex items-center gap-3 text-text-primary font-medium">
                {admin.members.instagram_username && (
                  <span className="flex items-center gap-1">
                    <Globe size={13} className="text-text-secondary" />
                    <span>@{admin.members.instagram_username}</span>
                  </span>
                )}
                {admin.members.tiktok_username && (
                  <span className="flex items-center gap-1">
                    <span className="text-xs font-bold">T</span>
                    <span>@{admin.members.tiktok_username}</span>
                  </span>
                )}
                {!admin.members.instagram_username && !admin.members.tiktok_username && (
                  <span>-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-text-muted">Approval & Jabatan</h3>

            {/* Label Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Label Jabatan (Contoh: Tim Konten)</label>
              <input
                type="text"
                placeholder="Masukkan jabatan admin..."
                value={label}
                onChange={e => setLabel(e.target.value)}
                disabled={status === "revoked" || isApproving}
                className="w-full bg-bg-well border border-gray-400 focus:border-text-primary rounded-xl mt-3 px-4 py-2.5 text-xs text-text-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-4">
            {status === "pending" && (
              <button
                onClick={handleApproveAdmin}
                disabled={isApproving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Menyetujui...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={13} />
                    <span>Approve & Kirim Akses</span>
                  </>
                )}
              </button>
            )}

            {status === "active" && (
              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Simpan Permission</span>
                  </>
                )}
              </button>
            )}

            {status === "revoked" && (
              <div className="p-3 text-center text-xs text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20 font-semibold">
                Akses admin ini telah dicabut permanen.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-bg-card border border-border-default rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-default">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Shield size={15} className="text-violet-500" />
            <span>Matriks Hak Akses Per Halaman (Dynamic RBAC)</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Tentukan halaman mana saja yang bisa diakses dan aksi (CRUD) yang diizinkan untuk admin ini.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {groups.map(group => {
            const groupItems = itemsByGroup[group.id] || [];
            if (groupItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-3">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider bg-bg-well px-3 py-1.5 rounded-lg w-max">
                  {group.name}
                </h4>

                <div className="border border-border-default/70 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-well/20 text-text-secondary font-semibold border-b border-border-default">
                        <th className="py-3.5 px-5">Halaman / Modul</th>
                        {actions.map(act => (
                          <th key={act.id} className="py-3.5 px-5 text-center w-24">
                            {act.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupItems.map(item => (
                        <tr key={item.id} className="border-b border-border-default/40 last:border-b-0 hover:bg-bg-well/10 transition-colors">
                          <td className="py-3 px-5 font-bold text-text-primary">
                            {item.name}
                          </td>
                          {actions.map(act => {
                            const isAvailable = item.available_actions.includes(act.id);
                            const key = `${item.id}:${act.id}`;
                            const isChecked = permissions.includes(key);

                            return (
                              <td key={act.id} className="py-3 px-5 text-center">
                                {isAvailable ? (
                                  <div className="flex justify-center items-center">
                                    <Checkbox
                                      checked={isChecked}
                                      disabled={status === "revoked" || isSaving || isApproving}
                                      onCheckedChange={checked => handleCheckboxChange(item.id, act.id, !!checked)}
                                      className="cursor-pointer border-gray-400 data-[state=checked]:bg-violet-650 data-[state=checked]:border-violet-650 focus-visible:ring-violet-500"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-text-muted font-medium">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isSaveConfirmOpen}
        onOpenChange={setIsSaveConfirmOpen}
        title="Simpan Perubahan Hak Akses"
        description={
          <>
            Apakah Anda yakin ingin menyimpan perubahan hak akses untuk admin &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-violet-500 decoration-2">{admin.members.full_name}</span>&rdquo;?
            <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-500 font-bold">
              Perubahan akan segera berlaku setelah disimpan.
            </p>
          </>
        }
        confirmLabel="Simpan"
        confirmClassName="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-750 rounded-full cursor-pointer h-auto border-0 shadow-sm"
        onConfirm={executeSavePermissions}
      />

      <DeleteConfirmDialog
        isOpen={isApproveConfirmOpen}
        onOpenChange={setIsApproveConfirmOpen}
        title="Setujui Pendaftaran Admin"
        description={
          <>
            Setujui pendaftaran admin &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-green-500 decoration-2">{admin.members.full_name}</span>&rdquo; dengan jabatan &ldquo;<span className="font-bold">{label}</span>&rdquo;?
            <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-500 font-bold">
              Kredensial login (username & password) akan langsung dibuat dan dikirim ke email tujuan secara otomatis.
            </p>
          </>
        }
        confirmLabel="Setujui"
        confirmClassName="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 rounded-full cursor-pointer h-auto border-0 shadow-sm"
        onConfirm={executeApproveAdmin}
      />

    </div>
  );
}
