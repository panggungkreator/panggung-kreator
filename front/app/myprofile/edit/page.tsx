"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile } from "@/lib/types/member";
import ProfileForm from "@/components/member/ProfileForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import ProfileNavbar from "../components/ProfileNavbar";
import Footer from "@/components/community/Footer";

export default function EditProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemberData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (data) {
        if (data.role === "admin") {
          const isLocalhost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          const adminUrl =
            !isLocalhost && process.env.NEXT_PUBLIC_ADMIN_URL
              ? process.env.NEXT_PUBLIC_ADMIN_URL
              : "/admin";
          window.location.href = adminUrl;
          return;
        }

        const interests = data.interests;
        const hasCompletedInterests =
          interests &&
          (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);

        if (data.role === "member" && !hasCompletedInterests) {
          router.replace("/myprofile/onboarding");
          return;
        }
      }

      setMember(data as MemberProfile);
    } catch (err: any) {
      console.error("Error loading profile for edit:", err);
      toast.error("Gagal memuat data profil.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const handleSaveSuccess = () => {
    toast.success("Perubahan profil berhasil disimpan.");
    router.push("/myprofile");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white font-sans gap-3">
        <Loader2 className="animate-spin h-7 w-7 text-neutral-900 dark:text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Memuat Form Edit Profil...
        </span>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">
      <ProfileNavbar member={member} />

      <div className="max-w-4xl w-full mx-auto pt-20 sm:pt-28 pb-28 lg:pb-16 px-3.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 flex-1">
        {/* TOP BACK BAR & HEADER */}
        <div className="space-y-2 sm:space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-3 sm:pb-5">
          <Link
            href="/myprofile"
            className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            &larr; Kembali ke Profil
          </Link>

          <div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white font-normal">
              Edit Profil Member
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-sans">
              Perbarui data diri, foto profil, jejaring sosial, serta minat pilar keahlianmu.
            </p>
          </div>
        </div>

        {/* PROFILE FORM CONTAINER */}
        <div className="shadow-none sm:shadow-sm">
          <ProfileForm member={member} onSave={handleSaveSuccess} />
        </div>
      </div>
    </div>
  );
}
