# Implementation Plan — Landing Page Panggung Kreator
> **Dibuat:** 19 Juni 2026
> **Tujuan:** Panduan lengkap pengembangan ulang landing page Panggung Kreator, mencakup arsitektur section, sistem animasi, dan migrasi editor dari Inline Edit ke WYSIWYG berbasis panel terpusat.

---

## 1. AUDIT KONDISI SAAT INI

### 1.1 Struktur Kode yang Ada

Codebase saat ini menggunakan Next.js 16 (App Router) + Supabase sebagai backend CMS. Landing page dibagi ke beberapa komponen di `front/components/landing/`:

| File | Peran |
|------|-------|
| `LandingCMSContext.tsx` | Context Provider: `isAdmin`, `isEditMode`, `activeSectionId` |
| `AdminEditBar.tsx` | Floating button toggle mode edit |
| `EditableSection.tsx` | Wrapper tiap section dengan highlight border saat edit mode |
| `InlineEditText.tsx` | Komponen teks yang bisa diklik langsung di halaman untuk diedit |
| `InlineImage.tsx` | Komponen gambar yang bisa diklik untuk upload ulang |
| `SectionEditorPanel.tsx` | Sidebar panel kanan yang muncul saat section diklik — render form dinamis dari JSON content |
| `HeroSection.tsx` | Section Hero dengan InlineEditText tertanam di setiap elemen teks |
| `WelcomeSection.tsx` | Section Welcome |
| `PainPointsSection.tsx` | Section Pain Points |
| `CurriculumSection.tsx` | Section Curriculum |
| `PricingSection.tsx` | Section Pricing |
| `RemainingSections.tsx` | Kumpulan 7 section lainnya dalam 1 file besar |

Database `landing_sections` (Supabase):
```sql
CREATE TABLE landing_sections (
  id UUID PRIMARY KEY,
  section_type TEXT UNIQUE,  -- 'hero', 'welcome', dst
  content JSONB,             -- semua konten disimpan sebagai JSON
  is_visible BOOLEAN,
  section_order INTEGER,
  updated_at TIMESTAMPTZ
);
```

---

### 1.2 Masalah yang Ditemukan pada Sistem Edit Saat Ini

#### ❌ Problem 1 — Inline Edit Mengacaukan Struktur Kode

Setiap komponen section dipenuhi oleh `InlineEditText` yang tertanam di tiap elemen teks. Ini menyebabkan:

- **Kode sulit dibaca:** Markup JSX tercampur antara logika presentasi (tampilan) dan logika editing (interaksi admin)
- **Susah diganti konten:** Untuk mengganti teks, programmer harus mencari di antara baris-baris `InlineEditText` yang tersebar
- **Layout rusak saat edit mode:** `InlineEditText` membungkus teks dengan `div` tambahan yang bisa mempengaruhi layout Flexbox/Grid
- **Banyak `router.refresh()`:** Setiap perubahan 1 field langsung memicu refresh halaman penuh
- **Susah maintain:** Menambah field baru berarti menambah `InlineEditText` baru di JSX + menambah handler di komponen

#### ❌ Problem 2 — SectionEditorPanel Tidak Intuitif

`SectionEditorPanel.tsx` menampilkan form JSON secara dinamis (`renderField` yang generik). Masalahnya:

- Field label adalah key JSON mentah (e.g., `heading1`, `ctaText`) — tidak ramah editor non-developer
- Tidak ada WYSIWYG untuk teks panjang — hanya `<textarea>` biasa
- Tidak ada preview perubahan sebelum disimpan
- Untuk field yang mengandung HTML (`allowHtml={true}`), editor hanya textarea biasa — tidak aman dan tidak intuitif

#### ❌ Problem 3 — `RemainingSections.tsx` Terlalu Besar

7 section dijejalkan dalam 1 file berukuran 32KB. Ini:
- Sulit di-debug (cari section tertentu butuh scroll panjang)
- Tidak bisa lazy-load per section
- Tidak modular

#### ❌ Problem 4 — Tidak Ada Animasi

Seluruh landing page saat ini tidak memiliki animasi scroll, parallax, atau entrance animation. Ini berbeda jauh dari konsep yang diinginkan (referensi: tresmarescapital.com).

