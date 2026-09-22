"use client";

import React, { useState } from "react";
import { MemberProfile } from "@/lib/types/member";
import ChangePasswordModal from "@/components/member/ChangePasswordModal";
import ChangeUsernameModal from "@/components/member/ChangeUsernameModal";
import { User, KeyRound, Clock } from "lucide-react";

interface AccountSecurityPanelProps {
  member: MemberProfile;
  onUsernameChanged?: (newUsername: string) => void;
}

export default function AccountSecurityPanel({
  member,
  onUsernameChanged,
}: AccountSecurityPanelProps) {
  const [username, setUsername] = useState(member.username || "");
  const [usernameChangesCount, setUsernameChangesCount] = useState(
    member.username_changes_count ?? 0
  );
  const [lastUsernameChange, setLastUsernameChange] = useState<string | null>(
    member.last_username_change ?? null
  );

  const [isChangeUsernameOpen, setIsChangeUsernameOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Username change cooldown calculation
  let isCoolingDown = false;
  let daysRemaining = 0;
  if (lastUsernameChange) {
    const lastChangeTime = new Date(lastUsernameChange).getTime();
    const diffDays = (Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24);
    if (diffDays < 14) {
      isCoolingDown = true;
      daysRemaining = Math.ceil(14 - diffDays);
    }
  }

  const handleUsernameSuccess = (
    newUsername: string,
    newCount: number,
    newLastChange: string
  ) => {
    setUsername(newUsername);
    setUsernameChangesCount(newCount);
    setLastUsernameChange(newLastChange);
    if (onUsernameChanged) onUsernameChanged(newUsername);
  };

  return (
    <>
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
        {/* SECTION HEADER */}
        <div className="border-b border-border-default/60 pb-4">
          <h2 className="text-base font-bold text-text-primary">
            Keamanan & Pengaturan Akun
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola kredensial login, username identitas, dan kata sandi akun Anda.
          </p>
        </div>

        <div className="space-y-4">
          {/* USERNAME CARD */}
          <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-text-primary text-bg-card flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block font-bold">
                  Handle Username
                </span>
                <span className="text-sm font-bold font-mono text-text-primary">
                  @{username || "belum_diatur"}
                </span>
                {isCoolingDown ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-sans font-medium">
                    <Clock size={12} />
                    <span>Dapat diubah kembali dalam {daysRemaining} hari</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-text-secondary mt-0.5 font-sans">
                    Username digunakan sebagai tautan publik profil Anda.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangeUsernameOpen(true)}
              className="px-4 py-2 rounded-xl border border-border-default bg-bg-card text-text-primary hover:bg-bg-well font-bold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              Ubah Username
            </button>
          </div>

          {/* PASSWORD CARD */}
          <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-text-primary text-bg-card flex items-center justify-center shrink-0">
                <KeyRound size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block font-bold">
                  Kata Sandi Akun
                </span>
                <span className="text-sm font-bold text-text-primary font-mono tracking-wider">
                  ••••••••••••
                </span>
                <p className="text-[11px] text-text-secondary mt-0.5 font-sans">
                  Disarankan memperbarui kata sandi secara berkala untuk menjaga keamanan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-4 py-2 rounded-xl border border-border-default bg-bg-card text-text-primary hover:bg-bg-well font-bold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              Ganti Kata Sandi
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ChangeUsernameModal
        isOpen={isChangeUsernameOpen}
        onClose={() => setIsChangeUsernameOpen(false)}
        currentUsername={username}
        usernameChangesCount={usernameChangesCount}
        lastUsernameChange={lastUsernameChange}
        onSuccess={handleUsernameSuccess}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}
