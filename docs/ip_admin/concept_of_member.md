# Konsep Sistem Keanggotaan (Member) Panggung Kreator

> **Versi:** 1.0  
> **Tanggal:** 30 Juni 2026  
> **Status:** Konsep Final (Untuk Implementasi)

---

## 1. Gambaran Besar Ekosistem

Ekosistem keanggotaan Panggung Kreator terdiri dari **dua komunitas yang berjalan bersamaan** namun memiliki jalur tersendiri. Keduanya dapat saling terhubung melalui proses peningkatan status (*upgrade*).

```
┌─────────────────────────────────────────┐
│      BERANI TAMPIL BICARA (BTB)         │
│         Side Community                 │
│  • Workshop full praktek               │
│  • Funnel masuk ke PK                  │
└───────────────────┬─────────────────────┘
                    │ upgrade ke membership
                    ▼
┌─────────────────────────────────────────────────────┐
│              PANGGUNG KREATOR (PK)                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           GENERAL MEMBER                   │    │
│  │   (Semua member PK ada di sini)            │    │
│  │   Info: Open Mic, Workshop, Level Up       │    │
│  └─────────────┬──────────────────────────────┘    │
│                │ upgrade                            │
│       ┌────────┴────────┐                           │
│       │                 │                           │
│  ┌────▼─────┐    ┌──────▼──────┐                   │
│  │PRIORITY  │    │ MEMBERSHIP  │                   │
│  │(Earned)  │    │ (Purchased) │                   │
│  │Tdk bayar │    │ Rp 49.000   │                   │
│  └──────────┘    └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Klasifikasi Lengkap Tipe Member

### 2.1 BeraniTampilBicara (`btb`)
**Nama Tampilan:** Berani Tampil Bicara  
**Kode Sistem:** `btb` *(nilai field `community`)*

| Atribut | Keterangan |
|---|---|
| **Ekosistem** | Komunitas terpisah dari PK |
| **Cara Masuk** | Bergabung ke komunitas BTB |
| **Fungsi** | Side community & funnel marketing ke PK |
| **Benefit** | Workshop full praktek |
| **Naik Level** | Harus menjadi `membership` PK. Saat upgrade, member otomatis masuk ke komunitas PK General (`community` berubah ke `panggung_kreator`) |
| **Biaya** | Tidak ada (atau sesuai program BTB) |

---

### 2.2 PanggungKreator General (`general`)
**Nama Tampilan:** Member Panggung Kreator  
**Kode Sistem:** `general` *(nilai field `membership_tier`)*

| Atribut | Keterangan |
|---|---|
| **Ekosistem** | Komunitas utama PK |
| **Cara Masuk** | Bergabung ke WA Group Komunitas PK General |
| **Fungsi** | Menerima informasi event & kegiatan komunitas |
| **Benefit** | Info Sesi Panggung, Level Up Challenge, Open Mic |
| **Naik Level** | Menjadi `priority` (syarat keaktifan) atau `membership` (bayar Rp 49.000) |
| **Biaya** | Gratis |

> Semua member Priority dan Membership juga berada di ekosistem General (komunitas induk).

---

### 2.3 Member Prioritas (`priority`)
**Nama Tampilan:** Member Prioritas  
**Kode Sistem:** `priority` *(nilai field `membership_tier`)*

| Atribut | Keterangan |
|---|---|
| **Ekosistem** | Komunitas utama PK |
| **Cara Masuk** | Memenuhi kriteria keaktifan yang ditetapkan admin |
| **Fungsi** | Disiapkan menjadi Performer, Mentor, dan Public Speaker |
| **Benefit** | Setara akses komunitas Membership, **namun tidak mendapatkan sesi mentoring eksklusif** |
| **Naik Level** | Sudah di tingkat atas. Dapat berlangganan Membership jika ingin akses mentoring (opsional) |
| **Biaya** | **Gratis** — status diperoleh melalui keaktifan, bukan pembayaran |
| **Sifat Status** | *Lifetime* — tidak ada kadaluarsa. Hanya dapat diubah manual oleh admin |

**Kriteria untuk menjadi Member Prioritas:**
- Telah mengikuti minimal **2 kelas** (Panggung 9 dan 10)
- Hadir minimal **3 kali** di acara Open Mic Teman Sepanggung

---

### 2.4 Membership PK (`membership`)
**Nama Tampilan:** Membership Panggung Kreator  
**Kode Sistem:** `membership` *(nilai field `membership_tier`)*

| Atribut | Keterangan |
|---|---|
| **Ekosistem** | Komunitas utama PK |
| **Cara Masuk** | Mendaftar dan membayar Rp 49.000 |
| **Fungsi** | Member aktif dengan akses benefit penuh |
| **Benefit** | **Sesi Mentoring Khusus** + semua benefit General |
| **Biaya** | **Rp 49.000** |
| **Sifat Status** | *Lifetime* — **tidak ada tanggal kadaluarsa** untuk saat ini. Sistem berlangganan (*subscription*) direncanakan untuk program **Online Course** di masa depan |

---

## 3. Ringkasan Perbandingan

| | BTB | General | Priority | Membership |
|---|:---:|:---:|:---:|:---:|
| **Kode Ekosistem** | `btb` | `panggung_kreator` | `panggung_kreator` | `panggung_kreator` |
| **Kode Tier** | `free` | `free` | `priority` | `membership` |
| **Biaya** | – | Gratis | Gratis | Rp 49k |
| **Cara Dapat** | Daftar BTB | Daftar PK | Syarat aktif | Bayar |
| **Mentoring Eksklusif** | ❌ | ❌ | ❌ | ✅ |
| **Info Event PK** | ❌ | ✅ | ✅ | ✅ |
| **Open Mic & Workshop PK** | ❌ | ✅ | ✅ | ✅ |
| **Workshop BTB** | ✅ | ❌ | ❌ | ❌ |
| **Status Kadaluarsa** | – | – | Lifetime | Lifetime* |

> *Sistem subscription akan diperkenalkan di masa depan khusus untuk Online Course.

---

## 4. Struktur Database yang Direkomendasikan

Menggunakan **dua field terpisah** pada tabel `members` agar ekosistem dan tingkatan tidak bercampur:

```sql
-- Field 1: Ekosistem / komunitas asal
community: 'panggung_kreator' | 'berani_tampil_bicara'

