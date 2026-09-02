"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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
    if (!response?.credential) {
      if (onError) onError("Gagal menerima kredensial dari Google.");
      return;
    }

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

  const renderGoogleButton = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id && containerRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        // Ukur lebar form induk agar tombol Google pas penuh setara dengan tombol MASUK (maks 400px resmi Google)
        const parentW = containerRef.current.parentElement?.clientWidth || 384;
        const targetWidth = Math.min(Math.max(parentW, 280), 400);

        // Kosongkan kontainer sebelum render ulang untuk mencegah duplikasi iframe
        containerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: targetWidth,
        });

        // Munculkan popup Google One Tap secara otomatis
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            console.debug("[GSI] One Tap not displayed:", notification.getNotDisplayedReason?.());
          }
        });
      } catch (err) {
        console.error("Failed to render Google button:", err);
      }
    }
  };

  useEffect(() => {
    if (scriptLoaded || (typeof window !== "undefined" && window.google?.accounts?.id)) {
      renderGoogleButton();
    }
  }, [scriptLoaded]);

  return (
    <div className={`w-full ${className}`}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />

      {isProcessing ? (
        <div className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-3 border border-zinc-900 dark:border-white shadow-md">
          <Loader2 className="w-4 h-4 animate-spin text-white dark:text-zinc-900" />
          <span>Memverifikasi & Mengambil Data...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          {/* Kontainer Google Identity Services selalu ada di DOM dengan min-height 44px agar tidak ada layout shift atau efek meluncur dari kiri */}
          <div
            ref={containerRef}
            className="w-full flex justify-center min-h-[44px] [&>div]:!w-full [&>div]:flex [&>div]:justify-center [&_iframe]:!w-full [&_iframe]:max-w-full"
          />
        </div>
      )}
    </div>
  );
}
