"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { checkMemberEmailExistsAction } from "@/lib/actions/auth-actions";
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

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(rawNonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return { rawNonce, hashedNonce };
}

export function GoogleSignInButton({
  redirectTo,
  onSuccess,
  onError,
  onLoadingChange,
  className = "",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawNonceRef = useRef<string | null>(null);
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
      // 1. Ekstrak email dari token kredensial Google
      const payload = parseJwt(response.credential);
      const googleEmail = payload?.email?.toLowerCase().trim();

      if (!googleEmail) {
        throw new Error("Email tidak ditemukan pada akun Google Anda.");
      }

      // 2. Validasi Sistem: Tolak login jika email belum terdaftar di tabel members
      const { exists, member } = await checkMemberEmailExistsAction(googleEmail);

      if (!exists || !member) {
        setIsProcessing(false);
        if (onLoadingChange) onLoadingChange(false);
        const unregMsg =
          "Email tidak terdaftar. Gunakan email saat register atau hubungi admin.";
        if (onError) onError(unregMsg);
        return;
      }

      // 3. Email terdaftar! Lanjutkan proses sign in via ID token
      const supabase = createClient();
      const hasNonceInToken = Boolean(payload?.nonce);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        ...(hasNonceInToken && rawNonceRef.current ? { nonce: rawNonceRef.current } : {}),
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

  const renderGoogleButton = async () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id && containerRef.current) {
      try {
        let hashedNonce: string | undefined;
        try {
          const nonces = await generateNonce();
          rawNonceRef.current = nonces.rawNonce;
          hashedNonce = nonces.hashedNonce;
        } catch (nonceErr) {
          console.warn("[GSI] Failed to generate nonce:", nonceErr);
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ...(hashedNonce ? { nonce: hashedNonce } : {}),
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        // Gunakan ukuran standar awal (320px) agar proporsional dan rapi
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 320,
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
    if (!isProcessing && (scriptLoaded || (typeof window !== "undefined" && window.google?.accounts?.id))) {
      renderGoogleButton();
    }
  }, [scriptLoaded, isProcessing]);

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />

      {isProcessing && (
        <div className="w-full max-w-[320px] mb-2 py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-3 border border-zinc-900 dark:border-white shadow-md">
          <Loader2 className="w-4 h-4 animate-spin text-white dark:text-zinc-900" />
          <span>Memverifikasi Akun Google...</span>
        </div>
      )}

      <div className={`w-full flex justify-center ${isProcessing ? "hidden" : "block"}`}>
        <div
          ref={containerRef}
          className="flex justify-center min-h-[44px]"
        />
      </div>
    </div>
  );
}


