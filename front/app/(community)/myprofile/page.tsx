"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile } from "@/lib/types/member";
import ProfileForm from "@/components/member/ProfileForm";
import PortfolioManager from "@/components/member/PortfolioManager";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";
import { Copy, Gift, Award, LogOut, Check, Star, Users, DollarSign, ExternalLink } from "lucide-react";
import { signout } from "@/lib/actions/auth-actions";

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "affiliate">("profile");
  const [copied, setCopied] = useState(false);

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile & interests
      const { data: profile, error } = await supabase
        .from("members")
        .select("*, interests:member_interests(*)")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setMember(profile);

      // Fetch referrals
      const { data: refs } = await supabase
        .from("members")
        .select("id, full_name, email, membership_tier, created_at")
        .eq("referred_by", user.id);
      
      setReferrals(refs || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat profil.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  const handleCopyLink = () => {
    if (!member?.affiliate_code) return;
    const link = `${window.location.origin}/register?ref=${member.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link affiliate berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignout = async () => {
    await signout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-black dark:text-white font-sans">
        <svg className="animate-spin h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0A0A0A] text-black dark:text-white font-sans selection:bg-black selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex justify-between items-center border-b-2 border-black dark:border-zinc-800 pb-4">
          <h1 className="text-3xl font-serif italic tracking-tight leading-none text-black dark:text-white">
            Workspace <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-850 dark:text-zinc-300 uppercase text-2xl">
              {member.stage_name || member.full_name}
            </span>
          </h1>
          <button
            onClick={handleSignout}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 hover:border-black dark:hover:border-white transition-colors text-xs font-mono uppercase tracking-wider rounded-none flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={12} /> Keluar
          </button>
        </div>

        {/* PROFILE STATS / TIER SUMMARY CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 p-6 gap-6">
          <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-850 pb-4 md:pb-0 md:pr-4">
            <div className="bg-[#bc151b]/10 p-3 text-[#bc151b]">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-450 uppercase block">MEMBERSHIP TIER</span>
              <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                {member.membership_tier.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-850 pb-4 md:pb-0 md:pr-4">
            <div className="bg-emerald-500/10 p-3 text-emerald-500">
              <DollarSign size={24} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-450 uppercase block">SALDO KOMISI AFFILIATE</span>
              <span className="text-sm font-black text-black dark:text-white">
                Rp {(member.commission_balance || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 p-3 text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-450 uppercase block">TEMAN DIAJAK (REFERRALS)</span>
              <span className="text-sm font-black text-black dark:text-white">
                {referrals.length} Orang
              </span>
            </div>
          </div>
        </div>

        {/* WORKSPACE SECTIONS NAVIGATION */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-850 gap-2">
          {(["profile", "portfolio", "affiliate"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border border-b-0 rounded-none cursor-pointer transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-[#121212] border-zinc-250 dark:border-zinc-800 text-black dark:text-white font-bold border-t-2 border-t-black dark:border-t-white"
                  : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab === "profile" ? "[ Edit Profil ]" : tab === "portfolio" ? "[ Kelola Portfolio ]" : "[ Program Affiliate ]"}
            </button>
          ))}
        </div>

        {/* CONTENT PANELS */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <ProfileForm member={member} onSave={fetchMemberData} />
          )}

          {activeTab === "portfolio" && (
            <PortfolioManager memberId={member.id} />
          )}

          {activeTab === "affiliate" && (
            <div className="bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 p-6 md:p-8 space-y-6 animate-fade-in text-black dark:text-white">
              
              <div className="space-y-2">
                <h3 className="text-lg font-serif italic text-black dark:text-white">
                  Program Affiliate Panggung Kreator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed max-w-2xl">
                  Bagikan tautan referal unik Anda. Dapatkan komisi instan setelah pendaftar baru melakukan pembayaran membership dan berhasil dikonfirmasi lunas oleh Admin.
                </p>
              </div>

              {/* Affiliate Link Clipboard */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-4 max-w-xl space-y-2">
                <span className="text-[10px] font-mono text-zinc-450 block uppercase">LINK AFFILIATE ANDA</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/register?ref=${member.affiliate_code}`}
                    className="flex-1 bg-neutral-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono rounded-none text-zinc-500 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white transition-colors text-xs font-mono uppercase tracking-wider rounded-none flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Referred Friends Table */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-450 block uppercase tracking-wider">
                  [ DAFTAR REFERRAL TEMAN YANG BERGABUNG ]
                </span>

                {referrals.length === 0 ? (
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500 dark:text-zinc-450 font-mono">
                    [ BELUM ADA TEMAN YANG BERGABUNG MENGGUNAKAN KODE ANDA ]
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto rounded-none">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                          <th className="p-3">Nama</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Membership</th>
                          <th className="p-3">Tanggal Gabung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((ref) => (
                          <tr key={ref.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                            <td className="p-3 font-bold text-black dark:text-white">{ref.full_name}</td>
                            <td className="p-3 text-zinc-500 dark:text-zinc-450">{ref.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                                ref.membership_tier !== "free" 
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                              }`}>
                                {ref.membership_tier}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-500 dark:text-zinc-450">
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
          )}
        </div>

      </div>
    </div>
  );
}
