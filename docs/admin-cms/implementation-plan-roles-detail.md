# Implementation Plan — Step-by-Step Admin Roles & Permissions System

This document outlines the step-by-step implementation plan for the **Admin Roles & Permissions System (v4.1 Relational RBAC + Runtime Enforcement)**. It includes a comprehensive mapping of every page slug to its actual UI components and CRUD buttons, specifying which permission is required for each action.

Reference Document: [docs/ip_admin/admin_roles.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/ip_admin/admin_roles.md)

---

## 1. Halaman & Pemetaan Izin CRUD (Page & UI Button Mapping)

Berdasarkan audit codebase, berikut adalah daftar lengkap halaman admin, aksi UI yang tersedia, dan izin yang harus disematkan:

### 1.1 `members` (Membership)
*   **Akses Halaman (`view`)**: Membuka `/admin/members`.
*   **Ekspor CSV (`view`)**: Tombol "Ekspor CSV" di `MembersClient.tsx` (Line 239-246).
*   **Lihat Detail (`view`)**: Tombol Eye / Detail modal di `MembersClient.tsx` (Line 371-377).
*   **Edit Status/Tier (`edit`)**: Tombol Edit / Edit modal di `MembersClient.tsx` (Line 378-384).
*   *Tidak memiliki aksi Create & Delete.*

### 1.2 `transactions` (Transactions)
*   **Akses Halaman (`view`)**: Membuka `/admin/transactions` (Read-only).
*   *Tidak memiliki aksi Create, Edit, & Delete.*

### 1.3 `attendance` (Attendance)
*   **Akses Halaman (`view`)**: Membuka `/admin/attendance`.
*   **Catat Kehadiran Manual (`create`)**: Section/Form "CATAT KEHADIRAN MANUAL" di `AttendanceClient.tsx` (Line 471-472).
*   **Toggle Hadir/Absen (`edit`)**: Checkbox `is_present` di tabel row `AttendanceClient.tsx` (Line 433-438).
*   *Tidak memiliki aksi Delete.*

### 1.4 `packages` (Packages)
*   **Akses Halaman (`view`)**: Membuka `/admin/packages`.
*   **Tambah Paket Baru (`create`)**: Tombol/Link "Tambah Paket" di `/admin/packages/create` (Line 103-109).
*   **Edit Paket (`edit`)**: Link Edit di tabel row ke `/admin/packages/[id]` (Line 201-207).
*   **Jadikan Default (`edit`)**: Tombol "Jadikan Default" di tabel row (Line 191-196).
*   **Hapus Paket (`delete`)**: Tombol Trash2 di tabel row (Line 208-214).

### 1.5 `voucher` (Voucher)
*   **Akses Halaman (`view`)**: Membuka `/admin/voucher`.
*   **Buat Voucher (`create`)**: Tombol "Buat Voucher" (Line 204-210) & submit form modal.
*   **Edit Voucher (`edit`)**: Tombol Edit di tabel row (Line 268-274) & submit edit.
*   **Toggle Aktif/Nonaktif (`edit`)**: Tombol status di tabel row (Line 259-264).
*   **Hapus Voucher (`delete`)**: Tombol Trash2 di tabel row (Line 275-281).

### 1.6 `payment` (Payment)
*   **Akses Halaman (`view`)**: Membuka `/admin/payment`.
*   **Lihat Bukti Bayar (`view`)**: Tombol "Bukti Bayar" / "Lihat" modal (Line 379-385).
*   **Konfirmasi Pembayaran (`edit`)**: Tombol "Konfirmasi Lunas" (Line 387-394).
*   *Tidak memiliki aksi Create & Delete.*

### 1.7 `mentoring` (Mentoring)
*   **Akses Halaman (`view`)**: Membuka `/admin/mentoring`.
*   **Buat Sesi Baru (`create`)**: Tombol "Buat Sesi Baru" (Line 131-137).
*   **Lihat Catatan (`view`)**: Tombol "Lihat Catatan" / Notes Dialog modal (Line 293-299).
*   **Edit / Reschedule (`edit`)**: Tombol Edit di tabel row (Line 300-306).
*   *Tidak memiliki aksi Delete.*

