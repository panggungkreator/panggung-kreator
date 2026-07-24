# Spesifikasi Teknis & Arsitektur
# Panggung Kreator v2

**Versi:** 2.0  
**Tanggal:** Juli 2026  
**Tech Lead:** Bagas  
**Stack:** Next.js 15 (App Router) · Supabase · TypeScript

---

## 1. Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | SSR + Client Components |
| **Styling** | Tailwind CSS | Utility-first |
| **Database** | Supabase (PostgreSQL) | 24 tabel, RLS enabled |
| **Auth** | Supabase Auth (Google OAuth + Magic Link) | Session lintas subdomain |
| **Storage** | Supabase Storage | Media library |
| **Hosting** | Vercel | Otomatis deploy dari GitHub |
| **Animation** | GSAP / Lenis | Landing page scroll animation |
| **CMS** | Custom inline editor | Headless, berdasarkan `landing_sections` |

---

## 2. Arsitektur Multi-Domain

### 2.1 Konsep Routing

```
panggungkreator.web.id         →  app/ (root — tanpa prefix)
akademi.panggungkreator.web.id →  app/akademi/ (via rewrite middleware)
admin.panggungkreator.web.id   →  app/admin-app/ (via rewrite middleware)
```

### 2.2 Prinsip "Satu Rumah, Dua Pintu, Satu Dapur"

- **Satu Dapur:** 1 database Supabase, 1 auth system
- **Dua Pintu:** Web Komunitas (publik) & Web Akademi (konversi)
- **Satu Rumah:** 1 codebase Next.js, middleware yang membagi traffic

---

## 3. Struktur Folder Lengkap

```
front/
│
├── middleware.ts                           ← Otak pembagi domain
│
├── app/
│   │
│   │  ── SHARED AUTH (berlaku di 3 domain) ──────────────────
│   ├── login/
│   │   └── page.tsx                        ← Login Center (satu-satunya)
│   ├── register/
│   │   └── page.tsx                        ← Daftar member gratis
│   └── auth/
│       └── callback/
│           └── route.ts                    ← Redirect by role & tier
│   │
│   │  ── WEB KOMUNITAS (panggungkreator.web.id) ─────────────
│   ├── page.tsx                            ← Landing page
│   ├── tentang/
│   │   └── page.tsx
│   ├── galeri/
│   │   └── page.tsx
│   └── myprofile/
│       └── page.tsx                        ← Area member (semua tier)
│   │
│   │  ── WEB AKADEMI (akademi.panggungkreator.web.id) ───────
│   ├── akademi/
│   │   ├── page.tsx                        ← Landing page akademi
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx                  ← GUARD: blokir jika tier = free
│   │       ├── page.tsx                    ← Home dashboard
│   │       ├── program/page.tsx
│   │       ├── jadwal/page.tsx
│   │       ├── resource/page.tsx
│   │       └── course/page.tsx             ← [FUTURE]
│   │
│   │  ── ADMIN CMS (admin.panggungkreator.web.id) ───────────
│   ├── admin-app/
│   │   ├── layout.tsx                      ← GUARD: blokir jika role = member
│   │   ├── page.tsx                        ← Dashboard ringkasan
│   │   ├── data-center/
│   │   │   ├── members/page.tsx
│   │   │   └── attendance/page.tsx
│   │   ├── akademi/
│   │   │   ├── packages/
│   │   │   ├── voucher/
│   │   │   ├── registration/
│   │   │   ├── mentoring/
│   │   │   └── resources/
│   │   ├── komunitas/
│   │   │   ├── acara/
│   │   │   ├── venue/
│   │   │   └── partner/
│   │   ├── cms/
│   │   │   ├── komunitas/
│   │   │   ├── akademi/
│   │   │   └── media/
│   │   ├── analytics/
│   │   │   ├── funnel/
│   │   │   ├── revenue/
│   │   │   └── aktivitas/
│   │   └── system/
│   │       ├── admins/
│   │       ├── roles/
│   │       └── logs/
│   │
│   └── api/
│       └── upload/route.ts
│
├── components/
│   ├── ui/                                 ← Button, Input, Table, Badge (shared)
│   ├── editor/
│   │   ├── Edit.tsx                        ← Headless inline edit
│   │   └── EditorContext.tsx
│   ├── komunitas/                          ← Komponen khusus Web Komunitas
│   ├── akademi/                            ← Komponen khusus Web Akademi
│   └── admin/
│       └── Sidebar.tsx                     ← Render menu berdasarkan role
│
└── lib/
    ├── supabase/
    │   ├── client.ts
    │   ├── server.ts                       ← Cookie: domain '.panggungkreator.web.id'
    │   └── middleware.ts
    ├── auth/
    │   ├── getRedirectTarget.ts
    │   └── rbac.ts
    └── animations/
        └── useScrollAnimation.ts           ← GSAP/Lenis untuk landing page
```

