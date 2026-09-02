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
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_black" | "filled_blue";
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
  text = "continue_with",
  theme = "outline",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isButtonReady, setIsButtonReady] = useState(false);

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

      if (error) {
        throw error;
      }

      if (data?.user) {
        if (onSuccess) {
          onSuccess(data.user);
          return;
        }

        // Cek apakah user adalah admin
        let { data: member } = await supabase
          .from("members")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!member && data.user.email) {
          const { data: mByEmail } = await supabase
            .from("members")
            .select("role")
            .ilike("email", data.user.email)
            .maybeSingle();
          if (mByEmail) member = mByEmail;
        }

        const isAdmin = member?.role === "admin";
        const isCustomNext = redirectTo && redirectTo !== "/myprofile" && redirectTo !== "/";

        if (isAdmin && !isCustomNext) {
          const isLocal =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          window.location.href = isLocal
            ? "/admin"
            : process.env.NEXT_PUBLIC_ADMIN_URL || "/admin";
        } else {
          window.location.href = redirectTo || "/myprofile";
        }
      }
    } catch (err: any) {
      console.error("[GOOGLE GIS ERROR]", err);
      if (onError) onError(err?.message || "Gagal masuk dengan Google.");
      setIsProcessing(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const renderGoogleButton = () => {
    if (window.google?.accounts?.id && containerRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        const containerWidth = containerRef.current.offsetWidth || 320;

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: theme,
          size: "large",
          text: text,
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(Math.max(containerWidth, 240), 400),
        });

        setIsButtonReady(true);

        // Tampilkan One Tap popup jika diizinkan oleh Google
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error("Failed to render Google button:", err);
      }
    }
  };

  useEffect(() => {
    if (scriptLoaded || (typeof window !== "undefined" && window.google?.accounts?.id)) {
      renderGoogleButton();
    }
  }, [scriptLoaded, theme, text]);

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
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
        <div className="w-full flex flex-col items-center justify-center">
          {!isButtonReady && (
            <div className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>Memuat Google Sign-In...</span>
            </div>
          )}
          <div
            ref={containerRef}
            className={`w-full flex justify-center min-h-[44px] ${!isButtonReady ? "hidden" : "block"}`}
          />
        </div>
      )}
    </div>
  );
}

