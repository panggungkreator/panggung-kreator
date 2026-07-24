# Implementation Plan: Member Profile, Portfolio & Form Priority
# Panggung Kreator — Platform v2

**Path:** `docs/member-profile-portfolio/implementationplan.md`
**Versi:** 1.0
**Tanggal:** Juli 2026
**Referensi Spesifikasi:** `specification.md` (dokumen ini adalah pasangannya)

---

## Peta Fase Pengerjaan

```
FASE 1: Database & Storage Setup
FASE 2: Backend — API Routes & Functions  
FASE 3: Form Priority — UI & Logic        
FASE 4: Portfolio — UI & Upload Logic     
FASE 5: Halaman Talent Public             
FASE 6: Admin CMS — Integrasi             
FASE 7: Newsletter Integration            
FASE 8: Testing & QA                      
─────────────────────────────────────────
```
Simpan di folder (form)/form/memberpriority - kemudian buat file dan folder dengan rapih
---

## FASE 1 — Database & Storage Setup

### Step 1.1 — Buat Migration File

```bash
# Di dalam folder front/
cd front
npx supabase migration new add_member_profile_portfolio
# Output: supabase/migrations/[timestamp]_add_member_profile_portfolio.sql
```

### Step 1.2 — Isi File Migration

Buka file yang baru dibuat, isi dengan SQL berikut:

```sql
-- ============================================================
-- FASE 1: Migration — Member Profile, Interests & Portfolio
-- File: supabase/migrations/[timestamp]_add_member_profile_portfolio.sql
-- ============================================================

-- ----------------------------------------------------------
-- 1A. ALTER TABLE members — tambah kolom baru
-- ----------------------------------------------------------
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS city                   text,
  ADD COLUMN IF NOT EXISTS youtube_url            text,
  ADD COLUMN IF NOT EXISTS linkedin_url           text,
  ADD COLUMN IF NOT EXISTS portfolio_url          text,
  ADD COLUMN IF NOT EXISTS avatar_url             text,
  ADD COLUMN IF NOT EXISTS tier_changed_at        timestamptz,
  ADD COLUMN IF NOT EXISTS tier_changed_by        uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tier_note              text,
  ADD COLUMN IF NOT EXISTS subscribed_newsletter  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS newsletter_subscribed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS profile_completed_at   timestamptz,
  ADD COLUMN IF NOT EXISTS affiliate_code         text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by            uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_balance     numeric DEFAULT 0;

-- Tambahkan kolom affiliate ke transactions (tabel lama)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS affiliate_code_used text,
  ADD COLUMN IF NOT EXISTS commission_earned numeric DEFAULT 0;

-- Tambahkan kolom community & membership_tier jika belum ada
-- (sesuai concept-member.md)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS community text NOT NULL DEFAULT 'panggung_kreator'
    CHECK (community IN ('panggung_kreator', 'berani_tampil_bicara')),
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'free'
    CHECK (membership_tier IN ('free', 'priority', 'membership'));

-- ----------------------------------------------------------
-- 1B. CREATE TABLE member_interests
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_interests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  primary_interests   text[] NOT NULL DEFAULT '{}',
  experience_level    text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goals               text[] NOT NULL DEFAULT '{}',
  content_topics      text[] NOT NULL DEFAULT '{}',
  availability        text CHECK (availability IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
  learning_preference text[] NOT NULL DEFAULT '{}',
  referral_source     text,
  ai_analysis         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_interests_member_id_unique UNIQUE (member_id)
);

-- Trigger updated_at otomatis
CREATE TRIGGER member_interests_updated_at
  BEFORE UPDATE ON public.member_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------
-- 1C. CREATE TABLE portfolio_items
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  pillar          text NOT NULL CHECK (pillar IN ('public_speaking', 'content_creation', 'personal_branding')),
  item_type       text NOT NULL CHECK (item_type IN ('video', 'image', 'article', 'link', 'achievement')),
  title           text NOT NULL,
  description     text,
  media_url       text,
  media_source    text NOT NULL CHECK (media_source IN ('youtube', 'instagram', 'tiktok', 'storage', 'external')),
  thumbnail_url   text,
  is_featured     boolean NOT NULL DEFAULT false,
  is_public       boolean NOT NULL DEFAULT true,
  view_count      integer NOT NULL DEFAULT 0,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index untuk query profil publik
CREATE INDEX IF NOT EXISTS portfolio_items_member_id_idx ON public.portfolio_items (member_id);
CREATE INDEX IF NOT EXISTS portfolio_items_pillar_idx ON public.portfolio_items (pillar);
CREATE INDEX IF NOT EXISTS portfolio_items_featured_idx ON public.portfolio_items (member_id, is_featured) WHERE is_featured = true;

-- Trigger updated_at otomatis
CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------
-- 1D. RLS — member_interests
-- ----------------------------------------------------------
ALTER TABLE public.member_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member read own interests"
  ON public.member_interests FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Member upsert own interests"
  ON public.member_interests FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin read all interests"
  ON public.member_interests FOR SELECT
  USING (is_admin());

-- ----------------------------------------------------------
-- 1E. RLS — portfolio_items
-- ----------------------------------------------------------
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read portfolio"
  ON public.portfolio_items FOR SELECT
  USING (is_public = true);

CREATE POLICY "Member CRUD own portfolio"
  ON public.portfolio_items FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin read all portfolio"
  ON public.portfolio_items FOR SELECT
  USING (is_admin());
```

