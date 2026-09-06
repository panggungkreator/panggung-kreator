"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Download,
  CheckCircle,
  Users,
  Eye,
  Edit2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Mail,
  Send,
  RefreshCw,
  Trash2,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  FileText,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { toast } from "sonner";
import AdminPagination from "@/components/admin/AdminPagination";
import { sendMemberCredentialsAction, deleteMemberAction } from "./actions";
import { MemberFormRecapModal } from "./MemberFormRecapModal";

type Member = {
  id: string;
  full_name: string;
  stage_name: string;
  whatsapp_number: string;
  email: string;
  birth_date?: string | null;
  address?: string | null;
  city?: string | null;
  instagram_username?: string;
  tiktok_username?: string;
  social_media?: {
    instagram?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  } | null;
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
  subscribed_newsletter?: boolean;
  interests?: any;
};

interface MembersClientProps {
  initialMembers: Member[];
  packages?: any[];
  paginationLimit?: number;
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

export default function MembersClient({
  initialMembers,
  packages = [],
  paginationLimit = 10,
}: MembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit > 0 ? paginationLimit : 10;

  // Sinkronkan state members ketika initialMembers dari server berubah
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Real-time Supabase subscription untuk pembaruan live data member tanpa membebani server
  useEffect(() => {
    const supabase = createClient();
    let refreshTimeout: NodeJS.Timeout | null = null;

    const debouncedRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        router.refresh();
      }, 1000);
    };

