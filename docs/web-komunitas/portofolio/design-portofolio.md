# Prompt UI Stitch: Halaman "Talent Kami" (Public Portfolio Showcase)

*Copy dan paste seluruh teks di bawah ini ke dalam Google Stitch (atau AI UI Generator lainnya) untuk melihat pratinjau langsung antarmuka halaman Talent Kami.*

---

**Role & Context:**
Kamu adalah seorang Frontend Engineer dan UI/UX Expert. Buatlah halaman "Talent Kami" (Public Portfolio Showcase) menggunakan React, Tailwind CSS, dan Lucide React Icons. Halaman ini berfungsi sebagai etalase publik yang menampilkan profil dan portofolio para kreator (members).

**Aesthetic Style & Design System:**
Gunakan gaya **"Bold Monochrome Grid-Based Editorial Architecture"** (Stark, High-Contrast, Structured) dengan aturan ketat berikut:
1. **Rigid Grid Divisions:** Halaman dibagi oleh grid kolom yang sangat terstruktur dengan garis pembatas (border) 1px solid warna hitam (`border-black`) di Light Mode, atau putih murni di Dark Mode. Tidak ada elemen atau kontainer yang mengambang bebas tanpa batas.
2. **Flat & High-Contrast:** Sama sekali TIDAK ADA bayangan (no drop shadows), tidak ada gradasi, tidak ada warna pastel. Gunakan hanya warna Hitam murni (`#000` / `#2c2c2c`), Putih murni (`#FFF`), dan Abu-abu netral (`neutral-500`) untuk teks keterangan minor.
3. **Sharp Corners:** Seluruh elemen visual memiliki sudut siku tajam 90 derajat (`rounded-none`). Tidak ada border-radius pada tombol, kartu, atau input.
4. **Typography Contrast:** 
   - **Giant Headlines:** Gunakan font Sans-serif (seperti Inter) dengan ketebalan ultra-bold/black, huruf besar semua (`uppercase`), jarak antar-huruf rapat (`tracking-tighter`), dan ukuran raksasa (`text-5xl` atau `text-7xl`).
   - **Serif Accents:** Gunakan font Serif klasik bergaya *lowercase italic* (`font-serif italic font-normal text-neutral-500 lowercase`) untuk melembutkan grid yang kaku pada kata-kata kunci tertentu.
   - **Micro-copy & Labels:** Huruf besar semua, font Sans-serif, ukuran kecil (`text-[10px]` atau `text-xs`), dan jarak antar-huruf sangat renggang (`tracking-[0.25em]`). Selalu bungkus label section dengan kurung siku (contoh: `[ CARI KREATOR ]`).

**Struktur Halaman (Page Layout):**

1. **Top Header Section (Editorial Header):**
   - Berikan border tebal di bawah (`border-b-2 border-black`).
   - Headline raksasa: "ETALASE <span class='font-serif italic text-neutral-500 lowercase'>karya</span> KAMI".
   - Sub-headline kecil di sebelahnya: `[ DIREKTORI TALENTA PANGGUNG KREATOR - 2026 ]`.

2. **Search & Filter Bar (Grid Bersebelahan):**
   - Terdiri dari 1 baris (row) yang dibagi menjadi beberapa kolom dengan border vertikal (`border-r border-black`).
   - **Kolom 1 (Search):** Input teks border-none, outline-none dengan placeholder "Cari nama atau bio...". Dilengkapi ikon `Search` dari Lucide.
   - **Kolom 2 (Filter Pilar):** Dropdown (Select) bergaya flat untuk memilih pilar keahlian (Public Speaking, Content Creation, dll).
   - **Kolom 3 (Filter Tier):** Dropdown (Select) untuk memilih tier (Priority, Regular).
   - Seluruh bar dibungkus border atas dan bawah yang tegas.

3. **Talent Grid (Direktori):**
   - Layout grid 3 kolom (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
   - Tanpa gap standar, melainkan menggunakan border di setiap sisi kartu agar terlihat menyatu bagai tabel cetak koran.
   - **Talent Card Design:**
     - Border tegas di sekelilingnya (`border border-black`).
     - **Bagian Visual:** Foto profil persegi besar atau placeholder warna `bg-neutral-200` beraksen kotak (bukan lingkaran!).
     - **Bagian Info (Padding tegas `p-4` atau `p-5`):**
       - Nama Stage / Nama Kreator: Sans-serif tebal, uppercase, `text-xl`.
       - Profesi (Occupation): Serif Italic abu-abu di bawah nama (`text-sm`).
       - Garis pemisah horizontal (`border-t border-black my-3`).
       - Bio ringkas (Maksimal 2 baris, font medium, uppercase).
       - Tags Keahlian: Kotak-kotak kecil dengan border hitam, teks micro-copy `text-[9px] tracking-wider uppercase`.
     - **Call to Action (Footer Kartu):** Tombol lebar penuh (`w-full`) di bagian bawah kartu dengan teks `[ LIHAT PROFIL LENGKAP ]`, background transparan, hover hitam, border atas hitam.

4. **Pagination (Bawah):**
   - Tombol "SEBELUMNYA" dan "SELANJUTNYA" bergaris tegas, diletakkan dalam grid simetris di bagian paling bawah halaman.

Tampilkan output sebagai satu file komponen React tunggal (`TalentShowcase.tsx`) yang mencakup semua elemen di atas dan dapat di-render secara interaktif dengan state filter dan search (mock data).