### Step 1.3 — Push Migration ke Dev & Prod

```bash
# Apply ke database dev lokal
npx supabase db push

# Verifikasi di Supabase dashboard (dev)
# Cek: 26 tabel ada, kolom baru di members ada

# Push ke production
npx supabase db push --project-ref wmuzvefmrbgffftkpdnx

# Verifikasi di dashboard production
```

### Step 1.4 — Setup Supabase Storage Buckets

Buka Supabase Dashboard → Storage → New Bucket:

```bash
# Buat via CLI (atau manual di dashboard)
# Bucket 1: avatar member
npx supabase storage create member-avatars --public

# Bucket 2: gambar portfolio
npx supabase storage create portfolio-images --public

# Bucket 3: thumbnail video (cache)
npx supabase storage create portfolio-thumbnails --public
```

### Step 1.5 — Setup Storage RLS via SQL Editor

```sql
-- Jalankan di Supabase SQL Editor (dev & prod)

-- Policy: Avatar
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-avatars');

CREATE POLICY "Owner upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'member-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner delete avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'member-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Portfolio images & thumbnails
CREATE POLICY "Public read portfolio files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('portfolio-images', 'portfolio-thumbnails'));

CREATE POLICY "Owner manage portfolio files"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('portfolio-images', 'portfolio-thumbnails')
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id IN ('portfolio-images', 'portfolio-thumbnails')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Checklist Fase 1:**
- [ ] Migration file dibuat dan berhasil diapply ke dev
- [ ] Kolom baru di `members` terverifikasi di dashboard
- [ ] Tabel `member_interests` ada dengan unique constraint
- [ ] Tabel `portfolio_items` ada dengan semua index
- [ ] RLS enabled di kedua tabel baru
- [ ] 3 Storage bucket dibuat (member-avatars, portfolio-images, portfolio-thumbnails)
- [ ] Storage RLS policies aktif
- [ ] Migration berhasil dipush ke production

---

## FASE 2 — Backend: TypeScript Types, Helpers & API Routes

### Step 2.1 — Tambah TypeScript Types

```typescript
// front/lib/types/member.ts

export type Community = 'panggung_kreator' | 'berani_tampil_bicara'
export type MembershipTier = 'free' | 'priority' | 'membership'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type PrimaryInterest = 'public_speaking' | 'mc_host' | 'voice_over' | 'content_creator' | 'personal_branding' | 'live_host'
export type Pillar = 'public_speaking' | 'content_creation' | 'personal_branding'
export type ItemType = 'video' | 'image' | 'article' | 'link' | 'achievement'
export type MediaSource = 'youtube' | 'instagram' | 'tiktok' | 'storage' | 'external'