### 1.8 `resources` (Resources)
*   **Akses Halaman (`view`)**: Membuka `/admin/resources`.
*   **Upload Resource Baru (`create`)**: Tombol "Upload Resource Baru" (Line 229-235).
*   **Download/Buka Berkas (`view`)**: Tombol Download di tabel row (Line 393-401).
*   **Edit Info (`edit`)**: Tombol Edit di tabel row (Line 402-408).
*   **Toggle Publish (`edit`)**: Tombol Published/Draft toggle (Line 378-386).
*   **Hapus Resource (`delete`)**: Tombol Trash2 di tabel row (Line 409-415).

### 1.9 `acara` (Acara & Event)
*   **Akses Halaman (`view`)**: Membuka `/admin/acara`.
*   **Buat Acara Baru (`create`)**: Tombol "Buat Acara Baru" di `AcaraListClient.tsx` (Line 215-222).
*   **Lihat Detail & Kehadiran (`view`)**: Link ke `/admin/acara/[id]` (Line 367-373).
*   **Toggle Publish (`edit`)**: Tombol toggle Published/Draft di `AcaraListClient.tsx` (Line 355-363).
*   **Hapus Acara (`delete`)**: Tombol Trash2 di `AcaraListClient.tsx` (Line 374-380).
*   **Detail Acara - Tambah Peserta (`create`)**: Form "Daftarkan Hadir" di `/admin/acara/[id]` (Line 556-572).
*   **Detail Acara - Toggle Absensi (`edit`)**: Checkbox `is_present` di `/admin/acara/[id]` (Line 465-471).
*   **Detail Acara - Hapus Absensi (`delete`)**: Tombol Trash2 absensi di `/admin/acara/[id]` (Line 488-494).
*   **Detail Acara - Ekspor CSV (`view`)**: Tombol "Ekspor CSV" di `/admin/acara/[id]` (Line 417-423).
*   *Catatan: Tidak ada form edit data acara itu sendiri.*

### 1.10 `venue` (Venue)
*   **Akses Halaman (`view`)**: Membuka `/admin/venue`.
*   **Tambah Venue Baru (`create`)**: Tombol "Tambah Venue Baru" (Line 275-282).
*   **Edit Venue (`edit`)**: Tombol Edit di kartu venue (Line 426-432).
*   **Toggle Rekomendasi (`edit`)**: Tombol "Recommend" (Line 417-425).
*   **Hapus Venue (`delete`)**: Tombol Trash2 (Line 433-439).

### 1.11 `partner` (Partner)
*   **Akses Halaman (`view`)**: Membuka `/admin/partner`.
*   **Tambah Partner Baru (`create`)**: Tombol "Tambah Partner Baru" (Line 252-259).
*   **Edit Partner (`edit`)**: Tombol Edit di tabel row (Line 459-465).
*   **Toggle Featured/Active (`edit`)**: Tombol Star/Badge status (Line 432-454).
*   **Reorder Partner (`edit`)**: Tombol Arrow Up / Down (Line 352-366).
*   **Hapus Partner (`delete`)**: Tombol Trash2 (Line 466-472).

### 1.12 `galeri` (cms_galeri)
*   **Akses Halaman (`view`)**: Membuka `/admin/galeri`.
*   **Tambah Album (`create`)**: Tombol "Tambah Album" (Line 204-207).
*   **Lihat Detail Album (`view`)**: Tombol Eye / Detail modal (Line 287-293).
*   **Edit Album (`edit`)**: Tombol Edit di tabel row / modal (Line 294-298).
*   **Hapus Album (`delete`)**: Tombol Trash2 / modal (Line 299-305).

### 1.13 `media` (media_library)
*   **Akses Halaman (`view`)**: Membuka `/admin/media`.
*   **Upload File Baru (`create`)**: Tombol "Upload File Baru" (Line 225-234).
*   **Copy Link / Buka Tab Baru (`view`)**: Tombol Eye / Copy Link (Line 363-378).
*   **Hapus File (`delete`)**: Tombol Trash2 (Line 420-426).
*   *Tidak memiliki aksi Edit.*

### 1.14 `admins` (Kelola Admin & Hak Akses)
*   **Akses Halaman (`view`)**: Membuka `/admin/admins`.
*   *Catatan: Halaman ini hanya boleh diakses oleh Super Admin / Admin dengan hak akses `system`.*
*   **Tunjuk Admin Baru (`create`)**: Tombol "Tunjuk Admin Baru" (Line 235-241) / "Promosikan Jadi Admin".
*   **Edit Hak Akses (`edit`)**: Tombol Edit Hak Akses / modal (Line 318-327).
*   **Revoke Akses Admin (`delete`)**: Tombol Trash2 / Revoke (Line 328-334).

