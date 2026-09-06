import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const urlSanitizer = z.string().optional().nullable().transform((val) => {
  if (!val) return "-";
  const trimmed = val.trim();
  if (!trimmed || trimmed === "-") return "-";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
});

const emptyStringSanitizer = z.string().optional().nullable().transform((val) => {
  if (!val || val.trim() === "") return null;
  return val.trim();
});

const dateSanitizer = z.string().optional().nullable().transform((val) => {
  if (!val || val.trim() === "" || val === "-") return null;
  return val.trim();
});

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  stage_name: z.string().min(2).max(50),
  username: z.string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-z0-9_.]+$/, "Username hanya boleh huruf kecil, angka, titik (.), atau garis bawah (_)")
    .optional()
    .nullable(),
  whatsapp_number: z.string().min(10).max(20),
  occupation: emptyStringSanitizer,
  description: emptyStringSanitizer,
  city: emptyStringSanitizer,
  birth_date: dateSanitizer,
  address: emptyStringSanitizer,
  social_media: z.object({
    instagram: emptyStringSanitizer,
    tiktok: emptyStringSanitizer,
    twitter: emptyStringSanitizer,
    youtube: urlSanitizer,
    linkedin: urlSanitizer,
    spotify: emptyStringSanitizer,
  }).optional().nullable(),
  avatar_url: emptyStringSanitizer,
  portfolio_url: urlSanitizer,
  subscribed_newsletter: z.boolean().default(true),
  referred_by_code: emptyStringSanitizer,
})

const interestsSchema = z.object({
  primary_interests: z.array(z.string()).default([]),
  experience_level: z.string().optional().nullable().transform((val) => {
    if (!val || val === "" || !['beginner', 'intermediate', 'advanced'].includes(val)) return null;
    return val;
  }),
  goals: z.array(z.string()).default([]),
  content_topics: z.array(z.string()).default([]),
  availability: z.string().optional().nullable().transform((val) => {
    if (!val || val === "" || !['morning', 'afternoon', 'evening', 'night', 'flexible'].includes(val)) return null;
    return val;
  }),
  learning_preference: z.array(z.string()).default([]),
  ps_challenges: z.array(z.string()).default([]),
  confidence_scale: z.number().min(1).max(10).optional().nullable(),
  nervous_trigger: emptyStringSanitizer,
  skills_to_master: emptyStringSanitizer,
  role_model: emptyStringSanitizer,
  monetization_interest: emptyStringSanitizer,
  target_audience: emptyStringSanitizer,
  expert_desire: emptyStringSanitizer,
  career_obstacle: emptyStringSanitizer,
  active_communities: emptyStringSanitizer,
  time_commitment: emptyStringSanitizer,
})

