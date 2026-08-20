"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import {
  getAttendanceEmailSettingAction,
  saveAttendanceEmailSettingAction,
  getReferralCommissionSettingsAction,
  saveReferralCommissionSettingsAction,
  ReferralCommissionSettings,
} from "@/lib/actions/settings-actions";
import SettingsSidebar, { TabId } from "./SettingsSidebar";
import UnsavedChangesBar from "./UnsavedChangesBar";
import GeneralPanel from "./panels/GeneralPanel";
import AbsensiPanel from "./panels/AbsensiPanel";
import ReferralPanel from "./panels/ReferralPanel";

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal confirm tab switch
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  // Saved States (from DB)
  const [savedEmailEnabled, setSavedEmailEnabled] = useState(true);
  const [savedReferral, setSavedReferral] = useState<ReferralCommissionSettings>({
    mode: "flat",
    flatAmount: "10000",
    percentage: "10",
  });

  // Current Working States (Form)
  const [currentEmailEnabled, setCurrentEmailEnabled] = useState(true);
  const [currentReferral, setCurrentReferral] = useState<ReferralCommissionSettings>({
    mode: "flat",
    flatAmount: "10000",
    percentage: "10",
  });

  // Fetch initial settings from DB
  useEffect(() => {
    async function loadAllSettings() {
      setIsLoading(true);
      try {
        const [emailVal, referralVal] = await Promise.all([
          getAttendanceEmailSettingAction(),
          getReferralCommissionSettingsAction(),
        ]);

        setSavedEmailEnabled(emailVal);
        setCurrentEmailEnabled(emailVal);

        setSavedReferral(referralVal);
        setCurrentReferral(referralVal);
      } catch (err) {
        console.error("Error loading settings:", err);
        toast.error("Gagal memuat beberapa pengaturan sistem.");
      } finally {
        setIsLoading(false);
      }
    }
    loadAllSettings();
  }, []);

  // Check unsaved changes per tab
  const unsavedTabs = useMemo(() => {
    const isAbsensiUnsaved = currentEmailEnabled !== savedEmailEnabled;
    const isReferralUnsaved =
      currentReferral.mode !== savedReferral.mode ||
      currentReferral.flatAmount !== savedReferral.flatAmount ||
      currentReferral.percentage !== savedReferral.percentage;

    return {
      general: false,
      absensi: isAbsensiUnsaved,
      referral: isReferralUnsaved,
    };
  }, [currentEmailEnabled, savedEmailEnabled, currentReferral, savedReferral]);

  // Current active tab has unsaved changes?
  const hasActiveTabUnsaved = unsavedTabs[activeTab];

  // Tab switch request handler
  const handleTabSwitchRequest = (targetTab: TabId) => {
    if (targetTab === activeTab) return;

    if (hasActiveTabUnsaved) {
      setPendingTab(targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  // Confirm tab switch (discard changes on current tab)
  const handleConfirmDiscardAndSwitch = () => {
    if (activeTab === "absensi") {
      setCurrentEmailEnabled(savedEmailEnabled);
    } else if (activeTab === "referral") {
      setCurrentReferral(savedReferral);
    }

    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  // Discard changes on active tab
  const handleDiscardActiveTabChanges = () => {
    if (activeTab === "absensi") {
      setCurrentEmailEnabled(savedEmailEnabled);
      toast.info("Perubahan pengaturan Absensi dibuang.");
    } else if (activeTab === "referral") {
      setCurrentReferral(savedReferral);
      toast.info("Perubahan pengaturan Referral dibuang.");
    }
  };

  // Save changes on active tab
  const handleSaveActiveTabSettings = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "absensi") {
        const res = await saveAttendanceEmailSettingAction(currentEmailEnabled);
        if (res.success) {
          setSavedEmailEnabled(currentEmailEnabled);
          toast.success(
            currentEmailEnabled
              ? "Pengaturan disetujui: Email absensi DIAKTIFKAN."
              : "Pengaturan disetujui: Email absensi DINONAKTIFKAN."
          );
        } else {
          toast.error(res.error || "Gagal menyimpan pengaturan absensi.");
        }
      } else if (activeTab === "referral") {
        const res = await saveReferralCommissionSettingsAction(currentReferral);
        if (res.success) {
          setSavedReferral(currentReferral);
          toast.success("Pengaturan komisi referral global berhasil disimpan!");
        } else {
          toast.error(res.error || "Gagal menyimpan pengaturan referral.");
        }
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans text-text-primary">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Dashboard Admin"
          >
            <ArrowLeft size={14} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">
                [ SYSTEM CONFIGURATION ]
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase mt-1">
              Pengaturan Sistem & Notifikasi
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Kelola pengaturan aplikasi, absensi, dan skema referral
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveActiveTabSettings}
          disabled={isSaving || isLoading || !hasActiveTabUnsaved}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-text-primary text-bg-card hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-text-primary" />
          <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">
            Memuat Pengaturan Sistem...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR NAVIGATION (col-span-3) */}
          <div className="lg:col-span-3 lg:sticky lg:top-4">
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={handleTabSwitchRequest}
              unsavedTabs={unsavedTabs}
            />
          </div>

          {/* MAIN PANEL CONTENT (col-span-9) */}
          <div className="lg:col-span-9">
            {activeTab === "general" && <GeneralPanel />}

            {activeTab === "absensi" && (
              <AbsensiPanel
                value={currentEmailEnabled}
                onChange={setCurrentEmailEnabled}
              />
            )}

            {activeTab === "referral" && (
              <ReferralPanel
                value={currentReferral}
                onChange={setCurrentReferral}
              />
            )}
          </div>
        </div>
      )}

      {/* FLOATING UNSAVED CHANGES SNACKBAR */}
      <UnsavedChangesBar
        hasChanges={hasActiveTabUnsaved}
        isSaving={isSaving}
        onSave={handleSaveActiveTabSettings}
        onDiscard={handleDiscardActiveTabChanges}
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
    </div>
  );
}
