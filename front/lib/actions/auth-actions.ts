"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        return { success: false, error: error.message };
    }

    redirect("/login");
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect("/login?message=Could not authenticate user");
    }

    return redirect(data.url);
}

export async function signInWithGithub() {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect("/login?message=Could not authenticate user");
    }

    return redirect(data.url);
}

function formatSupabaseError(error: any): string {
    if (!error) return "Unknown error";
    
    const keys = Object.getOwnPropertyNames(error);
    const details: Record<string, any> = {};
    for (const key of keys) {
        details[key] = error[key];
    }
    
    let msg = error.message;
    if (!msg || msg === "{}" || typeof msg !== "string") {
        msg = error.error_description || error.error || error.name || "Unknown Auth Error";
    }
    
    if (typeof msg === "object") {
        try {
            msg = JSON.stringify(msg);
        } catch {
            msg = String(msg);
        }
    }
    
    return `${msg} (Status: ${error.status || 'N/A'}, Code: ${error.code || 'N/A'}, Details: ${JSON.stringify(details)})`;
}

export async function signInWithPasswordAction(emailOrUsername: string, password: string) {
    console.log("[AUTH ACTION] Menggunakan NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!emailOrUsername || !password) {
        return { success: false, error: "Email/Username dan Password wajib diisi" };
    }

    const supabase = await createClient();

    let loginEmail = emailOrUsername.trim();

    // Jika input tidak mengandung '@', kita anggap itu adalah username
    if (!loginEmail.includes("@")) {
        // Cari email di tabel members berdasarkan username menggunakan RPC (untuk bypass RLS)
        const { data: memberEmail, error: searchError } = await supabase
            .rpc("get_email_by_username", { p_username: loginEmail });

        if (searchError) {
            console.error("Error searching username in database:", searchError);
            return { success: false, error: `Database Error: ${formatSupabaseError(searchError)}` };
        }

        if (memberEmail) {
            loginEmail = memberEmail;
        } else {
            return { success: false, error: `Username "${loginEmail}" tidak terdaftar sebagai member.` };
        }
    }

    // Jalankan autentikasi Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
    });

    if (error) {
        console.error("Login error:", error);
        return { success: false, error: `Supabase Auth Error: ${formatSupabaseError(error)}` };
    }

    let isAdmin = false;
    if (authData?.user) {
        const { data: member } = await supabase
            .from("members")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (member && member.role === "admin") {
            isAdmin = true;
        }
    }

    return { success: true, isAdmin };
}
