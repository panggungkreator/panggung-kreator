"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, PortfolioItem } from "@/lib/types/member";
import PortfolioForm from "@/components/member/PortfolioForm";
import ProfileNavbar from "../../components/ProfileNavbar";
import Footer from "@/components/community/Footer";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EditPortfolioPageProps {
  params?: Promise<{ id: string }> | { id: string };
}

export default function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  const routeParams = useParams();
  const rawId = routeParams?.id;
  const portfolioId = (Array.isArray(rawId) ? rawId[0] : (rawId as string)) || "";

  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
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

        // 1. Fetch member
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*, interests:member_interests(*)")
          .eq("id", user.id)
          .single();

        if (memberError) throw memberError;
        if (isMounted) setMember(memberData as MemberProfile);

        // 2. Fetch specific portfolio item
        const { data: itemData, error: itemError } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("id", portfolioId)
          .eq("member_id", user.id)
          .maybeSingle();

        if (itemError || !itemData) {
          if (isMounted) setNotFound(true);
          return;
        }

        if (isMounted) setPortfolioItem(itemData as PortfolioItem);
      } catch (err: unknown) {
        console.error("Error loading portfolio item for edit:", err);
        toast.error("Gagal memuat item portofolio.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [portfolioId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white font-sans gap-3">
        <Loader2 className="animate-spin h-7 w-7 text-neutral-900 dark:text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Memuat Data Portofolio...
        </span>
      </div>
    );
  }

  if (notFound || !portfolioItem || !member) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">
        {member && <ProfileNavbar member={member} />}
        <div className="max-w-xl w-full mx-auto my-auto p-8 text-center space-y-4 border border-dashed border-neutral-300 dark:border-neutral-800">
          <AlertCircle size={32} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Karya Tidak Ditemukan</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Item portofolio ini tidak ditemukan atau Anda tidak memiliki akses untuk mengubahnya.
          </p>
          <div className="pt-2">
            <Link
              href="/myprofile?tab=portfolio"
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider rounded-none"
            >
              <ArrowLeft size={14} /> Kembali ke Portofolio
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">
      <ProfileNavbar member={member} />

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
              Edit Portofolio Karya
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
              Perbarui rincian karya, ganti tautan/berkas, atau atur status publikasi.
            </p>
          </div>
        </div>

        {/* Portfolio Form Container */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <PortfolioForm memberId={member.id} initialData={portfolioItem} mode="edit" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
