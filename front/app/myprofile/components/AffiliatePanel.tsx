"use client";

import React, { useState } from "react";
import { MemberProfile, ReferralMember, CommissionLedgerEntry } from "@/lib/types/member";
import { Copy, Check, Eye, ExternalLink, Calendar, CreditCard, Clock, FileText, CheckCircle2, Image as ImageIcon, Loader2, Users, Receipt } from "lucide-react";
import { toast } from "sonner";
import { generateAffiliateCodeAction } from "@/lib/actions/referral-actions";
import GenerateAffiliateModal from "@/components/member/GenerateAffiliateModal";
import { Modal, ModalSection } from "@/components/ui/Modal";

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
  const [activeSubTab, setActiveSubTab] = useState<"referrals" | "ledger">("referrals");
  const [selectedDetail, setSelectedDetail] = useState<CommissionLedgerEntry | null>(null);

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

      {/* SUB-TABS NAVIGATION */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("referrals")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 rounded-none cursor-pointer border ${
              activeSubTab === "referrals"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold"
                : "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            <Users size={13} />
            <span>Daftar Teman ({referrals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("ledger")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 rounded-none cursor-pointer border ${
              activeSubTab === "ledger"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold"
                : "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            <Receipt size={13} />
            <span>Riwayat Mutasi Komisi ({ledger.length})</span>
          </button>
        </div>

        {/* TAB CONTENT 1: DAFTAR TEMAN */}
        {activeSubTab === "referrals" && (
          <div className="space-y-3 animate-fade-in">
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
        )}

        {/* TAB CONTENT 2: RIWAYAT MUTASI KOMISI */}
        {activeSubTab === "ledger" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                [ RIWAYAT MUTASI KOMISI & REWARD ]
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {ledger.length} TRANSAKSI
              </span>
            </div>

            {ledger.length === 0 ? (
              <div className="border border-dashed border-neutral-300 dark:border-neutral-800 py-8 text-center text-xs text-neutral-500 font-mono rounded-none">
                [ BELUM ADA RIWAYAT MUTASI KOMISI ]
              </div>
            ) : (
              <div className="border border-neutral-200 dark:border-neutral-800 overflow-x-auto rounded-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Keterangan</th>
                      <th className="p-3.5">Tipe</th>
                      <th className="p-3.5 text-right">Nominal</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => {
                      const isPaid = entry.type === "paid" || entry.source === "affiliate_payout";
                      return (
                        <tr
                          key={entry.id}
                          className="border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors"
                        >
                          <td className="p-3.5 text-neutral-500 dark:text-neutral-400 font-mono whitespace-nowrap">
                            {new Date(entry.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3.5 text-neutral-800 dark:text-neutral-200 font-medium">
                            {entry.description || (isPaid ? "Pencairan Komisi" : "Komisi Referral Masuk")}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {isPaid ? (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-sm">
                                <Check size={10} /> Sudah Terbayar
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-sm">
                                <Clock size={10} /> Siap Cair
                              </span>
                            )}
                          </td>
                          <td
                            className={`p-3.5 text-right font-mono font-bold whitespace-nowrap ${
                              isPaid ? "text-neutral-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isPaid ? "" : "+"} Rp {entry.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedDetail(entry)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
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
            )}
          </div>
        )}
      </div>

      {/* DETAIL MODAL MUTASI KOMISI */}
      {selectedDetail && (
        <Modal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          title="Rincian Transaksi Komisi"
          subtitle={`ID: #${selectedDetail.id.substring(0, 8)}...`}
          icon={<FileText className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />}
          maxWidth="max-w-lg"
          footer={
            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer border border-neutral-900 dark:border-white rounded-none"
            >
              Tutup
            </button>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Status & Amount Highlight */}
            <div className="p-4 rounded-none border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                  Nominal Komisi
                </span>
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                  Rp {selectedDetail.amount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-right">
                {selectedDetail.type === "paid" || selectedDetail.source === "affiliate_payout" ? (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-sm">
                    <CheckCircle2 size={12} /> Sudah Ditransfer
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-sm">
                    <Clock size={12} /> Siap Cair (Menunggu Transfer)
                  </span>
                )}
              </div>
            </div>

            {/* Informasi Detail Transaksi */}
            <ModalSection title="Informasi Transaksi">
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
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500 dark:text-neutral-400">ID Referensi:</span>
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      {selectedDetail.reference_id}
                    </span>
                  </div>
                )}
              </div>
            </ModalSection>

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
                  <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-2 text-center rounded-none overflow-hidden">
                    <img
                      src={selectedDetail.proof_url}
                      alt="Bukti Transfer Pembayaran"
                      className="max-h-64 mx-auto object-contain rounded-none border border-neutral-200 dark:border-neutral-800"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={selectedDetail.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      <ExternalLink size={13} />
                      <span>Buka Gambar Ukuran Penuh</span>
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

      {/* POPUP MODAL KODE AFFILIATE */}
      <GenerateAffiliateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        affiliateCode={affiliateCode}
      />
    </div>
  );
}


