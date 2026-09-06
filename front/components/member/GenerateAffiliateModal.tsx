"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Copy, Check, Sparkles, Share2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  getReferralCommissionSettingsAction,
  ReferralCommissionSettings,
} from "@/lib/actions/settings-actions";

interface GenerateAffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  affiliateCode: string;
}

export default function GenerateAffiliateModal({
  isOpen,
  onClose,
  affiliateCode,
}: GenerateAffiliateModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<ReferralCommissionSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      getReferralCommissionSettingsAction()
        .then((settings) => setCommissionSettings(settings))
        .catch((err) => console.error("Gagal memuat setting komisi referral:", err));
    }
  }, [isOpen]);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/akademi/checkout?ref=${affiliateCode}`
      : `/akademi/checkout?ref=${affiliateCode}`;

  const handleCopyCode = () => {
    if (!affiliateCode) return;
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    toast.success("Kode affiliate berhasil disalin!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Link referral berhasil disalin!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6 pt-1 text-neutral-900 dark:text-white font-sans">
        {/* Header with Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#bc151b] font-bold block">
            [ KODE AFFILIATE AKTIF ]
          </span>
          <h3 className="text-xl font-bold font-sans">
            Selamat! Kode Kupon Anda Siap
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Gunakan kode ini atau bagikan link referral Anda untuk mulai mendapatkan komisi saldo saat rekan Anda bergabung ke Akademi.
          </p>
        </div>

        {/* STYLIZED COUPON BOX */}
        <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/50 p-5 text-center space-y-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            KODE REFERRAL / KUPON ANDA
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-neutral-900 dark:text-white bg-white dark:bg-black px-4 py-2 border border-neutral-300 dark:border-neutral-700 select-all shadow-sm">
              {affiliateCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer border border-neutral-900 dark:border-white shrink-0"
              title="Salin Kode"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Komisi standar:{" "}
            <strong>
              {commissionSettings ? (
                commissionSettings.mode === "percentage" ? (
                  `${commissionSettings.percentage}% dari total pembayaran member`
                ) : (
                  `Rp ${parseInt(commissionSettings.flatAmount.replace(/\D/g, "") || "10000", 10).toLocaleString("id-ID")} / pendaftar terkonfirmasi`
                )
              ) : (
                "Rp 10.000 / pendaftar terkonfirmasi"
              )}
            </strong>
          </p>
        </div>

        {/* LINK DIRECT SHARING */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
            Tautan Referral Langsung:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 p-2.5 text-xs font-mono text-neutral-800 dark:text-neutral-200 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-mono text-xs uppercase tracking-wider font-bold border border-neutral-900 dark:border-white shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? "Disalin" : "Salin Link"}</span>
            </button>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#bc151b] hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 border border-[#bc151b]"
          >
            <span>Buka Dashboard Affiliate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
