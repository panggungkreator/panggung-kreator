# Rencana Implementasi: Manajemen Talenta & Alur Portofolio (Talent Management & Portfolio Plan)

Dokumen ini merinci rencana implementasi untuk dua fitur utama: **Halaman Talent Kami (Public Showcase)** dan **Alur Portofolio MyProfile (`PortfolioManager.tsx`)**. 

## 1. Halaman Talent Kami (Public Showcase)

Halaman ini merupakan etalase publik yang mengumpulkan data dari formulir registrasi member dan profil portofolio, dilengkapi dengan pencarian dan filter tag (keahlian/peran).

### A. Routing Requirements (Kebutuhan Routing)
- **URL Path**: `/talent` atau `/kreator`
- **Layout**: Menggunakan layout publik standar aplikasi (Navbar dan Footer publik).
- **Sub-routing (Opsional)**: `/talent/[username]` untuk melihat halaman profil detail dari spesifik talent/member.

### B. Database Query Structures (Struktur Query Database)
Data akan ditarik dari tabel `members`, `member_interests`, dan `portfolio_items`.

**Query Utama (Mengambil daftar talent):**
```sql
SELECT 
  m.id, 
  m.full_name, 
  m.stage_name, 
  m.username, 
  m.avatar_url, 
  m.occupation, 
  m.description AS bio, 
  m.social_media, 
  mi.primary_interests AS skills
FROM members m
LEFT JOIN member_interests mi ON m.id = mi.member_id
WHERE m.role = 'member' AND m.profile_completed_at IS NOT NULL
ORDER BY m.created_at DESC;
```

**Query Detail (Saat membuka profil spesifik):**
```sql
-- Mengambil data profil member
SELECT * FROM members WHERE username = [username];

-- Mengambil data portofolio unggulan (Featured Projects)
SELECT * 
FROM portfolio_items 
WHERE member_id = [member_id] 
  AND is_public = true 
  AND is_featured = true
ORDER BY sort_order ASC, created_at DESC;
```

### C. UI Wireframes (Kerangka Antarmuka)

**1. Halaman Daftar Talent (`/talent`)**
- **Header Section**: Judul "Talent Kami", Sub-judul deskriptif.
- **Search & Filter Bar**:
  - Input Pencarian (Search by nama atau bio).
  - Filter Multi-select/Dropdown untuk Tag Keahlian/Peran (misal: Public Speaker, Content Creator, UI/UX Designer, dll).
- **Talent Grid**:
  - Grid card (3 kolom di Desktop, 1 kolom di Mobile).
  - Setiap card menampilkan: Foto profil (Avatar), Nama/Stage Name, Pekerjaan/Title (Occupation), badge keahlian (Skills), dan tombol "Lihat Profil".

**2. Halaman Detail Talent (`/talent/[username]`)**
- **Profile Header**: Foto besar/Avatar, Nama, Pekerjaan, Bio, Link Sosial Media (Instagram, LinkedIn, dll).
- **Project Highlights Section**: Menampilkan karya/portofolio yang ditandai sebagai `is_featured = true`.
- **Portofolio Lengkap Section**: Menampilkan semua portofolio lainnya yang di-set `is_public = true`, dapat dikelompokkan berdasarkan pilar (Public Speaking, Content Creation, dll).

---

## 2. Alur Portofolio MyProfile (`PortfolioManager.tsx`)

Antarmuka CRUD bagi member untuk mengelola bio, gelar profesional, tautan sosial, highlight proyek (featured), dan media kustom.

### A. Fitur yang Akan Diimplementasikan
1. **Pengelolaan Profil Dasar (Bio, Title, Social Links)**:
   - Terintegrasi dalam `PortfolioManager.tsx` (atau komponen profil berdampingan dengannya).
   - Field: `occupation` (Professional Title), `description` (Bio), `social_media` (JSON untuk links).
2. **Manajemen Karya/Portofolio (Media Kustom & Project Highlights)**:
   - CRUD untuk tabel `portfolio_items`.
   - Mengatur `is_featured` untuk highlight proyek.
3. **Pipeline Upload Gambar/Logo (Supabase Storage)**:
   - Menggunakan bucket Supabase.
   - Menerapkan kompresi gambar otomatis di sisi klien (menggunakan library `browser-image-compression`) sebelum diunggah ke Supabase untuk menghemat ruang dan bandwidth.

### B. Routing Requirements
- **URL Path**: `/member/profile` atau `/member/portfolio` (Secured Route).
- **API Routes**:
  - `GET /api/member/profile` (Mengambil data profil)
  - `PATCH /api/member/profile` (Memperbarui bio, occupation, social_media)
  - Fitur upload gambar dapat menggunakan API `/api/upload` atau klien Supabase secara langsung di frontend.

### C. UI Wireframes (Kerangka Antarmuka `PortfolioManager.tsx`)

**1. Bagian Informasi Profil (Profil & Kontak)**
- **Avatar Upload**: Komponen upload foto profil (dengan fitur preview & kompresi).
- **Form Fields**:
  - Gelar Profesional / Pekerjaan (Input Text).
  - Bio Singkat (Textarea).
  - Tautan Sosial (Input text dinamis untuk LinkedIn, Instagram, Website/Portfolio URL).
- **Tombol Simpan**: Menyimpan perubahan ke tabel `members`.

**2. Bagian Manajemen Karya (Portofolio)**
- **Tabs/Filter Pilar**: Filter karya berdasarkan pilar (Public Speaking, Content Creation, Personal Branding).
- **Tombol "Tambah Karya"**: Membuka modal tambah karya.
- **Grid Karya**:
  - Card karya menampilkan thumbnail, judul, tipe (video, artikel, gambar), dan badge "Featured" (jika `is_featured = true`).
  - Aksi pada Card: Edit, Hapus, Toggle Featured.

**3. Modal Form Tambah/Edit Karya**
- Pilihan Pilar (Select).
- Pilihan Tipe Media (Video, Gambar, Artikel).
- Upload Media Kustom:
  - Jika "Gambar": Input file dengan proses kompresi -> upload ke Supabase Storage -> return URL.
  - Jika "Video": Input link (YouTube/TikTok).
- Judul Karya & Deskripsi.
- Checkbox "Jadikan Highlight / Featured".
- Checkbox "Tampilkan ke Publik".

### D. Pipeline Upload Gambar dengan Kompresi (Supabase Storage)

**Alur Kerja (Workflow):**
1. User memilih file gambar (JPEG/PNG/WebP).
2. Fungsi utilitas `compressImage(file)` dijalankan di frontend (menggunakan `browser-image-compression`):
   - Maksimal resolusi (misal: 1920x1080).
   - Maksimal ukuran file (misal: 500KB).
3. Hasil gambar yang sudah dikompresi diunggah ke Supabase Storage (`storage.from('media').upload(...)`).
4. Mendapatkan `publicUrl` dari Supabase.
5. URL disimpan ke database (kolom `avatar_url` di `members` atau `media_url` di `portfolio_items`).
