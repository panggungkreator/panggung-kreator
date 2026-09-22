import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const experienceSchema = z.object({
  role: z.string().min(2, 'Peran/Posisi minimal 2 karakter').max(100),
  institution: z.string().min(2, 'Nama Instansi/Penyelenggara minimal 2 karakter').max(150),
  start_date: z.string().min(4, 'Tanggal/Tahun mulai wajib diisi'),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  sort_order: z.number().default(0),
})

// GET: Ambil daftar pengalaman member sendiri
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('member_experiences')
      .select('*')
      .eq('member_id', user.id)
      .order('sort_order', { ascending: true })
      .order('start_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Tambah pengalaman baru
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = experienceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('member_experiences')
      .insert({ member_id: user.id, ...result.data })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
