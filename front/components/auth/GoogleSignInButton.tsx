"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  redirectTo?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "150554382998-bnautg5j9esbm2u0hm7vhbask8kqc4nn.apps.googleusercontent.com";

export function GoogleSignInButton({
  redirectTo,
  onSuccess,
  onError,
  onLoadingChange,
  className = "",
}: GoogleSignInButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuccessRedirect = async (userId: string, userEmail?: string) => {
    const supabase = createClient();
    let { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!member && userEmail) {
      const { data: mByEmail } = await supabase
        .from("members")
        .select("role")
        .ilike("email", userEmail)
        .maybeSingle();
      if (mByEmail) member = mByEmail;
    }

    const isAdmin = member?.role === "admin";
    const isCustomNext = redirectTo && redirectTo !== "/myprofile" && redirectTo !== "/";

    if (isAdmin && !isCustomNext) {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      window.location.href = isLocal
        ? "/admin"
        : process.env.NEXT_PUBLIC_ADMIN_URL || "/admin";
    } else {
      window.location.href = redirectTo || "/myprofile";
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;

    setIsProcessing(true);
    if (onLoadingChange) onLoadingChange(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) throw error;

      if (data?.user) {
        if (onSuccess) {
          onSuccess(data.user);
          return;
        }
        await handleSuccessRedirect(data.user.id, data.user.email);
      }
    } catch (err: any) {
      console.error("[GSI] Sign in with ID token error:", err);
      if (onError) onError(err?.message || "Gagal masuk dengan Google.");
      setIsProcessing(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const handleClick = async () => {
    setIsProcessing(true);
    if (onLoadingChange) onLoadingChange(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const callbackUrl = new URL(`${origin}/auth/callback`);
      if (redirectTo) {
        callbackUrl.searchParams.set("next", redirectTo);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (onError) onError(err?.message || "Gagal menghubungkan ke Google.");
      setIsProcessing(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Background script untuk memunculkan popup One Tap Google di pojok kanan atas */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.google?.accounts?.id) {
            try {
              window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false,
              });
              window.google.accounts.id.prompt((notification: any) => {
                if (notification?.isNotDisplayed?.()) {
                  console.debug("[GSI] One Tap not displayed:", notification.getNotDisplayedReason?.());
                }
              });
            } catch (e) {
              console.debug("[GSI] One tap init error:", e);
            }
          }
        }}
      />

      {/* Button Native Full Width dengan Style Desain Sistem Panggung Kreator */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        className="w-full px-8 py-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-sm"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
            <span>MENGHUBUNGKAN KE GOOGLE...</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.04.69-2.37 1.1-3.71 1.1-2.85 0-5.27-1.92-6.13-4.49H2.18v2.82C4 20.36 7.77 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.87 14.01c-.22-.66-.35-1.36-.35-2.01s.13-1.35.35-2.01V7.17H2.18C1.43 8.47 1 9.93 1 11.5s.43 3.03 1.18 4.33l3.69-2.82z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4 3.64 2.18 7.17l3.69 2.82C6.73 7.42 9.15 5.38 12 5.38z"
              />
            </svg>
            <span>MASUK DENGAN GOOGLE</span>
          </>
        )}
      </button>
    </div>
  );
}
