import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const portfolioItemSchema = z.object({
  pillar: z.enum(['public_speaking', 'content_creation', 'personal_branding']),
  item_type: z.enum(['video', 'image', 'article', 'link', 'achievement']),
  title: z.string().min(2).max(150),
  description: z.string().max(500).optional().nullable(),
  media_url: z.string().url().optional().nullable(),
  media_source: z.enum(['youtube', 'instagram', 'tiktok', 'storage', 'external']),
  thumbnail_url: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  sort_order: z.number().default(0),
})

// GET: ambil portfolio milik sendiri
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('member_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: tambah item baru
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = portfolioItemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const itemData = { ...result.data }

    // Auto-generate thumbnail untuk YouTube jika belum diset
    if (itemData.media_source === 'youtube' && itemData.media_url) {
      const { extractYouTubeId, getYouTubeThumbnail } = await import('@/lib/utils/media')
      const ytId = extractYouTubeId(itemData.media_url)
      if (ytId && !itemData.thumbnail_url) {
        itemData.thumbnail_url = getYouTubeThumbnail(ytId, 'hq')
      }
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .insert({ member_id: user.id, ...itemData })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
