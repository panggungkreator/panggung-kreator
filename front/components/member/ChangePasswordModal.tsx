"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Loader2, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Password saat ini wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Password baru harus berbeda dengan password lama.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui password.");
      }

      // Logout client-side di semua perangkat & bersihkan token
      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "global" });
      } catch (soErr) {
        console.warn("Client signout error:", soErr);
      }

      toast.success(
        `Password berhasil diperbarui! Akun Anda di-logout otomatis dari semua platform demi keamanan. Silakan login kembali.`,
        { duration: 4000 }
      );

      handleClose();

      // Redirect ke halaman login setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat mengganti password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🔒 Ganti Password Akun"
      subtitle="Password baru akan memicu logout otomatis dari seluruh perangkat & platform."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">

        {/* PASSWORD SAAT INI */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            PASSWORD SAAT INI *
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama..."
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pr-8 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-0 top-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PASSWORD BARU */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            PASSWORD BARU * (MIN. 8 KARAKTER)
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru..."
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pr-8 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-0 top-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* KONFIRMASI PASSWORD BARU */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            KONFIRMASI PASSWORD BARU *
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru..."
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pr-8 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-0 top-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BUTTON BAR */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-transparent"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-neutral-900 dark:border-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Simpan Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
