# README — Dokumentasi Panggung Kreator v2
# Panduan Navigasi Direktori `docs/panggungv2/`

**Versi:** 2.0  
**Dibuat:** Juli 2026  
**Tim:** Bagas (Koordinator), Aldi (Founder)

---

## Tentang Direktori Ini

Direktori `panggungv2/` berisi dokumentasi terbaru Panggung Kreator platform v2 — hasil audit, update, dan integrasi catatan diskusi tim. Dokumen-dokumen ini bersifat **modular** (terpisah per topik) dan **hidup** (diperbarui berkala).

---

## Daftar File

| File | Topik | Deskripsi Singkat |
|---|---|---|
| **PRD.md** | Product Requirement | Dokumen produk lengkap: goals, arsitektur, fitur, user journey, roadmap, KPI |
| **Business.md** | Model Bisnis & Monetisasi | Revenue streams, funnel konversi, skema harga, proyeksi pendapatan |
| **Technical.md** | Arsitektur Teknis | Tech stack, folder structure, kode kritis, database schema, role system |
| **Akademi.md** | Program Akademi | Kurikulum, aset pembelajaran, dashboard member, mentoring system |
| **Community.md** | Ekosistem Komunitas | Profil komunitas, program, segmentasi member, strategi konten |
| **README.md** | Panduan Navigasi | File ini — indeks semua dokumen |

---

## Cara Baca Dokumen

### Jika kamu adalah Founder / Product Lead (Aldi)
Mulai dari: **PRD.md** → **Business.md** → **Akademi.md**

### Jika kamu adalah Koordinator / Analyst (Bagas)
Mulai dari: **PRD.md** → **Technical.md** → **Akademi.md** (bagian analisis database)

### Jika kamu adalah Developer
Mulai dari: **Technical.md** → **PRD.md** (bagian fitur & modul)

### Jika kamu adalah Konten / Program (Aldi)
Mulai dari: **Community.md** → **Akademi.md**

---

## Update Terakhir (Juli 2026)

### Perubahan Utama dari Versi Sebelumnya

1. **Peran & Tanggung Jawab** — Ditambahkan secara eksplisit: Bagas sebagai Koor analisis data, Aldi sebagai pengemasan program
2. **Aset Pembelajaran** — Diinventarisasi lengkap: Pedoman, Modul, eBook, Tulisan Praktikal, Bahan Mentoring
3. **Skema Harga Launching** — Diperjelas per segmen: Priority (diskon Rp100.000), Membership (Rp49.000), Private (gratis), Umum (Rp149.000)
4. **Target Launching Akademi** — Diperjelas: kursus online + integrasi database Priority, Membership, Private
5. **Sistem Monetisasi** — Diperluas: Afiliasi (60:40), Bootcamp, Inhouse Training, Live Host Streaming, Agensi, Workshop
6. **Ekosistem Web** — Diperbarui fungsi tiap domain: Komunitas untuk pitching & talent management, Akademi untuk full mentoring & kursus online

---

## Open Items Kritis

> Semua open item ini perlu keputusan dari Founder sebelum pengerjaan fitur terkait bisa dimulai.

| Prioritas | Topik | Dokumen Terkait |
|---|---|---|
| TINGGI | Online Course: benefit membership atau dijual terpisah? | Akademi.md, PRD.md |
| TINGGI | Integrasi database Priority & Private ke sistem — kapan target? | PRD.md, Technical.md |
| SEDANG | Private Mentoring: sub-paket akademi atau produk sendiri? | Akademi.md, Business.md |
| SEDANG | WA Group Automation: manual admin atau otomatis? | Community.md, PRD.md |
| RENDAH | Analytics Tools: Supabase cukup atau perlu Mixpanel/Posthog? | Technical.md |

---

## Dokumen Pendukung (di luar panggungv2/)

| File | Lokasi | Isi |
|---|---|---|
| `Profil_Komunitas_Panggung_Kreator.md` | `docs/` | Profil resmi komunitas (versi lama) |
| `New Concept 387e...` | `docs/` | Konsep arsitektur 3-domain (versi lengkap dengan kode) |
| `implementation_plan_25_june.md` | `docs/` | Implementation plan teknis detail (June 2026) |
| `db_implementation.md` | `docs/database/` | Panduan migrasi database dev → prod |
| `contentofwebkomunitas.md` | `docs/` | Content plan web komunitas per halaman |

---

## Konvensi Penulisan

- **Status:** ✅ Selesai | 🔄 In Progress | ⬜ Belum Dimulai | 🔜 Future
- **Urgency:** TINGGI (blocker) | SEDANG (penting tapi tidak blocker) | RENDAH (nice to have)
- Setiap dokumen menggunakan format tabel untuk kemudahan scan
- Update tanggal di header setiap kali ada perubahan signifikan

---

*Panggung Kreator — 1 Stage, 1 Progress. Mari Bertumbuh Bersama.*
