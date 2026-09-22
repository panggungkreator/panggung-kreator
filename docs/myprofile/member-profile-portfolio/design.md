# Panduan & Konsep Desain UI: Form Onboarding & Member Profile
# Tema: Bold Dark Editorial Architecture (Rangers Theme)

**Path:** `docs/member-profile-portfolio/design.md`
**Referensi Visual:** UI Form "Halo, PARA RANGERS" (`/form/admin`)

---

## 1. Filosofi Desain

Mengadopsi konsep **Bold Dark Editorial Architecture**. Desain ini mengedepankan estetika premium, minimalis, dan kontras tinggi. Karakter utamanya adalah penggunaan warna latar belakang super gelap, tipografi serif yang elegan untuk sapaan, berpadu dengan sans-serif ultra-bold uppercase untuk judul utama.

Desain ini menghilangkan ornamen UI klasik (seperti bayangan/shadows atau sudut tumpul) dan menggantikannya dengan garis batas tajam (`border-b` atau `border border-zinc-800`), sudut tegas (`rounded-none`), serta tipografi mono untuk elemen sistem/status.

---

## 2. Palet Warna (Color System)

| Elemen | Kode Warna (HEX) | Utility Class Tailwind | Keterangan |
|---|---|---|---|
| **Latar Belakang Utama** | `#0A0A0A` | `bg-[#0A0A0A]` | Hitam pekat untuk kesan premium |
| **Latar Belakang Card** | `#121212` | `bg-[#121212]` | Kontras halus untuk area form |
| **Garis Batas Utama** | `#27272A` | `border-zinc-800` | Pembatas card dan section |
| **Garis Batas Input** | `#3F3F46` | `border-zinc-700` | Garis bawah minimalis |
| **Teks Utama** | `#FFFFFF` | `text-white` | Kontras maksimal |
| **Teks Sekunder** | `#A1A1AA` | `text-zinc-400` | Untuk label, deskripsi, placeholder |
| **Warna Aksen Merah** | `#BC151B` | `bg-[#bc151b]` / `text-[#bc151b]`| Warna aksen Panggung Kreator |

---

## 3. Spesifikasi Tipografi

*   **Sapaan / Greetings** (e.g., *"Halo,"*):
    *   Font: Serif (seperti *Playfair Display*, *Georgia*, atau font serif default Next.js).
    *   Class: `text-3xl lg:text-4xl font-serif italic tracking-tight text-white`
*   **Judul Utama / Brand Callout** (e.g., *"PARA RANGERS"*, *"MEMBER PRIORITY"*):
    *   Font: Sans-serif Heavy.
    *   Class: `text-3xl lg:text-4xl font-sans font-black tracking-wide text-zinc-300 uppercase`
*   **Sub-title / Hashtag**:
    *   Class: `text-xs text-zinc-400 font-sans tracking-wide leading-relaxed`
*   **Label Field**:
    *   Class: `text-[11px] font-bold tracking-wider text-zinc-400 uppercase block mb-1`
*   **Status / Badge**:
    *   Class: `text-[8px] font-mono uppercase tracking-wider`

---

## 4. Komponen UI Utama (Tailwind Spec)

### 4.1 Input Text Minimalis (Bottom-Border)

Menghilangkan kotak penuh, hanya menyisakan garis bawah tipis yang berubah menjadi putih saat aktif.

```tsx
<input
  type="text"
  required
  placeholder="Budi Santoso"
  className="w-full bg-transparent border-b border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder-zinc-650 text-white"
/>
```

### 4.2 Dropdown / Select Custom

Menggunakan radix-ui (atau Shadcn UI) dengan modifikasi monochrome border tegas.

```tsx
// Dropdown Trigger
className="w-full bg-transparent border-0 border-b border-zinc-700 py-1.5 px-0 h-auto text-sm rounded-none focus:outline-none focus:ring-0 focus:border-white transition-colors text-white appearance-none cursor-pointer flex items-center justify-between shadow-none"

// Dropdown Content
className="bg-[#121212] border border-zinc-800 text-white rounded-none p-1"

// Dropdown Item
className="text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-none"
```

### 4.3 Grid Pilihan / Badge Multi-Select (Kunci Utama Visual)

Digunakan untuk memilih minat (VO, MC, dll.) atau memilih warna identitas. Menggunakan layout grid yang teratur dengan indikator warna/status di ujungnya.

```tsx
// Grid Container
className="grid grid-cols-2 sm:grid-cols-3 gap-2"

// Button Item (State: Default)
className="relative flex items-center space-x-2 px-3 py-2 border border-zinc-700 bg-transparent text-[11px] text-zinc-500 uppercase font-mono tracking-wider transition-all outline-none rounded-none cursor-pointer hover:border-white hover:text-white"

// Button Item (State: Active/Selected)
className="relative flex items-center space-x-2 px-3 py-2 border border-white bg-white text-black text-[11px] uppercase font-mono font-bold tracking-wider transition-all outline-none rounded-none cursor-pointer"

// Indikator Titik Warna (Dot)
className="h-2 w-2 rounded-full flex-shrink-0"
```

### 4.4 Tombol Utama (CTA Button)

Tombol dengan blok solid putih pekat dan teks hitam tebal, berubah menjadi merah aksen saat hover.

```tsx
<button
  type="submit"
  className="px-12 py-4 bg-white text-black hover:bg-[#bc151b] hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors cursor-pointer"
>
  JOIN RANGERS &rarr;
</button>
```

---

## 5. Implementasi pada Form Priority Member

Tema ini akan diterapkan sepenuhnya pada **Form Priority Tahap 1 (Register)** dan **Tahap 2 (Lengkapi Profil)**:

1.  **Tahap 1 (Register Onboarding):**
    *   Desain dibuat 1-card terpusat mirip persis dengan halaman `/form/admin`.
    *   Grid pilihan warna identitas di `/form/admin` diadaptasi menjadi **Grid Pilihan Minat Utama (VO, MC, CC, dll)** dengan dot warna yang mewakili pilar (misal: Hijau untuk *Public Speaking*, Pink untuk *Content Creation*, Kuning untuk *Personal Branding*).
2.  **Tahap 2 (Lengkapi Profil di `/myprofile`):**
    *   Menggunakan layout kolom sidebar kiri untuk navigasi menu, dan sisi kanan menggunakan form dengan gaya minimalis *border-bottom* yang sama agar konsisten.
