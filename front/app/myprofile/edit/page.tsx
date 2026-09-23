"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile } from "@/lib/types/member";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, AlertTriangle, Eye, ExternalLink } from "lucide-react";
import { isDedicatedAdmin } from "@/lib/constants";

import EditProfileSidebar, {
  ProfileEditTabId,
} from "./components/EditProfileSidebar";
import ProfileEditSkeleton from "./components/ProfileEditSkeleton";
import UnsavedChangesBar from "@/app/(admin)/admin/settings/UnsavedChangesBar";
import GeneralInfoPanel from "./panels/GeneralInfoPanel";
import SocialLinksPanel from "./panels/SocialLinksPanel";
import ShowcasePanel, { ShowcaseSubTab } from "./panels/ShowcasePanel";
import AccountSecurityPanel from "./panels/AccountSecurityPanel";
import UnderConstruction from "../components/UnderConstruction";
import { getTabVisibilitySettingsAction, TabVisibilitySettings } from "@/lib/actions/settings-actions";

export default function EditProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tabSettings, setTabSettings] = useState<TabVisibilitySettings>({
    tab_attendance_enabled: true,
    tab_portfolio_enabled: true,
    tab_affiliate_enabled: true,
  });

  // Sub-tab for Portofolio & Rekam Jejak showcase (default ke experience karena portfolio di-hide)
  const [showcaseSubTab, setShowcaseSubTab] = useState<ShowcaseSubTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const subParam = params.get("sub") as ShowcaseSubTab;
      if (tabParam === "pengalaman" || subParam === "experience") return "experience";
      if (tabParam === "portofolio" || subParam === "portfolio") return "portfolio";
      if (tabParam === "prestasi" || subParam === "achievement") return "portfolio";
      if (subParam && ["experience", "portfolio"].includes(subParam)) {
        return subParam;
      }
    }
    return "experience";
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<ProfileEditTabId>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["pengalaman", "portofolio", "prestasi"].includes(tabParam)) {
        return "portofolio";
      }
      if (
        tabParam &&
        ["identitas", "sosial", "portofolio", "keamanan"].includes(tabParam)
      ) {
        return tabParam as ProfileEditTabId;
      }
    }
    return "identitas";
  });

  // Modal confirm tab switch when dirty
  const [pendingTab, setPendingTab] = useState<ProfileEditTabId | null>(null);

  // Floating back button visibility on scroll
  const [showFloatingBack, setShowFloatingBack] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowFloatingBack(true);
      } else {
        setShowFloatingBack(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Unsaved changes tracking per tab
  const [isGeneralDirty, setIsGeneralDirty] = useState(false);
  const [isSocialDirty, setIsSocialDirty] = useState(false);

  const unsavedTabs: Partial<Record<ProfileEditTabId, boolean>> = {
    identitas: isGeneralDirty,
    sosial: isSocialDirty,
  };

  const hasActiveTabUnsaved = !!unsavedTabs[activeTab];

  // Save / Discard trigger refs
  const generalSaveRef = useRef<(() => Promise<void>) | null>(null);
  const generalDiscardRef = useRef<(() => void) | null>(null);
  const socialSaveRef = useRef<(() => Promise<void>) | null>(null);
  const socialDiscardRef = useRef<(() => void) | null>(null);

  const handleTabChange = (tabId: ProfileEditTabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const disabledTabs: Partial<Record<ProfileEditTabId, boolean>> = {
    portofolio: !tabSettings.tab_portfolio_enabled,
  };

  const handleTabSwitchRequest = (targetTab: ProfileEditTabId) => {
    if (targetTab === activeTab) return;
    if (disabledTabs[targetTab]) return;
    if (hasActiveTabUnsaved) {
      setPendingTab(targetTab);
    } else {
      handleTabChange(targetTab);
    }
  };

  const handleSaveActiveTab = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "identitas" && generalSaveRef.current) {
        await generalSaveRef.current();
      } else if (activeTab === "sosial" && socialSaveRef.current) {
        await socialSaveRef.current();
      }
    } catch (err: any) {
      console.error("Save active tab error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardActiveTab = () => {
    if (activeTab === "identitas" && generalDiscardRef.current) {
      generalDiscardRef.current();
    } else if (activeTab === "sosial" && socialDiscardRef.current) {
      socialDiscardRef.current();
    }
  };

  const handleConfirmDiscardAndSwitch = () => {
    handleDiscardActiveTab();
    if (pendingTab) {
      handleTabChange(pendingTab);
      setPendingTab(null);
    }
  };

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

      const [memberRes, tabVisRes] = await Promise.all([
        supabase
          .from("members")
          .select("*, interests:member_interests(*)")
          .eq("id", user.id)
          .single(),
        getTabVisibilitySettingsAction(),
      ]);

      if (tabVisRes) {
        setTabSettings(tabVisRes);
        if (!tabVisRes.tab_portfolio_enabled && activeTab === "portofolio") {
          setActiveTab("identitas");
        }
      }

      const { data, error } = memberRes;

      if (error) throw error;

      if (data) {
        if (isDedicatedAdmin(data.username)) {
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

        if (!hasCompletedInterests) {
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

  const handleMemberUpdated = (partialUpdates?: Partial<MemberProfile>) => {
    if (partialUpdates) {
      setMember((prev) => (prev ? { ...prev, ...partialUpdates } : null));
    }
    router.push("/myprofile");
    router.refresh();
  };

  const handleUsernameChanged = (newUsername: string) => {
    setMember((prev) => (prev ? { ...prev, username: newUsername } : null));
    router.push("/myprofile");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full bg-bg-app text-text-primary font-sans relative">
      {/* 🔙 FLOATING BACK BUTTON ON TOP LEFT WHEN SCROLLED */}
      <div
        className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
          showFloatingBack
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <Link
          href="/myprofile"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 dark:bg-[#1C1C1C]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg text-text-primary hover:scale-105 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
          title="Kembali ke Profil"
        >
          <ArrowLeft size={14} className="shrink-0" />
          <span className="font-sans">Kembali</span>
        </Link>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-44 sm:pb-36 space-y-8 animate-fade-in">
        {/* SKELETON LOADING STATE */}
        {isLoading ? (
          <ProfileEditSkeleton />
        ) : !member ? null : (
          <>
            {/* HEADER SECTION (IDENTICAL TO SETTINGS CLIENT) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/myprofile"
                  className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                  title="Kembali ke Profil"
                >
                  <ArrowLeft size={14} />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">
                      [ PENGATURAN DATA TALENT ]
                    </span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase mt-1">
                    Edit Profil Member
                  </h1>
                  <p className="text-xs text-text-secondary mt-1">
                    Kelola informasi identitas diri, tautan sosial media, jam terbang, portofolio karya, dan keamanan akun
                  </p>
                </div>
              </div>

              {/* PREVIEW PUBLIK (Hanya muncul di desktop saat tab Portofolio & Rekam Jejak aktif dan diizinkan) */}
              {activeTab === "portofolio" && member?.username && !disabledTabs.portofolio && (
                <div className="hidden sm:flex items-center self-start sm:self-center shrink-0">
                  <Link
                    href={`/talent/${member.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-default bg-bg-card hover:bg-bg-well text-text-secondary hover:text-text-primary text-xs font-semibold transition-all shadow-2xs cursor-pointer group"
                    title="Lihat Halaman Publik Talent"
                  >
                    <Eye size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span>Preview Publik</span>
                    <ExternalLink size={11} className="text-text-muted group-hover:text-text-secondary transition-colors" />
                  </Link>
                </div>
              )}
            </div>

            {/* MAIN GRID LAYOUT (12 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SIDEBAR NAVIGATION (col-span-3) */}
              <div className="lg:col-span-3 lg:sticky lg:top-4">
                <EditProfileSidebar
                  activeTab={activeTab}
                  onTabChange={handleTabSwitchRequest}
                  unsavedTabs={unsavedTabs}
                  disabledTabs={disabledTabs}
                />
              </div>

              {/* MAIN PANEL CONTENT (col-span-9) */}
              <div className="lg:col-span-9 space-y-6">
                {activeTab === "identitas" && (
                  <GeneralInfoPanel
                    member={member}
                    onSaved={handleMemberUpdated}
                    onDirtyChange={setIsGeneralDirty}
                    saveTriggerRef={generalSaveRef}
                    discardTriggerRef={generalDiscardRef}
                  />
                )}

                {activeTab === "sosial" && (
                  <SocialLinksPanel
                    member={member}
                    onSaved={handleMemberUpdated}
                    onDirtyChange={setIsSocialDirty}
                    saveTriggerRef={socialSaveRef}
                    discardTriggerRef={socialDiscardRef}
                  />
                )}

                {activeTab === "portofolio" && member && (
                  disabledTabs.portofolio ? (
                    <UnderConstruction
                      title="Portofolio & Rekam Jejak"
                      description="Fitur manajemen portofolio karya dan rekam jejak saat ini sedang dinonaktifkan oleh administrator."
                      onBackToOverview={() => handleTabChange("identitas")}
                    />
                  ) : (
                    <ShowcasePanel
                      member={member}
                      initialSubTab={showcaseSubTab}
                      previewUrl={!disabledTabs.portofolio && member.username ? `/talent/${member.username}` : undefined}
                    />
                  )
                )}

                {activeTab === "keamanan" && (
                  <AccountSecurityPanel
                    member={member}
                    onUsernameChanged={handleUsernameChanged}
                  />
                )}
              </div>
            </div>

            {/* FLOATING UNSAVED CHANGES BAR (DESKTOP & RESPONSIVE) */}
            <UnsavedChangesBar
              hasChanges={hasActiveTabUnsaved}
              isSaving={isSaving}
              onSave={handleSaveActiveTab}
              onDiscard={handleDiscardActiveTab}
            />

            {/* CONFIRMATION MODAL SWITCH TAB WITH UNSAVED CHANGES */}
            {pendingTab && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-bg-card border border-border-default rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 text-amber-500">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary">
                      Perubahan Belum Disimpan
                    </h3>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Anda memiliki perubahan pada tab ini yang belum disimpan. Jika Anda berpindah tab sekarang, perubahan tersebut akan hilang.
                  </p>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => setPendingTab(null)}
                      className="flex-1 border border-border-default hover:bg-bg-well rounded-xl py-2.5 text-xs font-bold text-text-primary transition-colors cursor-pointer"
                    >
                      Tetap di Sini
                    </button>
                    <button
                      onClick={handleConfirmDiscardAndSwitch}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Tinggalkan Saja
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
