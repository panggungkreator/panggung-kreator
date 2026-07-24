# Product Requirement Document (PRD)
# Panggung Kreator — Platform v2

**Versi:** 2.0  
**Tanggal:** Juli 2026  
**Status:** In Progress  
**Owner:** Bagas (Koordinator), Aldi (Founder & Product Lead)

---

## 1. Ringkasan Eksekutif

Panggung Kreator adalah komunitas pengembangan diri berbasis di Bandung yang berfokus pada tiga pilar: **Public Speaking**, **Content Creation**, dan **Personal Branding**. Dengan tagline *"1 Stage, 1 Progress"*, komunitas ini telah berkembang dari 6 orang menjadi 300+ anggota aktif.

Platform v2 adalah evolusi dari sistem lama menjadi **ekosistem digital terintegrasi** yang terdiri dari tiga domain dengan satu database terpusat, bertujuan untuk:

- Memperkuat **community funnel** dari visitor → member gratis → member berbayar
- Mengoperasikan **Akademi Panggung Kreator** secara sistematis
- Menyediakan **data kehadiran & program mentoring** yang teranalisis
- Membuka jalur **monetisasi** yang beragam dan berkelanjutan

---

## 2. Latar Belakang & Konteks

### 2.1 Kondisi Saat Ini (As-Is)

| Aspek | Kondisi |
|---|---|
| Anggota | 300+ anggota aktif |
| Database | Belum terkonsolidasi — data tersebar manual |
| Sistem Kehadiran | Manual, belum digital |
| Program Mentoring | Berjalan, tapi belum terdokumentasi sistematis |
| Monetisasi | Membership Rp49.000, belum teroptimasi |
| Web | Single-site, belum memisahkan komunitas & akademi |

### 2.2 Pain Points Tim Internal

- **Bagas (Koordinator):** Tidak ada dashboard untuk menganalisis data kehadiran dan program mentoring secara real-time
- **Aldi (Founder):** Program hasil diskursus sulit dikemas & didistribusikan secara konsisten
- **Tim secara umum:** Kesimpulan & rekomendasi dari brainstorming sulit diterjemahkan ke aksi nyata

### 2.3 Peran & Tanggung Jawab

| Nama | Peran | Tugas Utama |
|---|---|---|
| **Bagas** | Koordinator (Koor) | Analisis database (Kehadiran & Program Mentoring) → Brainstorming tim → Susun kesimpulan & rekomendasi |
| **Aldi** | Founder & Product Lead | Kemas program dari hasil diskursus; keputusan produk final |

---

## 3. Tujuan Produk (Goals & Non-Goals)

### Goals

1. Membangun ekosistem web 3-domain yang terintegrasi dengan satu login terpusat
2. Meluncurkan **Akademi Panggung Kreator** dengan kursus online + integrasi database lengkap
3. Mengdigitalisasi proses pencatatan kehadiran & rekam jejak program mentoring
4. Membuka jalur monetisasi: Afiliasi, Bootcamp, Live Host Streaming, Agensi, Workshop
5. Menyediakan aset pembelajaran terstruktur: Modul, eBook, Tulisan Praktikal, Bahan Mentoring

### Non-Goals (saat ini)

- Aplikasi mobile native (iOS/Android) — ditunda ke fase berikutnya
- Bootcamp Nasional — direncanakan di Fase Depan
- Fitur komunitas sosial lengkap (forum, comment thread) — bukan prioritas v2

---

## 4. Arsitektur Sistem

### 4.1 Tiga Domain Terpadu

| Domain | URL | Fungsi | Audiens |
|---|---|---|---|
| **Web Komunitas** | `panggungkreator.web.id` | Brand Awareness · Community Funnel · Talent Management | Visitor, Calon Member, Mitra, Sponsor |
| **Web Akademi** | `akademi.panggungkreator.web.id` | Conversion Engine · Learning Hub · Kursus Online | Member siap belajar serius |
| **Admin CMS** | `admin.panggungkreator.web.id` | Operasional Internal Terpusat | Founder, Mentor, Admin |

### 4.2 Prinsip Sistem

```
1 Database (Supabase)
1 Authentication (terpusat di panggungkreator.web.id/login)
1 Member Identity
Multi Frontend (Next.js App Router + Middleware)
```

### 4.3 Login Terpusat

Semua login dialihkan ke satu titik: `panggungkreator.web.id/login`

**Redirect setelah login berdasarkan role & tier:**

