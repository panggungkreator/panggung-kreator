"use client";

import React, { useState } from "react";
import { MemberProfile, ReferralMember } from "@/lib/types/member";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface AffiliatePanelProps {
  member: MemberProfile;
  referrals: ReferralMember[];
}

export default function AffiliatePanel({ member, referrals }: AffiliatePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!member?.affiliate_code) return;
    const link = `${window.location.origin}/register?ref=${member.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link affiliate berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const affiliateLink = typeof window !== "undefined" && member?.affiliate_code
    ? `${window.location.origin}/register?ref=${member.affiliate_code}`
    : `/register?ref=${member?.affiliate_code || ""}`;

  return (
    <div className="bg-transparent border-0 p-0 space-y-6 animate-fade-in text-neutral-900 dark:text-neutral-100 w-full rounded-none">
      <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="text-lg font-bold font-sans text-neutral-900 dark:text-white">
          <span className="highlight-stabilo">Program Affiliate Panggung Kreator</span>
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl font-sans">
          Bagikan tautan referal unik Anda. Dapatkan komisi instan setelah pendaftar baru melakukan pembayaran membership dan berhasil dikonfirmasi lunas oleh Admin.
        </p>
      </div>

      {/* COMMISSION BALANCE & STATS SUMMARY */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 flex flex-wrap gap-8">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ SALDO KOMISI ]
          </span>
          <span className="text-lg font-bold font-sans text-neutral-900 dark:text-white">
            <span className="highlight-stabilo">Rp {(member.commission_balance || 0).toLocaleString("id-ID")}</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ TOTAL REFERRAL ]
          </span>
          <span className="text-lg font-bold font-sans text-neutral-900 dark:text-white">
            <span className="highlight-stabilo">{referrals.length} TEMAN</span>
          </span>
        </div>
      </div>

      {/* AFFILIATE LINK CLIPBOARD */}
      {member?.affiliate_code ? (
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 max-w-xl space-y-2.5 bg-transparent">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            [ LINK AFFILIATE UNIK ANDA ]
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
        </div>
      ) : (
        <div className="border border-neutral-300 dark:border-neutral-700 bg-transparent p-4 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          [ KODE AFFILIATE BELUM TERSEDIA UNTUK AKUN INI ]
        </div>
      )}

      {/* REFERRED FRIENDS TABLE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
            [ DAFTAR REFERRAL TEMAN YANG BERGABUNG ]
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            {referrals.length} TEMAN
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="border border-dashed border-neutral-300 dark:border-neutral-800 py-10 text-center text-xs text-neutral-500 font-mono rounded-none">
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
    </div>
  );
}
