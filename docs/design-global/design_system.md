# Design System — Panggung Kreator

> Dokumentasi resmi design system proyek **Panggung Kreator**. Mencakup token warna, tipografi, spacing, radius, komponen UI, pola animasi, dan panduan penggunaan per konteks.

---

## Daftar Isi

1. [Filosofi Desain](#1-filosofi-desain)
2. [Warna (Color Tokens)](#2-warna-color-tokens)
3. [Tipografi](#3-tipografi)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Border Radius](#5-border-radius)
6. [Komponen UI](#6-komponen-ui)
7. [Animasi & Efek](#7-animasi--efek)
8. [Layout & Grid](#8-layout--grid)
9. [Scrollbar & Scroll Behavior](#9-scrollbar--scroll-behavior)
10. [Konteks Per Halaman](#10-konteks-per-halaman)
11. [Panduan Do / Don't](#11-panduan-do--dont)
12. [Referensi File](#12-referensi-file)

---

## 1. Filosofi Desain

Panggung Kreator menggunakan **dua identitas visual** yang berjalan berdampingan:

| Layer | Konteks | Karakter |
|---|---|---|
| **Community / Landing** | `/`, `/talent`, `/tentang`, `/galeri` | Editorial, bold, hitam-putih, serif accent, `rounded-none` |
| **Admin CMS** | `/admin/*`, `/akademi` | Clean, card-based, token-driven, `rounded-lg/xl`, dark mode penuh |
| **MyProfile** | `/myprofile` | Hybrid — editorial sidebar + clean content area |

> **Prinsip utama:** Konsisten dalam token, berbeda dalam karakter per konteks.

---

## 2. Warna (Color Tokens)

Tidak ada `tailwind.config.ts`. Proyek menggunakan **Tailwind v4** dengan konfigurasi via `@theme inline` di [`globals.css`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/globals.css).

### 2.1 Shadcn/Radix Semantic Tokens (OKLCH)

#### Light Mode

| Token CSS | Tailwind Class | Nilai OKLCH | Keterangan |
|---|---|---|---|
| `--background` | `bg-background` | `oklch(1 0 0)` | Putih murni |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | Hampir hitam |
| `--card` | `bg-card` | `oklch(1 0 0)` | Background card |
| `--card-foreground` | `text-card-foreground` | `oklch(0.145 0 0)` | Teks di card |
| `--primary` | `bg-primary` | `oklch(0.205 0 0)` | Hitam pekat (aksi utama) |
| `--primary-foreground` | `text-primary-foreground` | `oklch(0.985 0 0)` | Putih (teks di primary) |
| `--secondary` | `bg-secondary` | `oklch(0.97 0 0)` | Abu sangat terang |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | Background muted |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` | Abu medium |
| `--destructive` | `text-destructive` | `oklch(0.577 0.245 27.325)` | Merah error |
| `--border` | `border-border` | `oklch(0.922 0 0)` | Garis border default |
| `--input` | `border-input` | `oklch(0.922 0 0)` | Border input field |
| `--ring` | `ring-ring` | `oklch(0.708 0 0)` | Focus ring |
| `--radius` | — | `0.625rem` (10px) | Base border radius |

#### Dark Mode

| Token CSS | Nilai OKLCH | Keterangan |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Hampir hitam |
| `--foreground` | `oklch(0.985 0 0)` | Hampir putih |
| `--primary` | `oklch(0.922 0 0)` | Putih terang |
| `--primary-foreground` | `oklch(0.205 0 0)` | Hitam (teks di primary) |
| `--border` | `oklch(1 0 0 / 10%)` | Border sangat subtle |
| `--muted-foreground` | `oklch(0.708 0 0)` | Abu medium |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Merah (dark) |

---

### 2.2 Admin CMS Custom Tokens (Hex)

Eksklusif untuk `/admin/*`. Dipetakan ke Tailwind via `@theme inline`.

#### Light Mode

| Token CSS | Tailwind Class | Nilai | Keterangan |
|---|---|---|---|
| `--bg-page` | `bg-bg-page` | `#F2F4F7` | Background halaman |
| `--bg-card` | `bg-bg-card` | `#FFFFFF` | Background card |
| `--bg-well` | `bg-bg-well` | `#F5F5F5` | Background inset/section |
| `--bg-sidebar` | `bg-bg-sidebar` | `#FFFFFF` | Background sidebar |
| `--text-primary` | `text-text-primary` | `#111111` | Teks utama |
| `--text-secondary` | `text-text-secondary` | `#6B7280` | Teks sekunder |
| `--text-muted` | `text-text-muted` | `#9CA3AF` | Teks muted |
| `--border-default` | `border-border-default` | `#E5E7EB` | Border default |
| `--accent-green` | `text-accent-green` | `#BAFF6A` | Aksen hijau neon |
| `--accent-red` | `text-accent-red` | `#FF6B6B` | Aksen merah |

#### Dark Mode

| Token CSS | Nilai | Keterangan |
|---|---|---|
| `--bg-page` | `#0F1117` | Background gelap |
| `--bg-card` | `#1A1D27` | Card gelap |
| `--bg-well` | `#22263A` | Well gelap |
| `--bg-sidebar` | `#1C1C1F` | Sidebar gelap |
| `--text-primary` | `#F0F0F0` | Teks terang |
| `--text-secondary` | `#8B8FA8` | Teks sekunder |
| `--text-muted` | `#55596E` | Teks muted |
| `--border-default` | `#2A2E42` | Border gelap |
| `--accent-green` | `#A3E85A` | Hijau neon (dark) |
| `--accent-red` | `#FF5252` | Merah (dark) |

---

### 2.3 Community / Editorial Colors (Inline)

Digunakan langsung sebagai literal color pada halaman publik. **Tidak melalui token CSS.**

| Warna | Nilai | Penggunaan |
|---|---|---|
| Hitam Editorial | `#2c2c2c` | Teks heading, border, elemen utama |
| Putih | `#FFFFFF` | Background, teks di atas hitam |
| Off-White | `#FAF9F6` | Background talent page |
| Near-Black | `#0A0A0A` | Talent page dark bg |
| Stabilo Kuning | `#ffe78a` | Highlight `.highlight-stabilo` (light) |
| Stabilo Biru | `#0762bd` | Highlight `.highlight-stabilo` (dark) |
| Crimson Red | `#bc151b` | CTA Akademi |
| Muted text | `rgba(#2c2c2c, 0.7)` | Paragraf, subtitle |
| Border subtle | `rgba(#2c2c2c, 0.05–0.2)` | Divider, grid lines |

---

### 2.4 Zinc Scale (Admin/Dialog/CMS)

Digunakan bersama token Admin CMS untuk komponen Shadcn:

`zinc-50` `zinc-100` `zinc-200` `zinc-400` `zinc-500` `zinc-800` `zinc-900` `zinc-950`

---

### 2.5 Membership Tier Colors

| Tier | Background | Teks | Border |
|---|---|---|---|
| `priority` | `bg-red-500/10` | `text-red-600 dark:text-red-400` | `border-red-500/30` |
| `membership` | `bg-sky-500/10` | `text-sky-600 dark:text-sky-400` | `border-sky-500/30` |
| default / free | `bg-neutral-100` | `text-neutral-600` | `border-neutral-300` |

---

## 3. Tipografi

### 3.1 Font Families

| Nama | Sumber | Variable CSS | Penggunaan |
|---|---|---|---|
| **Geist** | `next/font/google` | `--font-sans` | Font utama seluruh UI |
| **Inter** | Google Fonts CDN | `--font-title` | Heading admin, dialog, card |
| **Plus Jakarta Sans** | Google Fonts CDN | — | Body alternatif |
| **Playfair Display** | Google Fonts CDN | `--font-serif` | Editorial accent, nama stage |

```css
/* @theme inline di globals.css */
--font-sans:  var(--font-sans);           /* Geist */
--font-title: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Playfair Display", ui-serif, Georgia, serif;
--font-mono:  ui-monospace, SFMono-Regular, monospace;
```

### 3.2 Skala Ukuran

| Elemen | Class | Ukuran | Konteks |
|---|---|---|---|
| H1 Hero | `text-[clamp(2.25rem,6vw,5.5rem)]` | 36–88px (fluid) | Landing page saja |
| H2 Section | `text-2xl md:text-3xl` | 24–30px | Header section |
| H3 Card Title | `text-lg font-semibold` | 18px | Judul card/modal |
| H4 Label | `text-[10px] uppercase tracking-wider` | 10px | Label uppercase admin |
| Body Default | `text-sm` | 14px | Konten umum |
| Body Small | `text-xs` | 12px | Meta, label, caption |
| Micro Label | `text-[10px]` / `text-[9px]` | 9–10px | Overline, kode mono |
| Monospace | `font-mono text-[10–11px]` | 10–11px | Username, kode, timestamp |

### 3.3 Font Weight

| Class | Penggunaan |
|---|---|
| `font-black` | Hero heading, nav uppercase, badge label |
| `font-bold` | Modal title, CTA button, dialog title |
| `font-semibold` | Section title, stat number |
| `font-medium` | Body label, input placeholder |
| `font-normal` | Body teks umum |
| `italic` (Playfair) | Stage name, editorial serif accent |

### 3.4 Letter Spacing

| Class | Nilai | Penggunaan |
|---|---|---|
| `tracking-tighter` | `-0.05em` | Hero heading |
| `tracking-tight` | `-0.025em` | Modal/dialog title |
| `tracking-wider` | `0.05em` | Label uppercase umum |
| `tracking-widest` | `0.1em` | Tier badge, kode mono |
| `tracking-[0.15em]` | Custom | Mobile nav links |
| `tracking-[0.2em]` | Custom | CTA button, overline label |
| `tracking-[0.25em]` | Custom | Footer nav, brand name |
| `tracking-[0.3em]` | Custom | Badge hero section |

---

## 4. Spacing & Sizing

### 4.1 Padding & Gap Umum

| Konteks | Nilai | Class |
|---|---|---|
| Padding card/section | 16–24px | `p-4`, `p-6` |
| Padding modal | 20–24px | `p-5 sm:p-6` |
| Padding dialog | 32px | `p-8` |
| Gap row item | 8–12px | `gap-2`, `gap-3` |
| Gap section vertikal | 24–32px | `gap-6`, `gap-8` |
| Padding button `default` | H:32px, X:10px | `h-8 px-2.5` |
| Padding input | H:32px, X:10px | `h-8 px-2.5` |
| Section vertikal | 64–96px | `py-16 md:py-24` |

### 4.2 Lebar Kontainer

| Konteks | Class | Lebar Maks |
|---|---|---|
| Landing / Community | `max-w-7xl mx-auto px-6` | 1280px |
| Inner content | `max-w-5xl` | 1024px |
| Modal default | `max-w-lg` | 512px |
| Modal besar | `max-w-2xl` | 672px |

### 4.3 Tinggi Komponen

| Komponen | Tinggi |
|---|---|
| Button `default` | `h-8` (32px) |
| Button `sm` | `h-7` (28px) |
| Button `lg` | `h-9` (36px) |
| Input | `h-8` (32px) |
| Avatar `default` | `size-8` (32px) |
| Avatar `lg` | `size-10` (40px) |
| Profile photo | `w-20 h-20` (80px) |
| Table head row | `h-10` (40px) |
| Modal icon | `w-10 h-10` (40px) |

---

## 5. Border Radius

| Token CSS | Nilai | Tailwind | Konteks |
|---|---|---|---|
| `--radius-sm` | `6px` | `rounded-sm` (custom) | Tag kecil |
| `--radius` (base) | `0.625rem` = 10px | `rounded-lg` | Card, button, input default |
| `--radius-md` | `10px` | — | Button, nav item |
| `--radius-lg` | `14px` | `rounded-lg` | Card, modal |
| `--radius-xl` | `20px` | `rounded-xl` | Modal overlay |
| `--radius-2xl` | `~1.125rem` | `rounded-2xl` | Dialog |
| literal `24px` | `24px` | `rounded-[24px]` | Dialog, confirm modal |
| `rounded-full` | `9999px` | `rounded-full` | Avatar, pill badge, scrollbar |
| `rounded-none` | `0px` | `rounded-none` | **Semua elemen Community/Editorial** |

> **Aturan penting:** Halaman Community/Editorial — `rounded-none` di semua elemen tanpa kecuali. Admin CMS — `rounded-lg` hingga `rounded-[24px]`.

---

## 6. Komponen UI

Semua komponen di [`front/components/ui/`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui).

### 6.1 Button

**File:** [`Button.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Button.tsx) — dibangun dengan CVA.

#### Variants

| Variant | Style | Penggunaan |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | Aksi utama |
| `outline` | `border-border bg-background hover:bg-muted` | Aksi sekunder |
| `secondary` | `bg-secondary text-secondary-foreground` | Aksi tersier |
| `ghost` | `hover:bg-muted hover:text-foreground` | Icon button tersembunyi |
| `destructive` | `bg-destructive/10 text-destructive hover:bg-destructive/20` | Hapus / bahaya |
| `link` | `text-primary underline-offset-4 hover:underline` | Tautan teks |

#### Sizes

| Size | Tinggi | Padding | Radius |
|---|---|---|---|
| `xs` | `h-6` | `px-2` | `rounded-[10px]` |
| `sm` | `h-7` | `px-2.5` | `rounded-[12px]` |
| `default` | `h-8` | `px-2.5` | `rounded-lg` |
| `lg` | `h-9` | `px-2.5` | `rounded-lg` |
| `icon` | `size-8` | — | `rounded-lg` |
| `icon-sm` | `size-7` | — | `rounded-[12px]` |
| `icon-xs` | `size-6` | — | `rounded-[10px]` |

```tsx
import { Button } from "@/components/ui/Button";

<Button>Simpan</Button>
<Button variant="outline" size="sm">Batal</Button>
<Button variant="destructive" size="icon"><Trash2 /></Button>
<Button variant="ghost" size="icon-sm"><Settings /></Button>
```

---

### 6.2 Badge

**File:** [`badge.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/badge.tsx)

Base: `h-5 rounded-4xl px-2 py-0.5 text-xs font-medium`

| Variant | Style |
|---|---|
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `destructive` | `bg-destructive/10 text-destructive` |
| `outline` | `border-border text-foreground` |
| `ghost` | `hover:bg-muted` |

```tsx
<Badge>Aktif</Badge>
<Badge variant="destructive">Tidak Aktif</Badge>
<Badge variant="outline">Pending</Badge>
```

---

### 6.3 Tags & Filter Chips

Untuk filter kategori / tag konten (seperti referensi gambar — "ALL", "MOODBOARD", "Ratings"):

```tsx
{/* Active chip */}
<button className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#2c2c2c] text-white rounded-full">
  ALL
</button>

{/* Inactive chip */}
<button className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-border text-muted-foreground rounded-full hover:border-foreground hover:text-foreground transition-colors">
  MOODBOARD
</button>
```

---

### 6.4 Input

**File:** [`Input.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Input.tsx)

```
h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1
text-base md:text-sm transition-colors outline-none
placeholder:text-muted-foreground
focus-visible:border-ring
disabled:opacity-50 disabled:cursor-not-allowed
aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
dark:bg-input/30
```

```tsx
<Input placeholder="Cari member..." />
<Input type="email" aria-invalid={!!errors.email} />
```

---

### 6.5 Tabs

**File:** [`tabs.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/tabs.tsx)

#### TabsList Variants

| Variant | Style | Penggunaan |
|---|---|---|
| `default` | `bg-muted rounded-lg p-[3px]` | Tab dalam card/panel |
| `line` | `bg-transparent gap-1` | Tab halaman (underline style) |

#### States

| State | Style |
|---|---|
| Default | `text-foreground/60` |
| Active | `data-active:bg-background data-active:text-foreground shadow-sm` |
| Line Active | `after:opacity-100` (garis bawah `bg-foreground`) |

```tsx
<Tabs defaultValue="absensi">
  <TabsList variant="line">
    <TabsTrigger value="absensi">Absensi</TabsTrigger>
    <TabsTrigger value="profil">Edit Profil</TabsTrigger>
  </TabsList>
  <TabsContent value="absensi">...</TabsContent>
</Tabs>
```

---

### 6.6 Modal / Dialog

**Files:** [`Modal.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Modal.tsx) (wrapper) + [`dialog.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/dialog.tsx) (primitif)

#### Modal Props

| Prop | Type | Default | Keterangan |
|---|---|---|---|
| `isOpen` | `boolean` | — | Status visibilitas |
| `onClose` | `() => void` | — | Callback tutup |
| `title` | `ReactNode` | — | Judul header |
| `subtitle` | `ReactNode` | — | Sub-judul header |
| `icon` | `ReactNode` | — | Icon 40×40 di header |
| `headerRight` | `ReactNode` | — | Konten kanan header |
| `footer` | `ReactNode` | — | Footer dengan border top |
| `maxWidth` | `string` | `"max-w-lg"` | Lebar maksimum |

#### Styling

```
/* DialogContent */
bg-white dark:bg-zinc-950
border border-zinc-200 dark:border-zinc-800
rounded-xl shadow-xl p-5 sm:p-6
max-h-[90vh] overflow-y-auto

/* Dialog primitive (Radix) */
rounded-[24px] p-8
border border-zinc-250 dark:border-zinc-800
```

#### ModalSection

```tsx
<ModalSection title="INFORMASI AKUN">
  {/* Konten */}
</ModalSection>
```

Style: `bg-zinc-50/80 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/80`
Label: `font-semibold mb-2.5 uppercase tracking-wider text-[10px] text-zinc-500`

---

### 6.7 Table

**File:** [`table.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/table.tsx)

| Sub-komponen | Style |
|---|---|
| `Table` | `w-full caption-bottom text-sm` + overflow wrapper |
| `TableHeader` | `[&_tr]:border-b` |
| `TableRow` | `border-b hover:bg-muted/50 transition-colors` |
| `TableHead` | `h-10 px-2 font-medium text-foreground whitespace-nowrap` |
| `TableCell` | `p-2 align-middle whitespace-nowrap` |
| `TableFooter` | `border-t bg-muted/50 font-medium` |

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nama</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Budi Santoso</TableCell>
      <TableCell><Badge>Aktif</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 6.8 Avatar

**File:** [`avatar.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/avatar.tsx)

| Sub-komponen | Keterangan |
|---|---|
| `Avatar` | Container, `rounded-full`, sizes: `sm`/`default`/`lg` |
| `AvatarImage` | `object-cover aspect-square` |
| `AvatarFallback` | Inisial fallback, `bg-muted text-muted-foreground` |
| `AvatarBadge` | Status dot pojok kanan bawah |
| `AvatarGroup` | Stack `-space-x-2` |

| Size | Dimensi |
|---|---|
| `sm` | `size-6` (24px) |
| `default` | `size-8` (32px) |
| `lg` | `size-10` (40px) |

> **Catatan:** Di `ProfileSidebar` (`/myprofile`), foto profil menggunakan `<img>` manual `w-20 h-20 rounded-none` — **bukan** `Avatar` component — untuk konsistensi editorial.

---

### 6.9 Spinner

**File:** [`spinner.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/spinner.tsx)

`Loader2Icon` dari `lucide-react` dengan `animate-spin`.

```tsx
<Spinner className="size-6 text-muted-foreground" />
```

---

### 6.10 Info Blocks / Alert Cards

Untuk kotak informasi kontekstual (seperti referensi gambar — `Info blocks`):

```tsx
{/* Success/info block */}
<div className="flex gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
  <p>Pesan informasi kontekstual di sini.</p>
</div>
```

Untuk toast/sonner — `rounded-[1.25rem]`, semantic colors: emerald (success), red (error), sky (info), amber (warning).

---

### 6.11 Accordion

**File:** [`accordion.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/accordion.tsx)

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="faq-1">
    <AccordionTrigger>Pertanyaan umum?</AccordionTrigger>
    <AccordionContent>Jawaban detail.</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### 6.12 Select & Dropdown

**Files:** [`select.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/select.tsx), [`dropdown-menu.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/dropdown-menu.tsx)

Select menggunakan token Admin CMS:
```
Trigger: h-10 rounded-full border border-border-default bg-bg-well px-4 text-xs font-bold text-text-primary
Content: rounded-2xl border border-border-default bg-bg-card p-1 shadow-lg
Item:    rounded-xl py-2 pl-8 pr-2 text-xs font-semibold hover:bg-bg-well
```

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 6.13 Checkbox & Radio

**Files:** [`checkbox.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/checkbox.tsx), [`radio-group.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/radio-group.tsx)

- **Checkbox:** `size-4 rounded-sm` — states: Default, Checked, Disabled Checked, Disabled Unchecked
- **Radio:** `size-4 rounded-full` — dot indicator, states serupa

---

### 6.14 Slider

**File:** [`slider.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/slider.tsx)

Input range untuk budget, nilai, dll. Menampilkan tooltip `Value` di atas thumb.

---

### 6.15 Segmented Controls / Toggle Group

**Files:** [`toggle-group.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/toggle-group.tsx), [`toggle.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/toggle.tsx)

```tsx
<ToggleGroup type="single" defaultValue="grid">
  <ToggleGroupItem value="grid"><LayoutGrid /></ToggleGroupItem>
  <ToggleGroupItem value="list"><List /></ToggleGroupItem>
</ToggleGroup>
```

Toggle base: `inline-flex items-center justify-center rounded-lg text-sm`
States: `aria-pressed:bg-muted` / `data-[state=on]:bg-muted`
Sizes: `default h-8`, `sm h-7`, `lg h-9`

---

### 6.16 Breadcrumb (Bread)

Navigasi halaman bertingkat (seperti referensi gambar — `Bread`):

```tsx
<nav className="flex items-center gap-1 text-xs text-muted-foreground">
  <Link href="/" className="hover:text-foreground transition-colors">Home Page</Link>
  <span>/</span>
  <span className="font-medium text-foreground">Case Study Details</span>
</nav>
```

---

### 6.17 Profile Image dengan Status Badge

Mengacu pada referensi gambar — Profile image dengan badge `GOLD`:

```tsx
<div className="relative w-16 h-16">
  <img src={avatarUrl} className="w-full h-full object-cover rounded-full" />
  {/* Status badge */}
  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-yellow-400 text-black rounded-sm">
    GOLD
  </span>
</div>
```

---

### 6.18 Delete Confirm Dialog

**File:** [`DeleteConfirmDialog.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/DeleteConfirmDialog.tsx)

```
Container: max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[24px]
Cancel:  px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 rounded-full
Confirm: px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full
```

---

## 7. Animasi & Efek

### 7.1 Smooth Scroll (Lenis)

Library **Lenis** digunakan sebagai virtual scroll engine. Diinisialisasi di [`SmoothScroll.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/SmoothScroll.tsx).

```css
html.lenis, html.lenis body { height: auto; }
.lenis-smooth { scroll-behavior: auto !important; }
.lenis-stopped { overflow: hidden; }
.lenis-scrolling iframe { pointer-events: none; }
```

### 7.2 Stabilo (Highlighter) Effect

Efek animasi highlight bergaya stabilo. Untuk heading utama landing.

```css
.highlight-stabilo {
  background: linear-gradient(180deg, transparent 40%, #ffe78a 40%, #ffe78a 85%, transparent 85%);
  background-size: 0% 100%;
  animation: draw-stabilo 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.8s;
}
@keyframes draw-stabilo {
  to { background-size: 100% 100%; color: #000000 !important; }
}

/* Dark mode */
.dark .highlight-stabilo {
  background: linear-gradient(180deg, transparent 40%, #0762bd 40%, #0762bd 85%, transparent 85%);
}
```

Nav aktif (tanpa delay): `class="highlight-stabilo highlight-stabilo-nav"`

```tsx
<h1>DARI panggung KECIL, MENJADI <span className="highlight-stabilo">VERSI TERBAIK DIRIMU</span></h1>
```

### 7.3 Scroll Animations (GSAP)

Hook [`useScrollAnimations.ts`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/useScrollAnimations.ts):

| Fungsi | Deskripsi |
|---|---|
| `fadeUp(el, delay, yOffset, duration)` | Muncul dari bawah ke atas dengan fade |
| `textReveal(el, delay)` | Teks muncul per karakter dengan stagger |
| `parallax(el, speed)` | Elemen bergerak lebih lambat dari scroll |
| `counterUp(el, target, suffix)` | Animasi counter angka 0 → target |

```tsx
useEffect(() => {
  fadeUp(headlineRef.current, 0.2, 30, 1.2);
  parallax(imgRef.current, 0.12);
}, [fadeUp, parallax]);
```

### 7.4 Page Transition

[`PageTransitionLoader.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/PageTransitionLoader.tsx) — overlay loading saat navigasi antar halaman.

### 7.5 Dialog / Modal Animations

```css
@keyframes dialog-zoom-in {
  from { transform: translate(-50%, -48%) scale(0.95); opacity: 0; }
  to   { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
}
.animate-dialog-in  { animation: dialog-zoom-in  200ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-dialog-out { animation: dialog-zoom-out 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

Shadcn fade: `.animate-in` (200ms) / `.animate-out` (150ms)

### 7.6 Infinite Marquee

```css
@keyframes marquee-loop {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.33%); }
}
```

Elemen track 300% lebar, 3 set konten yang sama untuk seamless loop.

### 7.7 Hover & Transition Defaults

| Pola | Class |
|---|---|
| Warna transisi | `transition-colors` |
| Semua properti | `transition-all duration-300` |
| Tombol CTA editorial | `transition-all duration-350` |
| Active press | `active:translate-y-px` (Button component) |
| Image hover | `grayscale group-hover:grayscale-0 transition-all duration-700` |

---

## 8. Layout & Grid

### 8.1 Breakpoints (Tailwind Default)

| Breakpoint | Lebar |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### 8.2 Community — 12-Column Grid

```tsx
<div className="max-w-7xl mx-auto px-6 w-full">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
    <div className="md:col-span-7">...</div>  {/* Konten utama */}
    <div className="md:col-span-5">...</div>  {/* Visual/gambar */}
  </div>
</div>
```

Semua section dibagi dengan **border 1px eksplisit**, bukan shadow atau jarak.

### 8.3 MyProfile Layout

```
Desktop: Sidebar 280px | Main area (flex-1)
Mobile:  Stack vertikal
```

```tsx
// ProfileLayout.tsx
<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
  <ProfileSidebar />
  <main>{children}</main>
</div>
```

### 8.4 Admin CMS Layout

```
Sidebar (fixed, ~240px) | Main: bg-bg-page p-6
```

### 8.5 Pillar / Stats Grid

```tsx
{/* 4-column → stack mobile */}
<div className="grid grid-cols-2 md:grid-cols-4 border-l border-[#2c2c2c]">
  <div className="border-r border-t border-[#2c2c2c] p-8">...</div>
  ...
</div>
```

---

## 9. Scrollbar & Scroll Behavior

```css
/* Sembunyikan native scrollbar — Lenis menangani scroll */
html, body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }

/* Custom scrollbar — auto-hide, muncul saat hover */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: transparent; border-radius: 9999px; }
*:hover::-webkit-scrollbar-thumb { background: #cccccc; }
.dark *:hover::-webkit-scrollbar-thumb { background: #3f3f46; }

/* Helper class */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
```

---

## 10. Konteks Per Halaman

### 10.1 Community / Landing

| Aspek | Nilai |
|---|---|
| Background | Putih murni `#FFFFFF` |
| Teks utama | `#2c2c2c` (hitam editorial) |
| Border | `border-[#2c2c2c]` / `border-[#2c2c2c]/20` |
| **Radius** | `rounded-none` — semua elemen |
| Button CTA | Full border, `uppercase`, `tracking-[0.2em]`, `rounded-none` |
| Heading | `font-sans font-black uppercase tracking-tighter` |
| Serif accent | `font-serif italic` (Playfair Display) |
| Label bracket | `[ TEXT DALAM BRACKET ]` monospace |
| Animasi | GSAP fadeUp, textReveal, parallax |

### 10.2 Admin CMS

| Aspek | Nilai |
|---|---|
| Background | `bg-bg-page` |
| Card | `bg-bg-card border border-border-default` |
| **Radius** | `rounded-md` / `rounded-lg` / `rounded-xl` |
| Font | Geist sans-serif, `text-sm` |
| Tabel | `Table` component, `hover:bg-muted/50` |
| Modal | `Modal` component, `max-w-lg` |
| Dialog | `rounded-[24px] p-8` |
| Dark mode | Didukung penuh |

### 10.3 MyProfile

| Aspek | Nilai |
|---|---|
| Sidebar | Editorial — `rounded-none border-[#2c2c2c]/20` |
| Konten area | Clean — `rounded-lg bg-card` |
| Foto profil | `w-20 h-20 rounded-none border border-[#2c2c2c]` |
| Nama stage | `font-serif italic text-xl` (Playfair Display) |
| Username | `font-mono text-xs` |
| Badge tier | Warna per tier (§2.5) |
| Label seksi | `font-mono text-[9px] uppercase tracking-[0.2em]` dalam `[ BRACKET ]` |
| Signout button | `rounded-none border font-mono uppercase tracking-wider` |
| Tab navigasi | `TabsList variant="line"` |

---

## 11. Panduan Do / Don't

### ✅ Do

- Gunakan **CSS variables / token** untuk warna Admin CMS, bukan hardcode hex.
- Gunakan `rounded-none` secara konsisten di semua elemen halaman Community.
- Gunakan `font-mono` untuk data teknis: username, kode referral, timestamp, label bracket.
- Gunakan `font-serif italic` hanya untuk nama stage / heading accent editorial.
- Gunakan `transition-colors` atau `transition-all duration-300/350` di semua hover state.
- Sertakan dark mode class (`dark:`) untuk semua elemen Admin CMS.
- Gunakan `aria-invalid` pada input untuk error state.
- Gunakan `Button` component dengan variant yang tepat, hindari `<button>` HTML mentah kecuali halaman editorial.
- Wrap semua floating overlay (tooltip, popover, dropdown) dengan `z-50`.
- Gunakan `clamp()` untuk font-size fluid di heading hero.
- Tulis label bracket dalam format `[ TEKS UPPERCASE ]` untuk konteks editorial/monospace.

### ❌ Don't

- Jangan gunakan `rounded-full` di elemen editorial Community (kecuali scrollbar/avatar di admin).
- Jangan gunakan warna hardcode hex di Admin CMS — selalu via token CSS.
- Jangan gunakan `Playfair Display / font-serif` di halaman Admin CMS.
- Jangan campurkan karakter visual Community dan Admin dalam satu komponen.
- Jangan gunakan `lucide-react` untuk brand icon sosial (Instagram, LinkedIn, YouTube) — tidak tersedia; gunakan `Camera`, `Share2`, `Tv`, `Globe` sebagai pengganti.
- Jangan gunakan `Avatar` Shadcn di `ProfileSidebar` — gunakan `<img>` manual dengan `rounded-none`.
- Jangan tambahkan `<Header />` dan `<Footer />` di route `/myprofile`.
- Jangan gunakan `drop-shadow` atau `box-shadow` di komponen Community/Editorial.
- Jangan gunakan gradient background di Community (kecuali `highlight-stabilo`).

---

## 12. Referensi File

| Kategori | Path |
|---|---|
| Global CSS | [`front/app/globals.css`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/globals.css) |
| Root Layout | [`front/app/layout.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/layout.tsx) |
| Button | [`front/components/ui/Button.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Button.tsx) |
| Badge | [`front/components/ui/badge.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/badge.tsx) |
| Input | [`front/components/ui/Input.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Input.tsx) |
| Tabs | [`front/components/ui/tabs.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/tabs.tsx) |
| Modal | [`front/components/ui/Modal.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/Modal.tsx) |
| Dialog (primitive) | [`front/components/ui/dialog.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/dialog.tsx) |
| Table | [`front/components/ui/table.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/table.tsx) |
| Avatar | [`front/components/ui/avatar.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/avatar.tsx) |
| Spinner | [`front/components/ui/spinner.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/spinner.tsx) |
| DeleteConfirmDialog | [`front/components/ui/DeleteConfirmDialog.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/DeleteConfirmDialog.tsx) |
| Accordion | [`front/components/ui/accordion.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/accordion.tsx) |
| Select | [`front/components/ui/select.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/select.tsx) |
| Toggle Group | [`front/components/ui/toggle-group.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/toggle-group.tsx) |
| Header (Community) | [`front/components/community/Header.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/Header.tsx) |
| Footer (Community) | [`front/components/community/Footer.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/Footer.tsx) |
| Profile Sidebar | [`front/app/myprofile/components/ProfileSidebar.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/myprofile/components/ProfileSidebar.tsx) |
| Scroll Animations | [`front/components/community/useScrollAnimations.ts`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/useScrollAnimations.ts) |
| Smooth Scroll | [`front/components/ui/SmoothScroll.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/ui/SmoothScroll.tsx) |

---

*Dokumen diperbarui: Agustus 2026. Setiap perubahan pada token atau komponen inti harus diperbarui di sini.*

