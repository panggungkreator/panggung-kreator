"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  Edit2,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Mail,
  Send,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { toast } from "sonner";
import { sendMemberCredentialsAction, deleteMemberAction } from "./actions";

type Member = {
  id: string;
  full_name: string;
  stage_name: string;
  whatsapp_number: string;
  email: string;
  instagram_username: string;
  tiktok_username: string;
  occupation: string;
  username: string;
  temporary_password?: string;
  membership_tier: string;
  community: string;
  created_at: string;
  tier_note?: string;
  role?: string;
  package_id?: string;
  package?: { id: string; name: string } | null;
  interests?: {
    primary_interests: string[];
    experience_level: string;
    goals: string[];
    ai_analysis?: string;
  };
};

interface MembersClientProps {
  initialMembers: Member[];
  packages?: any[];
}

const formatOccupation = (occupation: string | undefined) => {
  if (!occupation) return "-";

  const mapping: Record<string, string> = {
    "content_creator": "Content Creator",
    "student": "Mahasiswa / Pelajar",
    "employee": "Karyawan / Karyawati",
    "founder": "Pengusaha / Founder",
    "influencer": "Influencer",
    "other": "Lainnya"
  };

  const key = occupation.toLowerCase().trim();
  return mapping[key] || occupation;
};

const formatWhatsappLink = (phone: string | undefined, stageName: string | undefined, fullName: string | undefined) => {
  let cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }
  const name = stageName || fullName || "Kreator";
  const text = encodeURIComponent(
    `Halo Kak ${name}, salam kenal dari Panggung Kreator!`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
};

