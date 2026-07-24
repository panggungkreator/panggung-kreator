import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const portfolioUpdateSchema = z.object({
  pillar: z.enum(['public_speaking', 'content_creation', 'personal_branding']).optional(),
  item_type: z.enum(['video', 'image', 'article', 'link', 'achievement']).optional(),
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  media_url: z.string().url().optional().nullable(),
  media_source: z.enum(['youtube', 'instagram', 'tiktok', 'storage', 'external']).optional(),
  thumbnail_url: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  sort_order: z.number().optional(),
})

// PATCH: update item
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = portfolioUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const updateData = { ...result.data }

    // Cek kepemilikan item
    const { data: existingItem, error: checkError } = await supabase
      .from('portfolio_items')
      .select('id')
      .eq('id', id)
      .eq('member_id', user.id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // Auto-generate thumbnail jika media_url berubah ke YouTube
    if (updateData.media_source === 'youtube' && updateData.media_url) {
      const { extractYouTubeId, getYouTubeThumbnail } = await import('@/lib/utils/media')
      const ytId = extractYouTubeId(updateData.media_url)
      if (ytId && !updateData.thumbnail_url) {
        updateData.thumbnail_url = getYouTubeThumbnail(ytId, 'hq')
      }
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .update(updateData)
      .eq('id', id)
      .eq('member_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: hapus item + cleanup storage jika menggunakan storage
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ambil detail item terlebih dahulu
    const { data: item, error: fetchError } = await supabase
      .from('portfolio_items')
      .select('media_url, thumbnail_url, media_source')
      .eq('id', id)
      .eq('member_id', user.id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // 1. Bersihkan file media dari Storage jika tipenya storage
    if (item.media_source === 'storage' && item.media_url) {
      const path = item.media_url.split('/portfolio-images/')[1]
      if (path) {
        await supabase.storage.from('portfolio-images').remove([path])
      }
    }

    // 2. Bersihkan file thumbnail dari Storage jika ada
    if (item.thumbnail_url?.includes('portfolio-thumbnails')) {
      const thumbPath = item.thumbnail_url.split('/portfolio-thumbnails/')[1]
      if (thumbPath) {
        await supabase.storage.from('portfolio-thumbnails').remove([thumbPath])
      }
    }

    // 3. Hapus item dari database
    const { error: deleteError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
      .eq('member_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
