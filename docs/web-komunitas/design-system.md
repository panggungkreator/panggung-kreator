# Design System: Panggung Kreator (Web Komunitas)
**Project ID:** panggung-kreator-web-01
**Aesthetic Style:** Bold Monochrome Grid-Based Editorial Architecture (Stark, High-Contrast, Structured)

---

## 1. Visual Theme & Atmosphere
Desain mengusung konsep **"Stark Monochrome Grid-Based Editorial"** yang menggabungkan struktur kaku arsitektur modern dengan tipografi majalah fashion avant-garde. Karakteristik utamanya adalah:
- **Rigid Grid Divisions:** Setiap halaman dibagi oleh grid kolom yang sangat terstruktur dengan garis pembatas (border) hitam-putih yang tebal dan eksplisit. Tidak ada kontainer mengambang bebas.
- **Flat & High-Contrast:** Tidak ada bayangan (*drop shadows*), tidak ada gradasi warna halus, dan tidak ada warna aksen pastel. Hirarki visual dicapai secara mutlak melalui ukuran tipografi raksasa dan kontras murni hitam-putih.
- **Sharp Corners (No Rounded Corners):** Seluruh elemen visual memiliki sudut siku tajam bersudut 90 derajat (`rounded-none`). Tidak ada bentuk kapsul atau oval pada tombol maupun kartu.
- **Serif Contrast Accents:** Untuk melembutkan grid yang kaku, kata-kata kunci tertentu dalam headline ditulis dalam huruf kecil miring (*lowercase italic*) dengan font Serif klasik, menciptakan kontras organik yang elegan terhadap font Sans-serif raksasa yang serba kaku.

---

## 2. Color Palette & Roles

Sistem monokromatik murni untuk menjamin konsistensi visual di seluruh komponen:

| Warna | Kode Hex | Peran Visual |
|---|---|---|
| **Pure White** | `#FFFFFF` | Latar belakang utama halaman (Light Mode), warna teks utama (Dark Mode), warna tombol sekunder. |
| **Stark Black** | `#2c2c2c` | Latar belakang utama (Dark Mode), warna teks utama (Light Mode), warna tombol utama, warna border pemisah grid. |
| **Muted Charcoal** | `#666666` | Teks keterangan minor, detail metadata, warna border sekunder saat non-aktif. |
| **Light/Dark Gray** | Tailwind `neutral-100` / `900` | Latar belakang placeholder gambar dan area visual sekunder. |

---

## 3. Typography Rules

Kombinasi tegas antara font **Sans-Serif Bold** (modern, industri, kaku) dan **Serif Italic** (klasik, luwes, manusiawi):

* **Giant Headlines (Hero, Section Title, Closing CTA):** Menggunakan font Sans-serif (seperti Inter atau System Sans) ultra-bold/black.
  - Aturan: Ukuran raksasa menggunakan fluid typography (`text-[clamp(2.25rem,6vw,5.5rem)]`), line-height sangat sempit (`leading-[0.85]`), huruf besar semua (*uppercase*), jarak antar-huruf rapat (*tracking-tighter*).
* **Serif Accents in Headlines:** Beberapa kata pilihan (misalnya: *panggung*, *terbaik*, *hari*) dibungkus dalam tag span dengan font Serif bergaya *lowercase italic* (`font-serif italic font-normal text-neutral-500 lowercase`).
* **Section Labels & Micro-copy:** Menggunakan font Sans-serif bold.
  - Aturan: Huruf besar semua (*uppercase*), jarak antar-huruf sangat renggang (`tracking-[0.25em]`), ukuran sangat kecil (`text-[9px]` hingga `text-xs`). Dibungkus tanda kurung siku (contoh: `[ VISUAL PORTFOLIO ]`).
* **Body Text & Descriptions:** Menggunakan font Sans-serif medium.
  - Aturan: Ukuran `text-xs` hingga `text-sm`, jarak antar-huruf renggang, huruf besar semua untuk deskripsi kartu program dan pilar guna memperkuat getaran editorial koran/majalah. Line-height lega (`leading-relaxed`).

---

## 4. Grid, Borders & Layout System

Struktur pembagian halaman dibangun dengan aturan tata letak yang kaku:
- **Border Divisions:** Garis border vertikal dan horizontal setebal 1px berwarna hitam `#2c2c2c` (atau putih murni dalam Dark Mode) memisahkan setiap section dan kolom secara eksplisit.
- **Responsive Layout Collapsing:**
  - **Grid 4 Kolom (Pilar, Journey):** Berubah menjadi kolom tumpuk (*stacked*) pada mobile. Setiap kartu dibatasi oleh border bawah murni.
  - **Grid 2 Kolom (Story):** Berubah menjadi kolom tumpuk. Garis pemisah tengah vertikal berubah menjadi garis horizontal pada mobile.
  - **Grid 2x2 (Galeri):** Berubah menjadi kolom tumpuk 1 kolom pada mobile, dengan border horizontal memisahkan tiap foto kegiatan.
- **Border Styling:** Menggunakan warna border solid `#2c2c2c` (light mode) dan `#FFFFFF` (dark mode) dengan opacity penuh untuk garis pemisah utama, dan opacity 10-20% untuk garis ornamen sekunder.

---

## 5. Animation Specifications (GSAP + ScrollTrigger + Lenis)

Animasi diimplementasikan melalui utility hook `useScrollAnimations.ts` yang berintegrasi dengan pendaftaran global GSAP di `SmoothScroll.tsx`:

1. **Text Reveal (Split Character):**
   - Karakter dalam kata dipecah menjadi spans individu di dalam wadah ber-overflow tersembunyi (`overflow-hidden`).
   - Karakter bergeser dari `translate-y-[110%]` ke `0%` dengan efek stagger `0.02s` per huruf, menciptakan efek teks yang muncul dari bawah secara cinematic.
2. **Parallax Scroll (Image Placeholders):**
   - Elemen gambar/visual di dalam container ber-overflow tersembunyi diberikan dimensi tinggi `120%` dengan posisi awal `-10%`.
   - GSAP ScrollTrigger menggerakkan posisi `yPercent` dari `-15%` ke `15%` secara linier mengikuti laju gulir scroll (`scrub: true`).
3. **Fade Up:**
   - Elemen bertransisi dari `opacity: 0` dan `y: 40px` ke `opacity: 1` dan `y: 0` saat memasuki 85% tinggi viewport. Menggunakan kurva perlambatan cinematic (`ease: "power3.out"`).
4. **Counter-Up (Statistik):**
   - Angka statistik memutar nilai dari `0` ke target (misalnya: `350`, `52`, `95`) dalam durasi `2 detik` dengan kurva perlambatan `power2.out` tepat ketika bar statistik terlihat di layar.
5. **Infinite Marquee (Typography Ribbon):**
   - Ticker teks horizontal murni menggunakan animasi CSS `@keyframes marquee-loop` yang menggeser `translateX(0)` ke `translateX(-33.33%)` secara terus-menerus.