export interface MemberInterests {
  id: string
  member_id: string
  primary_interests: PrimaryInterest[]
  experience_level: ExperienceLevel | null
  goals: string[]
  content_topics: string[]
  availability: string | null
  learning_preference: string[]
  referral_source: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  member_id: string
  pillar: Pillar
  item_type: ItemType
  title: string
  description: string | null
  media_url: string | null
  media_source: MediaSource
  thumbnail_url: string | null
  is_featured: boolean
  is_public: boolean
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MemberProfile {
  // Existing fields
  id: string
  full_name: string
  stage_name: string
  username: string | null
  email: string | null
  description: string | null
  // New fields
  city: string | null
  avatar_url: string | null
  youtube_url: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  instagram_username: string
  tiktok_username: string | null
  community: Community
  membership_tier: MembershipTier
  subscribed_newsletter: boolean
  profile_completed_at: string | null
  // Relations
  interests?: MemberInterests
  portfolio?: PortfolioItem[]
}
```

### Step 2.2 — Buat Helper: YouTube Thumbnail Extractor

```typescript
// front/lib/utils/media.ts

/**
 * Ekstrak YouTube video ID dari berbagai format URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Generate thumbnail URL dari YouTube ID (tanpa storage cost)
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'maxres' = 'hq') {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Deteksi media source dari URL
 */
export function detectMediaSource(url: string): MediaSource {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('supabase.co/storage')) return 'storage'
  return 'external'
}
```

### Step 2.3 — Buat Helper: Image Compressor

```typescript
// front/lib/utils/image-compress.ts
// Install dulu: npm install browser-image-compression

import imageCompression from 'browser-image-compression'

export async function compressImage(
  file: File,
  target: 'avatar' | 'portfolio' | 'thumbnail'
): Promise<File> {
  const options = {
    avatar:     { maxSizeMB: 0.2,  maxWidthOrHeight: 400,  useWebWorker: true, fileType: 'image/webp' },
    portfolio:  { maxSizeMB: 0.5,  maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' },
    thumbnail:  { maxSizeMB: 0.1,  maxWidthOrHeight: 400,  useWebWorker: true, fileType: 'image/webp' },
  }
  return await imageCompression(file, options[target])
}
```

### Step 2.4 — Buat API Route: Profile Update

```typescript
// front/app/api/member/profile/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  stage_name: z.string().min(2).max(50),
  whatsapp_number: z.string().min(10).max(15),
  instagram_username: z.string(),
  tiktok_username: z.string().optional(),
  occupation: z.string(),
  description: z.string().max(500).optional(),
  city: z.string().optional(),
  youtube_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  subscribed_newsletter: z.boolean().default(true),
})

const interestsSchema = z.object({
  primary_interests: z.array(z.string()).min(1),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()).default([]),
  content_topics: z.array(z.string()).default([]),
  availability: z.string().optional(),
  learning_preference: z.array(z.string()).default([]),
  referral_source: z.string().optional(),
})

