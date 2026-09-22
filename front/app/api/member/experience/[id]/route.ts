import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const experienceUpdateSchema = z.object({
  role: z.string().min(2, 'Peran/Posisi minimal 2 karakter').max(100).optional(),
  institution: z.string().min(2, 'Nama Instansi/Penyelenggara minimal 2 karakter').max(150).optional(),
  start_date: z.string().min(4, 'Tanggal/Tahun mulai wajib diisi').optional(),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().optional(),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  sort_order: z.number().optional(),
})

// PATCH: Update pengalaman member
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = experienceUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    // Cek kepemilikan item
    const { data: existingItem, error: checkError } = await supabase
      .from('member_experiences')
      .select('id')
      .eq('id', id)
      .eq('member_id', user.id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json({ error: 'Experience item not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('member_experiences')
      .update(result.data)
      .eq('id', id)
      .eq('member_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Hapus pengalaman
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('member_experiences')
      .delete()
      .eq('id', id)
      .eq('member_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
