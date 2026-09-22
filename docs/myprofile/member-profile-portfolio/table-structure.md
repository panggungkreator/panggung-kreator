# Struktur Tabel Database
# Modul: Member Profile & Portfolio

Dokumen ini memetakan struktur tabel database Supabase yang dibutuhkan untuk fitur Profil Member, Portofolio, dan Form Assessment (Priority), termasuk kolom untuk menyimpan hasil analisis AI.

---

## 1. Tabel `members` (Modifikasi Tabel Existing)

Tabel ini adalah tabel utama pengguna. Kita **hanya menambahkan kolom-kolom baru** ke tabel ini tanpa menghapus yang lama.

| Nama Kolom | Tipe Data | Constraint / Default | Deskripsi |
|---|---|---|---|
| `id` | uuid | PK | Dari auth.users |
| `full_name` | text | NOT NULL | Nama Lengkap |
| `stage_name` | text | | Nama Panggung |
| `whatsapp_number` | text | NOT NULL | Nomor WA aktif |
| `instagram_username`| text | NOT NULL | Username Instagram |
| `tiktok_username` | text | | Username TikTok |
| `occupation` | text | | Pekerjaan / Status |
| `description` | text | | Bio singkat |
| `city` | text | [BARU] | Kota domisili |
| `youtube_url` | text | [BARU] | Link Channel YouTube |
| `linkedin_url` | text | [BARU] | Link Profil LinkedIn |
| `portfolio_url` | text | [BARU] | Link website pribadi / eksternal |
| `avatar_url` | text | [BARU] | URL foto profil (Supabase Storage) |
| `community` | text | Default: 'panggung_kreator' | Pilihan: panggung_kreator / btb |
| `membership_tier` | text | Default: 'free' | Pilihan: free / priority / membership |
| `tier_changed_at` | timestamptz | [BARU] | Audit trail perubahan tier |
| `tier_changed_by` | uuid | FK ke members(id) [BARU] | Admin yang mengubah tier |
| `tier_note` | text | [BARU] | Alasan perubahan tier |
| `subscribed_newsletter`| boolean | Default: true [BARU] | Opt-in email marketing |
| `profile_completed_at`| timestamptz | [BARU] | Waktu profil selesai diisi |
| `affiliate_code` | text | UNIQUE [BARU] | Kode referal member (misal: PK-BAGAS) |
| `referred_by` | uuid | FK ke members(id) [BARU] | Siapa yang mengajak bergabung |
| `commission_balance`| numeric | Default: 0 [BARU] | Saldo komisi affiliate belum ditarik |

---

## 2. Tabel `member_interests` (Tabel Baru 1:1)

Tabel ini menyimpan data kuesioner assessment secara detail dan hasil analisis otomatis dari AI. **Satu member hanya boleh memiliki maksimal satu baris data (Unique).**

| Nama Kolom | Tipe Data | Constraint / Default | Deskripsi |
|---|---|---|---|
| `id` | uuid | PK, Default: gen_random_uuid() | |
| `member_id` | uuid | FK ke members(id) ON DELETE CASCADE | **UNIQUE** (Hanya 1 data per member) |
| `primary_interests` | text[] | Default: '{}' | Minat utama (VO, MC, Content Creator, dll) |
| `experience_level` | text | CHECK (beginner/intermediate/advanced) | Tingkat pengalaman |
| `goals` | text[] | Default: '{}' | Tujuan bergabung (karier, hobi, bisnis) |
| `content_topics` | text[] | Default: '{}' | Topik konten yang disukai |
| `availability` | text | CHECK (morning/afternoon/evening/night/flexible) | Waktu luang untuk kelas |
| `learning_preference`| text[] | Default: '{}' | Preferensi (online/offline/hybrid) |
| `referral_source` | text | | Sumber informasi (IG, TikTok, Teman) |
| `ai_analysis` | text | [BARU] | Hasil rangkuman dan pemetaan dari LLM (Gemini) khusus untuk dibaca Mentor/Admin |
| `created_at` | timestamptz | Default: now() | |
| `updated_at` | timestamptz | Default: now() | Trigger otomatis saat update |

---

## 3. Tabel `portfolio_items` (Tabel Baru 1:N)

Tabel ini menyimpan daftar karya/portofolio member yang akan ditampilkan di profil publik mereka. **Satu member bisa memiliki banyak baris data.**

| Nama Kolom | Tipe Data | Constraint / Default | Deskripsi |
|---|---|---|---|
| `id` | uuid | PK, Default: gen_random_uuid() | |
| `member_id` | uuid | FK ke members(id) ON DELETE CASCADE | Pemilik portofolio |
| `pillar` | text | CHECK (public_speaking/content_creation/personal_branding) | Pilar utama karya |
| `item_type` | text | CHECK (video/image/article/link/achievement) | Jenis portofolio |
| `title` | text | NOT NULL | Judul karya |
| `description` | text | | Penjelasan singkat (opsional) |
| `media_url` | text | | URL external (YouTube/TikTok) atau Storage URL |
| `media_source` | text | CHECK (youtube/instagram/tiktok/storage/external) | Sumber platform |
| `thumbnail_url` | text | | URL gambar thumbnail (Cache/Storage) |
| `is_featured` | boolean | Default: false | Tampil di pin/unggulan profil |
| `is_public` | boolean | Default: true | Visibilitas (Public vs Private) |
| `view_count` | integer | Default: 0 | Jumlah view |
| `sort_order` | integer | Default: 0 | Urutan tampilan (Drag & Drop) |
| `created_at` | timestamptz | Default: now() | |
| `updated_at` | timestamptz | Default: now() | Trigger otomatis saat update |

---

## 4. Policy Keamanan (Row Level Security / RLS)

### `member_interests`
- **Member:** Hanya bisa `SELECT` dan `UPSERT` data milik mereka sendiri (berdasarkan `auth.uid()`).
- **Publik:** TIDAK ADA AKSES.
- **Admin/Mentor:** Bisa `SELECT` semua data untuk analisis.

### `portfolio_items`
- **Member:** Bisa `ALL` (CRUD) data milik mereka sendiri.
- **Publik:** Hanya bisa `SELECT` jika `is_public = true`.
- **Admin/Mentor:** Bisa `SELECT` dan `UPDATE` (misal untuk take-down konten tidak pantas).

---

## 5. Tabel `transactions` (Modifikasi Tabel Existing)

Untuk mendukung sistem **Affiliate**, kita menambahkan kolom pencatat komisi di tabel transaksi yang sudah ada.

| Nama Kolom | Tipe Data | Constraint / Default | Deskripsi |
|---|---|---|---|
| `affiliate_code_used`| text | [BARU] | Kode affiliate yang digunakan pembeli saat transaksi |
| `commission_earned` | numeric | Default: 0 [BARU] | Komisi yang diberikan ke pemilik kode affiliate |