export async function POST(req: NextRequest) {
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

  // Update members
  const { error: memberError } = await supabase
    .from('members')
    .update({
      ...profileResult.data,
      profile_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Upsert member_interests
  const { error: interestError } = await supabase
    .from('member_interests')
    .upsert({
      member_id: user.id,
      ...interestsResult.data,
    }, { onConflict: 'member_id' })

  if (interestError) {
    return NextResponse.json({ error: interestError.message }, { status: 500 })
  }

  // Panggil AI Analysis secara asinkron di latar belakang
  // Jangan gunakan await agar response UI tetap cepat
  fetch(`${req.nextUrl.origin}/api/member/analyze-interests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id: user.id }),
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
```

### Step 2.4.b — Buat API Route: AI Interest Analysis (Background)

```typescript
// front/app/api/member/analyze-interests/route.ts
// Install: npm install @google/genai

import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  const { member_id } = await req.json()
  const supabase = await createClient() // Setup admin client if needed

  // 1. Ambil data mentah member_interests
  const { data: interests } = await supabase
    .from('member_interests')
    .select('*')
    .eq('member_id', member_id)
    .single()

  if (!interests) return NextResponse.json({ error: 'No data' }, { status: 404 })

  // 2. Generate prompt
  const prompt = `Analisis data minat member berikut dan berikan ringkasan profil (kekuatan, potensi, kendala). Data: ${JSON.stringify(interests)}`

  // 3. Panggil Gemini
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    })
    
    // 4. Update ke database
    await supabase
      .from('member_interests')
      .update({ ai_analysis: response.text })
      .eq('member_id', member_id)
      
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'AI failed' }, { status: 500 })
  }
}
```

### Step 2.5 — Buat API Route: Portfolio CRUD

```typescript
// front/app/api/member/portfolio/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const portfolioItemSchema = z.object({
  pillar: z.enum(['public_speaking', 'content_creation', 'personal_branding']),
  item_type: z.enum(['video', 'image', 'article', 'link', 'achievement']),
  title: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  media_url: z.string().url().optional(),
  media_source: z.enum(['youtube', 'instagram', 'tiktok', 'storage', 'external']),
  thumbnail_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  sort_order: z.number().default(0),
})

// GET: ambil portfolio milik sendiri
export async function GET(req: NextRequest) {
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
}

// POST: tambah item baru
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = portfolioItemSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  // Auto-generate thumbnail untuk YouTube
  if (result.data.media_source === 'youtube' && result.data.media_url) {
    const { extractYouTubeId, getYouTubeThumbnail } = await import('@/lib/utils/media')
    const ytId = extractYouTubeId(result.data.media_url)
    if (ytId && !result.data.thumbnail_url) {
      result.data.thumbnail_url = getYouTubeThumbnail(ytId, 'hq')
    }
  }

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({ member_id: user.id, ...result.data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

```typescript
// front/app/api/member/portfolio/[id]/route.ts

// PATCH: update item
// DELETE: hapus item + cleanup storage jika media_source = 'storage'
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ambil item dulu untuk cek media_source
  const { data: item } = await supabase
    .from('portfolio_items')
    .select('media_url, thumbnail_url, media_source, member_id')
    .eq('id', params.id)
    .eq('member_id', user.id)  // Pastikan milik sendiri
    .single()

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Jika file ada di Storage, hapus juga dari Storage
  if (item.media_source === 'storage' && item.media_url) {
    const path = item.media_url.split('/portfolio-images/')[1]
    if (path) await supabase.storage.from('portfolio-images').remove([path])
  }
  if (item.thumbnail_url?.includes('portfolio-thumbnails')) {
    const thumbPath = item.thumbnail_url.split('/portfolio-thumbnails/')[1]
    if (thumbPath) await supabase.storage.from('portfolio-thumbnails').remove([thumbPath])
  }

  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', params.id)
    .eq('member_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

**Checklist Fase 2:**
- [ ] File types `member.ts` dibuat
- [ ] Helper `media.ts` dibuat (extractor + detector)
- [ ] Helper `image-compress.ts` dibuat, package `browser-image-compression` di-install
- [ ] API route `POST /api/member/profile` berjalan dan tervalidasi
- [ ] API route `GET/POST /api/member/portfolio` berjalan
- [ ] API route `PATCH/DELETE /api/member/portfolio/[id]` berjalan

---

## FASE 3 — Form Priority: UI & Logic

### Step 3.1 — Buat Komponen Form Register (Onboarding)
Form dirancang untuk **mendukung Dark & Light Mode** secara penuh menggunakan Tailwind variant `dark:`.

```
front/components/member/RegisterForm/
├── index.tsx           ← Orchestrator (Register Flow)
├── StepAccount.tsx     ← Step 1: Email & Password
└── StepEssential.tsx   ← Step 2: Form Onboarding (Data Diri & Minat)
```

### Step 3.2 — Implementasi `StepEssential.tsx` (Komponen Kritis)
Formulir di `StepEssential` dibagi secara visual menjadi **2 kategori utama**:
1. **Kategori A: Data Diri (Essential Info)**
   - Nama Lengkap, Nama Panggung, No. WhatsApp, Kota Domisili
   - Kode Affiliate Teman (Opsional)
2. **Kategori B: Minat & Pengalaman (Segmentasi)**
   - Minat Utama (Checkbox Grid)
   - Tingkat Pengalaman (Radio Group)

```tsx
// front/components/member/RegisterForm/StepEssential.tsx

// Desain responsif Dark/Light Mode:
// - Container: bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-800
// - Input: border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white
// - Text: text-black dark:text-white

const INTEREST_OPTIONS = [
  { value: 'public_speaking', label: '🎤 Public Speaking', desc: 'Berbicara di depan umum' },
  { value: 'mc_host',         label: '🎙️ MC / Host',       desc: 'Memandu acara' },
  { value: 'voice_over',      label: '🔊 Voice Over',      desc: 'Pengisi suara' },
  { value: 'content_creator', label: '🎬 Content Creator', desc: 'Membuat konten digital' },
  { value: 'personal_branding', label: '✨ Personal Branding', desc: 'Membangun identitas profesional' },
  { value: 'live_host',       label: '📱 Live Host',       desc: 'Host live streaming' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner',      label: 'Pemula',   desc: 'Baru mulai belajar' },
  { value: 'intermediate',  label: 'Menengah', desc: 'Sudah punya pengalaman dasar' },
  { value: 'advanced',      label: 'Lanjutan', desc: 'Pengalaman profesional' },
]

// Render memisahkan kategori Data Diri & Minat secara visual (menggunakan Border / Section Header)
```

### Step 3.3 — Integrasikan Form di `/register` (Onboarding)

```
Alur register yang diperbarui:
Step 1: Input email & password → buat akun (auth.users)
Step 2: Form StepEssential (Nama, WA, Minat Utama, Level)
Step 3: Halaman sukses → redirect ke /myprofile
```

### Step 3.4 — Buat Komponen Form Lengkapi Profil Post-Login
Form post-login di dashboard juga **mendukung penuh Dark & Light Mode** dan dibagi ke dalam **3 kategori/seksi**:

```
front/components/member/ProfileForm/
├── index.tsx           ← Form lengkap di tab /myprofile
├── SectionBio.tsx      ← Kategori 1: Foto Profil, Bio Singkat, Pekerjaan
├── SectionSocial.tsx   ← Kategori 2: Link sosial & Portofolio (IG, TikTok, YT, LinkedIn)
└── SectionGoals.tsx    ← Kategori 3: Target, Minat Lanjutan, Waktu Luang
```

**Checklist Fase 3:**
- [ ] Komponen `RegisterForm/StepEssential` dibuat (UI ringkas)
- [ ] Form terintegrasi di `/register` (step 2 setelah buat akun)
- [ ] Komponen `ProfileForm` dibuat untuk data sekunder
- [ ] Form terintegrasi di `/myprofile` (tab "Edit/Lengkapi Profil")
- [ ] Implementasi class `dark:` Tailwind untuk support Dark & Light Mode pada form
- [ ] Pengelompokan visual (kategori) pada form registrasi dan profile update terverifikasi
- [ ] Loading state & error handling ada
- [ ] Sukses → toast notifikasi + redirect/refresh

---

## FASE 4 — Portfolio: Upload UI & Logic

### Step 4.1 — Buat Struktur Komponen Portfolio

```
front/components/member/Portfolio/
├── index.tsx               ← Tab portfolio di /myprofile (edit mode)
├── PortfolioGrid.tsx       ← Grid tampil per pilar (3 tab: PS | CC | PB)
├── PortfolioCard.tsx       ← Card individual item
├── AddItemModal.tsx        ← Modal tambah/edit item
├── VideoLinkInput.tsx      ← Input URL video + preview thumbnail otomatis
└── ImageUploader.tsx       ← Drag & drop dengan kompresi otomatis
```

### Step 4.2 — Implementasi `VideoLinkInput.tsx`

```tsx
// front/components/member/Portfolio/VideoLinkInput.tsx
// Logika:
// 1. User paste URL (YouTube/TikTok/IG)
// 2. onBlur atau onChange (debounced 500ms):
//    - detectMediaSource(url) → set media_source state
//    - extractYouTubeId(url) → jika YouTube, getYouTubeThumbnail(id)
//    - Set thumbnail_url state
// 3. Tampilkan preview thumbnail di bawah input
// 4. Jika bukan YouTube → tampilkan field upload thumbnail manual (opsional)

export function VideoLinkInput({ value, onChange, onThumbnailChange }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  const handleUrlChange = useDebouncedCallback(async (url: string) => {
    const source = detectMediaSource(url)
    if (source === 'youtube') {
      const id = extractYouTubeId(url)
      if (id) {
        const thumb = getYouTubeThumbnail(id, 'hq')
        setThumbnail(thumb)
        onThumbnailChange(thumb) // YouTube thumb = URL publik, tidak perlu storage
      }
    }
    onChange({ url, source })
  }, 500)
  // ... render
}
```

### Step 4.3 — Implementasi `ImageUploader.tsx`

```tsx
// front/components/member/Portfolio/ImageUploader.tsx
// Logika:
// 1. User pilih/drag gambar
// 2. Validasi: max 10MB, format jpg/png/webp/gif
// 3. compressImage(file, 'portfolio') → output File WebP <500KB
// 4. Preview gambar terkompresi di UI (URL.createObjectURL)
// 5. Saat form submit → upload ke Supabase Storage
//    Path: portfolio-images/{member_id}/{nanoid()}.webp
// 6. Simpan storage URL ke portfolio_items.media_url

async function handleImageUpload(file: File, memberId: string) {
  const compressed = await compressImage(file, 'portfolio')
  const fileName = `${nanoid()}.webp`
  const path = `${memberId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(path, compressed, { contentType: 'image/webp', upsert: false })

  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(path)

  return publicUrl
}
```

### Step 4.4 — Avatar Upload di Profile Form Post-Login

```tsx
// Tambahkan ke ProfileForm/SectionBio.tsx
// Logika: crop + compress ke 400x400px, upload ke member-avatars/{member_id}/avatar.webp

async function handleAvatarUpload(file: File, memberId: string) {
  const compressed = await compressImage(file, 'avatar')
  const path = `${memberId}/avatar.webp`

  await supabase.storage
    .from('member-avatars')
    .upload(path, compressed, { contentType: 'image/webp', upsert: true })
  // upsert: true → timpa avatar lama

  const { data: { publicUrl } } = supabase.storage
    .from('member-avatars')
    .getPublicUrl(path)

  // Update members.avatar_url
  await supabase.from('members').update({ avatar_url: publicUrl }).eq('id', memberId)
  return publicUrl
}
```

**Checklist Fase 4:**
- [ ] `VideoLinkInput.tsx` — preview thumbnail otomatis untuk YouTube
- [ ] `ImageUploader.tsx` — drag & drop + kompresi + upload
- [ ] `AddItemModal.tsx` — form tambah/edit dengan semua field
- [ ] `PortfolioCard.tsx` — tampilan card dengan actions (edit, delete, toggle featured)
- [ ] `PortfolioGrid.tsx` — tab per pilar, sortable drag-and-drop
- [ ] Avatar upload terintegrasi di `SectionBio`
- [ ] Delete item → cleanup file di storage

---

## FASE 5 — Halaman Talent Publik

### Step 5.1 — Halaman Direktori `/talent`

```
front/app/talent/
├── page.tsx          ← Direktori semua talent (publik)
└── [username]/
    └── page.tsx      ← Profil publik individual
```

### Step 5.2 — Query untuk `/talent`

```typescript
// front/app/talent/page.tsx — server component

const { data: talents } = await supabase
  .from('members')
  .select(`
    id, full_name, stage_name, username, description, avatar_url,
    city, instagram_username, community, membership_tier,
    member_interests (primary_interests),
    portfolio_items (id, pillar, is_featured, thumbnail_url)
  `)
  .eq('status', 'active')
  .eq('community', 'panggung_kreator')
  .not('username', 'is', null)
  .order('created_at', { ascending: false })

// Filter: tampilkan hanya member yang punya minimal 1 portfolio item publik
```

### Step 5.3 — Query untuk `/talent/[username]`

```typescript
// front/app/talent/[username]/page.tsx — server component (SSG/ISR)

// Ambil member by username
const { data: member } = await supabase
  .from('members')
  .select(`
    id, full_name, stage_name, username, description, avatar_url,
    city, instagram_username, tiktok_username, youtube_url,
    linkedin_url, portfolio_url, community, membership_tier,
    member_interests (*),
    portfolio_items (*)
  `)
  .eq('username', params.username)
  .eq('status', 'active')
  .single()

// Group portfolio by pillar untuk tab display
const portfolioByPillar = {
  public_speaking: member.portfolio_items.filter(i => i.pillar === 'public_speaking' && i.is_public),
  content_creation: member.portfolio_items.filter(i => i.pillar === 'content_creation' && i.is_public),
  personal_branding: member.portfolio_items.filter(i => i.pillar === 'personal_branding' && i.is_public),
}

// Metadata untuk SEO
export async function generateMetadata({ params }) {
  return {
    title: `${member.stage_name} — Talent Panggung Kreator`,
    description: member.description,
    openGraph: { images: [member.avatar_url] }
  }
}
```

### Step 5.4 — Tambah Link ke Navigasi Web Komunitas

```tsx
// front/app/page.tsx (landing page) — tambah di section program/CTA
// "Lihat Talent Kami" → /talent

// front/app/layout.tsx atau Navbar komunitas
// Tambah menu: Home | Tentang | Galeri | Talent | Login
```

**Checklist Fase 5:**
- [ ] `/talent/page.tsx` — grid card talent dengan filter pilar & search nama
- [ ] `/talent/[username]/page.tsx` — profil lengkap dengan tab 3 pilar
- [ ] SEO metadata (title, description, OG image)
- [ ] Link ke `/talent` di navbar/landing page komunitas
- [ ] ISR (Incremental Static Regeneration) di-setup: `revalidate = 3600` (1 jam)

---

## FASE 6 — Admin CMS: Integrasi Data Interests

### Step 6.1 — Tambah Tab Analytics di Admin

```
front/app/admin-app/analytics/member-insights/page.tsx
```

Konten halaman:
- **Distribusi Minat:** Bar chart — berapa member per interest (VO, MC, dll.)
- **Distribusi Level:** Pie chart — Pemula / Menengah / Lanjutan
- **Referral Source:** Bar chart — dari mana member datang
- **Completion Rate:** Berapa % member yang sudah isi form interest

```typescript
// Query analytics
const { data: interestStats } = await supabase
  .from('member_interests')
  .select('primary_interests, experience_level, referral_source')

// Process di server: flatten arrays, hitung frekuensi
```

### Step 6.2 — Tambah Filter "Segment" di Halaman Members

Di `admin-app/data-center/members/page.tsx`:
- Tambah filter dropdown: "Minat" → VO / MC / Content Creator / dll.
- Tambah badge di tabel: tampilkan `primary_interests` sebagai chips kecil

**Checklist Fase 6:**
- [ ] Halaman analytics member insights dibuat
- [ ] Filter segment di halaman members admin
- [ ] Export CSV dengan kolom interests

---

## FASE 7 — Newsletter Integration

### Step 7.1 — Setup MailerLite / Brevo

```bash
# Install MailerLite SDK (atau Brevo, pilih yang free tier lebih cocok)
npm install @mailerlite/mailerlite-nodejs
# MailerLite free: 1000 subscribers, 12000 email/bulan ✓
```

### Step 7.2 — Buat Supabase Edge Function

```typescript
// front/supabase/functions/sync-newsletter/index.ts

import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { member_id, action } = await req.json()
  // action: 'subscribe' | 'update' | 'unsubscribe'

  const supabase = createClient(/* ... */)
  const { data: member } = await supabase
    .from('members')
    .select('*, member_interests(*)')
    .eq('id', member_id)
    .single()

  if (!member.subscribed_newsletter || action === 'unsubscribe') {
    // Hapus dari MailerLite
    return
  }

  const groups = buildSegmentGroups(member.member_interests)
  // POST ke MailerLite API
  await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('MAILERLITE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: member.email,
      fields: {
        name: member.full_name,
        city: member.city,
        tier: member.membership_tier,
      },
      groups, // Segment berdasarkan interests
    })
  })
})
```

### Step 7.3 — Trigger dari API Profile Route

```typescript
// Tambahkan di akhir POST /api/member/profile setelah sukses save:

