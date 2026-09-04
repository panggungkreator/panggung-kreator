"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { syncDualOperation } from "@/lib/supabase/dual-sync";

export interface OnboardingMemberData {
  id: string;
  role: string;
  membership_tier: string;
  hasCompletedInterests: boolean;
  initialData: {
    fullName: string;
    stageName: string;
    email: string;
    whatsappNumber: string;
    birthDate: string;
    address: string;
    occupation: string;
    instagramUsername: string;
    tiktokUsername: string;
    youtubeUrl: string;
    linkedinUrl: string;
  };
}

export async function getMemberOnboardingDataAction(): Promise<{
  success: boolean;
  data?: OnboardingMemberData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi pengguna tidak valid. Silakan login kembali." };
    }

    const supabaseAdmin = createServiceRoleClient();
    const { data: member, error: memberError } = await supabaseAdmin
      .from("members")
      .select("*, interests:member_interests(*)")
      .eq("id", user.id)
      .maybeSingle();

    if (memberError || !member) {
      return { success: false, error: "Data member tidak ditemukan." };
    }

    const interests = member.interests;
    const hasCompletedInterests =
      interests &&
      (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);

    const social = member.social_media || {};

    return {
      success: true,
      data: {
        id: member.id,
        role: member.role || "member",
        membership_tier: member.membership_tier || "free",
        hasCompletedInterests: !!hasCompletedInterests,
        initialData: {
          fullName: member.full_name || "",
          stageName: member.stage_name || member.full_name || "",
          email: member.email || user.email || "",
          whatsappNumber: member.whatsapp_number || "",
          birthDate: member.birth_date || "",
          address: member.address || "",
          occupation: member.occupation || "",
          instagramUsername: member.instagram_username || (social.instagram?.replace("@", "").trim() || ""),
          tiktokUsername: member.tiktok_username || (social.tiktok?.replace("@", "").trim() || ""),
          youtubeUrl: social.youtube || "",
          linkedinUrl: social.linkedin || "",
        },
      },
    };
  } catch (err: any) {
    console.error("getMemberOnboardingDataAction error:", err);
    return { success: false, error: err.message || "Gagal memuat data onboarding." };
  }
}

export interface SubmitOnboardingPayload {
  fullName: string;
  birthDate: string;
  address: string;
  whatsappNumber: string;
  email: string;
  instagramUsername: string;
  tiktokUsername: string;
  youtubeUrl: string;
  linkedinUrl: string;
  occupation: string;
  psChallenges: string[];
  confidenceScale: number | null;
  nervousTrigger: string;
  skillsToMaster: string;
  customSkillsToMaster?: string;
  roleModel: string;
  monetizationInterest: string;
  customMonetizationInterest?: string;
  careerGoal: string;
  firstOpportunity: string;
  mainTopic: string;
  customMainTopic?: string;
  mainMessage: string;
  targetAudience: string;
  expertDesire: string;
  activeCommunities: string;
  careerObstacle: string;
  timeCommitment: string;
}