---

## 2. STRATEGI SOLUSI — WYSIWYG EDITOR

### 2.1 Filosofi Pendekatan Baru

> **Prinsip utama:** Komponen section HARUS MURNI PRESENTASI. Semua logika edit dipisahkan ke dalam sistem WYSIWYG panel yang berdiri sendiri.

```
SEBELUM (Inline Edit):
  HeroSection.tsx = JSX tampilan + InlineEditText + handler save + router.refresh
  
SESUDAH (WYSIWYG Panel):
  HeroSection.tsx = JSX tampilan MURNI (tidak ada logika edit sama sekali)
  LandingEditor/ = Sistem WYSIWYG terpisah yang membaca & menulis ke DB
```

### 2.2 Arsitektur Baru — WYSIWYG Editor Panel

```
┌─────────────────────────────────────────────────────┐
│                  LANDING PAGE (public)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Hero    │ │  Pain    │ │ Pricing  │  ...        │
│  │ Section  │ │  Points  │ │ Section  │             │
│  └──────────┘ └──────────┘ └──────────┘            │
│       ↑ hanya render data, tidak tahu edit mode      │
└──────────────────────────┬──────────────────────────┘
                           │
              (Admin login → Edit Mode aktif)
                           │
┌──────────────────────────▼──────────────────────────┐
│              WYSIWYG EDITOR PANEL (admin only)        │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Sidebar Kiri: Section Navigator                │ │
│  │  - List semua section (drag to reorder)         │ │
│  │  - Toggle visibility per section                │ │
│  │  - Klik → buka editor section                  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Panel Kanan: WYSIWYG Content Editor            │ │
│  │  - Tiptap/Quill editor untuk teks panjang       │ │
│  │  - Input field dengan label bahasa manusia      │ │
│  │  - List editor dengan drag-to-reorder           │ │
│  │  - Image uploader visual                        │ │
│  │  - Live Preview di halaman                      │ │
│  │  - Auto-save atau Save button                   │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 3. RENCANA IMPLEMENTASI DETAIL

### FASE 1 — Refactor Struktur Section (Prioritas Tinggi)

#### 3.1.1 Pisah `RemainingSections.tsx` Menjadi File Individual

Setiap section mendapatkan file sendiri:

```
front/components/landing/sections/
  ├── HeroSection.tsx          [MODIFY — hapus semua InlineEditText]
  ├── WelcomeSection.tsx       [MODIFY]
  ├── PainPointsSection.tsx    [MODIFY]
  ├── CurriculumSection.tsx    [MODIFY]
  ├── PricingSection.tsx       [MODIFY]
  ├── TargetAudienceSection.tsx [NEW — dari RemainingSections]
  ├── CommunityValuesSection.tsx [NEW]
  ├── VisionSection.tsx        [NEW]
  ├── FacilitiesSection.tsx    [NEW]
  ├── TestimonialsSection.tsx  [NEW]
  ├── ClosingCtaSection.tsx    [NEW]
  ├── FaqSection.tsx           [NEW]
  └── FooterSection.tsx        [NEW]
```

#### 3.1.2 Konversi Section ke Pure Presentational Component

Setiap section komponen diubah menjadi **murni menerima props dan render UI** — tanpa `useLandingCMS`, tanpa `InlineEditText`, tanpa handler save.

**Contoh sebelum (HeroSection.tsx):**
```tsx
// SEBELUM — tercampur logika edit
export function HeroSection({ id, isVisible, content, packages }) {
  const { isEditMode } = useLandingCMS();
  const handleSave = async (key, value) => { ... router.refresh() };
  
  return (
    <section>
      <InlineEditText
        value={content.badge}
        onSave={(v) => handleSave("badge", v)}
      />
      <h1>
        <InlineEditText value={content.heading1} onSave={...} />
        <InlineEditText value={content.heading2} onSave={...} />
      </h1>
    </section>
  );
}
```

**Contoh sesudah (HeroSection.tsx):**
```tsx
// SESUDAH — murni presentasi
interface HeroSectionProps {
  content: HeroContent;
  packages?: Package[];
  isVisible?: boolean;
}