export default function MembersClient({ initialMembers, packages = [] }: MembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const packagesMap = useMemo(() => {
    const map = new Map<string, string>();
    (packages || []).forEach((pkg: any) => {
      if (pkg.id && pkg.name) {
        map.set(pkg.id, pkg.name);
      }
    });
    return map;
  }, [packages]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit status modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editCommunity, setEditCommunity] = useState<string>("panggung_kreator");
  const [editTier, setEditTier] = useState<string>("free");
  const [editNote, setEditNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Detail modal state
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  // Credential modal state
  const [isCredentialOpen, setIsCredentialOpen] = useState(false);
  const [credentialMember, setCredentialMember] = useState<Member | null>(null);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);

  // Delete modal state
  const [deleteModalMember, setDeleteModalMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMember = async () => {
    if (!deleteModalMember) return;
    setIsDeleting(true);
    try {
      const res = await deleteMemberAction(deleteModalMember.id);
      if (res.success) {
        toast.success(res.message || "Member berhasil dihapus.");
        setMembers((prev) => prev.filter((m) => m.id !== deleteModalMember.id));
        setDeleteModalMember(null);
      } else {
        toast.error(res.error || "Gagal menghapus member.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus member.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCredentialModal = (member: Member) => {
    setCredentialMember(member);
    setInputUsername(member.username || "");
    setInputPassword(member.temporary_password || "");
    setIsCredentialOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let pwd = "PK-";
    for (let i = 0; i < 9; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputPassword(pwd);
  };

  const handleSendCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialMember) return;

    setIsSendingCredentials(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await sendMemberCredentialsAction({
        memberId: credentialMember.id,
        username: inputUsername,
        password: inputPassword,
      });

      if (res.success) {
        const msg =
          res.message ||
          `Berhasil memperbarui kredensial member ${credentialMember.full_name}`;
        setSuccessMessage(msg);
        toast.success(msg);

        const updatedUsername = res.credentials?.username || inputUsername;
        const updatedPassword = res.credentials?.password || inputPassword;

        // Update local members state
        setMembers((prev) =>
          prev.map((m) =>
            m.id === credentialMember.id
              ? {
                ...m,
                username: updatedUsername,
                temporary_password: updatedPassword,
              }
              : m
          )
        );

        // Update detailMember if modal is active for this member
        if (detailMember?.id === credentialMember.id) {
          setDetailMember((prev) =>
            prev
              ? {
                ...prev,
                username: updatedUsername,
                temporary_password: updatedPassword,
              }
              : null
          );
        }

        setIsCredentialOpen(false);
        setCredentialMember(null);
        router.refresh();
      } else {
        const err = res.error || "Gagal memperbarui dan mengirim kredensial.";
        setErrorMessage(err);
        toast.error(err);
      }
    } catch (err: any) {
      console.error("Error sending credentials:", err);
      const errStr = err.message || "Terjadi kesalahan saat memproses kredensial.";
      setErrorMessage(errStr);
      toast.error(errStr);
    } finally {
      setIsSendingCredentials(false);
    }
  };

  // Get current user id for audit logs
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Exclude admin members from this list
      if (m.role === "admin") return false;

      const matchSearch =
        (m.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.stage_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.whatsapp_number || "").includes(search);

      const matchCommunity = communityFilter === "all" || m.community === communityFilter;
      const matchTier =
        tierFilter === "all" ||
        (tierFilter === "priority" && m.membership_tier === "priority") ||
        (tierFilter === "membership" && m.membership_tier !== "priority") ||
        (tierFilter === "free" && (m.membership_tier === "free" || !m.membership_tier));

      return matchSearch && matchCommunity && matchTier;
    });
  }, [members, search, communityFilter, tierFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.role !== "admin");
    const total = activeMembers.length;
    const pkCount = activeMembers.filter(m => m.community === "panggung_kreator").length;
    const btbCount = activeMembers.filter(m => m.community === "berani_tampil_bicara").length;
    const priorityCount = activeMembers.filter(m => m.membership_tier === "priority").length;
    const membershipCount = activeMembers.filter(m => m.membership_tier !== "priority").length;

    return { total, pkCount, btbCount, priorityCount, membershipCount };
  }, [members]);

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditCommunity(member.community || "panggung_kreator");
    setEditTier(member.membership_tier || "free");
    setEditNote(member.tier_note || "");
    setIsEditOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("members")
        .update({
          community: editCommunity,
          membership_tier: editTier,
          tier_changed_at: new Date().toISOString(),
          tier_changed_by: currentUserId,
          tier_note: editNote.trim() || null
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      // Update local state
      setMembers(prev =>
        prev.map(m =>
          m.id === editingMember.id
            ? { ...m, community: editCommunity, membership_tier: editTier, tier_note: editNote }
            : m
        )
      );

      setSuccessMessage(`Berhasil memperbarui status member ${editingMember.full_name}`);
      setIsEditOpen(false);
      setEditingMember(null);
      router.refresh();
    } catch (err: any) {
      console.error("Error updating member status:", err);
      setErrorMessage(err.message || "Gagal memperbarui status member.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export to Excel (CSV compatible format)
  const handleExportExcel = () => {
    if (filteredMembers.length === 0) return;

    const headers = [
      "ID",
      "Nama Lengkap",
      "Nama Panggung",
      "Username",
      "Email",
      "No. WhatsApp",
      "Komunitas",
      "Tingkatan Tier",
      "Pekerjaan",
      "Tanggal Terdaftar"
    ];

    const rows = filteredMembers.map(m => [
      m.id,
      m.full_name || "-",
      m.stage_name || "-",
      m.username || "-",
      m.email || "-",
      `="${m.whatsapp_number || ''}"`,
      m.community === "berani_tampil_bicara" ? "Berani Tampil Bicara" : "Panggung Kreator",
      m.membership_tier === "priority" ? "Prioritas" : m.membership_tier === "membership" ? "Membership PK" : "General (Free)",
      formatOccupation(m.occupation),
      new Date(m.created_at).toLocaleDateString("id-ID")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => {
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `Daftar_Member_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in text-zinc-800 dark:text-zinc-200">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default mb-6">
        <div>
          <h1 className="text-lg font-black tracking-wider text-text-primary uppercase">
            MANAJEMEN DATA MEMBER
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Daftar lengkap anggota komunitas Panggung Kreator dan Berani Tampil Bicara.
          </p>
        </div>

        <div>
          <button
            onClick={handleExportExcel}
            disabled={filteredMembers.length === 0}
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-[#dcfce7] border border-emerald-200/50 rounded-2xl text-xs text-[#15803d] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#15803d] dark:text-emerald-400" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="hover:opacity-80 p-1">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-[#fee2e2] border border-red-200/50 rounded-2xl text-xs text-[#b91c1c] dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#b91c1c] dark:text-red-400" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-80 p-1">✕</button>
        </div>
      )}


      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-well/50 border border-border-default/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
            <span>Total Member</span>
            <Users className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="text-2xl font-black text-text-primary mt-2">{stats.total}</div>
          <span className="text-[10px] text-text-secondary mt-0.5 font-medium">Semua anggota terdaftar</span>
        </div>

        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <span>Membership PK</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">{stats.membershipCount}</div>
          <span className="text-[10px] text-sky-600/70 dark:text-sky-400/70 mt-0.5 font-medium">Paket Membership</span>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>Member Priority</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">{stats.priorityCount}</div>
          <span className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-0.5 font-medium">Form Prioritas Langsung</span>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="flex gap-3.5 mb-6">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari member berdasarkan nama, email, username atau nomor WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-well border border-gray-400 rounded-full py-4 pl-11 pr-4 text-xs text-text-primary focus:outline-none focus:border-text-primary font-bold"
          />
        </div>

        {/* Filter Komunitas */}
        <div className="flex flex-col min-w-[150px]">
          <Select value={communityFilter} onValueChange={setCommunityFilter}>
            <SelectTrigger className="h-[50px] border-gray-400">
              <SelectValue placeholder="Semua Komunitas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Komunitas</SelectItem>
              <SelectItem value="panggung_kreator">Panggung Kreator</SelectItem>
              <SelectItem value="berani_tampil_bicara">Berani Tampil Bicara</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tier */}
        <div className="flex flex-col min-w-[150px]">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="h-[50px] border-gray-400">
              <SelectValue placeholder="Semua Tingkatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkatan</SelectItem>
              <SelectItem value="free">Free (General)</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="membership">Membership PK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-border-default/70 bg-bg-well/50 text-text-secondary">
                <th className="p-4 uppercase tracking-wider font-bold">Nama & Username</th>
                <th className="p-4 uppercase tracking-wider font-bold">Email</th>
                <th className="p-4 uppercase tracking-wider font-bold">WhatsApp</th>
                <th className="p-4 uppercase tracking-wider font-bold">Tipe Member</th>
                <th className="p-4 uppercase tracking-wider font-bold">Tgl Bergabung</th>
                <th className="p-4 uppercase tracking-wider font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    Tidak ada data member ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const pkgName = m.package?.name || (m.package_id ? packagesMap.get(m.package_id) : null);

                  return (
                    <tr
                      key={m.id}
                      className={`group hover:bg-bg-well/30 transition-colors ${m.membership_tier === "priority" ? "bg-red-500/[0.02]" : ""
                        }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-text-primary">{m.full_name || "-"}</div>
                          {m.membership_tier === "priority" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-500 text-white font-black uppercase tracking-wider">
                              PRIORITY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">@{m.username}</div>
                      </td>
                      <td className="p-4 text-text-secondary font-normal">{m.email || "-"}</td>
                      <td className="p-4 text-text-secondary font-normal">{m.whatsapp_number || "-"}</td>
                      <td className="p-4">
                        {m.membership_tier === "priority" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            Member Priority
                          </span>
                        ) : pkgName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            {pkgName}
                          </span>
                        ) : m.membership_tier === "membership" || m.membership_tier === "regular" || m.membership_tier === "mvp" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            Membership PK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            General (Free)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-text-secondary font-normal">
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setDetailMember(m)}
                            className="p-1.5 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary cursor-pointer"
                            title="Edit Status"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModalMember(m)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Hapus Member"
                          >
                            <Trash2 size={14} />
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

      {/* Reusable Edit Status Member Modal */}
      <Modal
        isOpen={isEditOpen && !!editingMember}
        onClose={() => {
          setIsEditOpen(false);
          setEditingMember(null);
        }}
        maxWidth="max-w-md"
        title="Edit Status Member"
        subtitle={editingMember ? `${editingMember.full_name} (${editingMember.email || editingMember.username})` : undefined}
      >
        {editingMember && (
          <form onSubmit={handleSaveStatus} className="space-y-3.5 text-xs">
            {/* Komunitas */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Komunitas
              </label>
              <Select value={editCommunity} onValueChange={setEditCommunity}>
                <SelectTrigger className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:ring-0 focus:outline-none">
                  <SelectValue placeholder="Pilih Komunitas" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="panggung_kreator">Panggung Kreator (PK)</SelectItem>
                  <SelectItem value="berani_tampil_bicara">Berani Tampil Bicara (BTB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Tingkatan (Tier)
              </label>
              <Select value={editTier} onValueChange={setEditTier}>
                <SelectTrigger className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:ring-0 focus:outline-none">
                  <SelectValue placeholder="Pilih Tier" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="free">General (Free)</SelectItem>
                  <SelectItem value="priority">Member Prioritas</SelectItem>
                  <SelectItem value="membership">Membership PK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Catatan Perubahan
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Contoh: Naik tier karena keaktifan di 3 acara Open Mic..."
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Status"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reusable Detail Member Modal - Stacked, Reduced Radius, Neutral Colors */}
      <Modal
        isOpen={!!detailMember}
        onClose={() => setDetailMember(null)}
        maxWidth="max-w-lg"
        icon={(detailMember?.full_name || "M")[0].toUpperCase()}
        title={detailMember?.full_name}
        subtitle={`@${detailMember?.username || "username"}`}
        footer={
          <div className="flex gap-2.5">
            <button
              onClick={() => setDetailMember(null)}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors w-full cursor-pointer text-center"
            >
              Tutup
            </button>
            {detailMember?.whatsapp_number && (
              <a
                href={formatWhatsappLink(
                  detailMember.whatsapp_number,
                  detailMember.stage_name,
                  detailMember.full_name
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors w-full flex justify-center items-center gap-2 cursor-pointer text-center"
              >
                <span>Kirim WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        }
      >
        {detailMember && (
          <div className="flex flex-col gap-3 text-xs">
            {/* Personal Info Section */}
            <ModalSection title="Informasi Personal">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Nama Panggung:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{detailMember.stage_name || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Username:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">@{detailMember.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Pekerjaan:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatOccupation(detailMember.occupation)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Tgl Terdaftar:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {new Date(detailMember.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </ModalSection>

            {/* Kontak & Sosial Media Section */}
            <ModalSection title="Kontak & Sosial Media">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">No. WhatsApp:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{detailMember.whatsapp_number || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Email:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{detailMember.email || "-"}</span>
                </div>
                {detailMember.instagram_username && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">Instagram:</span>
                    <a
                      href={`https://instagram.com/${detailMember.instagram_username.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-600"
                    >
                      @{detailMember.instagram_username.replace("@", "")}
                    </a>
                  </div>
                )}
                {detailMember.tiktok_username && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">TikTok:</span>
                    <a
                      href={`https://tiktok.com/@${detailMember.tiktok_username.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-600"
                    >
                      @{detailMember.tiktok_username.replace("@", "")}
                    </a>
                  </div>
                )}
              </div>
            </ModalSection>

            {/* Status Keanggotaan Section */}
            <ModalSection title="Status Keanggotaan">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Komunitas:</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {detailMember.community === "berani_tampil_bicara" ? "Berani Tampil Bicara (BTB)" : "Panggung Kreator (PK)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Tipe Tier:</span>
                  {detailMember.membership_tier === "priority" ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      Priority Member
                    </span>
                  ) : detailMember.membership_tier === "membership" || detailMember.membership_tier === "regular" || detailMember.membership_tier === "mvp" ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      Membership PK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      General (Free)
                    </span>
                  )}
                </div>
                {detailMember.tier_note && (
                  <div className="pt-2 mt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-500 font-medium block text-[10px] mb-0.5">Catatan Status:</span>
                    <p className="text-zinc-800 dark:text-zinc-200 text-[11px] font-medium leading-relaxed">
                      {detailMember.tier_note}
                    </p>
                  </div>
                )}
              </div>
            </ModalSection>

            {/* Kredensial & Akses Akun Section */}
            <ModalSection title="Kredensial & Akses Akun">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Username:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    @{detailMember.username || "-"}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCredentialModal(detailMember)}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Set username & password</span>
                  </button>
                </div>
              </div>
            </ModalSection>

            {/* Minat & AI Insights Section */}
            {detailMember.interests && (
              <ModalSection title="Minat & Mentoring Insights">
                <div className="space-y-2.5">
                  {(detailMember.interests as any).primary_interests?.length > 0 && (
                    <div>
                      <span className="text-zinc-500 font-medium text-[10px] block mb-1">Minat Utama:</span>
                      <div className="flex flex-wrap gap-1">
                        {(detailMember.interests as any).primary_interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 rounded-md font-medium border border-zinc-200/60 dark:border-zinc-700/60"
                          >
                            {interest.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(detailMember.interests as any).ai_analysis && (
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                      <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider block">AI Mentoring Insights:</span>
                      {typeof (detailMember.interests as any).ai_analysis === 'object' && !(detailMember.interests as any).ai_analysis.legacy ? (
                        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                          {([
                            { key: 'ringkasan', label: 'Ringkasan Profil' },
                            { key: 'diagnosis_ps', label: 'Diagnosis Public Speaking' },
                            { key: 'potensi_konten', label: 'Potensi Konten & Monetisasi' },
                            { key: 'roadmap', label: 'Roadmap Kreator' },
                            { key: 'insight_mentor', label: 'Insight untuk Mentor' },
                            { key: 'rekomendasi_ekosistem', label: 'Rekomendasi Course & Ekosistem' },
                          ] as const).map(({ key, label }) => {
                            const val = (detailMember.interests as any).ai_analysis[key];
                            if (!val) return null;
                            return (
                              <div key={key} className="p-2 bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-md">
                                <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider block mb-0.5">{label}</span>
                                <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{val}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-md text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line">
                          {typeof (detailMember.interests as any).ai_analysis === 'object'
                            ? (detailMember.interests as any).ai_analysis.legacy
                            : (detailMember.interests as any).ai_analysis}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ModalSection>
            )}
          </div>
        )}
      </Modal>

      {/* Set Username & Password Modal */}
      <Modal
        isOpen={isCredentialOpen && !!credentialMember}
        onClose={() => {
          setIsCredentialOpen(false);
          setCredentialMember(null);
        }}
        maxWidth="max-w-md"
        title="Set Username & Password"
        subtitle={
          credentialMember
            ? `${credentialMember.full_name} (${credentialMember.email || "Tanpa Email"})`
            : undefined
        }
      >
        {credentialMember && (
          <form onSubmit={handleSendCredentials} className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Username Member
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={inputUsername}
                  disabled
                  readOnly
                  placeholder="username_member"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-7 pr-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium cursor-not-allowed focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Username digunakan member untuk login ke platform.
              </span>
            </div>

            {/* Password Input & Generator */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Password Sementara
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Password</span>
                </button>
              </div>
              <input
                type="text"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Contoh: PK-7x9m2k"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-medium focus:outline-none focus:border-zinc-400"
              />
              <span className="text-[10px] text-zinc-400 block">
                Password akan disimpan di akun member dan dikirimkan via email.
              </span>
            </div>

            {/* Email Notification Preview Box */}
            <div className="p-3 bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Kirim Email Otomatis</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Email kredensial berisi username dan password ini akan langsung dikirim ke{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">{credentialMember.email}</strong>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsCredentialOpen(false);
                  setCredentialMember(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSendingCredentials}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSendingCredentials ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan & Kirim Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Konfirmasi Hapus Member */}
      <Modal
        isOpen={!!deleteModalMember}
        onClose={() => !isDeleting && setDeleteModalMember(null)}
        title="Konfirmasi Hapus Member"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 dark:text-red-200 space-y-1">
              <p className="font-bold">Peringatan: Tindakan ini permanen!</p>
              <p className="leading-relaxed">
                Menghapus member ini akan menghapus seluruh data relasi terkait di database (minat, portofolio, absensi event, transaksi, serta akun login autentikasi).
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Apakah Anda yakin ingin menghapus member{" "}
            <strong className="text-zinc-900 dark:text-white">
              {deleteModalMember?.stage_name || deleteModalMember?.full_name}
            </strong>{" "}
            ({deleteModalMember?.email || deleteModalMember?.whatsapp_number})?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalMember(null)}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteMember}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Permanen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
