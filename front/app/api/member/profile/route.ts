import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  stage_name: z.string().min(2).max(50),
  whatsapp_number: z.string().min(10).max(20),
  instagram_username: z.string().optional().nullable(),
  tiktok_username: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  city: z.string().optional().nullable(),
  youtube_url: z.string().url().optional().or(z.literal('')).nullable(),
  linkedin_url: z.string().url().optional().or(z.literal('')).nullable(),
  portfolio_url: z.string().url().optional().or(z.literal('')).nullable(),
  subscribed_newsletter: z.boolean().default(true),
  referred_by_code: z.string().optional().nullable(),
})

const interestsSchema = z.object({
  primary_interests: z.array(z.string()).min(1),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  goals: z.array(z.string()).default([]),
  content_topics: z.array(z.string()).default([]),
  availability: z.string().optional().nullable(),
  learning_preference: z.array(z.string()).default([]),
  referral_source: z.string().optional().nullable(),
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
    const profileResult = profileSchema.partial().safeParse(body.profile)
    if (!profileResult.success) {
      return NextResponse.json({ error: profileResult.error.flatten() }, { status: 400 })
    }

    const interestsResult = interestsSchema.partial().safeParse(body.interests)
    if (!interestsResult.success) {
      return NextResponse.json({ error: interestsResult.error.flatten() }, { status: 400 })
    }

    // Ambil data member saat ini untuk audit/affiliate
    const { data: currentMember, error: fetchError } = await supabase
      .from('members')
      .select('affiliate_code, referred_by')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Logika Affiliate Code
    let affiliate_code = currentMember?.affiliate_code
    if (!affiliate_code && profileResult.data.stage_name) {
      affiliate_code = generateAffiliateCode(profileResult.data.stage_name)
    }

    let referred_by = currentMember?.referred_by
    if (!referred_by && profileResult.data.referred_by_code) {
      // Cari member pemilik code referral
      const { data: referrer } = await supabase
        .from('members')
        .select('id')
        .eq('affiliate_code', profileResult.data.referred_by_code.trim())
        .maybeSingle()

      if (referrer) {
        referred_by = referrer.id
      }
    }

    // Update members
    const updateData: any = {
      ...profileResult.data,
      profile_completed_at: new Date().toISOString(),
    }
    if (affiliate_code) updateData.affiliate_code = affiliate_code
    if (referred_by) updateData.referred_by = referred_by
    
    // Hapus referred_by_code karena tidak ada di kolom members
    delete updateData.referred_by_code

    const { error: memberError } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', user.id)

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // Upsert member_interests
    if (body.interests) {
      const { error: interestError } = await supabase
        .from('member_interests')
        .upsert({
          member_id: user.id,
          ...interestsResult.data,
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