| Kondisi | Redirect Tujuan |
|---|---|
| Role = Admin | `admin.panggungkreator.web.id` |
| Tier = Free | `panggungkreator.web.id/myprofile` |
| Tier = Regular / MVP | `akademi.panggungkreator.web.id/dashboard` |

---

## 5. Fitur & Modul

### 5.1 Web Komunitas — `panggungkreator.web.id`

**Fungsi:** Community funnel, brand awareness, pitching, talent management (portofolio, artikel, personal branding), event, dan in-house training.

| Halaman | URL | Akses | Keterangan |
|---|---|---|---|
| Landing Page | `/` | Publik | 10+ section — funnel utama |
| Tentang | `/tentang` | Publik | Sejarah, visi-misi, tim |
| Galeri | `/galeri` | Publik | Dokumentasi visual kegiatan |
| Media Kit | `/media-kit` | Publik | Data audiens untuk mitra |
| Login | `/login` | Publik | **Login Center** seluruh sistem |
| Register | `/register` | Publik | Daftar member gratis |
| My Profile | `/myprofile` | Login | Area member semua tier |

**CTA Utama:** `Gabung Member Komunitas — Gratis`

### 5.2 Web Akademi — `akademi.panggungkreator.web.id`

**Fungsi:** Full mentoring, akses kursus online lifetime, mentoring 1x/minggu.

| Halaman | URL | Akses |
|---|---|---|
| Landing Akademi | `/` | Publik |
| Checkout | `/checkout` | Login |
| Dashboard | `/dashboard` | Regular/MVP |
| Program Saya | `/dashboard/program` | Regular/MVP |
| Jadwal Mentoring | `/dashboard/jadwal` | Regular/MVP |
| Resource & Materi | `/dashboard/resource` | Regular/MVP |
| Kursus Online | `/dashboard/course` | Future |

**CTA Utama:** `Mulai Perjalanan Belajarmu`

### 5.3 Admin CMS — `admin.panggungkreator.web.id`

| Menu | Sub Menu | Deskripsi |
|---|---|---|
| **Dashboard** | Ringkasan Sistem | Snapshot: member, transaksi, aktivitas |
| **Data Center** | Members, Attendance | Semua data member + rekap kehadiran |
| **Akademi** | Packages, Voucher, Mentoring, Resources | Manajemen program berbayar |
| **Komunitas** | Acara, Venue, Partner | Kelola event & rekam kehadiran |
| **CMS** | Landing Komunitas, Akademi, Media | Inline edit konten tanpa coding |
| **Analytics** | Funnel, Revenue, Aktivitas | Laporan & insight |
| **System** | Admin Users, Roles, Logs | Manajemen akses & audit |

---

## 6. User Personas & Journey

### 6.1 Personas

| Persona | Deskripsi | Goal |
|---|---|---|
| **Visitor Baru** | Tau dari medsos / rekomendasi teman | Cari tahu tentang komunitas |
| **Member Gratis** | Sudah daftar, aktif di kegiatan offline | Bergabung lebih dalam |
| **Member Priority** | Member lama yang sudah 2+ kelas + 3x Open Mic | Siap jadi Performer / Mentor |
| **Member Membership** | Bayar Rp49.000, punya sesi mentoring | Belajar terstruktur |
| **Member BTB** | Berani Tampil Bicara — side community | Scale up ke Membership |

### 6.2 User Journey Lengkap

```
Visitor
  ↓ Lihat konten Medsos / rekomendasi teman
Web Komunitas (panggungkreator.web.id)
  ↓ Daftar Member Gratis
Bergabung WhatsApp Group Eksklusif
  ↓ Dapat info acara via WA Group
Hadir di Open Mic / Sharing Session / Networking
  ↓ Admin rekam kehadiran di Admin CMS
My Profile — riwayat aktivitas tercatat
  ↓ CTA Upgrade muncul (setelah ada aktivitas)
Web Akademi (akademi.panggungkreator.web.id)
  ↓ Checkout Rp49.000 (Regular / MVP)
Dashboard Akademi — Full Mentoring + Kursus Online
  ↓ Ikut mentoring 1x/minggu
Performer — Panggung Kreator All Star
```

### 6.3 WhatsApp Group Ecosystem

| No | Grup | Segmen | Fungsi |
|---|---|---|---|
| 1 | Komunitas Panggung Kreator @Bandung (General) | Member lama & baru | Info Sesi Panggung, Level Up Challenge, Open Mic |
| 2 | PanggungKreatorPriority | Member aktif (ikut 2+ kelas + 3x Open Mic) | Persiapan Performer, Mentor, Public Speaker |
| 3 | PanggungKreatorMembership | Member bayar Rp49.000 | Sesi mentoring eksklusif + benefit premium |
| 4 | KomunitasBeraniTampilBicara (BTB) | Member baru, side community | Funnel marketing → Scale up ke Membership |

