# Panduan Pipeline Kompresi Gambar & Supabase Storage

Dokumen ini menjelaskan standar implementasi kompresi gambar di sisi klien (*client-side*) menggunakan HTML5 Canvas, konversi format ke WebP, serta alur pengunggahan (*upload*) ke Supabase Storage pada ekosistem project Panggung Kreator.

---

## 1. Arsitektur & Gambaran Alur

```
[User Memilih File Gambar]
           │
           ▼
[Validasi MIME Type (image/*)]
           │
           ▼
[Kompresi Otomatis (HTML5 Canvas)]
  - Multi-step downscaling (halving) untuk menjaga ketajaman
  - Konversi format ke image/webp (fallback image/jpeg)
  - Penyesuaian dimensi maxW x maxH & quality (default 0.82)
           │
           ▼
[Preview Menggunakan URL.createObjectURL]
           │
           ▼ (Saat Form Disubmit)
[Upload ke Supabase Storage Bucket ('partners' / 'avatars')]
  - Path unik: `<prefix>_<timestamp>_<random>.<ext>`
  - Header content-type & cacheControl
           │
           ▼
[Ambil Public URL via supabase.storage.from(...).getPublicUrl()]
           │
           ├─► [Hapus File Lama / Obsolete di Storage (jika diganti / dihapus)]
           │
           ▼
[Simpan URL ke Database via Server Action]
```

---

## 2. Utilitas Kompresi: `compressImage` (`@/lib/file-compress.ts`)

Fungsi `compressImage` melakukan kompresi dan downscaling cerdas tanpa dependensi pihak ketiga yang berat:

```typescript
import { compressImage } from "@/lib/file-compress";

// Signature:
compressImage(
  file: File,
  maxW: number = 1920,
  maxH: number = 1080,
  quality: number = 0.8
): Promise<File>;
```

### Keunggulan:
1. **Multi-Step Downscaling**: Mencegah efek *aliasing* atau gambar buram ketika gambar resolusi sangat tinggi (misal: foto kamera 4K/4000px) diturunkan ke ukuran thumbnail/logo (<1000px).
2. **Modern WebP Output**: Mengutamakan format WebP untuk rasio kompresi tinggi dengan kualitas visual optimal, dengan fallback ke JPEG jika browser tidak mendukung.
3. **Safe Bypass**: Melewati file vektor SVG atau animasi GIF tanpa merusak animasi aslinya.
4. **Size Guard**: Jika hasil kompresi ternyata tidak lebih kecil atau dimensi tidak berubah, file asli tetap dipertahankan.

---

## 3. Implementasi pada Komponen Form (Contoh: `AddPartnerClient.tsx`)

### A. State Management
```typescript
const [existingLogo, setExistingLogo] = useState<string>(initialData?.logo_url || "");
const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string>(initialData?.logo_url || "");
const [isCompressingLogo, setIsCompressingLogo] = useState(false);

// Bersihkan Blob URL saat unmount untuk mencegah memory leak
React.useEffect(() => {
  return () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
  };
}, [logoPreview]);
```

### B. Handler Pemilihan & Kompresi Berkas
```typescript
const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("File yang dipilih harus berupa gambar.");
      return;
    }

    setIsCompressingLogo(true);
    try {
      // Kompresi logo: batasan 1000x1000 px, kualitas 0.82
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      setNewLogoFile(compressed);
      const previewUrl = URL.createObjectURL(compressed);
      setLogoPreview(previewUrl);
      toast.success(`Logo siap diunggah (${Math.round(compressed.size / 1024)} KB)`);
    } catch (err) {
      console.error("Gagal mengompresi logo:", err);
      setNewLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } finally {
      setIsCompressingLogo(false);
    }
  }
};
```

### C. Handler Penghapusan Logo
```typescript
const handleRemoveLogo = () => {
  if (logoPreview && logoPreview.startsWith("blob:")) {
    URL.revokeObjectURL(logoPreview);
  }
  setNewLogoFile(null);
  setLogoPreview("");
  setExistingLogo("");
};
```

### D. Alur Submit: Upload ke Supabase Storage & Cleanup
```typescript
import { createClient } from "@/lib/supabase/client";

// Pada blok handleSubmit:
let finalLogoUrl = existingLogo;

if (newLogoFile) {
  const supabase = createClient();
  const ext = newLogoFile.name.split(".").pop() || "webp";
  const fileName = `partner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("partners")
    .upload(filePath, newLogoFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: newLogoFile.type || "image/webp",
    });

  if (uploadError) {
    throw new Error("Gagal mengunggah logo: " + uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("partners")
    .getPublicUrl(filePath);

  finalLogoUrl = publicUrl;

  // Bersihkan file logo lama jika sebelumnya sudah ada dan diganti
  if (initialPartner?.logo_url && initialPartner.logo_url !== finalLogoUrl) {
    try {
      const oldPath = initialPartner.logo_url.split("/public/partners/")[1];
      if (oldPath) {
        await supabase.storage.from("partners").remove([decodeURIComponent(oldPath)]);
      }
    } catch (e) {
      console.warn("Gagal membersihkan logo lama:", e);
    }
  }
} else if (!existingLogo && initialPartner?.logo_url) {
  // Jika logo dihapus tanpa mengganti yang baru
  try {
    const supabase = createClient();
    const oldPath = initialPartner.logo_url.split("/public/partners/")[1];
    if (oldPath) {
      await supabase.storage.from("partners").remove([decodeURIComponent(oldPath)]);
    }
  } catch (e) {
    console.warn("Gagal menghapus logo lama:", e);
  }
  finalLogoUrl = "";
}

// Terakhir: panggil Server Action untuk menyimpan finalLogoUrl ke database
await savePartnerAction({
  ...formData,
  logo_url: finalLogoUrl,
});
```

---

## 4. Konfigurasi Kebijakan (RLS) Supabase Storage

Pastikan bucket (misalnya `partners`) memiliki RLS permissions yang sesuai di Supabase:

1. **SELECT (Public Read)**:
   - Target: `bucket_id = 'partners'`
   - Policy: `public` dapat membaca semua berkas (`true`).
2. **INSERT (Auth / Admin Upload)**:
   - Target: `bucket_id = 'partners'`
   - Policy: Pengguna terautentikasi (atau role admin) dapat mengunggah berkas.
3. **DELETE (Auth / Admin Delete)**:
   - Target: `bucket_id = 'partners'`
   - Policy: Pengguna terautentikasi (atau role admin) dapat menghapus berkas usang.