    const channel = supabase
      .channel("admin_members_realtime_list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        async (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newMemberBasic = payload.new as Member;
            // Abaikan akun admin
            if (newMemberBasic.role === "admin") return;

            // Ambil relasi interests & package secara langsung via Supabase client agar data langsung muncul komplit
            try {
              const { data: fullMember } = await supabase
                .from("members")
                .select("*, interests:member_interests(*), package:packages(id, name)")
                .eq("id", newMemberBasic.id)
                .maybeSingle();

              const memberToAdd = fullMember || newMemberBasic;

              setMembers((prev) => {
                if (prev.some((m) => m.id === memberToAdd.id)) {
                  return prev.map((m) => (m.id === memberToAdd.id ? { ...m, ...memberToAdd } : m));
                }
                return [memberToAdd, ...prev];
              });
            } catch (err) {
              setMembers((prev) => {
                if (prev.some((m) => m.id === newMemberBasic.id)) return prev;
                return [newMemberBasic, ...prev];
              });
            }
            debouncedRefresh();
          } else if (payload.eventType === "UPDATE") {
            const updatedMember = payload.new as Member;
            if (updatedMember.role === "admin") {
              setMembers((prev) => prev.filter((m) => m.id !== updatedMember.id));
            } else {
              setMembers((prev) =>
                prev.map((m) => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
              );
            }
            debouncedRefresh();
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setMembers((prev) => prev.filter((m) => m.id !== deletedId));
            }
            debouncedRefresh();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "member_interests" },
        (payload: any) => {
          const memberId = payload.new?.member_id || payload.old?.member_id;
          if (memberId) {
            setMembers((prev) =>
              prev.map((m) =>
                m.id === memberId
                  ? { ...m, interests: payload.eventType === "DELETE" ? null : payload.new }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Auto-sync saat tab aktif kembali (visibility change / window focus) tanpa polling berkala
  useEffect(() => {
    let lastSyncTime = Date.now();
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastSyncTime > 20000) {
          lastSyncTime = Date.now();
          router.refresh();
        }
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [router]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, communityFilter, tierFilter, sortBy]);

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

  // Recap form onboarding modal state
  const [recapModalMember, setRecapModalMember] = useState<Member | null>(null);

  // Delete modal state
  const [deleteModalMember, setDeleteModalMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to check whether member has filled StepEssential onboarding form
  const hasFilledOnboardingForm = (m: Member | null | undefined) => {
    if (!m) return false;
    const ints = Array.isArray(m.interests) ? m.interests[0] : m.interests;
    if (!ints) return false;
    const hasPs = Array.isArray(ints.ps_challenges) && ints.ps_challenges.length > 0;
    const hasSkills = Boolean(ints.skills_to_master);
    const hasGoals = Array.isArray(ints.goals) && ints.goals.length > 0;
    const hasConfidence = ints.confidence_scale !== null && ints.confidence_scale !== undefined;
    const hasTopics = Array.isArray(ints.content_topics) && ints.content_topics.length > 0;
    const hasMonetization = Boolean(ints.monetization_interest);
    const hasRoleModel = Boolean(ints.role_model);
    const hasNervous = Boolean(ints.nervous_trigger);
    return hasPs || hasSkills || hasGoals || hasConfidence || hasTopics || hasMonetization || hasRoleModel || hasNervous;
  };

  const handleDeleteMember = async () => {
    if (!deleteModalMember) return;
    setIsDeleting(true);
    try {
      const res = await deleteMemberAction(deleteModalMember.id);
      if (res.success) {
        toast.success(res.message || "Member berhasil dihapus.");
        setMembers((prev) => prev.filter((m) => m.id !== deleteModalMember.id));
        setDeleteModalMember(null);
        if (detailMember?.id === deleteModalMember.id) {
          setDetailMember(null);
        }
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

  // Filtered and sorted members list
  const filteredMembers = useMemo(() => {
    const list = members.filter((m) => {
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

    return list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name_asc") {
        return (a.full_name || "").localeCompare(b.full_name || "");
      }
      return 0;
    });
  }, [members, search, communityFilter, tierFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredMembers.length, startIndex + limit);
  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, startIndex, endIndex]);

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

  const renderTierBadge = (m: Member, pkgName?: string | null) => {
    if (m.membership_tier === "priority") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Member Priority
        </span>
      );
    }
    if (pkgName) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          {pkgName}
        </span>
      );
    }
    if (m.membership_tier === "membership" || m.membership_tier === "regular" || m.membership_tier === "mvp") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          Membership
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-500/20 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
        General (Free)
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/60">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ ANGGOTA KOMUNITAS ]
          </span>
          <div className="flex items-center gap-2.5 mt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Manajemen Data Member
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              router.refresh();
              toast.info("Memperbarui data member...");
            }}
            title="Segarkan data member"
            className="inline-flex items-center justify-center h-9 w-9 text-text-muted hover:text-text-primary bg-bg-well/60 hover:bg-bg-well border border-border-default rounded-full transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={filteredMembers.length === 0}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all shadow-xs cursor-pointer tracking-wider shrink-0"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 bg-[#dcfce7] border border-emerald-200/50 rounded-2xl text-xs text-[#15803d] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#15803d] dark:text-emerald-400" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="hover:opacity-80 p-1 cursor-pointer">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[#fee2e2] border border-red-200/50 rounded-2xl text-xs text-[#b91c1c] dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#b91c1c] dark:text-red-400" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-80 p-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Horizontal Scrollable Capsule Pills for Quick Filter & Stats (Persis Standar admin-mobile.md) */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Pill 1: Semua Member */}
        <button
          type="button"
          onClick={() => setTierFilter("all")}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${tierFilter === "all"
            ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] shadow-xs dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-well/60"
            }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Semua</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-[#0369a1] dark:text-sky-300 shadow-2xs">
            {stats.total}
          </span>
        </button>

        {/* Pill 2: Membership PK */}
        <button
          type="button"
          onClick={() => setTierFilter("membership")}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${tierFilter === "membership"
            ? "bg-[#e0f2fe] text-[#0284c7] border border-[#7dd3fc] shadow-xs dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-well/60"
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span>Membership PK</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-sky-600 dark:text-sky-300 shadow-2xs">
            {stats.membershipCount}
          </span>
        </button>

        {/* Pill 3: Member Priority */}
        <button
          type="button"
          onClick={() => setTierFilter("priority")}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${tierFilter === "priority"
            ? "bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5] shadow-xs dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-well/60"
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Priority</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-[#b91c1c] dark:text-red-300 shadow-2xs">
            {stats.priorityCount}
          </span>
        </button>

        {/* Pill 4: General Free */}
        {/* <button
          type="button"
          onClick={() => setTierFilter("free")}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${tierFilter === "free"
            ? "bg-zinc-200 text-zinc-900 border border-zinc-300 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-well/60"
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
          <span>General (Free)</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300 shadow-2xs">
            {stats.total - stats.priorityCount - stats.membershipCount}
          </span>
        </button> */}
      </div>

      {/* Toolbar Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, username, nomor WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-bg-well/70 border border-border-default rounded-full pl-9 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary font-medium transition-colors"
          />
        </div>

        <div className="hidden sm:flex sm:w-auto gap-2 sm:gap-3">
          {/* Filter Komunitas */}
          <div className="w-full sm:w-44">
            <Select value={communityFilter} onValueChange={setCommunityFilter}>
              <SelectTrigger className="w-full h-9 rounded-full px-3 text-xs font-medium bg-bg-well/70 border-border-default">
                <SelectValue placeholder="Semua Komunitas" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">Semua Komunitas</SelectItem>
                <SelectItem value="panggung_kreator">Panggung Kreator</SelectItem>
                <SelectItem value="berani_tampil_bicara">Berani Tampil Bicara</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Tier */}
          <div className="w-full sm:w-44">
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full h-9 rounded-full px-3 text-xs font-medium bg-bg-well/70 border-border-default">
                <SelectValue placeholder="Semua Tingkatan" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">Semua Tingkatan</SelectItem>
                <SelectItem value="free">Free (General)</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="membership">Membership PK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(communityFilter !== "all" || tierFilter !== "all" || search) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-text-muted font-medium mr-1">Filter Aktif:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Cari: "{search}"
              <button onClick={() => setSearch("")} className="hover:text-red-500 ml-1 cursor-pointer">×</button>
            </span>
          )}
          {communityFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Komunitas: {communityFilter === "berani_tampil_bicara" ? "BTB" : "PK"}
              <button onClick={() => setCommunityFilter("all")} className="hover:text-red-500 ml-1 cursor-pointer">×</button>
            </span>
          )}
          {tierFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Tier: {tierFilter.toUpperCase()}
              <button onClick={() => setTierFilter("all")} className="hover:text-red-500 ml-1 cursor-pointer">×</button>
            </span>
          )}
          <button
            onClick={() => {
              setSearch("");
              setCommunityFilter("all");
              setTierFilter("all");
            }}
            className="text-[11px] text-text-muted hover:text-text-primary underline ml-1 cursor-pointer"
          >
            Reset Semua
          </button>
        </div>
      )}

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default/70 bg-bg-well/50">
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Nama & Username</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Email</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">WhatsApp</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Tipe Member</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">Tgl Bergabung</th>
                <th className="py-3.5 px-5 text-center uppercase tracking-wider font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    Tidak ada data member ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => {
                  const pkgName = m.package?.name || (m.package_id ? packagesMap.get(m.package_id) : null);

                  return (
                    <tr
                      key={m.id}
                      className={`group hover:bg-bg-well/30 transition-colors ${m.membership_tier === "priority" ? "bg-red-500/[0.02]" : ""}`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-text-primary">{m.full_name || "-"}</div>
                          {m.membership_tier === "priority" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-500 text-white font-black uppercase tracking-wider">
                              PRIORITY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5 font-mono">@{m.username}</div>
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary font-normal">{m.email || "-"}</td>
                      <td className="py-3.5 px-5 text-text-secondary font-normal font-mono">{m.whatsapp_number || "-"}</td>
                      <td className="py-3.5 px-5">{renderTierBadge(m, pkgName)}</td>
                      <td className="py-3.5 px-5 text-text-secondary font-normal">
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setDetailMember(m)}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Edit Status"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setRecapModalMember(m)}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer relative"
                            title="Rekap Jawaban Form"
                          >
                            <FileText size={14} />
                            {!hasFilledOnboardingForm(m) && (
                              <span
                                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900"
                                title="Form belum diisi"
                              />
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

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-4">
        {filteredMembers.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data member ditemukan.</p>
          </div>
        ) : (
          paginatedMembers.map((m) => {
            const pkgName = m.package?.name || (m.package_id ? packagesMap.get(m.package_id) : null);
            return (
              <div
                key={m.id}
                onClick={() => setDetailMember(m)}
                className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative cursor-pointer active:scale-[0.99]"
              >
                {/* Top: Tier Badge & Community Dot */}
                <div className="flex items-center justify-between gap-2">
                  <div>{renderTierBadge(m, pkgName)}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${m.community === 'berani_tampil_bicara' ? 'bg-amber-500' : 'bg-emerald-500'} shrink-0`}></span>
                    <span className="text-[11px] font-semibold text-text-secondary tracking-tight">
                      {m.community === 'berani_tampil_bicara' ? 'BTB' : 'PK'}
                    </span>
                  </div>
                </div>

                {/* Middle: Member info */}
                <div className="my-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-black tracking-tight text-text-primary dark:group-hover:text-yellow-400 transition-colors leading-tight">
                      {m.full_name || "-"}
                    </h3>
                    {m.stage_name && (
                      <span className="text-[11px] font-semibold text-text-muted">
                        ({m.stage_name})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">@{m.username}</p>
                  {m.occupation && (
                    <p className="text-[11px] text-text-muted mt-1 font-medium">
                      {formatOccupation(m.occupation)}
                    </p>
                  )}
                </div>

                {/* Bottom: Contact info & Action buttons */}
                <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-text-secondary truncate">
                      {m.whatsapp_number || m.email || "-"}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Gabung: {new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setDetailMember(m)}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                      title="Edit Status"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecapModalMember(m)}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer relative"
                      title="Rekap Jawaban Form"
                    >
                      <FileText size={13} />
                      {!hasFilledOnboardingForm(m) && (
                        <span
                          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500"
                          title="Form belum diisi"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMembers.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="member"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* 1. Sort Button (Popover) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer ${sortBy !== "newest" ? "text-white bg-zinc-800" : ""
                  }`}
                title="Urutkan Data"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-52 p-2.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-1 mb-2 z-50"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted px-2.5 py-1 block border-b border-border-default/50 mb-1">
                Urutkan Berdasarkan
              </span>
              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${sortBy === "newest"
                  ? "bg-bg-well text-text-primary font-bold"
                  : "text-text-secondary hover:bg-bg-well hover:text-text-primary"
                  }`}
              >
                <span>Tanggal Terbaru</span>
                {sortBy === "newest" && <Check className="w-3.5 h-3.5 text-text-primary" />}
              </button>
              <button
                type="button"
                onClick={() => setSortBy("oldest")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${sortBy === "oldest"
                  ? "bg-bg-well text-text-primary font-bold"
                  : "text-text-secondary hover:bg-bg-well hover:text-text-primary"
                  }`}
              >
                <span>Tanggal Terlama</span>
                {sortBy === "oldest" && <Check className="w-3.5 h-3.5 text-text-primary" />}
              </button>
              <button
                type="button"
                onClick={() => setSortBy("name_asc")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${sortBy === "name_asc"
                  ? "bg-bg-well text-text-primary font-bold"
                  : "text-text-secondary hover:bg-bg-well hover:text-text-primary"
                  }`}
              >
                <span>Nama (A - Z)</span>
                {sortBy === "name_asc" && <Check className="w-3.5 h-3.5 text-text-primary" />}
              </button>
            </PopoverContent>
          </Popover>

          {/* 2. Filter Button (Popover with Direct Selectable Chips) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${communityFilter !== "all" || tierFilter !== "all" ? "text-white bg-zinc-800" : ""
                  }`}
                title="Filter Member"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(communityFilter !== "all" || tierFilter !== "all") && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-72 p-4 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3.5 mb-2 z-50"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                  Filter Member
                </span>
                {(communityFilter !== "all" || tierFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setCommunityFilter("all");
                      setTierFilter("all");
                    }}
                    className="text-[10px] text-text-muted hover:text-red-500 underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Filter Komunitas */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary block">
                  Komunitas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "panggung_kreator", label: "Panggung Kreator" },
                    { id: "berani_tampil_bicara", label: "Berani Tampil Bicara" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCommunityFilter(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${communityFilter === c.id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                        }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Tingkatan Tier */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary block">
                  Tingkatan Tier
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "priority", label: "Priority" },
                    { id: "membership", label: "Membership PK" },
                    { id: "free", label: "General (Free)" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTierFilter(t.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${tierFilter === t.id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 3. Right Action Button: Ekspor CSV */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredMembers.length === 0}
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Ekspor CSV Data Member"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Ekspor</span>
          </button>
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
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            {/* Komunitas */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Komunitas
              </label>
              <input
                type="text"
                value={
                  editCommunity === "berani_tampil_bicara"
                    ? "Berani Tampil Bicara (BTB)"
                    : editCommunity === "panggung_kreator"
                      ? "Panggung Kreator (PK)"
                      : editCommunity || "Panggung Kreator (PK)"
                }
                disabled
                readOnly
                className="w-full h-10 bg-bg-well/30 border border-border-default rounded-xl px-3.5 text-xs text-text-muted font-medium cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Tier */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Tingkatan (Tier)
              </label>
              <Select value={editTier} onValueChange={setEditTier}>
                <SelectTrigger className="w-full h-10 bg-bg-well/50 border border-border-default rounded-xl px-3.5 text-xs text-text-primary font-medium focus:ring-0 focus:outline-none">
                  <SelectValue placeholder="Pilih Tier" />
                </SelectTrigger>
                <SelectContent className="bg-bg-card border-border-default">
                  <SelectItem value="free">General (Free)</SelectItem>
                  <SelectItem value="priority">Member Prioritas</SelectItem>
                  <SelectItem value="membership">Membership PK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Catatan Perubahan
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Contoh: Naik tier karena keaktifan di 3 acara Open Mic..."
                rows={3}
                className="w-full bg-bg-well/50 border border-border-default rounded-xl py-2.5 px-3.5 text-xs text-text-primary font-medium focus:outline-none focus:border-text-primary leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-default/60">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingMember(null);
                }}
                className="h-10 px-4 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Status"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reusable Detail Member Modal */}
      <Modal
        isOpen={!!detailMember}
        onClose={() => setDetailMember(null)}
        maxWidth="max-w-lg"
        icon={(detailMember?.full_name || "M")[0].toUpperCase()}
        title={detailMember?.full_name}
        subtitle={`@${detailMember?.username || "username"}`}
        footer={
          <div className="flex gap-2.5 w-full">
            <button
              onClick={() => setDetailMember(null)}
              className="h-10 px-4 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors w-full cursor-pointer text-center"
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
                className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors w-full flex justify-center items-center gap-2 cursor-pointer text-center"
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
            {/* Rekap Jawaban Form Onboarding Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-bg-well/60 border border-border-default/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-bg-card border border-border-default/80 flex items-center justify-center shrink-0 text-text-muted">
                  <FileText size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Rekap Jawaban Form Onboarding</p>
                  <p className="text-[10px] text-text-muted">Profiling minat & kebutuhan program (StepEssential)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecapModalMember(detailMember)}
                className="h-8 px-3 rounded-xl bg-text-primary text-bg-card hover:opacity-90 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Lihat Rekap</span>
                {hasFilledOnboardingForm(detailMember) ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">Terisi</span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">Belum diisi</span>
                )}
              </button>
            </div>

            {/* Personal Info Section */}
            <ModalSection title="Informasi Personal">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Nama Panggung:</span>
                  <span className="font-semibold text-text-primary">{detailMember.stage_name || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Username:</span>
                  <span className="font-semibold text-text-primary font-mono">@{detailMember.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Pekerjaan:</span>
                  <span className="font-semibold text-text-primary">{formatOccupation(detailMember.occupation)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Tgl Terdaftar:</span>
                  <span className="font-semibold text-text-primary">
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
                  <span className="text-text-muted font-medium">No. WhatsApp:</span>
                  <span className="font-semibold text-text-primary font-mono">{detailMember.whatsapp_number || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Email:</span>
                  <span className="font-semibold text-text-primary">{detailMember.email || "-"}</span>
                </div>
                {(detailMember.social_media?.instagram || detailMember.instagram_username) && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-medium">Instagram:</span>
                    <a
                      href={`https://instagram.com/${(detailMember.social_media?.instagram || detailMember.instagram_username || "").replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-text-primary underline hover:text-amber-600"
                    >
                      @{(detailMember.social_media?.instagram || detailMember.instagram_username || "").replace("@", "")}
                    </a>
                  </div>
                )}
                {(detailMember.social_media?.tiktok || detailMember.tiktok_username) && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-medium">TikTok:</span>
                    <a
                      href={`https://tiktok.com/@${(detailMember.social_media?.tiktok || detailMember.tiktok_username || "").replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-text-primary underline hover:text-amber-600"
                    >
                      @{(detailMember.social_media?.tiktok || detailMember.tiktok_username || "").replace("@", "")}
                    </a>
                  </div>
                )}
              </div>
            </ModalSection>

            {/* Status Keanggotaan Section */}
            <ModalSection title="Status Keanggotaan">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Komunitas:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-well text-text-primary border border-border-default">
                    {detailMember.community === "berani_tampil_bicara" ? "Berani Tampil Bicara (BTB)" : "Panggung Kreator (PK)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Tipe Tier:</span>
                  <div>{renderTierBadge(detailMember, detailMember.package?.name || (detailMember.package_id ? packagesMap.get(detailMember.package_id) : null))}</div>
                </div>
                {detailMember.tier_note && (
                  <div className="pt-2 mt-1 border-t border-border-default/50">
                    <span className="text-text-muted font-medium block text-[10px] mb-0.5">Catatan Status:</span>
                    <p className="text-text-primary text-[11px] font-medium leading-relaxed">
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
                  <span className="text-text-muted font-medium">Username:</span>
                  <span className="font-semibold text-text-primary font-mono">
                    @{detailMember.username || "-"}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCredentialModal(detailMember)}
                    className="w-full h-10 px-4 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                      <span className="text-text-muted font-medium text-[10px] block mb-1">Minat Utama:</span>
                      <div className="flex flex-wrap gap-1">
                        {(detailMember.interests as any).primary_interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="px-2 py-0.5 bg-bg-well text-[10px] text-text-secondary rounded-full font-medium border border-border-default"
                          >
                            {interest.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(detailMember.interests as any).ai_analysis && (
                    <div className="pt-2 border-t border-border-default/50 space-y-2">
                      <span className="text-text-muted font-medium text-[10px] uppercase tracking-wider block">AI Mentoring Insights:</span>
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
                              <div key={key} className="p-2.5 bg-bg-well/60 border border-border-default/60 rounded-xl">
                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-0.5">{label}</span>
                                <p className="text-[11px] text-text-secondary leading-relaxed">{val}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-bg-well/60 border border-border-default/60 rounded-xl text-[11px] text-text-secondary leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line">
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

            {/* Danger Zone: Hapus Member dengan Peringatan Jelas */}
            <div className="mt-2 p-3.5 rounded-2xl border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 space-y-2.5">
              <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">Peringatan: Tindakan Berbahaya (Hapus Akun)</h4>
                  <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-relaxed">
                    Menghapus akun member ini akan menghapus seluruh data profil, akun login autentikasi, jawaban form, dan relasi transaksi secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalMember(detailMember)}
                  className="h-8 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus Akun Member</span>
                </button>
              </div>
            </div>
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
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Username Member
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-text-muted font-mono text-xs">@</span>
                <input
                  type="text"
                  value={inputUsername}
                  disabled
                  readOnly
                  placeholder="username_member"
                  className="w-full h-10 bg-bg-well/30 border border-border-default rounded-xl pl-8 pr-3 text-xs text-text-muted font-mono font-medium cursor-not-allowed focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-text-muted block">
                Username digunakan member untuk login ke platform.
              </span>
            </div>

            {/* Password Input & Generator */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-text-secondary block">
                  Password Sementara
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-text-muted hover:text-text-primary font-semibold flex items-center gap-1 cursor-pointer"
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
                className="w-full h-10 bg-bg-well/50 border border-border-default rounded-xl px-3.5 text-xs text-text-primary font-mono font-medium focus:outline-none focus:border-text-primary"
              />
              <span className="text-[10px] text-text-muted block">
                Password akan disimpan di akun member dan dikirimkan via email.
              </span>
            </div>

            {/* Email Notification Preview Box */}
            <div className="p-3 bg-bg-well/60 border border-border-default rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-primary font-semibold text-[11px]">
                <Mail className="w-3.5 h-3.5 text-text-muted" />
                <span>Kirim Email Otomatis</span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Email kredensial berisi username dan password ini akan langsung dikirim ke{" "}
                <strong className="text-text-primary">{credentialMember.email}</strong>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border-default/60">
              <button
                type="button"
                onClick={() => {
                  setIsCredentialOpen(false);
                  setCredentialMember(null);
                }}
                className="h-10 px-4 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSendingCredentials}
                className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 dark:text-red-200 space-y-1">
              <p className="font-bold">Peringatan: Tindakan ini permanen!</p>
              <p className="leading-relaxed">
                Menghapus member ini akan menghapus seluruh data relasi terkait di database (minat, portofolio, absensi event, transaksi, serta akun login autentikasi).
              </p>
            </div>
          </div>

          <p className="text-xs text-text-secondary">
            Apakah Anda yakin ingin menghapus member{" "}
            <strong className="text-text-primary">
              {deleteModalMember?.stage_name || deleteModalMember?.full_name}
            </strong>{" "}
            ({deleteModalMember?.email || deleteModalMember?.whatsapp_number})?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-default/60">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalMember(null)}
              className="h-10 px-4 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteMember}
              className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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

      {/* Modal Rekap Jawaban Form Onboarding (StepEssential) */}
      <MemberFormRecapModal
        isOpen={!!recapModalMember}
        onClose={() => setRecapModalMember(null)}
        member={recapModalMember}
      />

    </div>
  );
}