---

## 7. Skema Harga & Launching Akademi

### 7.1 Skema Harga

| Segmen | Harga Normal | Diskon | Harga Akhir |
|---|---|---|---|
| **Umum** | Rp149.000 | — | Rp149.000 |
| **Panggung Priority** | Rp149.000 | Rp100.000 | Rp49.000 |
| **Membership** | Rp49.000 | — | Rp49.000 |
| **Peserta Private** | Berbayar | — | Gratis akses kursus |

### 7.2 Target Launching

**Target Rilis:** Kursus online live + integrasi database lengkap mencakup:
- Integrasi data Priority member
- Integrasi data Membership member
- Integrasi data Peserta Private
- Kursus online dapat diakses dari dashboard

---

## 8. Aset Pembelajaran & Konten

### 8.1 Kurikulum

| Aset | Keterangan |
|---|---|
| **Pedoman Panggung Kreator** | Panduan induk filosofi & metode komunitas |
| **Modul** | Materi pembelajaran terstruktur per topik |
| **eBook** | Referensi digital untuk member |
| **Tulisan Praktikal** | Konten how-to berbasis pengalaman nyata |
| **Bahan Mentoring** | Material sesi 1-on-1 / kelompok |

### 8.2 Strategi Konten

Konsep konten terintegrasi tiga pilar:

| Tipe Konten | Contoh |
|---|---|
| **Daily** | Quotes, insight harian, reminder |
| **Tips / Education** | Tutorial praktis 3 pilar (Public Speaking, Content, Branding) |
| **Entertainment** | Behind the scenes, momen Open Mic, highlight member |

---

## 9. Open Items — Perlu Keputusan

| # | Topik | Pertanyaan | Urgency |
|---|---|---|---|
| 1 | **Online Course** | Benefit membership atau dijual terpisah? Siapa yang buat konten? Kapan target? | Harus jelas sebelum bangun dashboard/course |
| 2 | **Private Mentoring** | Tetap sub-paket di Akademi atau pisah jadi produk sendiri? | Sebelum bangun halaman program |
| 3 | **WA Group Automation** | Siapa kelola undangan ke grup WA? Manual admin atau otomatis setelah daftar? | Sebelum launch Web Komunitas |
| 4 | **Analytics Tools** | Cukup Supabase internal atau integrasi Mixpanel/Posthog? | Bisa diputuskan belakangan |
| 5 | **Analisis Data Kehadiran** | Bagas perlu menyusun template laporan analisis — format dashboard atau spreadsheet? | Prioritas koordinator |

---

## 10. Urutan Pengerjaan (Roadmap)

| Tahap | Yang Dikerjakan | PIC | Status |
|---|---|---|---|
| **0** | Finalisasi open items bersama founder | Bagas + Aldi | Belum |
| **1** | Middleware + folder placeholder semua domain | Dev | Belum |
| **2** | Cookie domain Supabase + tes sesi lintas subdomain | Dev | Belum |
| **3** | Auth: `/login`, `/register`, `/auth/callback` | Dev | Belum |
| **4** | Migrasi modul admin ke `admin-app/` | Dev | Belum |
| **5** | `/myprofile` — area member | Dev | Belum |
| **6** | Halaman publik Web Komunitas: `/`, `/tentang`, `/galeri` | Dev | Belum |
| **7** | Landing Page Akademi + skema harga | Dev + Aldi | Belum |
| **8** | Admin CMS: acara/absensi, analytics | Dev + Bagas | Belum |
| **9** | Dashboard Akademi + checkout + payment | Dev | Belum |
| **10** | Online Course & LMS | Dev + Aldi | Tunggu keputusan |

---

## 11. Metrik Keberhasilan (KPI)

| Metrik | Target (3 Bulan Post-Launch) |
|---|---|
| Member terdaftar (gratis) | 500+ |
| Konversi free → berbayar | 15% atau lebih |
| Member aktif (hadir ≥1 kegiatan/bulan) | 60% atau lebih |
| Pendapatan bulanan | Rp5.000.000+ |
| Data kehadiran ter-record (digital) | 100% dari semua event |

---

*Dokumen ini adalah dokumen hidup — diperbarui setiap ada keputusan baru dari hasil brainstorming tim.*
