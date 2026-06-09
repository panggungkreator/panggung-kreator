-- Run this in your Supabase SQL Editor to create the landing_sections table

CREATE TABLE IF NOT EXISTS landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  section_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read" ON landing_sections 
  FOR SELECT USING (true);

-- Allow admin to insert/update/delete
CREATE POLICY "Admin write" ON landing_sections 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed initial data based on the current page content
INSERT INTO landing_sections (section_type, section_order, content)
VALUES
  ('hero', 1, '{
    "badge": "Bukan Sekadar Belajar Ngomong.",
    "heading1": "Tapi Belajar Gimana Cara",
    "heading2": "Lo Didengar.",
    "paragraphs": [
      "Pernah ngerasa lo punya ide bagus, tapi waktu diomongin malah berantakan? Atau ngerasa kalah saing sama mereka yang aslinya biasa aja, tapi jago ngebungkus kata-kata?",
      "Lo gak sendirian.",
      "Banyak orang kehilangan kesempatan—bukan karena mereka gak mampu, tapi karena mereka gak tahu cara menyampaikannya.",
      "Itulah kenapa Panggung Kreator Akademi ada."
    ],
    "benefits": [
      "Berani bicara di depan orang",
      "Bangun personal branding yang kuat",
      "Punya panggung pertama lo sendiri",
      "Menciptakan panggung untuk karir impian lo sebagai performer, host, speaker, content creator, atau professional yang impactful."
    ],
    "tagline": "Karena hari ini… Kesempatan sering datang bukan ke yang paling pintar. Tapi ke mereka yang berani tampil.",
    "ctaText": "DAFTAR SEKARANG"
  }'),
  ('welcome', 2, '{
    "heading": "Welcome to Panggung Kreator Akademi",
    "subheading": "Tempat dimana orang biasa belajar jadi versi terbaik dirinya lewat komunikasi.",
    "items": [
      "Cara ngomong tanpa blank",
      "Cara bikin orang tertarik dengerin lo",
      "Cara membangun rasa percaya diri",
      "Cara menyampaikan cerita yang relate",
      "Cara membangun personal branding yang autentik",
      "Cara menciptakan peluang lewat komunikasi"
    ],
    "tagline": "Karena di dunia sekarang… orang yang bisa menyampaikan value dirinya dengan baik, akan punya peluang lebih besar."
  }'),
  ('pain_points', 3, '{
    "heading": "Kenapa Banyak Orang Sulit Bertumbuh?",
    "cards": [
      {
        "title": "Takut Dinilai",
        "description": "Takut salah bicara dan selalu memikirkan kritik orang lain sebelum tampil."
      },
      {
        "title": "Overthinking Saat Bicara",
        "description": "Terlalu memikirkan kata demi kata hingga akhirnya nge-blank di panggung."
      },
      {
        "title": "Ngerasa Gak Cukup Bagus",
        "description": "Merasa minder dengan orang lain dan kurang mengapresiasi keunikan diri."
      },
      {
        "title": "Bingung Mulai Personal Branding",
        "description": "Gak tahu harus mulai dari mana dan bagaimana menampilkan citra diri."
      },
      {
        "title": "Punya Skill Tapi Gak Bisa Menjual",
        "description": "Hebat dalam teknis tapi kesulitan mempresentasikan nilai diri ke klien atau atasan."
      },
      {
        "title": "Gak Punya Lingkungan Support",
        "description": "Berada di lingkungan toxic yang menjatuhkan ketika lo mencoba hal baru."
      }
    ],
    "bottomHighlight": "Public Speaking Bukan Bakat. Public Speaking adalah Skill. Dan skill bisa dilatih."
  }'),
  ('curriculum', 4, '{
    "label": "Kurikulum Utama PKA",
    "heading": "Apa yang Akan Lo Pelajari?",
    "cards": [
      {
        "title": "Confident Speaking",
        "items": ["Mengatasi Grogi", "Latihan Intonasi", "Latihan Artikulasi", "Teknik Tampil Pede"]
      },
      {
        "title": "Storytelling & Personal Branding",
        "items": ["Cerita yang Relate", "Pengalaman Hidup", "Image Personal Kuat", "Tampil Autentik"]
      },
      {
        "title": "Performance & Stage Presence",
        "items": ["MC / Host Live", "Content Creator", "Speaker", "Performer", "Freelancer", "Mahasiswa", "Profesional Muda"],
        "subtitle": "Sangat Cocok Untuk:"
      },
      {
        "title": "Communication for Career",
        "items": ["Presentasi Impactful", "Pitching Ide Bisnis", "Networking Bisnis", "Menjual Value Diri"]
      }
    ]
  }'),
  ('target_audience', 5, '{
    "heading": "Siapa yang Cocok Gabung?",
    "items": [
      "Sering takut bicara depan umum",
      "Mau mulai bangun personal branding",
      "Mau lebih percaya diri",
      "Punya mimpi jadi content creator / speaker / performer",
      "Mau lebih jago presentasi",
      "Mau membangun relasi & peluang karir",
      "Ingin bertumbuh bareng lingkungan positif"
    ]
  }'),
  ('community_values', 6, '{
    "label": "This Is More Than A Course",
    "heading": "Ini Bukan Sekadar Kelas. Ini Tempat Lo Bertumbuh.",
    "cards": [
      {
        "title": "Support Proses Lo",
        "description": "Mendukung setiap langkah kecil perkembangan komunikasimu."
      },
      {
        "title": "Gak Nge-Judge",
        "description": "Bebas dari penghakiman atau rasa malu saat kamu masih belajar."
      },
      {
        "title": "Kasih Ruang Berkembang",
        "description": "Memberi panggung penuh untuk mencoba, gagal, dan mencoba lagi."
      },
      {
        "title": "Bikin Berani Tampil",
        "description": "Mendorong batas kepercayaan dirimu hingga siap bersinar."
      }
    ]
  }'),
  ('vision', 7, '{
    "heading": "Bayangin Kalau 6 Bulan Dari Sekarang…",
    "items": [
      "Lebih pede ngomong di depan umum",
      "Lebih jelas menyampaikan isi kepala",
      "Mulai dikenal karena value lo",
      "Punya personal branding yang kuat",
      "Berani tampil depan publik tanpa ragu",
      "Punya circle yang suportif dan bertumbuh",
      "Mulai membuka peluang karir dari skill komunikasi"
    ],
    "bottomText": "Dan semua itu… dimulai dari satu keputusan kecil: Berani mulai."
  }'),
  ('facilities', 8, '{
    "heading": "Fasilitas & Bonus Member",
    "facilities": [
      "Live Class & Mentoring",
      "Komunitas Supportive",
      "Materi Public Speaking",
      "Materi Personal Branding",
      "Latihan Performance",
      "Networking Circle",
      "Challenge & Praktik",
      "Ruang Tampil & Open Mic",
      "Feedback & Evaluasi",
      "Akses Rekaman Pembelajaran"
    ],
    "bonuses": [
      {
        "title": "E-Book Public Speaking",
        "badge": "Premium Guide"
      },
      {
        "title": "Template Personal Branding",
        "badge": "Workbook"
      },
      {
        "title": "Framework Storytelling",
        "badge": "Quick Script"
      },
      {
        "title": "Circle Networking",
        "badge": "Exclusive Access"
      },
      {
        "title": "Kesempatan Tampil di Event Panggung Kreator",
        "badge": "Real Stage Opportunity"
      }
    ]
  }'),
  ('testimonials', 9, '{
    "label": "Social Proof & Alumni Voice",
    "heading": "Mereka Juga Pernah Ada Di Posisi Lo Sekarang.",
    "items": [
      {
        "quote": "Dulu gue takut ngomong depan orang. Sekarang jadi lebih pede presentasi di kampus.",
        "name": "Member PKA",
        "role": "Verified Alumni",
        "initial": "M"
      },
      {
        "quote": "Awalnya cuma pengen belajar ngomong, ternyata jadi lebih ngerti personal branding.",
        "name": "Member PKA",
        "role": "Verified Alumni",
        "initial": "M"
      },
      {
        "quote": "Yang paling berharga bukan cuma ilmunya, tapi lingkungannya.",
        "name": "Member PKA",
        "role": "Verified Alumni",
        "initial": "M"
      },
      {
        "quote": "Gue jadi lebih berani tampil dan mulai bikin konten sendiri.",
        "name": "Member PKA",
        "role": "Verified Alumni",
        "initial": "M"
      }
    ]
  }'),
  ('closing_cta', 10, '{
    "heading": "Dunia gak selalu butuh orang paling sempurna. Tapi dunia butuh orang yang berani tampil.",
    "paragraphs": [
      "Jangan biarkan ketakutan menahan lo lebih lama lagi. Kesempatan demi kesempatan hilang hanya karena lo gak berani ngomong.",
      "Panggung Kreator Akademi bukan cuma tempat belajar bicara, tapi tempat lo menemukan panggung lo sendiri.",
      "Keputusan ada di tangan lo. Apakah lo mau terus jadi penonton, atau lo siap naik ke panggung?",
      "Mari bertumbuh bareng."
    ],
    "ctaText": "DAFTAR SEKARANG"
  }'),
  ('faq', 11, '{
    "label": "FAQ (Frequently Asked Questions)",
    "heading": "Pertanyaan yang Sering Diajukan",
    "items": [
      {
        "question": "Apakah cocok untuk pemula?",
        "answer": "Sangat cocok. Materi dibuat step by step bahkan untuk yang masih takut bicara."
      },
      {
        "question": "Apakah harus sudah jago public speaking?",
        "answer": "Tidak. Justru tempat ini dibuat untuk belajar dan berkembang bersama."
      },
      {
        "question": "Apakah hanya untuk mahasiswa?",
        "answer": "Tidak. Cocok untuk mahasiswa, pekerja muda, freelancer, content creator, dan siapa pun yang ingin berkembang lewat komunikasi."
      },
      {
        "question": "Apakah ada praktik langsung?",
        "answer": "Ada. Karena komunikasi gak cukup dipelajari, tapi harus dilatih secara konsisten."
      },
      {
        "question": "Apakah akan belajar personal branding juga?",
        "answer": "Yes. Karena hari ini kemampuan komunikasi + personal branding adalah kombinasi penting untuk membangun karir."
      }
    ]
  }'),
  ('footer', 12, '{
    "brandName": "Panggung Kreator Akademi",
    "tagline": "Bicara Bukan Sekadar Skill. Tapi Jalan Untuk Membuka Banyak Panggung Dalam Hidup Lo.",
    "copyright": "© 2026 Panggung Kreator Akademi. All rights reserved.",
    "links": [
      { "label": "Privacy Policy", "url": "#" },
      { "label": "Terms of Service", "url": "#" },
      { "label": "Contact", "url": "#" }
    ]
  }')
ON CONFLICT (section_type) DO NOTHING;
