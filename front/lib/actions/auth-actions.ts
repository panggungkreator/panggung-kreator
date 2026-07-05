"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signout() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        console.log("Error: ", error);
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: "", ...options });
                    } catch (error) {
                        console.log("Error: ", error);
                    }
                },
            },
        }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        return { success: false, error: error.message };
    }

    redirect("/login");
}

export async function signInWithGoogle() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name, options) {
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );
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
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name, options) {
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );

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

export async function signInWithPasswordAction(emailOrUsername: string, password: string) {
    console.log("[AUTH ACTION] Menggunakan NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!emailOrUsername || !password) {
        return { success: false, error: "Email/Username dan Password wajib diisi" };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (err) {
                        console.error("Error setting cookie in signin action:", err);
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: "", ...options });
                    } catch (err) {
                        console.error("Error removing cookie in signin action:", err);
                    }
                },
            },
        }
    );

    let loginEmail = emailOrUsername.trim();

    // Jika input tidak mengandung '@', kita anggap itu adalah username
    if (!loginEmail.includes("@")) {
        // Cari email di tabel members berdasarkan username menggunakan RPC (untuk bypass RLS)
        const { data: memberEmail, error: searchError } = await supabase
            .rpc("get_email_by_username", { p_username: loginEmail });

        if (searchError) {
            console.error("Error searching username in database:", searchError);
            return { success: false, error: `Database Error: ${searchError.message}` };
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
        return { success: false, error: `Supabase Auth Error: ${error.message}` };
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
