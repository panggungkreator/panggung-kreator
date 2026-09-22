"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile } from "@/lib/types/member";
import PortfolioForm from "@/components/member/PortfolioForm";
import ProfileNavbar from "../../components/ProfileNavbar";
import Footer from "@/components/community/Footer";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMemberData = async () => {
      try {
        const supabase = createClient();
        let {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          const { data: sessionData } = await supabase.auth.getSession();
          user = sessionData?.session?.user ?? null;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("members")
          .select("*, interests:member_interests(*)")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (isMounted) setMember(data as MemberProfile);
      } catch (err: unknown) {
        console.error("Error loading member for new portfolio:", err);
        toast.error("Gagal memuat profil member.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMemberData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white font-sans gap-3">
        <Loader2 className="animate-spin h-7 w-7 text-neutral-900 dark:text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Memuat Form Portofolio...
        </span>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">

      <div className="max-w-4xl w-full mx-auto pt-20 sm:pt-28 pb-28 lg:pb-16 px-3.5 sm:px-6 lg:px-8 space-y-6 flex-1">
        {/* Top Back Link & Header */}
        <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <Link
            href="/myprofile?tab=portfolio"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> [ Kembali ke Daftar Portofolio ]
          </Link>

          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-white font-normal">
              Tambah Portofolio Karya
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
              Bagikan karya terbaik, rekaman panggung, sertifikat, atau tulisan Anda untuk ditampilkan di etalase talent publik.
            </p>
          </div>
        </div>

        {/* Portfolio Form Container */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <PortfolioForm memberId={member.id} mode="add" />
        </div>
      </div>
    </div>
  );
}