await fetch(`${process.env.SUPABASE_URL}/functions/v1/sync-newsletter`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ member_id: user.id, action: 'subscribe' }),
})
// Fire-and-forget (tidak blocking response)
```

**Checklist Fase 7:**
- [ ] Akun MailerLite/Brevo dibuat, API key tersimpan di `.env`
- [ ] Edge function `sync-newsletter` di-deploy
- [ ] Trigger dari profile API route aktif
- [ ] Test: submit form → subscriber masuk di MailerLite

---

## FASE 8 — Testing & QA

### Step 8.1 — Test Cases Wajib

```
□ Register baru → form interest muncul di step 2-3
□ Lewati interest saat register → bisa diisi nanti di /myprofile
□ Submit form interest → data tersimpan di member_interests
□ Upload avatar >10MB → ditolak dengan pesan jelas
□ Upload avatar 5MB → dikompres ke <200KB, tersimpan di Storage
□ Paste URL YouTube → thumbnail muncul otomatis tanpa upload
□ Paste URL TikTok → thumbnail field muncul untuk upload manual
□ Tambah portfolio item 'image' → file terkompres, URL tersimpan
□ Hapus portfolio item 'image' → file dihapus dari Storage
□ Halaman /talent → tampil member dengan portfolio
□ Halaman /talent/[username] → profil lengkap + tab pilar
□ /talent/[username] yang tidak ada → 404 page
□ Visitor (non-login) bisa buka /talent dan /talent/[username]
□ Admin bisa filter member by interest di admin panel
□ Newsletter: form submit → subscriber muncul di MailerLite
```

### Step 8.2 — Verifikasi Storage Budget

```bash
# Cek ukuran bucket di Supabase Dashboard → Storage → Usage
# Target: total <900MB dari 1GB limit free tier

# Atau via SQL:
SELECT
  bucket_id,
  COUNT(*) as file_count,
  ROUND(SUM(metadata->>'size')::numeric / 1024 / 1024, 2) as size_mb
FROM storage.objects
GROUP BY bucket_id;
```

---

## Catatan Penting untuk Developer

> **Urutan pengerjaan HARUS linear per fase.** Jangan mulai Fase 3 sebelum Fase 1 dan 2 selesai — form bergantung pada API route yang bergantung pada tabel database.

> **Gunakan `upsert` bukan `insert` untuk `member_interests`** — karena satu member hanya boleh punya satu baris, dan form bisa disubmit berkali-kali (update).

> **Video TIDAK boleh disimpan ke Supabase Storage** — ini aturan keras untuk menjaga budget storage. Selalu arahkan member untuk upload ke YouTube/TikTok/IG terlebih dahulu.

> **Thumbnail YouTube bersumber dari `img.youtube.com`** — ini URL publik gratis dari YouTube, tidak perlu disimpan ke Storage. Simpan thumbnail_url-nya saja sebagai string URL di database.

---

*Dokumen ini adalah pasangan dari `specification.md`. Baca spec terlebih dahulu sebelum memulai implementasi.*