-- Field 2: Tingkatan dalam komunitasnya
membership_tier: 'free' | 'priority' | 'membership'
```

### Kombinasi nilai yang valid:

| `community` | `membership_tier` | Arti |
|---|---|---|
| `panggung_kreator` | `free` | Member PK General biasa |
| `panggung_kreator` | `priority` | Member Prioritas PK |
| `panggung_kreator` | `membership` | Membership PK (bayar Rp 49k) |
| `berani_tampil_bicara` | `free` | Member BTB aktif |
| ~~`berani_tampil_bicara`~~ | ~~`priority`~~ | ❌ Tidak valid |
| ~~`berani_tampil_bicara`~~ | ~~`membership`~~ | ❌ Tidak valid — jika upgrade, `community` berubah ke `panggung_kreator` |

### Field pendukung lainnya (tabel `members`):

```sql
-- Untuk keperluan masa depan (Online Course subscription)
payment_status:   'unpaid' | 'paid' | 'expired'

-- Audit trail perubahan status
tier_changed_at:  timestamp   -- kapan status terakhir diubah
tier_changed_by:  uuid        -- id admin yang melakukan perubahan
tier_note:        text        -- catatan alasan perubahan status
```

---

## 5. Aturan Bisnis (Business Rules)

1. **BTB → Membership:** Ketika member BTB upgrade ke Membership PK, field `community` diubah ke `panggung_kreator` DAN `membership_tier` diubah ke `membership` secara bersamaan dalam satu transaksi.

2. **Status Priority:** Hanya dapat diubah secara **manual oleh Admin** melalui panel manajemen member. Sistem tidak secara otomatis menaikkan atau menurunkan status Priority.

3. **Status Membership:** Saat ini bersifat *lifetime* tanpa kadaluarsa. Penambahan sistem kadaluarsa akan dilakukan saat fitur Online Course diimplementasikan.

4. **Priority + Membership (bersamaan):** Diperbolehkan secara teknis. Jika member Priority juga membayar Membership, `membership_tier` bernilai `membership`. Tidak perlu field tambahan karena secara bisnis sudah mencakup semua benefit Priority.

5. **Tidak ada downgrade otomatis:** Penurunan status dari `priority` atau `membership` ke `free` hanya dilakukan secara **manual oleh Admin**.

6. **Tidak ada upgrade otomatis:** Kenaikan tier dari `free` ke `priority` juga hanya dilakukan secara **manual oleh Admin** setelah memverifikasi kriteria keaktifan member.

---

## 6. Rencana Implementasi Fitur Admin

### 6.1 Halaman Manajemen Member (`/admin/member`)

**Tabel daftar member dengan kolom:**
- Nama & Foto Avatar
- Username
- Email
- Komunitas (badge: PK / BTB)
- Tier (badge: Free / Priority / Membership)
- Tanggal Bergabung
- Aksi: Edit Status

**Filter tersedia:**
- By `community`: Semua / Panggung Kreator / BTB
- By `membership_tier`: Semua / Free / Priority / Membership
- By `payment_status`: Semua / Paid / Unpaid
- Pencarian: Nama / Username / Email

---

### 6.2 Modal Edit Status Member

```
┌──────────────────────────────────────────┐
│  EDIT STATUS MEMBER                      │
│──────────────────────────────────────────│
│  Nama:  [Nama Member]                    │
│  Email: [email@...]                      │
│                                          │
│  Komunitas:                              │
│  ◉ Panggung Kreator                      │
│  ○ Berani Tampil Bicara                  │
│                                          │
│  Tingkatan (Tier):                       │
│  ◉ General (Free)                        │
│  ○ Priority                              │
│  ○ Membership                            │
│                                          │
│  Catatan Perubahan: [________________]   │
│                                          │
│  [Batal]              [Simpan Status]    │
└──────────────────────────────────────────┘
```

> Perubahan status akan menyimpan `tier_changed_at` (waktu sekarang), `tier_changed_by` (id admin), dan `tier_note` (catatan opsional) secara otomatis ke database.

---

## 7. Catatan untuk Masa Depan

- **Online Course Subscription:** Tambahkan field `subscription_expires_at` dan logika pengecekan kadaluarsa tanpa mengubah struktur `membership_tier` yang sudah ada.
- **Multi-Tier BTB:** Jika BTB nantinya memiliki tingkatan internal (misal: BTB Free vs BTB Premium), field `membership_tier` dapat diperluas dengan nilai tambahan seperti `btb_premium`.
- **Riwayat Perubahan Tier:** Pertimbangkan membuat tabel terpisah `member_tier_history` untuk menyimpan seluruh riwayat perubahan status member sebagai audit log lengkap.
