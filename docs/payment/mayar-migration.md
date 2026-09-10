# Rencana Integrasi Pembayaran Mayar.id (Telah Diaudit)

Dokumen ini menguraikan langkah-langkah untuk memigrasikan sistem *checkout* manual ke sistem pembayaran otomatis menggunakan Mayar.id. Alur ini telah disesuaikan dengan kondisi aktual *codebase* dan tabel basis data yang saat ini berjalan.

## Ruang Lingkup
Migrasi *checkout* manual ke pembayaran otomatis Mayar.id (Fokus awal: *local-first setup*).

## Kondisi Aktual Sistem Saat Ini (Sebelum Migrasi)
Berdasarkan audit *codebase* (`checkout-actions.ts` dan `referral-actions.ts`), berikut adalah kondisi state pengguna saat melakukan *checkout*:
1. **Saat Pendaftaran (*Checkout*):**
   - Baris pada tabel `members` dibuat dengan `payment_status: 'pending'` dan `membership_tier: 'new_member'`.
   - Baris pada tabel `transactions` dibuat dengan `status: 'pending'`.
   - *Order ID* (misal: `PK-AKAD-123456...`) di-generate dan disimpan ke kolom `payment_order_id` (di `members`) dan `order_id` (di `transactions`).
   - Nominal pembayaran ditambah dengan "kode unik" (3 digit acak).
2. **Saat Konfirmasi Manual (oleh Admin):**
   - Admin memicu aksi konfirmasi pembayaran (`confirmPaymentWithRewardAction`).
   - `transactions.status` diubah menjadi `'paid'`.
   - `members.payment_status` diubah menjadi `'paid'`, dan `members.membership_tier` diperbarui ke tingkat tujuan (umumnya menjadi `'membership'`, atau mengikuti `pkg.tier` jika membeli paket tertentu).
   - Logika komisi *referral* diproses (menambah `commission_balance` referrer, menulis ke `commission_ledger` dan `referral_rewards`).
   - Sistem mengirimkan email pemberitahuan berupa kredensial *login* (berisi email, username, dan password).

## Langkah-langkah Integrasi Mayar

### 1. Persiapan Akun dan Kredensial Mayar
- Buat akun *sandbox*/lokal di Mayar.id.
- Dapatkan kredensial API dan kunci *webhook* (*webhook secret*) dari dasbor *sandbox* Mayar.

### 2. Konfigurasi Variabel Lingkungan
- Tambahkan variabel berikut pada `.env` lokal:
  - `MAYAR_API_KEY`: Kunci otentikasi API.
  - `MAYAR_WEBHOOK_SECRET`: Kunci rahasia untuk validasi *payload webhook*.

### 3. Modifikasi Alur *Checkout* (Pembuatan Tautan Pembayaran)
- Pada proses *checkout* di `checkout-actions.ts`, setelah *Order ID* (seperti `PK-AKAD-...`) dan `transactions` dibuat, lakukan panggilan API ke Mayar untuk membuat *Payment Link* secara dinamis.
- Gunakan *Order ID* lokal sebagai `reference_id` atau `external_id` di Mayar agar transaksi saling tertaut.
- **Penting:** Konfigurasikan parameter API Mayar agar **hanya menerima metode pembayaran QRIS** (QRIS *Only payment*).
- Anda dapat menonaktifkan pembuatan "kode unik" 3 digit lokal karena sistem QRIS Mayar sudah memastikan nilai pembayaran yang presisi secara otomatis.

### 4. Pembuatan Endpoint Webhook (`/api/webhooks/mayar`)
- Buat *endpoint* di `/api/webhooks/mayar` untuk menerima pembaruan dari Mayar secara langsung (*real-time*).
- **Logika Validasi & Pemrosesan:**
  - Verifikasi keamanan *payload* menggunakan `MAYAR_WEBHOOK_SECRET`.
  - Ambil *Order ID* dari *payload* untuk mencari data transaksi pada tabel `transactions`.
- **Kondisi Jika Pembayaran Berhasil (`PAID`/`SUCCESS`):**
  - Pastikan transaksi belum berstatus `paid` untuk mencegah eksekusi ganda.
  - Panggil kembali fungsi atau duplikasi logika dari `confirmPaymentWithRewardAction`:
    - Perbarui `transactions.status` menjadi `'paid'`.
    - Perbarui profil: `members.payment_status` menjadi `'paid'` dan `members.membership_tier` diubah dari `'new_member'` menjadi tier paket (mis. `'membership'`).
    - Lakukan distribusi komisi *referral* (jika transaksi menggunakan kode *referral*).
    - Kirim email konfirmasi berisi kredensial dan kata sandi menggunakan Nodemailer.
- **Kondisi Jika Pembayaran Gagal/Kedaluwarsa (`FAILED`/`EXPIRED`):**
  - Perbarui `transactions.status` menjadi `'expired'` atau `'failed'`.
  - (Opsional) Perbarui `members.payment_status` ke status yang bersesuaian, sehingga profil yang belum terbayar tidak menumpuk dalam keadaan `'pending'` selamanya.

### 5. Pengujian Simulasi E2E (*End-to-End*) Lokal
- Simulasikan *checkout* via aplikasi secara lokal.
- Verifikasi bahwa *Payment Link* yang muncul hanya menyediakan opsi QRIS.
- Gunakan alat *Testing* (simulasi pembayaran sukses/gagal) yang disediakan pada Dasbor Mayar.
- Verifikasi perubahan *state* di database Supabase (perubahan dari `new_member` ke `membership`, komisi referral masuk, dan pengiriman email).
