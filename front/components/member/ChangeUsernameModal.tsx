"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Loader2, AlertCircle, Check, XCircle } from "lucide-react";

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  usernameChangesCount: number;
  lastUsernameChange: string | null;
  onSuccess: (newUsername: string, newCount: number, newLastChange: string) => void;
}

export default function ChangeUsernameModal({
  isOpen,
  onClose,
  currentUsername,
  usernameChangesCount,
  lastUsernameChange,
  onSuccess,
}: ChangeUsernameModalProps) {
  const [newUsername, setNewUsername] = useState(currentUsername || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewUsername(currentUsername || "");
      setValidationError(null);
      setIsAvailable(null);
      setIsChecking(false);
    }
  }, [isOpen, currentUsername]);

  // Cooldown calculation
  let isCoolingDown = false;
  let daysRemaining = 0;
  let nextAllowedDate: Date | null = null;

  if (lastUsernameChange) {
    const lastChangeTime = new Date(lastUsernameChange).getTime();
    const diffDays = (Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24);
    if (diffDays < 14) {
      isCoolingDown = true;
      daysRemaining = Math.ceil(14 - diffDays);
      nextAllowedDate = new Date(lastChangeTime + 14 * 24 * 60 * 60 * 1000);
    }
  }

  // Realtime check availability & format as user types
  useEffect(() => {
    if (!isOpen) return;

    const clean = newUsername.trim().toLowerCase();

    // Jika input kosong
    if (!clean) {
      setValidationError(null);
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    // Jika sama dengan username saat ini
    if (clean === (currentUsername || "").toLowerCase()) {
      setValidationError(null);
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    // Validasi format lokal langsung tanpa jeda
    if (clean.length < 3) {
      setValidationError("Username minimal 3 karakter.");
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    if (clean.length > 30) {
      setValidationError("Username maksimal 30 karakter.");
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    if (!/^[a-z0-9_.]+$/.test(clean)) {
      setValidationError("Hanya huruf kecil (a-z), angka (0-9), titik (.), atau garis bawah (_).");
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    // Format valid -> Jalankan debounced check ke server
    setIsChecking(true);
    setValidationError(null);
    setIsAvailable(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/member/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();

        if (res.ok && data.available) {
          setIsAvailable(true);
          setValidationError(null);
        } else {
          setIsAvailable(false);
          setValidationError(data.message || "Username sudah digunakan oleh pengguna lain.");
        }
      } catch (err) {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newUsername, currentUsername, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCoolingDown) {
      toast.error(`Anda masih dalam masa jeda 14 hari (${daysRemaining} hari lagi).`);
      return;
    }

    const clean = newUsername.trim().toLowerCase();

    if (!clean) {
      toast.error("Username tidak boleh kosong.");
      return;
    }

    if (clean === (currentUsername || "").toLowerCase()) {
      toast.info("Username tidak mengalami perubahan.");
      onClose();
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            username: clean,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Gagal mengubah username.";
        if (typeof data.error === "string") {
          msg = data.error;
        } else if (data.error?.fieldErrors?.username) {
          msg = Array.isArray(data.error.fieldErrors.username)
            ? data.error.fieldErrors.username.join(", ")
            : data.error.fieldErrors.username;
        } else if (data.error?.fieldErrors && Object.keys(data.error.fieldErrors).length > 0) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];
          const val = data.error.fieldErrors[firstKey];
          msg = Array.isArray(val) ? val.join(", ") : String(val);
        } else if (data.error?.formErrors && data.error.formErrors.length > 0) {
          msg = data.error.formErrors.join(", ");
        }
        toast.error(msg);
        return;
      }

      const newCount = (usernameChangesCount || 0) + 1;
      const newTimestamp = new Date().toISOString();

      toast.success(`Username berhasil diubah menjadi @${clean}`);
      onSuccess(clean, newCount, newTimestamp);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan saat mengganti username.");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanInput = newUsername.trim().toLowerCase();
  const isSameAsCurrent = cleanInput === (currentUsername || "").toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Username"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* PERINGATAN JIKA MASA JEDA AKTIF (DINAMIS HANYA SETELAH PERGANTIAN) */}
        {isCoolingDown && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wider font-mono">
                Masa Jeda Aktif
              </p>
              <p className="text-[11px] mt-0.5">
                Anda baru saja mengganti username. Anda dapat mengganti username kembali dalam{" "}
                <strong className="font-semibold">{daysRemaining} hari lagi</strong> (pada tanggal{" "}
                <strong className="font-semibold underline">
                  {nextAllowedDate?.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                ).
              </p>
            </div>
          </div>
        )}


        {/* INPUT USERNAME */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            USERNAME BARU *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-zinc-400 font-mono text-sm select-none pointer-events-none">
              @
            </span>
            <input
              type="text"
              value={newUsername}
              disabled={isCoolingDown || isLoading}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
                setNewUsername(val);
              }}
              placeholder="username_anda"
              maxLength={30}
              className={`w-full pl-8 pr-8 py-2 text-sm font-mono bg-transparent border-b rounded-none focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${validationError
                ? "border-red-500 text-red-600 dark:text-red-400 focus:border-red-600"
                : isAvailable && !isSameAsCurrent
                  ? "border-emerald-500 text-black dark:text-white focus:border-emerald-600"
                  : "border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-black dark:text-white"
                }`}
            />
            {/* Status indicator icon di sebelah kanan input */}
            <div className="absolute right-2 flex items-center pointer-events-none">
              {isChecking && (
                <Loader2 className="animate-spin w-4 h-4 text-zinc-400" />
              )}
              {!isChecking && isAvailable && !isSameAsCurrent && (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {!isChecking && validationError && (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          {/* AREA VALIDASI ERROR REALTIME DI BAWAH INPUT */}
          <div className="min-h-[18px]">
            {isChecking ? (
              <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Loader2 className="animate-spin w-3 h-3" />
                <span>Memeriksa ketersediaan username...</span>
              </p>
            ) : validationError ? (
              <p className="text-[10px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            ) : isAvailable && !isSameAsCurrent ? (
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Username @{cleanInput} tersedia.</span>
              </p>
            ) : cleanInput && isSameAsCurrent ? (
              <p className="text-[10px] font-mono text-zinc-400">
                Ini adalah username Anda saat ini.
              </p>
            ) : null}
          </div>
        </div>

        {/* BUTTON BAR */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-transparent"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={
              isLoading ||
              isCoolingDown ||
              isChecking ||
              !cleanInput ||
              isSameAsCurrent ||
              !!validationError ||
              !isAvailable
            }
            className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-900 dark:border-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Username</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}