---

## 4. Kode Kritis

### 4.1 `middleware.ts` — Pembagi Domain

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROOT_DOMAIN = 'panggungkreator.web.id'
const AUTH_PATHS = ['/login', '/register', '/auth']

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const { pathname, search } = req.nextUrl
  const sub = hostname.replace(`.${ROOT_DOMAIN}`, '').replace(ROOT_DOMAIN, '')

  // Subdomain non-root yang mencoba akses /login atau /register
  // → redirect ke root domain (login center terpusat)
  if (AUTH_PATHS.some(p => pathname.startsWith(p)) && sub !== '' && sub !== 'www') {
    return NextResponse.redirect(
      new URL(`https://${ROOT_DOMAIN}${pathname}${search}`)
    )
  }

  if (sub === 'akademi') {
    return NextResponse.rewrite(new URL(`/akademi${pathname}${search}`, req.url))
  }
  if (sub === 'admin') {
    return NextResponse.rewrite(new URL(`/admin-app${pathname}${search}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 4.2 `auth/callback` — Redirect by Role & Tier

```typescript
const { data: member } = await supabase
  .from('members')
  .select('role, membership_tier')
  .eq('id', user.id)
  .single()

// Admin → Admin CMS
if (member.role !== 'member') {
  return NextResponse.redirect('https://admin.panggungkreator.web.id')
}

// Member Gratis → My Profile di Web Komunitas
if (member.membership_tier === 'free') {
  return NextResponse.redirect('https://panggungkreator.web.id/myprofile')
}

// Member Berbayar → Dashboard Akademi
const redirectParam = searchParams.get('redirect')
const target = redirectParam ?? 'https://akademi.panggungkreator.web.id/dashboard'
return NextResponse.redirect(target)
```

### 4.3 Cookie Session Lintas Domain

```typescript
// lib/supabase/server.ts
cookieOptions: {
  domain: '.panggungkreator.web.id', // titik di depan = semua subdomain
  sameSite: 'lax',
  secure: true,
  path: '/',
}
```

---

## 5. Database Schema

### 5.1 Environment

| | Development (Local) | Production (Server) |
|---|---|---|
| **Project Name** | `panggungkreator-dev` | `panggungkreator's-prod` |
| **Supabase URL** | `https://zpcsqidgedvuaqgrklgp.supabase.co` | `https://wmuzvefmrbgffftkpdnx.supabase.co` |
| **Region** | `ap-southeast-1` (Singapore) | `ap-northeast-2` (Seoul) |
| **Status** | ACTIVE_HEALTHY | ACTIVE_HEALTHY |
| **Postgres** | 17.6.1 | 17.6.1 |

### 5.2 Inventaris Tabel (24 Tabel)

| Tabel | Fungsi | RLS |
|---|---|---|
| `members` | Data user utama | Enabled |
| `packages` | Paket membership | Enabled |
| `vouchers` | Kode diskon | Enabled |
| `events` | Data event / acara | Enabled |
| `attendances` | Absensi event | Enabled |
| `landing_sections` | Konten landing page (CMS) | Enabled |
| `transactions` | Transaksi pembayaran | Enabled |
| `referral_codes` | Kode referral afiliasi | Enabled |
| `mentoring_sessions` | Sesi mentoring | Enabled |
| `resources` | Materi/sumber daya | Enabled |
| `partners` | Data partner | Enabled |
| `venues` | Venue event | Enabled |
| `team_members` | Tim Panggung Kreator | Enabled |
| `gallery_items` | Item galeri | Enabled |
| `gallery_albums` | Album galeri | Enabled |
| `wa_group_assignments` | Penugasan grup WA | Enabled |
| `media_library` | Library media | Enabled |
| `testimonials` | Testimoni | Enabled |
| `admin_activity_logs` | Log aktivitas admin | Enabled |
| `privilege_groups` | Grup privilege admin | Enabled |
| `privilege_items` | Item privilege admin | Enabled |
| `privilege_actions` | Aksi yang diizinkan | Enabled |
| `admin_roles` | Role admin | Enabled |
| `admin_role_permissions` | Permission per role | Enabled |

### 5.3 Database Functions (9 Functions)

| Function | Deskripsi |
|---|---|
| `get_email_by_username(p_username)` | Ambil email berdasarkan username |
| `get_member_tier()` | Ambil tier membership user saat ini |
| `has_privilege(user_id, page_slug, action_slug)` | Cek privilege user |
| `is_admin()` | Cek apakah user adalah admin |
| `is_admin_akademi()` | Cek apakah user adalah admin akademi |
| `is_admin_komunitas()` | Cek apakah user adalah admin komunitas |
| `is_super_admin()` | Cek apakah user adalah super admin |
| `update_updated_at_column()` | Trigger auto-update kolom `updated_at` |
| `use_referral_code(p_code, p_member_id)` | Proses penggunaan referral code |

---

## 6. Role & Permission System

### 6.1 Role Matrix

| Modul | Super Admin | Admin Akademi | Admin Komunitas |
|---|---|---|---|
| **Dashboard** | Full | Full | Full |
| **Member** | Full | View Only | View Only |
| **Attendance** | Full | Tidak Bisa | Full |
| **Packages** | Full | Full | Tidak Bisa |
| **Voucher** | Full | Full | Tidak Bisa |
| **Registration** | Full | Full | Tidak Bisa |
| **Mentoring** | Full | Full | Tidak Bisa |
| **Resources** | Full | Full | Tidak Bisa |
| **Acara & Absensi** | Full | Tidak Bisa | Full |
| **Venue & Partner** | Full | Tidak Bisa | Full |
| **CMS** | Full | Akademi Only | Komunitas Only |
| **Analytics** | Full | Akademi Only | Komunitas Only |
| **System** | Full | Tidak Bisa | Tidak Bisa |

### 6.2 Membership Tier

| Tier | Akses | Deskripsi |
|---|---|---|
| `free` | `panggungkreator.web.id/myprofile` | Member komunitas gratis |
| `regular` | Dashboard Akademi | Member berbayar Rp49.000 |
| `mvp` | Dashboard Akademi + Prioritas | Member premium, prioritas mentoring |

---

## 7. Master URL Reference

| URL | Folder di Kode | Akses |
|---|---|---|
| `panggungkreator.web.id/` | `app/page.tsx` | Publik |
| `panggungkreator.web.id/tentang` | `app/tentang/` | Publik |
| `panggungkreator.web.id/galeri` | `app/galeri/` | Publik |
| `panggungkreator.web.id/login` | `app/login/` | Publik — **LOGIN CENTER** |
| `panggungkreator.web.id/register` | `app/register/` | Publik |
| `panggungkreator.web.id/myprofile` | `app/myprofile/` | Login (semua tier) |
| `akademi.panggungkreator.web.id/` | `app/akademi/page.tsx` | Publik |
| `akademi.panggungkreator.web.id/checkout` | `app/akademi/checkout/` | Login |
| `akademi.panggungkreator.web.id/dashboard` | `app/akademi/dashboard/` | Regular/MVP |
| `akademi.panggungkreator.web.id/dashboard/program` | `app/akademi/dashboard/program/` | Regular/MVP |
| `akademi.panggungkreator.web.id/dashboard/jadwal` | `app/akademi/dashboard/jadwal/` | Regular/MVP |
| `akademi.panggungkreator.web.id/dashboard/resource` | `app/akademi/dashboard/resource/` | Regular/MVP |
| `admin.panggungkreator.web.id/` | `app/admin-app/page.tsx` | Semua admin |
| `admin.panggungkreator.web.id/data-center/*` | `app/admin-app/data-center/` | Semua admin |
| `admin.panggungkreator.web.id/akademi/*` | `app/admin-app/akademi/` | Super Admin, Admin Akademi |
| `admin.panggungkreator.web.id/komunitas/*` | `app/admin-app/komunitas/` | Super Admin, Admin Komunitas |
| `admin.panggungkreator.web.id/system/*` | `app/admin-app/system/` | **Super Admin ONLY** |

---

## 8. Dev → Production Migration

### Alur Kerja Database

```
[Dev DB - zpcsqidgedvuaqgrklgp]
        │
        │  supabase db pull
        ▓
[front/supabase/migrations/*.sql]
        │
        │  git add + commit + push
        ▓
[GitHub Repository]
        │
        │  supabase db push --project-ref wmuzvefmrbgffftkpdnx
        ▓
[Prod DB - wmuzvefmrbgffftkpdnx]
```

### Checklist Migrasi Awal

- [ ] `npm install supabase --save-dev`
- [ ] `npx supabase login`
- [ ] `npx supabase link --project-ref zpcsqidgedvuaqgrklgp`
- [ ] `npx supabase db push --project-ref wmuzvefmrbgffftkpdnx`
- [ ] Verifikasi 24 tabel ada di Prod
- [ ] Verifikasi 9 functions ada di Prod
- [ ] Seed data: privilege_groups, privilege_items, privilege_actions, packages, landing_sections

---

## 9. Environment Variables

```env
# Development
NEXT_PUBLIC_SUPABASE_URL=https://zpcsqidgedvuaqgrklgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key dev]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[service role key dev]

# Production
NEXT_PUBLIC_SUPABASE_URL=https://wmuzvefmrbgffftkpdnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key prod]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[service role key prod]
```

> PENTING: Jangan commit `.env` ke Git.

---

*Lihat juga: PRD.md untuk spesifikasi produk, Akademi.md untuk detail program, Community.md untuk ekosistem komunitas.*
