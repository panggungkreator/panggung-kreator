"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

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

export async function signUpWithPasswordAction(email: string, password: string, username: string) {
  if (!email || !password || !username) {
    return { success: false, error: "Semua field wajib diisi" };
  }

  const supabase = await createClient();

  // Pastikan username unik
  const { data: existingUser, error: checkError } = await supabase
    .from("members")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (checkError) {
    console.error("Username check error:", checkError);
  }

  if (existingUser) {
    return { success: false, error: `Username "${username}" sudah digunakan.` };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password,
    options: {
      data: {
        username: username.trim().toLowerCase(),
        full_name: username.trim(),
      }
    }
  });

  if (error) {
    console.error("SignUp error:", error);
    return { success: false, error: `Supabase Auth Error: ${formatSupabaseError(error)}` };
  }

  return { success: true, user: data.user, session: data.session };
}

export async function checkEmailExistsAction(email: string) {
  if (!email || !email.trim()) return false;
  const cleanEmail = email.trim().toLowerCase();

  const standardClient = await createClient();
  const { data: { user } } = await standardClient.auth.getUser();

  const serviceClient = createServiceRoleClient();

  // 1. Cek di tabel public.members
  let query = serviceClient
    .from("members")
    .select("id")
    .eq("email", cleanEmail);

  if (user) {
    query = query.neq("id", user.id);
  }

  const { data: memberData, error } = await query.maybeSingle();

  if (error) {
    console.error("Email check error in members table:", error);
  }

  if (memberData) return true;

  // 2. Cek di tabel auth.users Supabase
  try {
    const { data: { users }, error: authListError } = await serviceClient.auth.admin.listUsers();
    if (!authListError && users) {
      const existsInAuth = users.some(
        (u) => u.email?.toLowerCase() === cleanEmail && (!user || u.id !== user.id)
      );
      if (existsInAuth) return true;
    }
  } catch (authErr) {
    console.error("Auth check error in auth.users:", authErr);
  }

  return false;
}

export async function registerPriorityMemberAction(onboardingData: any) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const { profile, interests } = onboardingData;
    const cleanEmail = profile.email.trim().toLowerCase();

    // 1. Check if email is already in public.members
    const { data: existingMember } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingMember) {
      return {
        success: false,
        error: "Email ini sudah terdaftar di sistem. Silakan login atau gunakan email lain.",
      };
    }

    // 2. Generate Username & Password
    const baseName = (profile.full_name || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUsername = `${baseName}${randomSuffix}`;
    const generatedPassword = `Panggung${Math.floor(1000 + Math.random() * 9000)}!`;

    // 3. Sign Up User using Supabase Auth Admin API
    let user: any = null;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: profile.full_name,
        whatsapp_number: profile.whatsapp_number,
        username: generatedUsername,
      },
    });

    if (authError) {
      // Handling jika user sudah ada di auth.users (misal akibat retry/orphaned auth user)
      if (
        authError.message?.includes("already been registered") ||
        authError.message?.includes("already exists")
      ) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (existingAuthUser) {
          user = existingAuthUser;
        } else {
          return {
            success: false,
            error: "Email ini sudah terdaftar. Silakan gunakan email lain atau login ke akun Anda.",
          };
        }
      } else {
        console.error("Auth creation error:", authError);
        return { success: false, error: authError.message };
      }
    } else {
      user = authData?.user;
    }

    if (!user) {
      return { success: false, error: "Gagal membuat akun autentikasi." };
    }

    // 4. Insert into members table (menggunakan upsert agar tidak crash jika ID sudah pernah dibuat)
    const { error: memberError } = await supabaseAdmin
      .from("members")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        stage_name: profile.full_name,
        whatsapp_number: profile.whatsapp_number,
        email: cleanEmail,
        instagram_username: profile.instagram_username || "",
        tiktok_username: profile.tiktok_username || "",
        youtube_url: profile.youtube_url || null,
        linkedin_url: profile.linkedin_url || null,
        city: profile.city || null,
        occupation: profile.occupation || null,
        subscribed_newsletter: profile.subscribed_newsletter ?? true,
        username: generatedUsername,
        membership_tier: 'priority',
        role: 'member',
        payment_status: 'paid'
      }, { onConflict: "id" });

    if (memberError) {
      console.error("Member insert error:", memberError);
      return { success: false, error: memberError.message };
    }

    // 5. Insert into member_interests table
    const goalsList = [];
    if (interests.career_goal) goalsList.push(interests.career_goal);
    if (interests.first_opportunity) goalsList.push(interests.first_opportunity);

    const topicsList = [];
    if (interests.main_topic) topicsList.push(interests.main_topic);
    if (interests.main_message) topicsList.push(interests.main_message);

    const { error: interestError } = await supabaseAdmin
      .from("member_interests")
      .upsert({
        member_id: user.id,
        primary_interests: interests.primary_interests || [],
        experience_level: null,
        goals: goalsList,
        content_topics: topicsList,
        availability: null,
        learning_preference: interests.learning_topics || [],
        referral_source: null,
      }, { onConflict: "member_id" });

    if (interestError) {
      console.error("Interest insert error:", interestError);
    }

    // Panggil AI Analysis secara asinkron di latar belakang
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch(`${origin}/api/member/analyze-interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: user.id }),
      }).catch(console.error);
    } catch (aiErr) {
      console.error("Failed to trigger AI analysis:", aiErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error("registerPriorityMemberAction error:", err);
    return { success: false, error: err.message || "Terjadi kesalahan internal server." };
  }
}

