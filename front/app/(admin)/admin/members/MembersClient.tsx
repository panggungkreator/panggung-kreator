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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  membership_tier: string;
  community: string;
  created_at: string;
  tier_note?: string;
  role?: string;
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

export default function MembersClient({ initialMembers }: MembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

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
      const matchTier = tierFilter === "all" || m.membership_tier === tierFilter;

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

    return { total, pkCount, btbCount, priorityCount };
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
              <SelectItem value="free">Free</SelectItem>
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
                <th className="p-4 uppercase tracking-wider font-bold">Komunitas</th>
                <th className="p-4 uppercase tracking-wider font-bold">Tier</th>
                <th className="p-4 uppercase tracking-wider font-bold">Tgl Bergabung</th>
                <th className="p-4 uppercase tracking-wider font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    Tidak ada data member ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-well/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-text-primary">{m.full_name || "-"}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">@{m.username}</div>
                    </td>
                    <td className="p-4 text-text-secondary font-normal">{m.email || "-"}</td>
                    <td className="p-4 text-text-secondary font-normal">{m.whatsapp_number || "-"}</td>
                    <td className="p-4">
                      {m.community === "berani_tampil_bicara" ? (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-wider">BTB</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wider">PK</span>
                      )}
                    </td>
                    <td className="p-4">
                      {m.membership_tier === "priority" ? (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">Prioritas</span>
                      ) : m.membership_tier === "membership" ? (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-500 font-bold uppercase tracking-wider">Membership</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-zinc-500/10 text-text-secondary font-bold uppercase tracking-wider">General</span>
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {isEditOpen && editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setEditingMember(null);
              }}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4">
              EDIT STATUS MEMBER
            </h3>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="text-xs">
                <div className="font-bold text-text-primary">{editingMember.full_name}</div>
                <div className="text-text-secondary mt-0.5">{editingMember.email}</div>
              </div>

              {/* Komunitas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Komunitas
                </label>
                <select
                  value={editCommunity}
                  onChange={(e) => setEditCommunity(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="panggung_kreator">Panggung Kreator (PK)</option>
                  <option value="berani_tampil_bicara">Berani Tampil Bicara (BTB)</option>
                </select>
              </div>

              {/* Tier */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Tingkatan (Tier)
                </label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="free">General (Free)</option>
                  <option value="priority">Member Prioritas</option>
                  <option value="membership">Membership PK</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Catatan Perubahan
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Contoh: Naik tier karena keaktifan di 3 acara Open Mic..."
                  rows={3}
                  className="w-full bg-bg-well border border-border-default rounded-2xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-text-primary font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingMember(null);
                  }}
                  className="bg-transparent hover:bg-bg-well text-text-secondary rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-none h-10"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer h-10"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Member Modal */}
      {detailMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDetailMember(null)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4">
              DETAIL DATA MEMBER
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Nama Lengkap</div>
                <div className="font-bold text-text-primary mt-0.5">{detailMember.full_name || "-"}</div>
              </div>

              <div>
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Username & Email</div>
                <div className="font-bold text-text-primary mt-0.5">@{detailMember.username || "-"}</div>
                <div className="text-text-secondary font-normal mt-0.5">{detailMember.email || "-"}</div>
              </div>

              <div>
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">WhatsApp</div>
                <div className="font-semibold text-text-primary mt-0.5">{detailMember.whatsapp_number || "-"}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Komunitas</div>
                  <div className="mt-1">
                    {detailMember.community === "berani_tampil_bicara" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-wider">BTB</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wider">Panggung Kreator</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Tier Keanggotaan</div>
                  <div className="mt-1">
                    {detailMember.membership_tier === "priority" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">Prioritas</span>
                    ) : detailMember.membership_tier === "membership" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-500 font-bold uppercase tracking-wider">Membership</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-zinc-500/10 text-text-secondary font-bold uppercase tracking-wider">General</span>
                    )}
                  </div>
                </div>
              </div>

              {detailMember.tier_note && (
                <div className="p-3 bg-bg-well border border-border-default rounded-xl">
                  <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Catatan Status</div>
                  <p className="text-text-primary font-semibold mt-1 leading-relaxed font-mono text-[10px]">
                    {detailMember.tier_note}
                  </p>
                </div>
              )}

              <div>
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Pekerjaan</div>
                <div className="font-semibold text-text-primary mt-0.5">{formatOccupation(detailMember.occupation)}</div>
              </div>

              {detailMember.instagram_username && (
                <div>
                  <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Instagram</div>
                  <div className="font-semibold text-text-primary mt-0.5">@{detailMember.instagram_username}</div>
                </div>
              )}

              {detailMember.tiktok_username && (
                <div>
                  <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">TikTok</div>
                  <div className="font-semibold text-text-primary mt-0.5">@{detailMember.tiktok_username}</div>
                </div>
              )}

              {/* Segmentasi Minat & AI Analysis */}
              {detailMember.interests && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div>
                    <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Minat Utama</div>
                    <div className="flex flex-wrap gap-1">
                      {(detailMember.interests as any).primary_interests?.map((interest: string) => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[9px] font-mono text-zinc-500 uppercase tracking-wider"
                        >
                          {interest.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(detailMember.interests as any).ai_analysis && (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
                      <div className="text-[9px] font-bold text-[#bc151b] uppercase tracking-wider">
                        ✨ AI Mentoring Insights (Gemini)
                      </div>
                      <div className="text-[10px] text-text-secondary leading-relaxed font-sans max-h-36 overflow-y-auto pr-1 whitespace-pre-line">
                        {(detailMember.interests as any).ai_analysis}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setDetailMember(null)}
                className="bg-bg-well hover:bg-bg-page border border-border-default text-text-primary rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-none"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