---

## 2. Langkah-Langkah Implementasi (Step-by-Step Roadmap)

### Tahap 1: Migrasi Database & Seeding (Prioritas 🔴)
1.  **Langkah 1.1**: Buat migration file Supabase untuk tabel `privilege_groups`, `privilege_actions`, dan `privilege_items` beserta *seed data* awal.
2.  **Langkah 1.2**: Buat migration file untuk tabel `admin_roles` (dengan relasi ke `members` dan constraint warna unik) serta `admin_role_permissions`.
3.  **Langkah 1.3**: Tambahkan `UNIQUE` constraints pada tabel `members` (`email`, `whatsapp_number`, `username`).
4.  **Langkah 1.4**: Migrasikan data admin yang ada saat ini dari kolom `members.admin_role` lama ke dalam skema tabel `admin_roles` dan berikan izin default (`view`, `create`, `edit`, `delete`) ke mereka.

### Tahap 2: Setup Kode Pendukung & Konstanta (Prioritas 🔴)
5.  **Langkah 2.1**: Buat file `lib/constants.ts` yang berisi daftar `COLOR_RANGERS` dengan format label `"Rangers [Warna]"` (contoh: `#db2777` -> **Rangers Pink**).
6.  **Langkah 2.2**: Buat file `lib/admin-page-registry.ts` sebagai cache statis frontend.
7.  **Langkah 2.3**: Buat file `lib/check-permission.ts` yang berisi:
    *   `checkPermission(pageSlug, action, mode)` (padanan `checkRole()`)
    *   `getPermissionMap(adminRoleId)` (padanan `checkRoleSidebar()`)
    *   `hasPermission(permMap, pageSlug, action)` (helper lookup)

### Tahap 3: Halaman Self-Onboarding Calon Admin (Prioritas 🟠)
8.  **Langkah 3.1**: Buat halaman pendaftaran mandiri `/admin/onboarding` dengan form identitas lengkap, pilihan profesi, media sosial, dan pilihan warna Color Rangers yang masih tersedia.
9.  **Langkah 3.2**: Tambahkan validasi frontend/backend untuk mencegah data ganda (1 email, 1 no WA, 1 warna per admin aktif).

### Tahap 4: Halaman Detail & Permission Matrix Super Admin (Prioritas 🟠)
10. **Langkah 4.1**: Update halaman list admin `/admin/admins` untuk menampilkan warna ranger berlabel, jabatan, dan status pending.
11. **Langkah 4.2**: Buat halaman detail admin `/admin/admins/[id]` dengan input label jabatan dan *Permission Matrix* dinamis yang membaca data `privilege_items` dari database.
12. **Langkah 4.3**: Buat server action untuk menyimpan data permission terpilih ke dalam tabel `admin_role_permissions`.
13. **Langkah 4.4**: Implementasikan alur approval: generate credentials, create Supabase auth user, update status ke `active`, dan trigger pengiriman email kredensial.

### Tahap 5: Integrasi Pengecekan Izin (Runtime Enforcement) (Prioritas 🟡)
14. **Langkah 5.1 (Layer 3)**: Modifikasi `layout.tsx` admin agar memfilter menu sidebar hanya untuk halaman yang memiliki izin `view`.
15. **Langkah 5.2 (Layer 1)**: Tambahkan `checkPermission(slug, "view", "page")` di setiap file `page.tsx` admin untuk menghentikan akses langsung via URL bagi yang tidak berwenang.
16. **Langkah 5.3 (Layer 2)**: Update setiap file Client Component (`*Client.tsx`) untuk menerima `permMap` dan menyembunyikan tombol Create/Edit/Delete berdasarkan nilai boolean dari `hasPermission()`.
17. **Langkah 5.4 (Layer 4)**: Tambahkan pengecekan `checkPermission()` di server actions backend untuk mengamankan API/Action dari manipulasi langsung.

### Tahap 6: Pembersihan (Prioritas 🟢)
18. **Langkah 6.1**: Hapus kolom legacy `members.admin_role` lama dari database.
19. **Langkah 6.2**: Lakukan pengujian menyeluruh pada hak akses tiap peran admin.
