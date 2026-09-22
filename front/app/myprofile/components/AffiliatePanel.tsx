"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MemberProfile, ReferralMember, CommissionLedgerEntry } from "@/lib/types/member";
import { Copy, Check, Eye, ExternalLink, Calendar, CreditCard, Clock, FileText, CheckCircle2, Image as ImageIcon, Loader2, Users, Receipt, RefreshCw, ZoomIn, ZoomOut, RotateCcw, X, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { generateAffiliateCodeAction, getReferredMembersAction, getMyCommissionLedgerAction } from "@/lib/actions/referral-actions";
import GenerateAffiliateModal from "@/components/member/GenerateAffiliateModal";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

interface AffiliatePanelProps {
  member: MemberProfile;
  referrals: ReferralMember[];
  ledger?: CommissionLedgerEntry[];
  onAffiliateGenerated?: (code: string) => void;
  onRefresh?: () => void;
}

export default function AffiliatePanel({
  member,
  referrals,
  ledger = [],
  onAffiliateGenerated,
  onRefresh,
}: AffiliatePanelProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(member?.affiliate_code || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CommissionLedgerEntry | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Live Auto-Reload State
  const [referralsList, setReferralsList] = useState<ReferralMember[]>(referrals);
  const [ledgerList, setLedgerList] = useState<CommissionLedgerEntry[]>(ledger);
  const [currentBalance, setCurrentBalance] = useState<number>(member?.commission_balance || 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize state with incoming props
  useEffect(() => {
    setReferralsList(referrals);
  }, [referrals]);

  useEffect(() => {
    setLedgerList(ledger);
  }, [ledger]);

  useEffect(() => {
    setCurrentBalance(member?.commission_balance || 0);
    if (member?.affiliate_code) {
      setAffiliateCode(member.affiliate_code);
    }
  }, [member?.commission_balance, member?.affiliate_code]);

  // Fetch latest affiliate & ledger data function
  const fetchLatestData = useCallback(
    async (showToast = false) => {
      if (!member?.id) return;
      setIsRefreshing(true);
      try {
        const supabase = createClient();
        const [referralRes, ledgerRes, memberRes] = await Promise.all([
          getReferredMembersAction(),
          getMyCommissionLedgerAction(),
          supabase
            .from("members")
            .select("commission_balance, affiliate_code")
            .eq("id", member.id)
            .single(),
        ]);

        if (referralRes.success && referralRes.data) {
          setReferralsList(referralRes.data);
        }
        if (ledgerRes.success && ledgerRes.data) {
          setLedgerList(ledgerRes.data);
        }
        if (memberRes.data) {
          setCurrentBalance(memberRes.data.commission_balance || 0);
          if (memberRes.data.affiliate_code && !affiliateCode) {
            setAffiliateCode(memberRes.data.affiliate_code);
          }
        }
        if (showToast) {
          toast.success("Data affiliate berhasil diperbarui.");
        }
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error("Error auto-reloading affiliate data:", err);
        if (showToast) {
          toast.error("Gagal menyegarkan data affiliate.");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [member?.id, affiliateCode, onRefresh]
  );

  // Real-time Supabase subscription for live updates
  useEffect(() => {
    if (!member?.id) return;

    const supabase = createClient();
    const channelName = `realtime_affiliate_${member.id}_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      // 1. Perubahan pada commission_ledger (mutasi baru / payout)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "commission_ledger",
          filter: `member_id=eq.${member.id}`,
        },
        () => {
          fetchLatestData();
        }
      )
      // 2. Perubahan pada affiliate_payouts (pembayaran komisi disetujui / bukti transfer diupload)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "affiliate_payouts",
          filter: `member_id=eq.${member.id}`,
        },
        () => {
          fetchLatestData();
        }
      )
      // 3. Perubahan saldo pada tabel members
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
          filter: `id=eq.${member.id}`,
        },
        (payload: any) => {
          if (payload.new && (payload.new as any).commission_balance !== undefined) {
            setCurrentBalance((payload.new as any).commission_balance || 0);
          }
          fetchLatestData();
        }
      )
      // 4. Perubahan pada referral_rewards
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "referral_rewards",
          filter: `referrer_id=eq.${member.id}`,
        },
        () => {
          fetchLatestData();
        }
      )
      // 5. Pendaftaran member baru yang direferralkan
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
        },
        (payload: any) => {
          if (
            payload.new?.referred_by === member.id ||
            payload.new?.referred_by_member_id === member.id
          ) {
            fetchLatestData();
          }
        }
      )
      .subscribe();

    // Polling berkala (30s) sebagai fallback jika koneksi websocket terganggu
    const interval = setInterval(() => {
      fetchLatestData();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [member?.id, fetchLatestData]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAffiliateCodeAction();
      if (result.success && result.affiliateCode) {
        setAffiliateCode(result.affiliateCode);
        setIsModalOpen(true);
        if (onAffiliateGenerated) {
          onAffiliateGenerated(result.affiliateCode);
        }
        toast.success(result.message || "Kode affiliate berhasil dibuat!");
      } else {
        toast.error(result.error || "Gagal membuat kode affiliate.");
      }
    } catch (err: any) {
      console.error("Generate affiliate code error:", err);
      toast.error("Terjadi kesalahan saat membuat kode affiliate.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!affiliateCode) return;
    const link = `${window.location.origin}/akademi/checkout?ref=${affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link affiliate berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!affiliateCode) return;
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    toast.success("Kode affiliate berhasil disalin!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const affiliateLink = typeof window !== "undefined" && affiliateCode
    ? `${window.location.origin}/akademi/checkout?ref=${affiliateCode}`
    : `/akademi/checkout?ref=${affiliateCode || ""}`;

  return (
    <div className="bg-transparent border-0 p-0 space-y-6 animate-fade-in text-[#212121] dark:text-[#F4F4F4] w-full">
      {/* HEADER SECTION */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-2">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold font-sans text-[#212121] dark:text-white flex items-center gap-2">
            <span>Program Referral & <span className="highlight-stabilo">Affiliate</span></span>
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-sans mt-0.5">
            Bagikan link referral untuk pendaftaran kelas Akademi. Dapatkan saldo komisi yang dapat dicairkan setiap kali teman berhasil bergabung.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYNC
          </span>
          <button
            type="button"
            onClick={() => fetchLatestData(true)}
            disabled={isRefreshing}
            className="p-2 border border-[#212121]/10 dark:border-white/10 hover:bg-[#F6F5FA] dark:hover:bg-neutral-800 text-[#212121] dark:text-neutral-300 transition-all rounded-full cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
            title="Segarkan Data Secara Manual"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 3 BENTO METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* CARD 1: SALDO KOMISI (HONEYDEW TINT) */}
        <div className="bg-[#CFDECA]/25 dark:bg-[#CFDECA]/10 border border-[#CFDECA]/50 dark:border-[#CFDECA]/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-2">
              SALDO KOMISI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#212121] dark:text-white">
                Rp {currentBalance.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL REFERRAL (VANILLA TINT) */}
        <div className="bg-[#EFF0A3]/25 dark:bg-[#EFF0A3]/10 border border-[#EFF0A3]/50 dark:border-[#EFF0A3]/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF0A3] text-[#302F1A] dark:bg-[#38371F] dark:text-[#EFF0A3] px-2.5 py-0.5 rounded-md mb-2">
              REFERRAL BERHASIL
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#212121] dark:text-white">
                {referralsList.length}
              </span>
              <span className="text-xs font-sans text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider">
                Member
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: KODE REFERRAL (SOFT SLATE TINT) */}
        <div className="bg-[#D8DFE9]/25 dark:bg-[#D8DFE9]/10 border border-[#D8DFE9]/50 dark:border-[#D8DFE9]/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-2">
              KODE REFERRAL ANDA
            </span>
            <div className="flex items-center gap-2 mt-1">
              {affiliateCode ? (
                <>
                  <span className="text-md sm:text-lg font-black font-mono text-[#212121] dark:text-white truncate">
                    {affiliateCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 text-xs font-mono font-bold text-[#212121] dark:text-neutral-200 hover:opacity-90 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                    title="Salin Kode Referral"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#212121] dark:bg-white text-white dark:text-[#212121] text-xs font-sans font-bold hover:opacity-90 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                      <span>Mengaktifkan...</span>
                    </>
                  ) : (
                    <span>Aktifkan Sekarang &rarr;</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GENERATE CODE CTA CARD (Jika Belum Memiliki Kode Affiliate) */}
      {!affiliateCode && (
        <div className="border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] p-5 space-y-3 rounded-2xl shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="space-y-1">
              <h4 className="font-bold font-sans text-sm text-[#212121] dark:text-white">
                Aktifkan Kode Affiliate Anda
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Buat kode referral kupon unik Anda dengan 1 klik untuk mulai membagikan tautan dan menghasilkan komisi.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] font-sans text-xs font-bold transition-all cursor-pointer flex items-center gap-2 rounded-xl disabled:opacity-50 shadow-2xs hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Membuat Kode...</span>
                </>
              ) : (
                <>
                  <span>Buat Kode Affiliate &rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AFFILIATE LINK CLIPBOARD */}
      {affiliateCode && (
        <div className="border border-[#212121]/10 dark:border-white/10 p-5 space-y-3 bg-white dark:bg-[#151B18] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
            [ LINK REFERRAL UNIK ANDA ]
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={affiliateLink}
              className="flex-1 bg-[#F6F5FA] dark:bg-[#1E2622] border border-[#212121]/10 dark:border-white/10 px-4 py-2.5 text-xs font-mono rounded-xl text-[#212121] dark:text-neutral-200 select-all focus:outline-none shadow-2xs"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] hover:opacity-90 transition-all text-xs font-sans rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-2xs hover:scale-[1.02] active:scale-95 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Tersalin" : "Salin Link"}</span>
            </button>
          </div>
          <p className="text-xs text-neutral-500 font-sans">
            Kode Kupon Terdaftar: <strong className="text-[#212121] dark:text-white font-mono">{affiliateCode}</strong>
          </p>
        </div>
      )}

      {/* RIWAYAT MUTASI KOMISI */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg text-[#212121] dark:text-white flex items-center gap-2">
            Riwayat Mutasi & <span className="highlight-stabilo">Komisi</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ {ledgerList.length} TRANSAKSI ]
          </span>
        </div>

        {ledgerList.length === 0 ? (
          <div className="border border-dashed border-[#212121]/20 dark:border-white/20 py-8 text-center text-xs text-neutral-500 font-sans rounded-2xl bg-white/50 dark:bg-[#151B18]/50">
            Belum ada riwayat mutasi komisi.
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (MD & UP) */}
            <div className="hidden md:block border border-[#212121]/10 dark:border-white/10 overflow-x-auto rounded-2xl bg-white dark:bg-[#151B18] shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F6F5FA] dark:bg-[#1E2622] border-b border-[#212121]/10 dark:border-white/10 text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5">Tipe</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerList.map((entry) => {
                    const isPaid = entry.type === "paid" || entry.source === "affiliate_payout";
                    const title =
                      entry.referred_member_name ||
                      entry.description ||
                      (isPaid ? "Pencairan Komisi" : "Komisi Referral Masuk");
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-[#212121]/5 dark:border-white/5 last:border-b-0 hover:bg-[#F6F5FA]/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="p-3.5 text-neutral-500 dark:text-neutral-400 font-sans whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3.5 text-neutral-800 dark:text-neutral-200 font-medium">
                          {title}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-sans font-semibold tracking-wider inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                              <Check size={10} /> Sudah Terbayar
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-sans font-semibold tracking-wider inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full">
                              <Clock size={10} /> Siap Cair
                            </span>
                          )}
                        </td>
                        <td
                          className={`p-3.5 text-right font-mono font-bold whitespace-nowrap ${isPaid ? "text-[#212121] dark:text-white" : "text-emerald-700 dark:text-emerald-400"
                            }`}
                        >
                          {isPaid ? "" : "+"} Rp {entry.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(entry)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-sans font-semibold rounded-full border border-[#212121]/10 dark:border-white/10 hover:bg-[#F6F5FA] dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                            title="Lihat Rincian & Bukti Transfer"
                          >
                            <Eye size={12} />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE COMPACT LIST VIEW (BELOW MD) */}
            <div className="block md:hidden divide-y divide-[#212121]/5 dark:divide-white/5 border-t border-b border-[#212121]/10 dark:border-white/10">
              {ledgerList.map((entry) => {
                const isPaid = entry.type === "paid" || entry.source === "affiliate_payout";
                const formattedDate = new Date(entry.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const title =
                  entry.referred_member_name ||
                  entry.description ||
                  (isPaid ? "Pencairan Komisi" : "Komisi Referral");

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedDetail(entry)}
                    className="flex items-center justify-between py-2.5 px-1 hover:bg-[#F6F5FA] dark:hover:bg-neutral-900/40 transition-colors cursor-pointer group gap-3"
                  >
                    {/* Left Column: Title & Issued Date */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-xs text-[#212121] dark:text-white truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                        {title}
                      </h5>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                        Issued {formattedDate}
                      </p>
                    </div>

                    {/* Right Column: Amount & Status Badge */}
                    <div className="text-right shrink-0">
                      <div className={`font-semibold text-xs font-mono ${isPaid ? "text-[#212121] dark:text-white" : "text-emerald-700 dark:text-emerald-400"}`}>
                        {isPaid ? "" : "+"}Rp {entry.amount.toLocaleString("id-ID")}
                      </div>
                      <div className="mt-0.5">
                        {isPaid ? (
                          <span className="inline-block px-2 py-0.5 text-[9px] font-sans font-semibold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                            PAID
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[9px] font-sans font-semibold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Far Right: 3-dots action icon */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetail(entry);
                        }}
                        className="p-1 text-neutral-400 hover:text-[#212121] dark:text-neutral-500 dark:hover:text-white transition-colors cursor-pointer"
                        title="Lihat Detail Transaksi"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL MUTASI KOMISI */}
      {selectedDetail && (
        <Modal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          title="Rincian Transaksi Komisi"
          subtitle={`ID: #${selectedDetail.id.substring(0, 8)}...`}
          icon={<FileText className="w-5 h-5 text-[#212121] dark:text-neutral-300" />}
          maxWidth="max-w-lg"
          footer={
            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="w-full py-2.5 bg-[#212121] hover:opacity-90 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-[#212121] font-sans text-xs font-bold transition-all cursor-pointer rounded-xl shadow-2xs hover:scale-[1.01] active:scale-95"
            >
              Tutup
            </button>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Status & Amount Highlight */}
            <div className="p-4 rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-[#F6F5FA] dark:bg-[#1E2622] flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block mb-1 font-bold">
                  Nominal Komisi
                </span>
                <span className="text-xl font-bold font-mono text-[#212121] dark:text-white">
                  Rp {selectedDetail.amount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-right">
                {selectedDetail.type === "paid" || selectedDetail.source === "affiliate_payout" ? (
                  <span className="px-3 py-1 text-xs font-sans font-semibold uppercase inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                    <CheckCircle2 size={12} /> Sudah Ditransfer
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-sans font-semibold uppercase inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full">
                    <Clock size={12} /> Siap Cair
                  </span>
                )}
              </div>
            </div>

            {/* Informasi Detail Transaksi */}
            <ModalSection title="Informasi Transaksi & Mutasi">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-neutral-500 dark:text-neutral-400">Tanggal Komisi Masuk:</span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    {new Date(selectedDetail.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-neutral-500 dark:text-neutral-400">Tanggal Pembayaran:</span>
                  <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    {selectedDetail.paid_at ? (
                      new Date(selectedDetail.paid_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    ) : selectedDetail.type === "paid" ? (
                      new Date(selectedDetail.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-sans italic">
                        Belum Ditransfer (Menunggu Admin)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-neutral-500 dark:text-neutral-400">Keterangan:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 text-right max-w-[240px]">
                    {selectedDetail.description || (selectedDetail.type === "paid" ? "Pencairan Komisi" : "Komisi Referral Masuk")}
                  </span>
                </div>
                {selectedDetail.reference_id && (
                  <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                    <span className="text-neutral-500 dark:text-neutral-400">ID Referensi:</span>
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      {selectedDetail.reference_id}
                    </span>
                  </div>
                )}
                {selectedDetail.order_id && (
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500 dark:text-neutral-400">Nomor Order ID:</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {selectedDetail.order_id}
                    </span>
                  </div>
                )}
              </div>
            </ModalSection>

            {/* Data Teman yang Diaffiliatekan / Pendaftar */}
            {(selectedDetail.referred_member_name ||
              selectedDetail.source === "referral_reward" ||
              selectedDetail.description?.includes("Komisi referral")) && (
                <ModalSection title="Data Teman yang Diaffiliatekan">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                      <span className="text-neutral-500 dark:text-neutral-400">Nama Teman:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {selectedDetail.referred_member_name ||
                          selectedDetail.description?.replace("Komisi referral dari pendaftaran ", "") ||
                          "-"}
                      </span>
                    </div>
                  </div>
                </ModalSection>
              )}

            {/* Informasi Rekening Tujuan Payout (Jika ada) */}
            {(selectedDetail.bank_name || selectedDetail.account_number || selectedDetail.account_holder) && (
              <ModalSection title="Rekening Penerima Payout">
                <div className="space-y-2 text-xs">
                  {selectedDetail.bank_name && (
                    <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                      <span className="text-neutral-500 dark:text-neutral-400">Bank / E-Wallet:</span>
                      <span className="font-bold text-neutral-900 dark:text-white uppercase font-mono">
                        {selectedDetail.bank_name}
                      </span>
                    </div>
                  )}
                  {selectedDetail.account_number && (
                    <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                      <span className="text-neutral-500 dark:text-neutral-400">Nomor Rekening:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {selectedDetail.account_number}
                      </span>
                    </div>
                  )}
                  {selectedDetail.account_holder && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500 dark:text-neutral-400">Atas Nama:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {selectedDetail.account_holder}
                      </span>
                    </div>
                  )}
                </div>
              </ModalSection>
            )}

            {/* Catatan Admin (Jika ada) */}
            {selectedDetail.notes && (
              <ModalSection title="Catatan dari Admin">
                <p className="text-neutral-700 dark:text-neutral-300 italic text-xs leading-relaxed">
                  "{selectedDetail.notes}"
                </p>
              </ModalSection>
            )}

            {/* Bukti Transfer */}
            <ModalSection title="Bukti Transfer Pembayaran">
              {selectedDetail.proof_url ? (
                <div className="space-y-2.5">
                  <div
                    onClick={() => {
                      setPreviewZoomImage(selectedDetail.proof_url!);
                      setZoomScale(1);
                    }}
                    className="group relative border border-[#212121]/10 dark:border-white/10 bg-[#F6F5FA] dark:bg-[#1E2622] p-2 text-center rounded-2xl overflow-hidden cursor-zoom-in transition-all hover:border-neutral-400 dark:hover:border-neutral-600 shadow-2xs"
                    title="Klik untuk memperbesar gambar (Zoom)"
                  >
                    <img
                      src={selectedDetail.proof_url}
                      alt="Bukti Transfer Pembayaran"
                      className="max-h-64 mx-auto object-contain rounded-xl border border-[#212121]/10 dark:border-white/10 transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white font-mono text-xs font-bold pointer-events-none rounded-2xl">
                      <ZoomIn size={24} className="text-white drop-shadow-md animate-pulse" />
                      <span>Klik untuk Zoom Gambar</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewZoomImage(selectedDetail.proof_url!);
                        setZoomScale(1);
                      }}
                      className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-sans text-xs cursor-pointer"
                    >
                      <ZoomIn size={13} />
                      <span>Perbesar (Zoom Lightbox)</span>
                    </button>
                    <a
                      href={selectedDetail.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-sans text-xs"
                    >
                      <ExternalLink size={13} />
                      <span>Buka Tab Baru</span>
                    </a>
                  </div>
                </div>
              ) : selectedDetail.type === "paid" || selectedDetail.source === "affiliate_payout" ? (
                <p className="text-neutral-500 dark:text-neutral-400 italic text-xs py-1">
                  Tidak ada lampiran foto bukti transfer dari admin untuk transaksi ini.
                </p>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400 italic text-xs py-1">
                  Bukti transfer akan otomatis ditampilkan di sini setelah pembayaran diselesaikan dan diunggah oleh admin.
                </p>
              )}
            </ModalSection>
          </div>
        </Modal>
      )}

      {/* FULLSCREEN IMAGE ZOOM LIGHTBOX (PORTALED TO DOCUMENT.BODY TO APPEAR IN FRONT OF DIALOG MODAL) */}
      {isMounted && previewZoomImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewZoomImage(null)}
        >
          {/* TOP CONTROLS BAR */}
          <div
            className="absolute top-3 sm:top-4 left-0 right-0 px-3 sm:px-6 flex items-center justify-between gap-2 z-10 text-white max-w-5xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/90 border border-neutral-700 px-3 py-1.5 text-xs font-sans rounded-full truncate">
              <ImageIcon size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">Bukti Transfer</span>
              <span className="text-neutral-400 text-[10px]">({Math.round(zoomScale * 100)}%)</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex items-center bg-neutral-900/90 border border-neutral-700 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomScale((prev) => Math.min(prev + 0.3, 3.5));
                  }}
                  className="p-2 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomScale((prev) => Math.max(prev - 0.3, 0.6));
                  }}
                  className="p-2 hover:bg-neutral-800 text-white transition-colors cursor-pointer border-l border-neutral-700"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomScale(1);
                  }}
                  className="p-2 hover:bg-neutral-800 text-white transition-colors cursor-pointer border-l border-neutral-700"
                  title="Reset Ukuran (100%)"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              <a
                href={previewZoomImage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-900/90 border border-neutral-700 hover:bg-neutral-800 text-white transition-colors cursor-pointer rounded-full"
                title="Buka Tab Baru"
              >
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                onClick={() => setPreviewZoomImage(null)}
                className="p-2 bg-red-600/90 hover:bg-red-600 text-white border border-red-500 transition-colors cursor-pointer rounded-full"
                title="Tutup (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* IMAGE DISPLAY CONTAINER */}
          <div
            className="w-full max-w-5xl max-h-[82vh] overflow-auto flex items-center justify-center p-2 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewZoomImage}
              alt="Bukti Transfer Zoom Penuh"
              style={{ transform: `scale(${zoomScale})` }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-neutral-800 shadow-2xl transition-transform duration-150 cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* BOTTOM HELPER TEXT */}
          <p className="text-xs font-sans text-neutral-400 mt-2 sm:mt-3 tracking-wider text-center px-4">
            Klik di luar gambar atau tombol silang untuk menutup
          </p>
        </div>,
        document.body
      )}

      {/* POPUP MODAL KODE AFFILIATE */}
      <GenerateAffiliateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        affiliateCode={affiliateCode}
      />
    </div>
  );
}