function generateAffiliateCode(stageName: string): string {
  const cleanName = stageName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PK-${cleanName}-${randomStr}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Validate only provided fields (partial update support)
    const profileResult = body.profile ? profileSchema.partial().safeParse(body.profile) : null
    if (profileResult && !profileResult.success) {
      return NextResponse.json({ error: profileResult.error.flatten() }, { status: 400 })
    }

    const interestsResult = body.interests ? interestsSchema.partial().safeParse(body.interests) : null
    if (interestsResult && !interestsResult.success) {
      return NextResponse.json({ error: interestsResult.error.flatten() }, { status: 400 })
    }

    const profileData = profileResult?.data || {}
    const interestsData = interestsResult?.data || {}

    // Ambil data member saat ini untuk audit/affiliate/username
    const { data: currentMember, error: fetchError } = await supabase
      .from('members')
      .select('username, username_changes_count, last_username_change, affiliate_code, referred_by')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Logika Affiliate Code / Referral Code
    let affiliate_code = currentMember?.affiliate_code
    if (!affiliate_code && profileData.stage_name) {
      affiliate_code = generateAffiliateCode(profileData.stage_name)
      
      // Sinkronisasi ke tabel referral_codes (Single Source of Truth)
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
        const adminClient = createServiceRoleClient()
        await adminClient
          .from('referral_codes')
          .insert({
            code: affiliate_code,
            owner_member_id: user.id,
            description: `Auto-generated referral code untuk ${profileData.stage_name}`,
            is_active: true,
          })
      } catch (err) {
        console.error('Failed to sync to referral_codes:', err)
      }
    }

    let referred_by = currentMember?.referred_by
    if (!referred_by && profileData.referred_by_code) {
      const cleanCode = profileData.referred_by_code.trim()
      // Cari pemilik code di referral_codes atau fallback ke members
      const { data: refCode } = await supabase
        .from('referral_codes')
        .select('owner_member_id')
        .eq('code', cleanCode)
        .maybeSingle()

      if (refCode?.owner_member_id) {
        referred_by = refCode.owner_member_id
      } else {
        const { data: referrer } = await supabase
          .from('members')
          .select('id')
          .eq('affiliate_code', cleanCode)
          .maybeSingle()

        if (referrer) {
          referred_by = referrer.id
        }
      }
    }

    // Update members
    const updateData: any = {
      ...profileData,
      profile_completed_at: new Date().toISOString(),
    }
    if (affiliate_code) updateData.affiliate_code = affiliate_code
    if (referred_by) updateData.referred_by = referred_by
    
    // Hapus referred_by_code karena tidak ada di kolom members
    delete updateData.referred_by_code

    // Logika Perubahan Username
    if (profileData.username !== undefined) {
      const rawNewUsername = profileData.username;
      const cleanNewUsername = rawNewUsername ? rawNewUsername.trim().toLowerCase() : null;
      const currentUsername = currentMember?.username ? currentMember.username.toLowerCase() : null;

      // Jika username diubah dan ada isinya
      if (cleanNewUsername && cleanNewUsername !== currentUsername) {
        const changesCount = currentMember?.username_changes_count || 0;
        const lastChange = currentMember?.last_username_change;

        // Aturan: Jeda waktu 14 hari untuk perubahan berikutnya (aturan batas 3x dinonaktifkan sementara)
        if (lastChange) {
          const lastChangeTime = new Date(lastChange).getTime();
          const daysSinceLastChange = (Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24);

          if (daysSinceLastChange < 14) {
            const remainingDays = Math.ceil(14 - daysSinceLastChange);
            return NextResponse.json(
              { error: `Anda baru saja mengubah username. Anda dapat mengganti username kembali dalam ${remainingDays} hari.` },
              { status: 400 }
            );
          }
        }

        // Cek apakah username baru sudah digunakan oleh member lain
        const { data: existingUser } = await supabase
          .from('members')
          .select('id')
          .ilike('username', cleanNewUsername)
          .neq('id', user.id)
          .maybeSingle();

        if (existingUser) {
          return NextResponse.json(
            { error: `Username @${cleanNewUsername} sudah digunakan. Silakan pilih username lain.` },
            { status: 400 }
          );
        }

        updateData.username = cleanNewUsername;
        updateData.username_changes_count = changesCount + 1;
        updateData.last_username_change = new Date().toISOString();
      } else {
        // Tidak ada perubahan username, jangan update kolom username / counter
        delete updateData.username;
      }
    }

    const { error: memberError } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', user.id)

    if (memberError) {
      if (memberError.code === '23505' || memberError.message?.includes('members_username_key')) {
        return NextResponse.json({ error: 'Username sudah digunakan oleh pengguna lain.' }, { status: 400 });
      }
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // Upsert member_interests
    if (body.interests) {
      const { error: interestError } = await supabase
        .from('member_interests')
        .upsert({
          member_id: user.id,
          ...interestsData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'member_id' })

      if (interestError) {
        return NextResponse.json({ error: interestError.message }, { status: 500 })
      }
    }

    // Panggil AI Analysis secara asinkron di latar belakang
    if (body.interests) {
      fetch(`${req.nextUrl.origin}/api/member/analyze-interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: user.id }),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, affiliate_code })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
