import { createClient } from '@/lib/supabase/server'
import { deleteStorageFiles } from '@/lib/supabase/storage-cleanup'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const portfolioUpdateSchema = z.object({
  pillar: z.enum(['public_speaking', 'content_creation', 'personal_branding']).optional(),
  item_type: z.enum(['video', 'image', 'link', 'achievement']).optional(),
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  media_url: z.string()
    .regex(/^https?:\/\/.+/i, 'URL media harus diawali dengan http:// atau https://')
    .optional()
    .nullable(),
  media_source: z.enum(['youtube', 'instagram', 'tiktok', 'storage', 'external']).optional(),
  thumbnail_url: z.string()
    .regex(/^https?:\/\/.+/i, 'URL thumbnail harus diawali dengan http:// atau https://')
    .optional()
    .nullable(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  sort_order: z.number().optional(),
})

// PATCH: update item + otomatis hapus file storage lama yang digantikan
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

    // Cek kepemilikan item & ambil informasi file lama
    const { data: existingItem, error: checkError } = await supabase
      .from('portfolio_items')
      .select('id, media_url, thumbnail_url, media_source')
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

    // ── AUTOMATIC STORAGE CLEANUP ON REPLACE/UPDATE ─────────────────────────────
    // Hapus file Supabase Storage lama yang digantikan / dihilangkan guna mencegah bloat
    try {
      const urlsToDelete: string[] = []

      // A. Cek perubahan media_url lama
      if (existingItem.media_source === 'storage' && existingItem.media_url) {
        const oldUrls = existingItem.media_url.split(',').map((u: string) => u.trim()).filter(Boolean)
        const newUrls = (updateData.media_url || '').split(',').map((u: string) => u.trim()).filter(Boolean)

        // Jika sumber media berganti bukan storage (misal jadi youtube/link)
        if (updateData.media_source && updateData.media_source !== 'storage') {
          urlsToDelete.push(...oldUrls)
        } else if (updateData.media_url !== undefined) {
          // Kumpulkan file storage lama yang sudah tidak tercantum pada media_url baru
          for (const oldU of oldUrls) {
            if (!newUrls.includes(oldU)) {
              urlsToDelete.push(oldU)
            }
          }
        }
      }

      // B. Cek perubahan thumbnail_url lama
      if (
        existingItem.thumbnail_url &&
        updateData.thumbnail_url !== undefined &&
        updateData.thumbnail_url !== existingItem.thumbnail_url
      ) {
        const isStillInNewMedia = (updateData.media_url || '').includes(existingItem.thumbnail_url)
        if (!isStillInNewMedia) {
          urlsToDelete.push(existingItem.thumbnail_url)
        }
      }

      if (urlsToDelete.length > 0) {
        await deleteStorageFiles(supabase, urlsToDelete)
      }
    } catch (cleanupErr) {
      console.warn('[PATCH /portfolio/:id] Cleanup orphan storage files warning:', cleanupErr)
    }

    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: hapus item + cleanup storage otomatis jika menggunakan storage
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

    // 1. Bersihkan file media & thumbnail dari Storage jika ada
    const urlsToClean: string[] = []
    if (item.media_source === 'storage' && item.media_url) {
      urlsToClean.push(item.media_url)
    }
    if (item.thumbnail_url) {
      urlsToClean.push(item.thumbnail_url)
    }

    if (urlsToClean.length > 0) {
      await deleteStorageFiles(supabase, urlsToClean)
    }

    // 2. Hapus item dari database
    const { error: deleteError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
      .eq('member_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
