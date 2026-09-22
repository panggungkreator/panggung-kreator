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

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Password saat ini wajib diisi.";
    }

    if (!newPassword) {
      newErrors.newPassword = "Password baru wajib diisi.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password baru minimal 8 karakter.";
    } else if (currentPassword && currentPassword === newPassword) {
      newErrors.newPassword = "Password baru harus berbeda dengan password lama.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password baru wajib diisi.";
    } else if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password baru tidak cocok.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
        const errMsg = typeof data.error === "string" ? data.error : "Gagal memperbarui password.";
        if (
          errMsg.toLowerCase().includes("saat ini") ||
          errMsg.toLowerCase().includes("tidak sesuai") ||
          errMsg.toLowerCase().includes("lama")
        ) {
          setErrors({ currentPassword: errMsg });
        } else if (
          errMsg.toLowerCase().includes("minimal 8") ||
          errMsg.toLowerCase().includes("password baru")
        ) {
          setErrors({ newPassword: errMsg });
        } else {
          setErrors({ general: errMsg });
        }
        toast.error(errMsg);
        return;
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
      const errMsg = err.message || "Terjadi kesalahan saat mengganti password.";
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ganti Password Akun"
      subtitle="Password baru akan memicu logout otomatis dari seluruh perangkat & platform."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-sans">
            {errors.general}
          </div>
        )}

        {/* PASSWORD SAAT INI */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
            Password Saat Ini <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) {
                  setErrors((prev) => ({ ...prev, currentPassword: undefined, general: undefined }));
                }
              }}
              placeholder="Masukkan password lama..."
              className={`w-full bg-transparent border-b py-1.5 pr-8 text-sm rounded-none focus:outline-none transition-colors text-[#212121] dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${
                errors.currentPassword
                  ? "border-red-600 dark:border-red-500 focus:border-red-600"
                  : "border-neutral-300 dark:border-neutral-700 focus:border-[#212121] dark:focus:border-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-0 top-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-600 dark:text-red-500 font-sans mt-1.5 font-medium">
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* PASSWORD BARU */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
            Password Baru <span className="text-red-500">*</span> (Min. 8 Karakter)
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: undefined, general: undefined }));
                }
              }}
              placeholder="Masukkan password baru..."
              className={`w-full bg-transparent border-b py-1.5 pr-8 text-sm rounded-none focus:outline-none transition-colors text-[#212121] dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${
                errors.newPassword
                  ? "border-red-600 dark:border-red-500 focus:border-red-600"
                  : "border-neutral-300 dark:border-neutral-700 focus:border-[#212121] dark:focus:border-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-0 top-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-600 dark:text-red-500 font-sans mt-1.5 font-medium">
              {errors.newPassword}
            </p>
          )}
        </div>

        {/* KONFIRMASI PASSWORD BARU */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
            Konfirmasi Password Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined, general: undefined }));
                }
              }}
              placeholder="Ulangi password baru..."
              className={`w-full bg-transparent border-b py-1.5 pr-8 text-sm rounded-none focus:outline-none transition-colors text-[#212121] dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${
                errors.confirmPassword
                  ? "border-red-600 dark:border-red-500 focus:border-red-600"
                  : "border-neutral-300 dark:border-neutral-700 focus:border-[#212121] dark:focus:border-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-0 top-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 dark:text-red-500 font-sans mt-1.5 font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* BUTTON BAR */}
        <div className="pt-4 border-t border-[#212121]/10 dark:border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-sans font-semibold text-neutral-500 hover:text-[#212121] dark:hover:text-white transition-colors cursor-pointer rounded-xl active:scale-95"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] hover:opacity-90 text-xs font-sans font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl shadow-2xs hover:scale-[1.02] active:scale-95"
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
