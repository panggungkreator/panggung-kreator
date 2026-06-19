# PANGGUNG KREATOR — LANDING PAGE CONCEPT
> Dokumen ini adalah pemetaan terstruktur dari copywriter landing page Panggung Kreator, dilengkapi dengan arahan section, animasi, dan referensi visual untuk developer.
> Referensi gaya: [tresmarescapital.com/en](https://www.tresmarescapital.com/en/) — elegan, parallax smooth, tipografi kuat, transisi cinematic.

---

## DESIGN SYSTEM (Global Reference)

```
Tone          : Inspiring, Confident, Warm
Color Palette :
  - Primary   : Deep Navy / Charcoal (#1A1A2E atau #111827)
  - Accent    : Gold / Amber (#D4A017 atau #F59E0B) — mewakili "panggung"
  - Light     : Off-White (#F5F5F0)
  - Text      : Dark (#1C1C1C)

Typography    :
  - Heading   : "Playfair Display" atau "DM Serif Display" (serif elegan)
  - Body      : "Inter" atau "Plus Jakarta Sans" (clean, readable)

Animasi Global:
  - Smooth scroll dengan "lenis.js" atau "locomotive-scroll"
  - Entrance animation: Fade-up + stagger per elemen (GSAP ScrollTrigger)
  - Cursor custom (opsional): Dot cursor mengikuti mouse
  - Page transition: Cinematic curtain/wipe (seperti Tres Mares)
```

---

---

# SECTION 1 — HERO (Above The Fold)

## Copywriter

> **"Komunitas Public Speaking Paling Supportif untuk Kamu Yang Ingin Bertumbuh Lewat Skill Bicara"**

### Sub-headline
> Belajar Public Speaking dan Personal Branding untuk Ciptakan Panggung Pertamamu

### CTA
> **[ Gabung Jadi Member Baru ]**

---

## Layout & Visual

- **Layout**: Full-viewport height (100vh), background gelap/charcoal
- **Visual**: Hero image / video loop komunitas (panggung, tampil, ekspresi percaya diri)
- **Foreground**: Teks hero besar di tengah-kiri layar, CTA di bawah

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Headline | Kata-per-kata muncul satu per satu (word split + stagger, GSAP) |
| Sub-headline | Fade-in up setelah headline selesai |
| CTA Button | Scale-in + subtle glow pulse |
| Background Image/Video | Slow Ken Burns zoom atau parallax depth effect |
| Scroll Indicator | Bouncing arrow / rotating text "SCROLL DOWN" |

## 💡 Referensi Dev

- Library: `GSAP` + `SplitType` untuk word-by-word animation
- Parallax: `CSS transform: translateY()` dikontrol JS scroll event atau `ScrollTrigger`
- Loader awal (opsional): Number counter / logo reveal sebelum hero muncul (seperti Tres Mares)

---

---

# SECTION 2 — PAIN POINTS (Identifikasi Masalah)

## Copywriter

> **"Banyak Orang Punya Potensi… Tapi Terjebak Di Sini:"**

- Gugup kalau disuruh bicara depan orang
- Ide bagus tapi bingung menyampaikannya
- Kurang percaya diri tampil
- Bingung cara bangun personal branding
- Mau berkembang, tapi gak punya circle suportif

---

## Layout & Visual

- **Layout**: Split-screen atau full-width dark section dengan daftar pain point
- **Visual**: Ilustrasi atau foto seseorang yang terlihat ragu-ragu / bingung
- **Style**: Dark background (charcoal), teks besar, list dengan ikon atau nomor

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Headline | Fade-in dari atas saat section masuk viewport |
| Setiap Pain Point | Stagger fade-in ke bawah satu per satu (interval 150ms) |
| Background | Subtle parallax — gambar bergerak lebih lambat dari scroll |
| Ikon/bullet | Micro-animation: shake atau pulse saat pertama muncul |

## 💡 Referensi Dev

- `IntersectionObserver` API atau `ScrollTrigger.batch()` untuk stagger list
- Background parallax: `background-attachment: fixed` (CSS) atau JS-based untuk performa lebih baik
- Efek dramatic: Teks muncul seperti "diketik" satu per satu (typewriter, opsional)

---

---

# SECTION 3 — KABAR BAIK (Turning Point)

## Copywriter

> **"Kabar Baiknya:"**
>
> Bukan karena kamu gak bisa.
>
> **Kamu cuma belum ketemu panggung yang tepat.**

---

## Layout & Visual

- **Layout**: Centered, minimal, bold typography — satu pesan dominan
- **Visual**: Background kontras (bisa terang setelah dark — visual "cahaya") atau gradient reveal
- **Style**: Teks besar, bold, dengan accent color pada kata kunci "panggung yang tepat"

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Section Entrance | Smooth color transition dari dark ke light (background wipe) |
| "Bukan karena kamu gak bisa" | Fade-in, lalu slight blur-to-clear |
| Kata kunci bold | Highlight color sweep dari kiri ke kanan (clip-path animation) |
| Background | Radial gradient pulse / glow subtle di belakang teks |

## 💡 Referensi Dev

- `clip-path` animation untuk text highlight sweep
- CSS `@keyframes` dengan `background-clip: text` untuk efek gradient teks
- Transisi warna section: `background-color` transition dikontrol ScrollTrigger

---

---

# SECTION 4 — ORIGIN STORY (Tentang Komunitas)

## Copywriter

> **"Kita Mulai dari Titik yang Sama:"**
>
> Panggung Kreator lahir dari tongkrongan sederhana.
>
> Ngumpul bareng. Latihan ngomong bareng. Belajar bareng.
>
> Dari panggung kecil-kecilan… sampai sekarang berhasil bikin panggung sungguhan.
>
> Karena kami tahu: **Semua orang bisa berkembang, asal ada tempat bertumbuh yang benar.**

---

## Layout & Visual

- **Layout**: Horizontal timeline atau storytelling scroll (teks di satu sisi, gambar di sisi lain, bergantian)
- **Visual**: Foto dokumentasi komunitas — suasana kasual, latihan bareng, momen seru
- **Style**: Warm tone, personal, organic (bukan terlalu korporat)

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Headline | Fade-in up |
| Paragraf narasi | Line-by-line reveal saat scroll (setiap baris muncul bergilir) |
| Foto komunitas | Parallax depth — foto bergerak lebih lambat dari teks saat scroll |
| Timeline (jika ada) | Draw/trace animasi garis dari kiri ke kanan |
| Quote akhir | Scale-in + bold emphasis animation |

## 💡 Referensi Dev

- Horizontal scroll section (opsional): `ScrollTrigger` pin + horizontal movement
- Image parallax: CSS `transform: translateY()` dikontrol scroll position
- Line-by-line text: `SplitType` (lines) + stagger ScrollTrigger

---

---

# SECTION 5 — VISI / MISI (Kami Menciptakan Performer)

## Copywriter

> **"Kami Tidak Sekadar Membuat Member."**
>
> Kami ingin menciptakan **Performer.**
>
> Orang-orang yang punya:
> - Skill Public Speaking
> - Cara bicara berkarakter
> - Mental tampil
> - Personal Branding kuat
> - Siap jadi pembicara, MC, presenter, host, kreator, maupun leader
>
> Dan suatu hari… Mereka akan berdiri di acara utama kami:
>
> ## **PANGGUNG KREATOR ALL STAR**
> *Panggung besar tempat performer terbaik bersinar.*

---

## Layout & Visual

- **Layout**: Dua bagian — kiri narasi/manifesto, kanan daftar kualitas + image panggung
- **Visual**: Gambar panggung megah / spotlight / performer tampil percaya diri
- **Style**: Dark, dramatic, accent gold — nuansa "grand stage"

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| "Performer" heading | Typewriter effect atau letter-by-letter reveal |
| Daftar kualitas | Stagger fade-in dengan ikon muncul lebih dulu lalu teks |
| Gambar panggung | Parallax + subtle vignette hover effect |
| "PANGGUNG KREATOR ALL STAR" | Scale-up reveal + glow/shimmer pada teks |
| Spotlight effect | CSS radial gradient animasi mengikuti cursor (hover) |

## 💡 Referensi Dev

- Spotlight cursor: `mousemove` event → update CSS `--x` `--y` custom property → `radial-gradient`
- Letter stagger: GSAP `stagger` pada `SplitType` chars
- Card hover: `transform: translateY(-8px)` + `box-shadow` transition

---

---

# SECTION 6 — PROGRAM / BENEFIT (Jalan Bertumbuh)

## Copywriter

> **"Jalan Bertumbuhmu Sudah Kami Siapkan"**

### 🎤 Program 1 — Sesi Panggung
> Kelas mentoring intensif dengan tema spesifik.
>
> Mulai dari: Public Speaking Fundamental, Voice Over, MC, Siaran, Presentasi, Storytelling, Personal Branding
>
> *Sudah berjalan dari Panggung Kesatu hingga Panggung Kesepuluh. Setiap sesi dirancang bertahap dan terstruktur.*

### 🚀 Program 2 — Level Up Session
> Mentoring kelompok bersama mentor melalui sistem **Mentoring Carousel**.
>
> Kamu akan belajar langsung dari beberapa mentor secara bergilir.
>
> *Lebih fokus. Lebih personal. Lebih cepat berkembang.*

### 🎙️ Program 3 — Open Mic Teman Sepanggung
> Mini stage untuk member tampil dan bercerita.
>
> Tentang impian. Perjuangan. Pengalaman hidup.
>
> *Tempat melatih keberanian, rasa percaya diri, dan koneksi emosional dengan audiens.*

---

## Layout & Visual

- **Layout**: Card-based 3 kolom (desktop) / vertical stack (mobile)
- **Visual**: Ikon besar + foto program per card
- **Style**: Light section setelah dark, clean & breathable spacing

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Section Heading | Fade-in up |
| 3 Cards | Stagger slide-up dari bawah (150ms delay each) |
| Card Hover | Lift up + subtle shadow + accent border-left reveal |
| Ikon Program | Bounce-in atau draw (SVG stroke animation) |
| Foto di dalam card | Parallax scroll ringan dalam card |
| Progress indicator | Counter animasi (e.g., "Panggung ke-10") — number count-up |

## 💡 Referensi Dev

- Card hover: `translateY(-10px)` + `box-shadow` CSS transition
- Number count-up: GSAP `gsap.to({ val: 0 }, { val: 10, ... })` atau `CountUp.js`
- SVG icon animation: `stroke-dasharray` + `stroke-dashoffset` animasi

---

---

# SECTION 7 — PRICING (Pilihan Membership)

## Copywriter

> **"Pilih Cara Bertumbuh yang Sesuai Dengan Targetmu"**
>
> Baik kamu yang baru ingin memulai maupun yang ingin berkembang lebih cepat, kami sudah menyiapkan jalurnya.

---

### 🎟 MEMBER REGULAR — Rp49.000

> Cocok untuk kamu yang ingin mulai belajar, mengenal komunitas, dan bertumbuh bersama performer lainnya.

**Benefit:**
- ✅ Bergabung ke Komunitas Panggung Kreator
- ✅ Akses mengikuti program komunitas
- ✅ E-book *Public Speaking ala Kreator Edukasi*
- ✅ Networking dengan sesama member
- ✅ Kesempatan mengikuti Open Mic Teman Sepanggung
- ✅ Mendapatkan informasi kegiatan dan event komunitas

**CTA:** `[ Saya Mau Jadi Member Regular ]`

---

### 👑 MVP (MOST VALUABLE PERFORMER) — Rp249.000

> Untuk kamu yang ingin berkembang lebih cepat dengan pendampingan yang lebih personal.

**Benefit:**
- ✅ Semua benefit Member Regular
- ✅ Private Class 1 on 1 via Zoom Meeting
- ✅ Dibimbing langsung oleh mentor
- ✅ Sesi konsultasi personal sesuai kebutuhan
- ✅ Feedback dan evaluasi kemampuan public speaking
- ✅ Arahan pengembangan personal branding
- ✅ Prioritas pendampingan dalam perjalanan belajarmu

**CTA:** `[ Saya Mau Jadi MVP ]`

---

## Layout & Visual

- **Layout**: Side-by-side 2 pricing card — Regular (clean/light) vs MVP (premium/dark+gold)
- **Visual**: MVP card lebih menonjol — border gold, badge "Most Popular" atau crown icon
- **Style**: Kontras jelas antara dua tier, MVP terasa "premium"

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Section Heading | Fade-in up |
| Pricing Cards | Slide-in dari kiri (Regular) dan kanan (MVP) bersamaan |
| MVP Card | Slight scale lebih besar (1.03x) + glow border pada hover |
| Benefit List | Stagger fade-in tiap item dari atas ke bawah |
| CTA Button | Pulse glow animation + hover scale |
| Harga | Number roll/flip animation saat masuk viewport |

## 💡 Referensi Dev

- Card scale: `transform: scale(1.03)` pada MVP secara default (CSS)
- Border glow: `box-shadow: 0 0 20px rgba(212, 160, 23, 0.5)` untuk gold glow
- Shimmer efek pada gold badge: CSS `@keyframes shimmer` dengan `background-position` animation

---

---

# SECTION 8 — WHY US (Kenapa Panggung Kreator)

## Copywriter

> **"Kenapa Bergabung di Panggung Kreator?"**
>
> Karena belajar public speaking tidak cukup hanya menonton video.
>
> Kamu perlu:
> - 🎤 Tempat untuk latihan
> - 🤝 Lingkungan yang suportif
> - 📈 Mentor yang bisa memberikan arahan
> - 🚀 Kesempatan untuk tampil secara langsung
>
> Di sinilah Panggung Kreator hadir.
>
> Bukan hanya mengajarkan teori, tetapi memberikan panggung untuk bertumbuh.

---

## Layout & Visual

- **Layout**: Icon + teks 2x2 grid (desktop) / 1 kolom (mobile), latar gelap
- **Visual**: Background foto komunitas dengan overlay dark — nuansa hangat tapi dramatic
- **Style**: Ikon besar, teks bold per item, closing statement center-aligned bold

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Background | Full-section parallax (gambar bergerak saat scroll) |
| Headline | Fade-in |
| 4 Item grid | Stagger fade-in + slide-up |
| Ikon | Bounce-in lalu settle |
| Closing statement | Scale-in + bold underline draw (SVG line) |

## 💡 Referensi Dev

- Full-section parallax bg: `background-attachment: fixed` atau `ScrollTrigger` + `translateY`
- SVG underline draw: `stroke-dasharray` / `stroke-dashoffset` animasi on scroll

---

---

# SECTION 9 — TRANSFORMATION (Before → After)

## Copywriter

> **"Bayangin 3 Bulan Dari Sekarang..."**

**Dulu:**
- Takut bicara
- Minder tampil
- Bingung mulai dari mana

**Sekarang:**
- Berani ngomong depan orang
- Punya gaya bicara sendiri
- Dikenal orang
- Punya circle berkembang
- Siap tampil di panggung besar

---

## Layout & Visual

- **Layout**: Split horizontal — "Dulu" (kiri, muted/grayscale) vs "Sekarang" (kanan, vibrant/color)
- **Visual**: Foto before/after atau ilustrasi perubahan karakter (grayscale → warna)
- **Style**: Kontras warna kuat, "Sekarang" terasa lebih hidup dan bersemangat

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Headline | Zoom-in soft |
| "Dulu" list | Slide-in dari kiri, grayscale, slight opacity rendah |
| "Sekarang" list | Slide-in dari kanan, warna penuh, lebih terang |
| Divider tengah | Garis vertikal draw dari atas ke bawah |
| Transisi antar state | Color wipe dari kiri ke kanan (clip-path) — grayscale ke warna |
| Background | Slow color gradient shift saat scroll |

## 💡 Referensi Dev

- Grayscale: `filter: grayscale(100%)` → `grayscale(0%)` dengan transition
- `clip-path: polygon(0 0, X% 0, X% 100%, 0 100%)` animasi untuk wipe effect
- Stagger list: GSAP ScrollTrigger batch

---

---

# SECTION 10 — CLOSING / FINAL CTA (Penutup & Call To Action)

## Copywriter

> **"Semua Performer Hebat Pernah Memulai Dari Panggung Kecil."**
>
> Hari ini mungkin kamu masih belajar berbicara.
>
> Besok, bisa jadi kamu yang berdiri di depan panggung, membawakan acara, menjadi pembicara, atau menginspirasi banyak orang.
>
> ### Bergabunglah Bersama
> # **Panggung Kreator**
>
> **Mulai perjalananmu hari ini.**
>
> `[ Gabung Member Regular Rp49.000 ]`
>
> `[ Jadi MVP Rp249.000 ]`

---

## Layout & Visual

- **Layout**: Full-viewport centered — dramatic closing statement
- **Visual**: Background gelap dengan elemen spotlight / bokeh / panggung samar di background
- **Style**: Monumental, cinematic, teks besar — rasa "grand finale"

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Background | Spotlight radial gradient animasi (slow pulse) |
| Quote opening | Letter reveal dari tengah keluar (scale + opacity) |
| Paragraf narasi | Fade-in line by line |
| "Panggung Kreator" nama | Dramatic scale-up dari kecil ke besar + glow |
| CTA Buttons | Stagger slide-up, button pertama lalu kedua |
| CTA Hover | Gold shimmer sweep dari kiri ke kanan |
| Particle effect (opsional) | Confetti ringan atau light particle floating |

## 💡 Referensi Dev

- `tsParticles` untuk partikel ringan
- CTA shimmer: CSS `::after` pseudo + `background: linear-gradient` + `translateX` animation
- Nama brand besar: GSAP `scale: 0.5 → 1` + `opacity: 0 → 1` dengan ease "power4.out"

---

---

# BONUS SECTION — NAVBAR / HEADER

## Elemen
> - Logo: **Panggung Kreator**
> - Menu: Tentang · Program · Harga · Gabung

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Navbar awal | Transparent di hero, dark on scroll (setelah 100px) |
| Logo | Fade-in dari atas saat halaman load |
| Menu items | Stagger fade-in dari kanan |
| CTA Navbar | Pulse highlight |
| Mobile menu | Fullscreen overlay slide dengan stagger item |

## 💡 Referensi Dev

- `scroll` event listener: `window.scrollY > 100` → tambah class `.scrolled` → ubah bg
- Hamburger → X animasi: CSS `transform` pada bar-bar ikon
- Mobile nav: `clip-path: circle(0% at 95% 5%)` → `circle(150% at 95% 5%)` transition

---

---

# BONUS SECTION — FOOTER

## Elemen
> - Logo Panggung Kreator
> - Tagline singkat
> - Link: Tentang · Program · Harga · Kontak
> - Sosial Media
> - Copyright

## 🎬 Animasi

| Elemen | Animasi |
|--------|---------|
| Footer reveal | Fade-in up saat section footer masuk viewport |
| Sosial media ikon | Stagger bounce-in |
| Hover link | Underline slide dari kiri ke kanan |

---

---

# RINGKASAN URUTAN SECTION

| # | Section | Tone | Background |
|---|---------|------|------------|
| 0 | Navbar / Header | Clean, Transparan | Transparent → Dark |
| 1 | Hero | Bold, Impactful | Dark / Full-image |
| 2 | Pain Points | Empathetic, Dark | Dark Charcoal |
| 3 | Turning Point | Hopeful, Light | Light / Gradient reveal |
| 4 | Origin Story | Warm, Personal | Warm neutral |
| 5 | Visi / Performer | Aspirational, Dramatic | Dark + Gold accent |
| 6 | Program | Clear, Informative | Light / White |
| 7 | Pricing | Confident, Premium | Light + MVP Dark card |
| 8 | Why Us | Reassuring, Warm | Dark + photo bg |
| 9 | Transformation | Motivational, Contrast | Split light/dark |
| 10 | Final CTA | Epic, Cinematic | Dark + spotlight |
| — | Footer | Clean | Dark |

---

# STACK & LIBRARY REKOMENDASI

| Kebutuhan | Library |
|-----------|---------|
| Smooth scroll | `Lenis.js` |
| Scroll animation | `GSAP` + `ScrollTrigger` |
| Text animation | `SplitType.js` |
| Parallax ringan | CSS `translate` + JS atau `ScrollTrigger` |
| Particle effect | `tsParticles` |
| Number count-up | `CountUp.js` |
| Page transition | `Taxi.js` atau GSAP timeline |
| Cursor custom | Custom JS + CSS |

---

> **Catatan Developer:**
> Setiap section sebaiknya dibungkus dalam `<section id="section-name">` agar navigasi anchor berfungsi.
> Gunakan `IntersectionObserver` atau `ScrollTrigger` untuk trigger animasi — jangan auto-play semua sekaligus.
> Mobile-first: pastikan semua animasi berat dinonaktifkan / disederhanakan di mobile (`prefers-reduced-motion`).
