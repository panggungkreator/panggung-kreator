# Audit & Brainstorm: Struktur Portofolio Member

Berdasarkan analisis terhadap database saat ini (`PortfolioItem`) dan kebutuhan UX profil kreator, berikut adalah hasil audit dan brainstorm mengenai pemisahan **Experience**, **Portofolio**, dan penggunaan **Pilar Kompetensi**.

## 1. Pemisahan "Experience" (Pengalaman) vs "Portofolio" (Karya)
Sangat direkomendasikan untuk **memisahkan** antara Pengalaman dan Portofolio. Keduanya memiliki fungsi dan struktur data yang berbeda:

- **Experience (Pengalaman / Jam Terbang)**
  - **Fokus:** Perjalanan karir, rekam jejak, atau partisipasi event.
  - **Contoh:** "MC Acara Puncak HUT RI ke-78", "Social Media Specialist di PT ABC".
  - **Kebutuhan Data:** Peran/Posisi (Role), Nama Acara/Perusahaan (Institution), Waktu Mulai & Selesai (Start/End Date), Deskripsi Tugas.
  - **Visualisasi:** Cocok ditampilkan dalam bentuk *Timeline* (Garis Waktu) atau *List*.

- **Portofolio (Karya / Deliverables)**
  - **Fokus:** Hasil karya nyata, bukti kemampuan visual/audio.
  - **Contoh:** Video reels Instagram saat sedang presentasi, Artikel Blog, Desain Carousel.
  - **Kebutuhan Data:** Media (Gambar/Video/Link), Judul, Thumbnail.
  - **Visualisasi:** Cocok ditampilkan dalam bentuk *Grid Card* (Galeri).

> **Status Saat Ini:** Database kita hanya memiliki `PortfolioItem`. Kita mungkin perlu menambahkan tabel/tipe baru bernama `ExperienceItem` agar datanya tidak bercampur dan UI-nya bisa disesuaikan.

---

## 2. Apakah Perlu Pemisahan "Pilar Kompetensi"?
(Pilar yang ada: *Public Speaking, Content Creation, Personal Branding*)

**Rekomendasi: TETAP DIPERTAHANKAN, tapi sebagai FILTER/TAG, bukan tembok pemisah yang kaku.**

- **Alasannya:** Pilar kompetensi adalah identitas utama Panggung Kreator. Namun, jika portofolio dipisah secara kaku ke halaman/tab yang berbeda-beda, halaman profil akan terasa kosong jika member hanya fokus di satu pilar. Karya juga seringkali *overlapping* (contoh: Video Reels tentang Public Speaking masuk ke Content Creation atau Public Speaking?).
- **Solusi UI:** Tampilkan **Semua Portofolio** dalam satu halaman galeri, namun berikan **Chip Filter** di bagian atas (All | Public Speaking | Content Creation | Personal Branding). Saat member menginput karya, mereka cukup menandai karya tersebut masuk pilar yang mana.

---

## 3. Apa Lagi yang Perlu Ditambahkan? (Kebutuhan Masa Depan)
Selain Experience dan Portofolio, profil kreator yang profesional biasanya membutuhkan elemen berikut (bisa dipertimbangkan untuk Roadmap selanjutnya):

1. **Achievements / Awards / Certifications (Pencapaian & Sertifikasi)**
   - Saat ini di database sudah ada `item_type: 'achievement'`. Ini bisa dikumpulkan dalam satu section khusus "Prestasi" di bawah portofolio karya.
2. **Services / Jasa yang Ditawarkan**
   - Menjelaskan layanan yang bisa di-hire (misal: MC Wedding, Video Editor, Public Speaking Coach).
3. **Testimonials / Client Reviews**
   - Testimoni tertulis dari klien atau kolaborator sebelumnya. Ini sangat kuat untuk *Personal Branding*.

---

## 💡 Kesimpulan & Usulan Eksekusi (Draft Plan)

Jika setuju dengan pemisahan ini, maka di dalam Tab **"Portofolio"** pada halaman `/myprofile`, isinya akan dibagi menjadi 3 section utama (tinggal di-scroll ke bawah):

1. **Experience (Pengalaman)**
   - Berupa daftar vertikal (Timeline). Member bisa tambah pengalaman kerja/event.
2. **Karya (Portofolio Visual)**
   - Berupa grid foto/video/link. Dilengkapi tombol filter *Pilar Kompetensi*.
3. **Pencapaian & Prestasi (Achievements)**
   - Berupa list/grid kecil untuk sertifikat atau piala.

**Tindakan teknis yang diperlukan jika setuju:**
- Membuat migrasi Supabase baru untuk tabel `member_experiences` (id, member_id, role, company, start_date, end_date, description).
- Menambahkan desain UI untuk Timeline Pengalaman.
- Mengubah fungsi tabel `PortfolioItem` saat ini murni untuk menampung visual (Karya) dan (Achievement).