export function HeroSection({ content, packages = [], isVisible = true }: HeroSectionProps) {
  if (!isVisible) return null;
  
  return (
    <section data-section="hero">
      <span className="badge">{content.badge}</span>
      <h1>
        <span>{content.heading1}</span>
        <span className="gradient-text">{content.heading2}</span>
      </h1>
      {content.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
      {/* ... pure rendering only */}
    </section>
  );
}
```

---

### FASE 2 — Sistem WYSIWYG Editor (Prioritas Tinggi)

#### 3.2.1 Struktur Folder Editor

```
front/components/landing/editor/
  ├── LandingEditorContext.tsx    [NEW] — State management editor
  ├── LandingEditorPanel.tsx     [NEW] — Panel utama WYSIWYG
  ├── SectionNavigator.tsx       [NEW] — Sidebar list section + drag reorder
  ├── SectionEditorForm.tsx      [NEW] — Form editor per section (mengganti SectionEditorPanel lama)
  ├── fields/
  │   ├── WysiwygField.tsx       [NEW] — Tiptap rich text editor
  │   ├── PlainTextField.tsx     [NEW] — Input teks biasa dengan label humanized
  │   ├── ListField.tsx          [NEW] — Editor list dengan drag-to-reorder
  │   ├── CardListField.tsx      [NEW] — Editor list of cards (objek dengan beberapa field)
  │   └── ImageField.tsx         [NEW] — Image uploader dengan preview
  └── AdminFloatingBar.tsx       [MODIFY dari AdminEditBar] — Toggle buka/tutup editor panel
```

#### 3.2.2 Library WYSIWYG yang Dipilih: Tiptap

**Alasan memilih Tiptap:**
- Headless — bisa di-style sepenuhnya dengan Tailwind
- React-native (tidak butuh adapter)
- Ringan dan extensible
- Support formatting: Bold, Italic, Link, List, Heading
- Free untuk fitur dasar yang diperlukan

**Instalasi:**
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

#### 3.2.3 Schema Field per Section

Setiap section memiliki **schema field yang didefinisikan**, bukan digenerate otomatis dari JSON. Ini membuat label lebih human-readable dan tipe field yang tepat:

```typescript
// front/components/landing/editor/section-schemas.ts

export const sectionSchemas: Record<string, FieldSchema[]> = {
  hero: [
    { key: "badge",     label: "Badge Text",       type: "text",     placeholder: "Bukan Sekadar Belajar Ngomong." },
    { key: "heading1",  label: "Judul Baris 1",    type: "text",     placeholder: "Tapi Belajar Gimana Cara" },
    { key: "heading2",  label: "Judul Baris 2 (Aksen)", type: "text", placeholder: "Lo Didengar." },
    { key: "paragraphs",label: "Paragraf Deskripsi", type: "list-text" },
    { key: "benefits",  label: "Daftar Benefit",   type: "list-text" },
    { key: "tagline",   label: "Tagline Bawah",    type: "wysiwyg" },
    { key: "ctaText",   label: "Teks Tombol CTA",  type: "text",     placeholder: "DAFTAR SEKARANG" },
  ],
  
  welcome: [
    { key: "heading",   label: "Judul Section",    type: "text" },
    { key: "subheading",label: "Sub-judul",        type: "wysiwyg" },
    { key: "items",     label: "Daftar Poin",      type: "list-text" },
    { key: "tagline",   label: "Tagline",          type: "wysiwyg" },
  ],
  
  pain_points: [
    { key: "heading",   label: "Judul Section",    type: "text" },
    { key: "cards",     label: "Kartu Pain Points", type: "list-card",
      cardFields: [
        { key: "title",       label: "Judul Kartu" },
        { key: "description", label: "Deskripsi" },
      ]
    },
    { key: "bottomHighlight", label: "Highlight Bawah", type: "wysiwyg" },
  ],
  
  // ... (semua section terdefinisi)
  
  testimonials: [
    { key: "label",    label: "Label Kecil",       type: "text" },
    { key: "heading",  label: "Judul",             type: "text" },
    { key: "items",    label: "Testimoni",         type: "list-card",
      cardFields: [
        { key: "quote",   label: "Kutipan" },
        { key: "name",    label: "Nama" },
        { key: "role",    label: "Peran/Role" },
        { key: "initial", label: "Inisial (Avatar)" },
      ]
    }
  ],
  
  faq: [
    { key: "label",   label: "Label Kecil",        type: "text" },
    { key: "heading", label: "Judul",              type: "text" },
    { key: "items",   label: "Daftar FAQ",         type: "list-card",
      cardFields: [
        { key: "question", label: "Pertanyaan" },
        { key: "answer",   label: "Jawaban" },
      ]
    }
  ],
};
```

#### 3.2.4 Tampilan Panel WYSIWYG

Panel editor menampilkan **form yang teroraganisir** dengan label bahasa Indonesia yang jelas:

```
┌─────────────────────────────────────────────────────┐
│ ✏️ Editor Landing Page            [×] Tutup Panel    │
├──────────────┬──────────────────────────────────────┤
│ NAVIGASI     │  EDIT SECTION: HERO                  │
│ SECTION      │                                      │
│              │  Badge Text                          │
│ ● Hero    ✓  │  ┌────────────────────────────────┐  │
│ ○ Welcome    │  │ Bukan Sekadar Belajar Ngomong. │  │
│ ○ Pain Pts   │  └────────────────────────────────┘  │
│ ○ Curriculum │                                      │
│ ○ Pricing    │  Judul Baris 1                       │
│ ○ Target     │  ┌────────────────────────────────┐  │
│ ○ Values     │  │ Tapi Belajar Gimana Cara       │  │
│ ○ Vision     │  └────────────────────────────────┘  │
│ ○ Facilities │                                      │
│ ○ Testimonial│  Judul Baris 2 (Aksen Warna)        │
│ ○ CTA        │  ┌────────────────────────────────┐  │
│ ○ FAQ        │  │ Lo Didengar.                   │  │
│ ○ Footer     │  └────────────────────────────────┘  │
│              │                                      │
│ [Urutan Section│  Tagline (Rich Text)                │
│  ↕ drag here]│  ┌──[B][I][🔗][•]─────────────────┐ │
│              │  │ Karena hari ini… Kesempatan    │  │
│              │  │ sering datang bukan ke yang    │  │
│              │  │ paling **pintar**. Tapi ke     │  │
│              │  │ mereka yang berani tampil.     │  │
│              │  └────────────────────────────────┘  │
│              │                                      │
│              │  Daftar Benefit  [+ Tambah]          │
│              │  ┌────────────────────────────┐ [🗑] │
│              │  │ Berani bicara di depan orang│     │
│              │  └────────────────────────────┘      │
│              │  ┌────────────────────────────┐ [🗑] │
│              │  │ Bangun personal branding... │     │
│              │  └────────────────────────────┘      │
│              │  [↕ Drag untuk reorder]              │
│              │                                      │
│              │  ────────────────────────────────    │
│              │  Visibilitas Section: [●ON] [○OFF]   │
│              │  ────────────────────────────────    │
│              │                                      │
│              │  [Batal]    [💾 Simpan Perubahan]    │
└──────────────┴──────────────────────────────────────┘
```

#### 3.2.5 Live Preview Mode

Ketika admin sedang edit, landing page di background menampilkan preview real-time dari perubahan yang belum disimpan:

```typescript
// LandingEditorContext.tsx
const [previewContent, setPreviewContent] = useState<Record<string, any>>({});
const [isDirty, setIsDirty] = useState(false);

// Section component membaca dari previewContent jika ada, fallback ke DB content
const effectiveContent = previewContent[sectionId] ?? dbContent;
```

Saat admin mengubah field di panel, `previewContent` di-update → section di-re-render dengan konten baru → admin bisa lihat hasilnya langsung di halaman tanpa save.

---

### FASE 3 — Implementasi Animasi Landing Page

Mengacu pada `docs/landingpage-concept-new.md`, animasi diimplementasikan per section dengan GSAP ScrollTrigger.

#### 3.3.1 Library yang Diinstall

```bash
npm install gsap
# SplitType tidak perlu npm karena ringan, bisa pakai GSAP SplitText atau custom
```

> **Catatan:** GSAP gratis untuk penggunaan tanpa lisensi. SplitText (GSAP plugin) butuh GSAP Club, alternatifnya gunakan library `split-type` (npm) yang open-source.

```bash
npm install split-type
```

#### 3.3.2 Arsitektur Animasi

```
front/lib/animations/
  ├── gsap-init.ts          [NEW] — Setup GSAP + ScrollTrigger + Lenis
  ├── useScrollAnimation.ts [NEW] — Custom hook untuk trigger animasi on scroll
  └── animation-variants.ts [NEW] — Kumpulan preset animasi reusable
```

**Pola implementasi per section:**

```tsx
// Setiap section menggunakan custom hook
export function HeroSection({ content }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  useScrollAnimation(sectionRef, {
    type: 'hero-entrance',
    // GSAP timeline otomatis dijalankan saat section masuk viewport
  });
  
  return (
    <section ref={sectionRef} data-section="hero">
      <span className="hero-badge" data-animate="fade-up">{content.badge}</span>
      <h1 data-animate="word-split">{content.heading1}</h1>
      {/* ... */}
    </section>
  );
}
```

#### 3.3.3 Animasi Per Section (sesuai konsep)

| Section | Animasi Utama | Library/Teknik |
|---------|--------------|----------------|
| **Hero** | Word-by-word reveal headline, Ken Burns parallax bg | GSAP SplitType + ScrollTrigger |
| **Pain Points** | Stagger list fade-in (150ms delay each) | GSAP stagger |
| **Turning Point** | Background wipe dark→light, clip-path highlight teks | CSS clip-path + GSAP |
| **Origin Story** | Line-by-line reveal paragraf, image parallax | SplitType lines + parallax |
| **Performer/Visi** | Letter-by-letter "PERFORMER", spotlight cursor | GSAP + mousemove |
| **Program Cards** | Stagger slide-up cards, count-up "Panggung ke-10" | GSAP stagger + CountUp |
| **Pricing** | Slide-in dari kiri/kanan, MVP glow border | GSAP fromTo |
| **Why Us** | Full-section parallax background foto | ScrollTrigger parallax |
| **Transformation** | Grayscale→color wipe, split screen | CSS filter + clip-path |
| **Final CTA** | Scale-up brand name + spotlight pulse | GSAP scale + CSS radial-gradient |

#### 3.3.4 Smooth Scroll (Lenis)

```tsx
// app/layout.tsx — inisialisasi Lenis global
'use client';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
```

> **Penting:** Lenis hanya diinisialisasi di client component. Gunakan `useEffect` dengan `typeof window !== 'undefined'` check.

#### 3.3.5 Aksesibilitas Animasi

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### FASE 4 — Redesign Visual Landing Page

Mengacu pada `docs/landingpage-concept-new.md`, halaman diubah secara visual dengan:

#### 3.4.1 Design Tokens (globals.css)

```css
:root {
  /* Color Palette */
  --color-primary: #111827;       /* Deep Charcoal */
  --color-accent: #D4A017;        /* Gold */
  --color-accent-red: #bc151b;    /* Brand Red (existing) */
  --color-light: #F5F5F0;         /* Off White */
  --color-muted: #6B7280;         /* Gray */
  
  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

#### 3.4.2 Section Mapping ke Konsep Baru

Berikut mapping section yang **sudah ada** dengan **konsep baru** dari `landingpage-concept-new.md`:

| Section DB (`section_type`) | Konsep Baru | Background | Status |
|-----------------------------|-------------|------------|--------|
| `hero` | Section 1 — Hero | Dark / Full-image | Redesign visual |
| `welcome` → rename? | Section 4 — Origin Story | Warm neutral | Pertimbangkan rename |
| `pain_points` | Section 2 — Pain Points | Dark Charcoal | Redesign |
| `curriculum` | Section 6 — Program (Sesi Panggung dll) | Light/White | Redesign |
| `target_audience` | Section 8 — Why Us | Dark + photo bg | Merge/Redesign |
| `community_values` | Bagian dari Section 8 | Dark | Merge |
| `vision` | Section 9 — Transformation | Split light/dark | Redesign |
| `facilities` | Bagian Section 6 — Program | Light | Merge ke curriculum |
| `testimonials` | (tidak ada di konsep, tetap ada) | Neutral | Keep |
| `pricing` | Section 7 — Pricing | Light + MVP dark | Redesign cards |
| `closing_cta` | Section 10 — Final CTA | Dark + spotlight | Redesign |
| `faq` | (tambahan, keep) | Light | Keep |
| `footer` | Footer | Dark | Redesign |

> **Tambah section baru di DB:**
> - `turning_point` → Section 3 (Kabar Baik)
> - `performer_vision` → Section 5 (Visi Performer / All Star)

---

### FASE 5 — Perbaikan Alur Data & Action

#### 3.5.1 Optimistic Updates (Menghilangkan `router.refresh()` Berulang)

Saat ini setiap `InlineEditText` memanggil `router.refresh()` setelah save. Dengan sistem baru, alur menjadi:

```
Admin edit di panel
       ↓
previewContent di-update (state lokal) → Live preview langsung
       ↓
Admin klik "Simpan"
       ↓
updateLandingSectionAction() dipanggil SEKALI
       ↓
Berhasil → router.refresh() SEKALI + tutup panel
```

#### 3.5.2 Auto-save Draft (Opsional, Fase Lanjut)

```typescript
// Simpan draft ke localStorage setiap 30 detik
useEffect(() => {
  const interval = setInterval(() => {
    if (isDirty) {
      localStorage.setItem(
        `landing-draft-${sectionId}`, 
        JSON.stringify(previewContent[sectionId])
      );
    }
  }, 30000);
  return () => clearInterval(interval);
}, [isDirty, sectionId, previewContent]);
```

---

## 4. STRUKTUR FILE AKHIR (TARGET)

```
front/
├── app/
│   ├── page.tsx                          [MODIFY — hapus semua import InlineEditText]
│   └── layout.tsx                        [MODIFY — tambah Lenis init]
│
├── components/landing/
│   │
│   ├── sections/                         [NEW FOLDER]
│   │   ├── HeroSection.tsx               [REFACTOR — pure presentational]
│   │   ├── WelcomeSection.tsx            [REFACTOR]
│   │   ├── PainPointsSection.tsx         [REFACTOR]
│   │   ├── TurningPointSection.tsx       [NEW SECTION]
│   │   ├── OriginStorySection.tsx        [REFACTOR dari Welcome]
│   │   ├── PerformerVisionSection.tsx    [NEW SECTION]
│   │   ├── CurriculumSection.tsx         [REFACTOR]
│   │   ├── PricingSection.tsx            [REFACTOR]
│   │   ├── WhyUsSection.tsx              [REFACTOR dari TargetAudience+Values]
│   │   ├── TransformationSection.tsx     [REFACTOR dari Vision]
│   │   ├── TestimonialsSection.tsx       [REFACTOR]
│   │   ├── ClosingCtaSection.tsx         [REFACTOR]
│   │   ├── FaqSection.tsx               [REFACTOR]
│   │   └── FooterSection.tsx            [REFACTOR]
│   │
│   ├── editor/                           [NEW FOLDER — sistem WYSIWYG]
│   │   ├── LandingEditorContext.tsx      [NEW]
│   │   ├── LandingEditorPanel.tsx        [NEW — panel utama]
│   │   ├── SectionNavigator.tsx          [NEW — sidebar list]
│   │   ├── SectionEditorForm.tsx         [NEW — form per section]
│   │   ├── section-schemas.ts            [NEW — definisi field per section]
│   │   ├── AdminFloatingBar.tsx          [MODIFY dari AdminEditBar]
│   │   └── fields/
│   │       ├── WysiwygField.tsx          [NEW — Tiptap editor]
│   │       ├── PlainTextField.tsx        [NEW]
│   │       ├── ListTextField.tsx         [NEW — list dengan drag reorder]
│   │       ├── CardListField.tsx         [NEW — list of cards]
│   │       └── ImageField.tsx            [NEW]
│   │
│   └── [DELETE] — file lama yang digantikan:
│       ├── InlineEditText.tsx            [DELETE]
│       ├── InlineImage.tsx               [MERGE ke ImageField.tsx]
│       ├── EditableSection.tsx           [DELETE — tidak diperlukan lagi]
│       ├── SectionEditorPanel.tsx        [DELETE — diganti SectionEditorForm]
│       ├── AdminEditBar.tsx              [DELETE — diganti AdminFloatingBar]
│       ├── LandingCMSContext.tsx         [DELETE — diganti LandingEditorContext]
│       └── RemainingSections.tsx         [DELETE — dipecah ke sections/]
│
├── lib/
│   ├── animations/                       [NEW FOLDER]
│   │   ├── gsap-init.ts                  [NEW]
│   │   ├── useScrollAnimation.ts         [NEW]
│   │   └── animation-variants.ts         [NEW]
│   └── actions/
│       └── landing-actions.ts            [MODIFY — tambah action untuk section baru]
│
└── package.json                          [MODIFY — tambah gsap, split-type, @tiptap/*]
```

---

## 5. DATABASE MIGRATION

### 5.1 Tambah Section Baru

```sql
-- Tambahkan section Turning Point (Section 3 konsep baru)
INSERT INTO landing_sections (section_type, section_order, content)
VALUES (
  'turning_point', 25,
  '{
    "heading": "Kabar Baiknya:",
    "mainText": "Bukan karena kamu gak bisa.",
    "highlightText": "Kamu cuma belum ketemu panggung yang tepat."
  }'
);

-- Tambahkan section Performer Vision (Section 5)
INSERT INTO landing_sections (section_type, section_order, content)
VALUES (
  'performer_vision', 45,
  '{
    "preHeading": "Kami Tidak Sekadar Membuat Member.",
    "heading": "Kami ingin menciptakan Performer.",
    "qualities": [
      "Skill Public Speaking",
      "Cara bicara berkarakter",
      "Mental tampil",
      "Personal Branding kuat",
      "Siap jadi pembicara, MC, presenter, host, kreator, maupun leader"
    ],
    "eventName": "PANGGUNG KREATOR ALL STAR",
    "eventTagline": "Panggung besar tempat performer terbaik bersinar."
  }'
)
ON CONFLICT (section_type) DO NOTHING;
```

### 5.2 Update section_order agar sesuai urutan baru

```sql
UPDATE landing_sections SET section_order = 10 WHERE section_type = 'hero';
UPDATE landing_sections SET section_order = 20 WHERE section_type = 'pain_points';
UPDATE landing_sections SET section_order = 30 WHERE section_type = 'turning_point';
UPDATE landing_sections SET section_order = 40 WHERE section_type = 'welcome'; -- Origin Story
UPDATE landing_sections SET section_order = 50 WHERE section_type = 'performer_vision';
UPDATE landing_sections SET section_order = 60 WHERE section_type = 'curriculum';
UPDATE landing_sections SET section_order = 70 WHERE section_type = 'pricing';
UPDATE landing_sections SET section_order = 80 WHERE section_type = 'target_audience'; -- Why Us
UPDATE landing_sections SET section_order = 90 WHERE section_type = 'vision'; -- Transformation
UPDATE landing_sections SET section_order = 100 WHERE section_type = 'closing_cta';
UPDATE landing_sections SET section_order = 110 WHERE section_type = 'faq';
UPDATE landing_sections SET section_order = 120 WHERE section_type = 'footer';
```

---

## 6. URUTAN PENGERJAAN (Checklist)

### Sprint 1 — Fondasi (1-2 hari)
- [ ] Install dependencies baru: `gsap`, `split-type`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `lenis`
- [ ] Jalankan migrasi SQL di Supabase (tambah section baru, update order)
- [ ] Buat folder `components/landing/sections/` dan `components/landing/editor/`
- [ ] Buat `section-schemas.ts` — definisikan field semua section

### Sprint 2 — Refactor Section Components (2-3 hari)
- [ ] Refactor `HeroSection.tsx` → pure presentational (hapus semua InlineEditText)
- [ ] Refactor `PainPointsSection.tsx`
- [ ] Refactor `WelcomeSection.tsx` → menjadi `OriginStorySection.tsx`
- [ ] Refactor `CurriculumSection.tsx`
- [ ] Refactor `PricingSection.tsx`
- [ ] Pecah `RemainingSections.tsx` → file individual
- [ ] Buat `TurningPointSection.tsx` (section baru)
- [ ] Buat `PerformerVisionSection.tsx` (section baru)
- [ ] Update `app/page.tsx` untuk import dari struktur baru

### Sprint 3 — WYSIWYG Editor (3-4 hari)
- [ ] Buat `LandingEditorContext.tsx` dengan state: `isEditMode`, `activeSectionId`, `previewContent`, `isDirty`
- [ ] Buat `AdminFloatingBar.tsx` — tombol toggle editor
- [ ] Buat `fields/PlainTextField.tsx`
- [ ] Buat `fields/WysiwygField.tsx` dengan Tiptap
- [ ] Buat `fields/ListTextField.tsx` dengan drag reorder (`@hello-pangea/dnd` sudah ada!)
- [ ] Buat `fields/CardListField.tsx`
- [ ] Buat `fields/ImageField.tsx`
- [ ] Buat `SectionEditorForm.tsx` — render field berdasarkan schema
- [ ] Buat `SectionNavigator.tsx` — sidebar list section
- [ ] Buat `LandingEditorPanel.tsx` — panel utama (sidebar kiri + form kanan)
- [ ] Integrasi live preview (previewContent → section re-render)
- [ ] Hapus file lama: `InlineEditText`, `EditableSection`, `SectionEditorPanel`, `AdminEditBar`, `LandingCMSContext`, `RemainingSections`

### Sprint 4 — Animasi (2-3 hari)
- [ ] Setup Lenis smooth scroll di `layout.tsx`
- [ ] Buat `lib/animations/gsap-init.ts`
- [ ] Buat `lib/animations/useScrollAnimation.ts`
- [ ] Implementasi animasi Hero (word split + parallax bg)
- [ ] Implementasi animasi Pain Points (stagger list)
- [ ] Implementasi animasi Turning Point (bg wipe)
- [ ] Implementasi animasi Curriculum Cards (stagger slide-up)
- [ ] Implementasi animasi Pricing (slide-in dual card)
- [ ] Implementasi animasi Transformation (grayscale wipe)
- [ ] Implementasi animasi Final CTA (scale-up + spotlight)
- [ ] Tambahkan `prefers-reduced-motion` media query

### Sprint 5 — Design Refresh (2-3 hari)
- [ ] Import Google Fonts: Playfair Display + Plus Jakarta Sans
- [ ] Update `globals.css` dengan design tokens baru
- [ ] Redesign Hero Section (dark + full image bg)
- [ ] Redesign Pricing Section (dual card Regular vs MVP gold)
- [ ] Redesign Final CTA (spotlight + particle)
- [ ] Pastikan semua section responsive (mobile-first)
- [ ] Dark/Light mode check

---

## 7. CATATAN PENTING UNTUK DEVELOPER

> **WYSIWYG bukan berarti edit langsung di halaman.** Pendekatan ini memisahkan concern:
> - Halaman = hanya tampilkan data
> - Panel editor = tempat mengedit data
>
> Programmer yang mengerjakan desain section **tidak perlu memikirkan logika edit** sama sekali — cukup fokus pada JSX dan CSS. Logika edit terpusat di folder `editor/`.

> **Menambah field baru ke section** cukup dengan:
> 1. Tambah key ke `section-schemas.ts`
> 2. Pastikan section component membaca key tersebut dari `content` props
> 3. Tidak perlu modifikasi komponen editor sama sekali — form akan muncul otomatis

> **`@hello-pangea/dnd`** sudah terinstall di project (digunakan di admin). Gunakan untuk drag-to-reorder pada `ListTextField.tsx` dan `SectionNavigator.tsx`.

> **Animasi dan Edit Mode tidak boleh konflik.** Saat edit panel terbuka, animasi scroll sebaiknya di-pause atau di-disable sementara agar tidak mengganggu pengalaman editing admin.

---

## 8. REFERENSI

- [landingpage-concept-new.md](./landingpage-concept-new.md) — Konsep section, copywriter, dan animasi
- [tresmarescapital.com/en](https://www.tresmarescapital.com/en/) — Referensi visual & animasi
- [Tiptap Docs](https://tiptap.dev/docs) — WYSIWYG editor
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Scroll animation
- [Lenis](https://github.com/darkroomengineering/lenis) — Smooth scroll
- [split-type](https://github.com/lukePeavey/SplitType) — Text splitting untuk animasi