export async function submitMemberOnboardingAction(
  payload: SubmitOnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi pengguna tidak valid. Silakan login kembali." };
    }

    const finalSkills =
      payload.skillsToMaster === "Lainnya" && payload.customSkillsToMaster?.trim()
        ? payload.customSkillsToMaster.trim()
        : payload.skillsToMaster;

    const finalMonetization =
      payload.monetizationInterest === "Lainnya" && payload.customMonetizationInterest?.trim()
        ? payload.customMonetizationInterest.trim()
        : payload.monetizationInterest;

    const finalTopic =
      payload.mainTopic === "Lainnya" && payload.customMainTopic?.trim()
        ? payload.customMainTopic.trim()
        : payload.mainTopic;

    const cleanInstagram = (payload.instagramUsername || "").replace(/@/g, "").trim();
    const cleanTiktok = (payload.tiktokUsername || "").replace(/@/g, "").trim();

    const socialMediaObj: Record<string, any> = {};
    if (cleanInstagram) socialMediaObj.instagram = cleanInstagram;
    if (cleanTiktok) socialMediaObj.tiktok = cleanTiktok;
    if (payload.youtubeUrl?.trim()) socialMediaObj.youtube = payload.youtubeUrl.trim();
    if (payload.linkedinUrl?.trim()) socialMediaObj.linkedin = payload.linkedinUrl.trim();

    const nowIso = new Date().toISOString();

    // 1. Update data pada tabel members
    const memberUpdatePayload: Record<string, any> = {
      full_name: payload.fullName.trim(),
      birth_date: payload.birthDate || null,
      address: payload.address.trim() || null,
      occupation: payload.occupation.trim() || null,
      instagram_username: cleanInstagram || null,
      tiktok_username: cleanTiktok || null,
      social_media: socialMediaObj,
      profile_completed_at: nowIso,
      updated_at: nowIso,
    };

    if (payload.whatsappNumber?.trim()) {
      memberUpdatePayload.whatsapp_number = payload.whatsappNumber.trim();
    }

    // 2. Prepare member_interests payload
    const goalsList: string[] = [];
    if (payload.careerGoal?.trim()) goalsList.push(payload.careerGoal.trim());
    if (payload.firstOpportunity?.trim()) goalsList.push(payload.firstOpportunity.trim());

    const topicsList: string[] = [];
    if (finalTopic?.trim()) topicsList.push(finalTopic.trim());
    if (payload.mainMessage?.trim()) topicsList.push(payload.mainMessage.trim());

    const learningList: string[] = [];
    if (finalSkills?.trim()) learningList.push(finalSkills.trim());

    const interestPayload = {
      member_id: user.id,
      primary_interests: ["public_speaking"],
      goals: goalsList,
      content_topics: topicsList,
      learning_preference: learningList,
      skills_to_master: finalSkills || null,
      monetization_interest: finalMonetization || null,
      active_communities: payload.activeCommunities.trim() || null,
      career_obstacle: payload.careerObstacle.trim() || null,
      ps_challenges: payload.psChallenges || [],
      confidence_scale: payload.confidenceScale ?? null,
      nervous_trigger: payload.nervousTrigger || null,
      role_model: payload.roleModel.trim() || null,
      target_audience: payload.targetAudience.trim() || null,
      expert_desire: payload.expertDesire || null,
      time_commitment: payload.timeCommitment || null,
      updated_at: nowIso,
    };

    // Sinkronisasi ke kedua database Supabase (wmuzvefmrbgffftkpdnx & zpcsqidgedvuaqgrklgp)
    const { devResult: updateResult, error: dualSyncErr } = await syncDualOperation(async (client) => {
      const { error: memErr } = await client
        .from("members")
        .update(memberUpdatePayload)
        .eq("id", user.id);

      if (memErr) {
        throw new Error(`Members update error: ${memErr.message}`);
      }

      const { error: intErr } = await client
        .from("member_interests")
        .upsert(interestPayload, { onConflict: "member_id" });

      if (intErr) {
        throw new Error(`Member interests upsert error: ${intErr.message}`);
      }

      return true;
    });

    if (dualSyncErr || !updateResult) {
      console.error("Gagal simpan data onboarding via dual-sync:", dualSyncErr);
      return { success: false, error: dualSyncErr?.message || "Gagal menyimpan data onboarding ke database." };
    }

    // 3. Trigger AI Analysis di latar belakang (fire-and-forget)
    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      fetch(`${origin}/api/member/analyze-interests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: user.id }),
      }).catch((aiErr) => {
        console.warn("Latar belakang AI Analysis error:", aiErr);
      });
    } catch (e) {
      console.warn("Trigger background AI error:", e);
    }

    return { success: true };
  } catch (err: any) {
    console.error("submitMemberOnboardingAction uncaught error:", err);
    return { success: false, error: err.message || "Terjadi kesalahan sistem saat menyimpan data onboarding." };
  }
}
