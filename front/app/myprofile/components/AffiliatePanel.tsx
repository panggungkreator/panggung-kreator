"use client";

import React, { useState } from "react";
import { MemberProfile, ReferralMember, CommissionLedgerEntry } from "@/lib/types/member";
import { Copy, Check, TrendingUp, Gift, ArrowDownRight, ArrowUpRight, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAffiliateCodeAction } from "@/lib/actions/referral-actions";
import GenerateAffiliateModal from "@/components/member/GenerateAffiliateModal";

interface AffiliatePanelProps {
  member: MemberProfile;
  referrals: ReferralMember[];
  ledger?: CommissionLedgerEntry[];
  onAffiliateGenerated?: (code: string) => void;
}

export default function AffiliatePanel({
  member,
  referrals,
  ledger = [],
  onAffiliateGenerated,
}: AffiliatePanelProps) {
  const [copied, setCopied] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(member?.affiliate_code || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const affiliateLink = typeof window !== "undefined" && affiliateCode
    ? `${window.location.origin}/akademi/checkout?ref=${affiliateCode}`
    : `/akademi/checkout?ref=${affiliateCode || ""}`;

  return (
    <div className="bg-transparent border-0 p-0 space-y-6 animate-fade-in text-neutral-900 dark:text-neutral-100 w-full rounded-none">
      <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="text-lg font-bold font-sans text-neutral-900 dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#bc151b]" />
          <span>Program Referral & <span className="highlight-stabilo">Affiliate</span> Panggung Kreator</span>
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl font-sans">
          Bagikan tautan referral unik Anda. Dapatkan komisi saldo setelah teman atau member baru melakukan pembayaran pendaftaran Akademi dan berhasil diverifikasi oleh Admin.
        </p>
      </div>

      {/* GENERATE CODE CTA CARD (Jika Belum Memiliki Kode Affiliate) */}
      {!affiliateCode && (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 space-y-3 rounded-none">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold font-sans text-sm text-neutral-900 dark:text-white">
                Aktifkan Kode Affiliate Anda
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                Buat kode referral kupon unik Anda dengan 1 klik untuk mulai membagikan tautan dan menghasilkan komisi.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-[#bc151b] hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-2 rounded-none disabled:opacity-50 border border-[#bc151b]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Membuat Kode...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Kode Affiliate &rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* COMMISSION BALANCE & STATS SUMMARY */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 flex flex-wrap gap-8">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ SALDO KOMISI ANDA ]
          </span>
          <span className="text-xl font-bold font-sans text-neutral-900 dark:text-white">
            Rp {(member.commission_balance || 0).toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ TOTAL TEMAN BERGABUNG ]
          </span>
          <span className="text-xl font-bold font-sans text-neutral-900 dark:text-white">
            {referrals.length} TEMAN
          </span>
        </div>
      </div>

      {/* AFFILIATE LINK CLIPBOARD */}
      {affiliateCode && (
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 max-w-xl space-y-2.5 bg-transparent">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            [ LINK REFERRAL UNIK ANDA ]
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={affiliateLink}
              className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 p-2.5 text-xs font-mono rounded-none text-neutral-800 dark:text-neutral-200 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-xs font-mono uppercase tracking-wider rounded-none flex items-center gap-1.5 cursor-pointer font-bold border border-neutral-900 dark:border-white"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">
            Kode Referral: <strong className="text-neutral-900 dark:text-white">{affiliateCode}</strong>
          </p>
        </div>
      )}


      {/* REFERRED FRIENDS TABLE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
            [ DAFTAR TEMAN YANG BERGABUNG ]
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            {referrals.length} TEMAN
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="border border-dashed border-neutral-300 dark:border-neutral-800 py-8 text-center text-xs text-neutral-500 font-mono rounded-none">
            [ BELUM ADA TEMAN YANG BERGABUNG MENGGUNAKAN KODE ANDA ]
          </div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-800 overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  <th className="p-3.5">Nama Teman</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Tier Membership</th>
                  <th className="p-3.5">Tanggal Gabung</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr
                    key={ref.id}
                    className="border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                      {ref.full_name}
                    </td>
                    <td className="p-3.5 text-neutral-500 dark:text-neutral-400 font-mono">
                      {ref.email || "-"}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-transparent text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                        {ref.membership_tier}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500 dark:text-neutral-400 font-mono">
                      {new Date(ref.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIWAYAT MUTASI SALDO KOMISI (LEDGER) */}
      {ledger.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
              [ RIWAYAT MUTASI KOMISI & REWARD ]
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {ledger.length} TRANSAKSI
            </span>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Keterangan</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5 text-right">Nominal</th>
                  <th className="p-3.5 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => {
                  const isCredit = entry.type === "credit";
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="p-3.5 text-neutral-500 dark:text-neutral-400 font-mono">
                        {new Date(entry.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 text-neutral-800 dark:text-neutral-200 font-medium">
                        {entry.description || (isCredit ? "Komisi Referral Masuk" : "Penggunaan Saldo")}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider inline-flex items-center gap-1 ${
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {isCredit ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                          {isCredit ? "Kredit" : "Debit"}
                        </span>
                      </td>
                      <td
                        className={`p-3.5 text-right font-mono font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isCredit ? "+" : "-"} Rp {entry.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400">
                        Rp {entry.balance_after.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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

