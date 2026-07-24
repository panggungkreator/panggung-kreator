# Implementation Plan — Admin Roles & Permissions System

> **Versi:** 4.1 (Relational RBAC + Runtime Enforcement)
> **Tanggal:** 3 Juli 2026
> **Status:** Draft — Menunggu Approval
> **Scope:** Arsitektur RBAC relasional, Runtime Permission Enforcement (3 Layer), Self-Onboarding Form, Color Rangers dengan Label, Dynamic Permission Matrix

---

## Changelog

### v4.1 — Runtime Enforcement

| # | Perubahan dari v4.0 |
|---|---|
| 1 | **Runtime RBAC Enforcement (3 Layer)**: Diadopsi dari pola `admin::checkRole()` di [admin.php](file:///e:/Coding/Project/pribadi/bemfisipunpad/library/admin.php#L9-L33), [dsp_list.php](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_list.php#L28-L30), dan [data_mahasiswa.php](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/controllers/data_mahasiswa.php#L19). Diterjemahkan ke Next.js/Supabase dengan 3 lapisan: Page Guard, Button/UI Visibility, dan Sidebar Filter. |

### v4.0 — Relational RBAC

| # | Perubahan dari v3.2 |
|---|---|
| 1 | **Arsitektur RBAC diubah total**: Dari flat `ADMIN_PAGE_REGISTRY` + JSONB menjadi skema relasional ternormalisasi yang diadopsi dari [bemfisipunpad.sql](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/bemfisipunpad.sql). Permission kini tersebar di 4 tabel yang saling berelasi. |
| 2 | **Color Rangers pakai label**: Warna kini memiliki label format "Rangers [Warna]" (contoh: pilih `#db2777` → **Rangers Pink**). |
| 3 | **Frontend registry tetap ada** tapi kini sebagai mirror/cache dari data tabel `privilege_items` — bukan satu-satunya source of truth. |

---

## 1. Latar Belakang & Tujuan

### Referensi Arsitektur: `bemfisipunpad.sql`

Proyek BEM FISIP UNPAD menggunakan 4 tabel relasional untuk RBAC:

| Tabel SQL Lama | Fungsi |
|---|---|
| `build_privileges` | **Grup sidebar** — mengelompokkan halaman (contoh: "User", "Master Data", "Tools") |
| `build_privileges_item` | **Halaman individual** di dalam grup — menyimpan daftar aksi yang tersedia (via `id_priv_acc`) |
| `build_privileges_acc` | **Master aksi** — daftar tipe aksi (View, Create, Update, Delete, dsb.) |
| `build_role_detail` | **Permission per user per halaman per aksi** — 1 baris = 1 izin spesifik |

**Konsep kunci yang diadopsi:**
- Setiap halaman (`privilege_item`) mendefinisikan aksi mana saja yang tersedia di komponen UI-nya — jika halaman tidak punya tombol Delete di UI, maka aksi Delete tidak pernah terdaftar untuk halaman itu, sehingga izin Delete otomatis tidak ada.
- Permission bersifat **granular per user**: bukan template role, tapi assignment individual per halaman per aksi.

### Tujuan sistem baru

1. **Self-Onboarding**: Calon admin mendaftarkan diri sendiri, isi data dari nol + pilih Color Rangers.
2. **Admin-Centric Setup**: Super Admin meninjau pendaftaran, isi label jabatan, set permission per halaman, lalu approve & kirim email kredensial login.
3. **Dynamic RBAC Relasional**: Tabel `privilege_items` menyimpan aksi yang tersedia per halaman (berdasarkan komponen UI yang aktif). Form hak akses membaca tabel ini secara dinamis — bukan hardcode. Jika tombol Delete tidak ada di halaman, checkbox Delete tidak muncul.
4. **Color Rangers Eksklusif dengan Label**: Setiap admin punya warna unik dengan format label "Rangers [Warna]".

---

## 2. Desain Database — Skema RBAC Relasional

### 2.1 Pemetaan dari SQL Lama ke Supabase Baru

| Tabel Lama (MySQL) | Tabel Baru (Supabase) | Keterangan |
|---|---|---|
| `build_privileges` | `privilege_groups` | Grup sidebar (DATA CENTER, AKADEMI, dll.) |
| `build_privileges_acc` | `privilege_actions` | Master aksi (view, create, edit, delete) |
| `build_privileges_item` | `privilege_items` | Halaman + aksi yang tersedia per halaman |
| `build_role_detail` | `admin_role_permissions` | Izin spesifik per admin per halaman per aksi |
| `build_user` + `build_role` | `admin_roles` (+ `members`) | Data admin + metadata (color, status, label) |

### 2.2 Tabel `privilege_groups` — Grup Sidebar

```sql
CREATE TABLE privilege_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,              -- "DATA CENTER", "AKADEMI", dll.
  slug       text NOT NULL UNIQUE,       -- "data_center", "akademi", dll.
  icon       text,                       -- opsional: icon class/name
  sort_order int NOT NULL DEFAULT 0,
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);
```

**Seed data:**

| slug | name | sort_order |
|------|------|:----------:|
| `data_center` | DATA CENTER | 1 |
| `akademi` | AKADEMI | 2 |
| `komunitas` | KOMUNITAS | 3 |
| `cms` | CMS | 4 |
| `analytics` | ANALYTICS | 5 |
| `system` | SYSTEM | 6 |

### 2.3 Tabel `privilege_actions` — Master Aksi

```sql
CREATE TABLE privilege_actions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,        -- "View", "Create", "Edit", "Delete"
  slug       text NOT NULL UNIQUE,  -- "view", "create", "edit", "delete"
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Seed data:**

| slug | name | sort_order |
|------|------|:----------:|
| `view` | View | 1 |
| `create` | Create | 2 |
| `edit` | Edit | 3 |
| `delete` | Delete | 4 |

### 2.4 Tabel `privilege_items` — Halaman + Aksi yang Tersedia

Ini adalah **jantung** Dynamic RBAC. Setiap baris mendefinisikan satu halaman admin dan aksi mana saja yang tersedia di komponen UI-nya.

```sql
CREATE TABLE privilege_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid NOT NULL REFERENCES privilege_groups(id) ON DELETE CASCADE,
  name            text NOT NULL,                -- "Membership", "Packages", dll.
  slug            text NOT NULL UNIQUE,          -- page slug: "members", "packages", dll.
  available_actions uuid[] NOT NULL DEFAULT '{}', -- Array of privilege_actions.id yang tersedia
  sort_order      int NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      timestamptz DEFAULT now()
);
```

**Cara kerja `available_actions`:**
- Kolom ini menyimpan **array UUID** dari `privilege_actions.id` yang tersedia di halaman tersebut.
- Ini adalah adaptasi modern dari `build_privileges_item.id_priv_acc` (comma-separated string) pada SQL lama.
- Jika halaman `transactions` hanya punya View dan tidak punya Create/Edit/Delete di komponen UI-nya, maka `available_actions` hanya berisi `[view_uuid]`.
- **Jika tombol Delete tidak ada di UI halaman**, maka `delete_uuid` tidak ada di `available_actions` → sehingga izin Delete tidak akan pernah muncul di form hak akses untuk halaman tersebut.

**Seed data (berdasarkan riset komponen UI aktual):**

| Grup | slug | name | available_actions |
|------|------|------|---|
| DATA CENTER | `members` | Membership | `[view, edit]` — Edit status/tier via modal. No create/delete |
| DATA CENTER | `transactions` | Transactions | `[view]` — View Only |
| DATA CENTER | `attendance` | Attendance | `[view, create]` — Create = catat manual |
| AKADEMI | `packages` | Packages | `[view, create, edit, delete]` — CRUD penuh |
| AKADEMI | `voucher` | Voucher | `[view, create, edit, delete]` — CRUD penuh |
| AKADEMI | `payment` | Payment | `[view]` — View Only + konfirmasi status |
| AKADEMI | `mentoring` | Mentoring | `[view, create, edit]` — Tidak ada Delete |
| AKADEMI | `resources` | Resources | `[view, create, edit, delete]` — CRUD penuh |
| KOMUNITAS | `acara` | Acara & Event | `[view, create, delete]` — Edit di sub-halaman |
| KOMUNITAS | `venue` | Venue | `[view, create, edit, delete]` — CRUD penuh |
| KOMUNITAS | `partner` | Partner | `[view, create, edit, delete]` — CRUD penuh |
| CMS | `cms_komunitas` | Landing Komunitas | `[view, create, edit, delete]` |
| CMS | `cms_akademi` | Landing Akademi | `[view, create, edit, delete]` |
| CMS | `cms_galeri` | Kelola Galeri | `[view, create, edit, delete]` |
| CMS | `media_library` | Media Library | `[view, create, delete]` — No edit file |
| ANALYTICS | `analytics` | Analytics | `[view]` — Read-only |
| SYSTEM | `system` | System & Logs | `[view, create, edit, delete]` |

### 2.5 Tabel `admin_roles` — Data Admin (tetap sama)

```sql
CREATE TABLE admin_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  label        text,                     -- Diisi oleh Super Admin saat approve
  color        text NOT NULL DEFAULT 'slate',
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'active', 'revoked')),
  approved_by  uuid REFERENCES members(id) ON DELETE SET NULL,
  approved_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Warna eksklusif per admin aktif
CREATE UNIQUE INDEX admin_roles_color_unique_active
  ON admin_roles(color) WHERE status != 'revoked';
```

> **Perubahan penting**: Kolom `permissions JSONB` **dihapus** dari `admin_roles`. Permission kini disimpan di tabel relasional `admin_role_permissions`.

### 2.6 Tabel `admin_role_permissions` — Izin Granular per Admin

Ini adalah adaptasi dari `build_role_detail`. Setiap baris = **satu izin spesifik** untuk satu admin pada satu halaman dengan satu aksi.

```sql
CREATE TABLE admin_role_permissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role_id   uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  privilege_item_id uuid NOT NULL REFERENCES privilege_items(id) ON DELETE CASCADE,
  action_id       uuid NOT NULL REFERENCES privilege_actions(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),

  -- Satu admin tidak bisa punya duplikat permission untuk halaman+aksi yang sama
  UNIQUE (admin_role_id, privilege_item_id, action_id)
);
```

**Cara kerja:**
- Jika admin "Budi" punya akses View + Create di halaman Packages, maka ada **2 baris**:
  - `(budi_role_id, packages_item_id, view_action_id)`
  - `(budi_role_id, packages_item_id, create_action_id)`
- Jika Budi tidak punya akses Delete di Packages, maka **tidak ada baris** untuk `delete_action_id`.
- Ini sama persis dengan pola `build_role_detail` di SQL lama yang menyimpan `(id_role, page, role)` per baris.

### 2.7 Constraint Keunikan Data `members`

```sql
-- 1 email, 1 no WA, 1 username = 1 data. Tidak boleh double.
ALTER TABLE members ADD CONSTRAINT members_email_key UNIQUE (email);
ALTER TABLE members ADD CONSTRAINT members_whatsapp_number_key UNIQUE (whatsapp_number);
ALTER TABLE members ADD CONSTRAINT members_username_key UNIQUE (username);
```

### 2.8 Diagram Relasi Lengkap

```
privilege_groups                  privilege_actions
  ├── id (PK)                      ├── id (PK)
  ├── name                         ├── name ("View", "Create", ...)
  ├── slug                         ├── slug ("view", "create", ...)
  └── sort_order                   └── sort_order
       │                                │
       │ 1:N                            │ referenced in
       ▼                                │
privilege_items                         │
  ├── id (PK)                           │
  ├── group_id (FK → privilege_groups)  │
  ├── name ("Membership", ...)          │
  ├── slug ("members", ...)             │
  ├── available_actions (uuid[])  ──────┘  ← Array of action IDs yang tersedia
  └── sort_order                            (jika delete tidak ada di UI, tidak ada di array)
       │
       │ referenced in
       ▼
admin_role_permissions                  admin_roles
  ├── id (PK)                            ├── id (PK)
  ├── admin_role_id (FK → admin_roles) ──┤── member_id (FK → members, UNIQUE)
  ├── privilege_item_id (FK → privilege_items)  ├── label (diisi Super Admin)
  ├── action_id (FK → privilege_actions)        ├── color (slug, unik per aktif)
  └── UNIQUE(admin_role_id, item_id, action_id) ├── status ('pending'|'active'|'revoked')
                                                 └── approved_by, approved_at
                                                      │
                                            members ◄──┘
                                              ├── id (PK)
                                              ├── full_name
                                              ├── stage_name
                                              ├── email (UNIQUE)
                                              ├── whatsapp_number (UNIQUE)
                                              ├── username (UNIQUE)
                                              └── ...
```

---

## 3. Color Rangers — Label Format "Rangers [Warna]"

### 3.1 Daftar 11 Warna dengan Label

| Slug | Hex | Label |
|------|-----|-------|
| `violet` | `#7c3aed` | **Rangers Violet** |
| `blue` | `#2563eb` | **Rangers Blue** |
| `cyan` | `#0891b2` | **Rangers Cyan** |
| `emerald` | `#059669` | **Rangers Emerald** |
| `lime` | `#65a30d` | **Rangers Lime** |
| `amber` | `#d97706` | **Rangers Amber** |
| `orange` | `#ea580c` | **Rangers Orange** |
| `rose` | `#e11d48` | **Rangers Rose** |
| `pink` | `#db2777` | **Rangers Pink** |
| `slate` | `#475569` | **Rangers Slate** |
| `yellow` | `#ca8a04` | **Rangers Yellow** |

Contoh penggunaan label: Jika admin memilih warna `#db2777`, maka di tabel admin dan badge sidebar akan ditampilkan **"Rangers Pink"**.

### 3.2 Konstanta `COLOR_RANGERS` (`lib/constants.ts`)

```typescript
export const COLOR_RANGERS = {
  violet:  { hex: "#7c3aed", label: "Rangers Violet"  },
  blue:    { hex: "#2563eb", label: "Rangers Blue"    },
  cyan:    { hex: "#0891b2", label: "Rangers Cyan"    },
  emerald: { hex: "#059669", label: "Rangers Emerald" },
  lime:    { hex: "#65a30d", label: "Rangers Lime"    },
  amber:   { hex: "#d97706", label: "Rangers Amber"   },
  orange:  { hex: "#ea580c", label: "Rangers Orange"  },
  rose:    { hex: "#e11d48", label: "Rangers Rose"    },
  pink:    { hex: "#db2777", label: "Rangers Pink"    },
  slate:   { hex: "#475569", label: "Rangers Slate"   },
  yellow:  { hex: "#ca8a04", label: "Rangers Yellow"  },
} as const;

export type ColorRangerSlug = keyof typeof COLOR_RANGERS;

export function colorRangerStyle(slug: ColorRangerSlug) {
  const hex = COLOR_RANGERS[slug]?.hex ?? "#475569";
  return {
    backgroundColor: hex + "18",
    color: hex,
    border: `1px solid ${hex}35`,
  };
}
```

### 3.3 Logika Eksklusivitas Warna (tidak berubah)

- Query `SELECT color FROM admin_roles WHERE status != 'revoked'`
- Warna yang sudah terpakai → disabled (greyed-out, tooltip nama pemilik)
- Constraint DB level: `CREATE UNIQUE INDEX ON admin_roles(color) WHERE status != 'revoked'`

---

## 4. Self-Onboarding Form (tidak berubah dari v3.2)

### 4.1 Konsep

Calon admin mengisi **semua data dari nol** (kecuali username, password, dan label jabatan). Username & password di-generate otomatis saat Super Admin approve.

### 4.2 Field Formulir

| Field | Kolom di DB | Wajib | Aturan |
|-------|------------|:-----:|--------|
| **Nama Lengkap** | `members.full_name` | ✓ | — |
| **Nama Panggung** | `members.stage_name` | ✓ | — |
| **Email** | `members.email` | ✓ | **UNIQUE** — 1 email = 1 data |
| **Nomor WhatsApp** | `members.whatsapp_number` | ✓ | **UNIQUE** — 1 no WA = 1 data |
| **Instagram** | `members.instagram_username` | — | Opsional |
| **TikTok** | `members.tiktok_username` | — | Opsional |
| **Pekerjaan/Profesi** | `members.occupation` | ✓ | Select |
| **Color Rangers** | `admin_roles.color` | ✓ | Eksklusif — yang terpakai di-disabled |

**Tidak diisi di form:**
- ❌ Username → auto-generate saat approve
- ❌ Password → auto-generate saat approve
- ❌ Label Jabatan → diisi Super Admin di halaman Detail

### 4.3 Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  DAFTAR SEBAGAI ADMIN PANGGUNG KREATOR                       │
│──────────────────────────────────────────────────────────────│
│                                                              │
│  DATA IDENTITAS & KONTAK                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Nama Lengkap *   [_______________________________]    │  │
│  │  Nama Panggung *  [_______________________________]    │  │
│  │  Email *          [_______________________________]    │  │
│  │  No. WhatsApp *   [_______________________________]    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  DATA PROFESI & MEDIA SOSIAL                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Profesi *        [Pilih profesi...             ▼]    │  │
│  │  Instagram        [@______________________________]    │  │
│  │  TikTok           [@______________________________]    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  PILIH IDENTITAS WARNA (Color Rangers) *                     │
│  Setiap warna bersifat eksklusif & memiliki label sendiri   │
│                                                              │
│  [● Rangers Violet]  [● Rangers Blue]   [● Rangers Cyan]    │
│  [● Rangers Emerald] [● Rangers Lime]   [● Rangers Amber]   │
│  [✗ Rangers Orange*] [● Rangers Rose]   [● Rangers Pink]    │
│  [● Rangers Slate]   [● Rangers Yellow]                      │
│  (* Rangers Orange sudah dipakai — tidak bisa dipilih)       │
│                                                              │
│  [ Ajukan Permintaan Akses Admin ]                           │
│                                                              │
│  ℹ️  Permintaanmu akan ditinjau oleh Super Admin.             │
│      Akses login akan dikirim via email setelah disetujui.   │
└──────────────────────────────────────────────────────────────┘
```

### 4.4 Alur Submit (Pencegahan Data Ganda)

```
User submit form
  │
  ├─→ Validasi Duplikasi:
  │     SELECT EXISTS(SELECT 1 FROM members WHERE email = :email
  │       OR whatsapp_number = :whatsapp_number)
  │     Jika TRUE → Error: "Email atau Nomor WhatsApp sudah terdaftar!"
  │
  ├─→ INSERT INTO members (
  │     full_name, stage_name, email, whatsapp_number,
  │     instagram_username, tiktok_username, occupation,
  │     role='member', membership_tier='free', username=NULL
  │   )
  │
  ├─→ INSERT INTO admin_roles (member_id, color, status='pending', label=NULL)
  │
  └─→ Halaman sukses:
        "Pendaftaran berhasil! Super Admin akan mengirimkan
         detail login (username & password) ke email Anda."
```

---

## 5. Admin-Centric Setup — Alur Super Admin (tidak berubah dari v3.2)

### 5.1 Flowchart End-to-End

```
[Calon Admin]                         [Super Admin]
     │                                      │
     ├─→ Isi Self-Onboarding Form           │
     ├─→ Submit → status 'pending'          │
     │                                      │
     │                              ┌───────┴──────────────────┐
     │                              │ /admin/admins            │
     │                              │ Badge: "2 Pending"       │
     │                              │ [●] Budi Santoso  PENDING│
     │                              │     [Detail] [Revoke]    │
     │                              └──────────┬───────────────┘
     │                                         │ klik "Detail"
     │                              ┌──────────▼───────────────┐
     │                              │ /admin/admins/[id]       │
     │                              │                          │
     │                              │ Masukkan Label Jabatan   │
     │                              │ [input: Tim Konten]      │
     │                              │                          │
     │                              │ PERMISSION MATRIX        │
     │                              │ (dari privilege_items)   │
     │                              │ [checkbox per aksi...]   │
     │                              │                          │
     │                              │ [Approve & Kirim Akses]  │
     │                              └──────────┬───────────────┘
     │                                         │
     │                              SISTEM:
     │                              1. Generate username unik
     │                              2. Generate temp password
     │                              3. Create Supabase Auth user
     │                              4. INSERT admin_role_permissions
     │                              5. UPDATE admin_roles → 'active'
     │                              6. UPDATE members.username
     │                              7. Kirim Email (username + pass)
     │                                         │
     ←─── Terima Email Login ──────────────────┘
     │
     ├─→ Login ke Web Admin
     └─→ Ubah Username & Password di Profil
```

### 5.2 Perubahan Tabel di `/admin/admins`

| Kolom | Sumber | Keterangan |
|-------|--------|-----------|
| **● Label Rangers + Nama** | `admin_roles.color` + `members.full_name` | Contoh: "● Rangers Pink · Budi Santoso" |
| **Label Jabatan** | `admin_roles.label` | Diisi Super Admin |
| **Email** | `members.email` | |
| **WhatsApp** | `members.whatsapp_number` | |
| **Status** | `admin_roles.status` | PENDING / ACTIVE / REVOKED |
| **Terdaftar** | `admin_roles.created_at` | |
| **Aksi** | — | Tombol **Detail** + **Revoke** |

### 5.3 Filter Bar

```
[🔍 Cari nama/email...]  [● Filter Warna ▼]  [Filter Status ▼]
```

---

## 6. Dynamic RBAC — Cara Permission Matrix Bekerja

### 6.1 Arsitektur 3 Lapis

```
LAYER 1: privilege_items.available_actions
  │  Sumber kebenaran: aksi apa saja yang TERSEDIA di setiap halaman
  │  Diupdate ketika komponen UI berubah (misal: tombol Delete ditambahkan/dihapus)
  │
  ▼
LAYER 2: Form Permission Matrix (Detail Admin)
  │  Membaca privilege_items → render checkbox HANYA untuk aksi yang tersedia
  │  Super Admin centang → INSERT ke admin_role_permissions
  │
  ▼
LAYER 3: Sidebar + Enforcement (layout.tsx + halaman)
     Membaca admin_role_permissions → sembunyikan menu jika tidak punya 'view'
     Guard aksi di halaman jika tidak punya 'create'/'edit'/'delete'
```

### 6.2 Query untuk Render Permission Matrix

```sql
-- Ambil semua halaman + aksi yang tersedia, dikelompokkan per grup
SELECT
  pg.name AS group_name,
  pg.slug AS group_slug,
  pi.id AS item_id,
  pi.name AS item_name,
  pi.slug AS item_slug,
  pi.available_actions,
  pa.id AS action_id,
  pa.name AS action_name,
  pa.slug AS action_slug
FROM privilege_items pi
JOIN privilege_groups pg ON pi.group_id = pg.id
CROSS JOIN privilege_actions pa
WHERE pi.status = 'active'
  AND pg.status = 'active'
  AND pa.id = ANY(pi.available_actions)   -- ← KUNCI: hanya aksi yang tersedia
ORDER BY pg.sort_order, pi.sort_order, pa.sort_order;
```

Hasilnya:

| group_name | item_name | action_name |
|---|---|---|
| DATA CENTER | Membership | View |
| DATA CENTER | Membership | Edit |
| DATA CENTER | Transactions | View |
| DATA CENTER | Attendance | View |
| DATA CENTER | Attendance | Create |
| AKADEMI | Packages | View |
| AKADEMI | Packages | Create |
| AKADEMI | Packages | Edit |
| AKADEMI | Packages | Delete |
| ... | ... | ... |

> Perhatikan: Transactions hanya muncul dengan "View" — tidak ada Create/Edit/Delete karena `available_actions` hanya berisi `[view_uuid]`.

### 6.3 Pseudo-code Form Permission Matrix

```tsx
// AdminDetailClient.tsx
// 1. Fetch privilege structure
const { data: items } = await supabase
  .from('privilege_items')
  .select(`
    id, name, slug, available_actions,
    privilege_groups ( name, slug, sort_order ),
    privilege_actions!inner ( id, name, slug )
  `)
  .eq('status', 'active')
  .order('sort_order');

// 2. Fetch existing permissions for this admin
const { data: existingPerms } = await supabase
  .from('admin_role_permissions')
  .select('privilege_item_id, action_id')
  .eq('admin_role_id', adminRoleId);

// 3. Build lookup set
const permSet = new Set(
  existingPerms.map(p => `${p.privilege_item_id}:${p.action_id}`)
);

// 4. Render matrix
{groupedItems.map(group => (
  <section key={group.slug}>
    <h3>{group.name}</h3>
    <table>
      <thead>
        <tr>
          <th>Halaman</th>
          <th>View</th><th>Create</th><th>Edit</th><th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {group.items.map(item => (
          <tr key={item.slug}>
            <td>{item.name}</td>
            {['view','create','edit','delete'].map(actionSlug => {
              const action = allActions.find(a => a.slug === actionSlug);
              const isAvailable = item.available_actions.includes(action.id);
              const isGranted = permSet.has(`${item.id}:${action.id}`);

              return (
                <td key={actionSlug}>
                  {isAvailable ? (
                    <Checkbox
                      checked={isGranted}
                      onCheckedChange={v => togglePerm(item.id, action.id, v)}
                    />
                  ) : (
                    <span className="text-muted">—</span>  // Aksi tidak tersedia
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
))}
```

### 6.4 Save Permission — INSERT/DELETE Rows

Saat Super Admin klik "Simpan":

```typescript
// Hapus semua permission lama untuk admin ini
await supabase
  .from('admin_role_permissions')
  .delete()
  .eq('admin_role_id', adminRoleId);

// Insert permission baru (hanya yang dicentang)
const rows = checkedPermissions.map(p => ({
  admin_role_id: adminRoleId,
  privilege_item_id: p.itemId,
  action_id: p.actionId,
}));

await supabase.from('admin_role_permissions').insert(rows);
```

### 6.5 Sidebar — Membaca Permission Relasional

```typescript
// layout.tsx
const { data: perms } = await supabase
  .from('admin_role_permissions')
  .select(`
    privilege_items!inner ( slug ),
    privilege_actions!inner ( slug )
  `)
  .eq('admin_role_id', currentAdminRoleId);

// Build lookup: { "members": ["view","edit"], "packages": ["view","create","edit","delete"] }
const permMap: Record<string, string[]> = {};
perms?.forEach(p => {
  const pageSlug = p.privilege_items.slug;
  const actionSlug = p.privilege_actions.slug;
  if (!permMap[pageSlug]) permMap[pageSlug] = [];
  permMap[pageSlug].push(actionSlug);
});

// Filter sidebar: hanya tampilkan halaman yang punya 'view'
const filteredNavGroups = staticNavGroups
  .map(group => ({
    ...group,
    items: group.items.filter(item => permMap[item.module]?.includes('view')),
  }))
  .filter(group => group.items.length > 0);
```

### 6.6 Wireframe Detail Panel per Admin

```
/admin/admins/[id]
┌─────────────────────────────────────────────────────────────┐
│  ← Kembali ke Daftar Admin                                  │
│─────────────────────────────────────────────────────────────│
│  PROFIL ADMIN                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [● Rangers Emerald]  Budi Santoso                   │   │
│  │  budi@gmail.com · 08123456789                        │   │
│  │  Instagram: @budi.kreator · TikTok: @budi            │   │
│  │  Profesi: Mahasiswa · Bergabung: 1 Jan 2026          │   │
│  │                                                      │   │
│  │  Label Jabatan: [Tim Konten                  ]       │   │
│  │  (Diisi oleh Super Admin)                            │   │
│  │                                                      │   │
│  │  Status: [● PENDING] → [Approve & Kirim Akses]       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  HAK AKSES PER HALAMAN                                      │
│  (dirender dari tabel privilege_items + privilege_actions)   │
│                                                             │
│  DATA CENTER                                                │
│  ┌──────────────┬──────┬────────┬──────┬────────┐          │
│  │ Halaman      │ View │ Create │ Edit │ Delete │          │
│  ├──────────────┼──────┼────────┼──────┼────────┤          │
│  │ Membership   │  ☐  │   —    │  ☐  │   —    │          │
│  │ Transactions │  ☐  │   —    │   — │   —    │          │
│  │ Attendance   │  ☐  │   ☐    │   — │   —    │          │
│  └──────────────┴──────┴────────┴──────┴────────┘          │
│                                                             │
│  AKADEMI                                                    │
│  ┌──────────────┬──────┬────────┬──────┬────────┐          │
│  │ Packages     │  ☐  │   ☐    │  ☐  │   ☐    │          │
│  │ Voucher      │  ☐  │   ☐    │  ☐  │   ☐    │          │
│  │ Payment      │  ☐  │   —    │   — │   —    │          │
│  │ Mentoring    │  ☐  │   ☐    │  ☐  │   —    │          │
│  │ Resources    │  ☐  │   ☐    │  ☐  │   ☐    │          │
│  └──────────────┴──────┴────────┴──────┴────────┘          │
│  (... dan seterusnya: KOMUNITAS, CMS, ANALYTICS, SYSTEM)   │
│                                                             │
│  [Ubah Warna Ranger]  [Simpan Permission]  [Revoke Akses]  │
└─────────────────────────────────────────────────────────────┘
```

### 6.7 Runtime RBAC Enforcement — 3 Layer Pengecekan

Diadopsi dari pola PHP `admin::checkRole()` di proyek BEM FISIP UNPAD. Setiap aksi di UI harus dicek izinnya secara runtime, bukan hanya saat render form permission.

#### Referensi PHP Asli

| Layer | File PHP | Kode | Fungsi |
|-------|----------|------|--------|
| **Page Guard** | [data_mahasiswa.php:L19](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/controllers/data_mahasiswa.php#L19) | `admin::checkRole("DSPL")` | Cek izin View sebelum halaman dirender. Jika tidak punya → redirect ke `/denied` |
| **Button Visibility** | [dsp_btn_action.php:L14,L26](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_btn_action.php#L14) | `admin::checkRole("CRT","b")` / `admin::checkRole("DEL","b")` | Show/hide tombol Create, Delete berdasarkan izin. Parameter `"b"` = return boolean (tidak redirect) |
| **List/Data Visibility** | [dsp_list.php:L9,L28,L40,L45](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_list.php#L28-L30) | `admin::checkRole("DEL","b")`, `admin::checkRole("UPDT","b")` | Tampilkan/sembunyikan kolom checkbox Delete, tombol Edit, dan kolom Status di setiap baris tabel |
| **Sidebar** | [dsp_sidebar.php:L63,L79](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_sidebar.php#L63) | `admin::checkRoleSidebar()` | Sembunyikan grup dan item menu yang tidak punya izin View |

#### Fungsi `admin::checkRole()` — Logika Inti

```php
// PHP asli: admin.php L9-33
public static function checkRole($roles, $kode="p")
{
    $id_role = db::data_where("id_role","user","id",$id);
    $sql = "SELECT * FROM role_detail
            WHERE role='$roles' AND page='$page' AND id_role='$id_role' LIMIT 1";
    db::query($sql, $rs, $nr);
    if ($nr > 0 OR $auth_id == 'a1') {
        return true;         // Izin ditemukan, atau user adalah master admin
    } else {
        if ($kode == "p") header("location: /denied"); // Page mode → redirect
        if ($kode == "b") return false;                 // Button mode → hide
    }
}
```

**2 mode operasi:**
- **Mode `"p"` (Page Guard)**: Jika tidak punya izin → **redirect ke halaman denied**. Digunakan di controller sebelum halaman dirender.
- **Mode `"b"` (Button Guard)**: Jika tidak punya izin → **return false** (tombol disembunyikan). Digunakan di template untuk show/hide elemen UI.

#### Adaptasi ke Next.js / Supabase — `checkPermission()`

Buat utility function `lib/check-permission.ts` yang menjadi padanan `admin::checkRole()`:

```typescript
// lib/check-permission.ts
import { createClient } from "@/utils/supabase/server";

type PermissionMode = "page" | "button";

/**
 * Cek apakah admin punya izin untuk aksi tertentu di halaman tertentu.
 *
 * Padanan PHP: admin::checkRole($action, $mode)
 * - mode "page"   = PHP "p" → redirect ke /denied jika tidak punya izin
 * - mode "button" = PHP "b" → return boolean (untuk show/hide UI)
 *
 * @param pageSlug  - Slug halaman (misal: "members", "packages")
 * @param action    - Slug aksi (misal: "view", "create", "edit", "delete")
 * @param mode      - "page" (redirect) atau "button" (return boolean)
 */
export async function checkPermission(
  pageSlug: string,
  action: string,
  mode: PermissionMode = "button"
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (mode === "page") redirect("/denied");
    return false;
  }

  // Query: apakah ada baris di admin_role_permissions
  // untuk admin ini, halaman ini, dan aksi ini?
  const { data, error } = await supabase
    .from("admin_role_permissions")
    .select("id")
    .eq("admin_role_id", /* current user's admin_role_id */)
    .eq("privilege_item_id", /* item id from pageSlug */)
    .eq("action_id", /* action id from action slug */)
    .limit(1)
    .maybeSingle();

  const hasPermission = !!data;

  if (!hasPermission && mode === "page") {
    redirect("/admin/denied");
  }

  return hasPermission;
}
```

Untuk efisiensi, buat juga versi batch yang memuat **semua permission sekaligus** untuk satu admin (di-cache per request):

```typescript
// lib/check-permission.ts (lanjutan)

/**
 * Fetch seluruh permission admin saat ini dalam 1 query.
 * Hasilnya berupa Map untuk lookup cepat.
 *
 * Padanan PHP: kombinasi checkRole + checkRoleSidebar
 */
export async function getPermissionMap(
  adminRoleId: string
): Promise<Map<string, Set<string>>> {
  const supabase = await createClient();

  const { data: perms } = await supabase
    .from("admin_role_permissions")
    .select(`
      privilege_items!inner ( slug ),
      privilege_actions!inner ( slug )
    `)
    .eq("admin_role_id", adminRoleId);

  // Hasil: Map<pageSlug, Set<actionSlug>>
  // Contoh: { "members" => Set{"view","edit"}, "packages" => Set{"view","create","edit","delete"} }
  const map = new Map<string, Set<string>>();
  perms?.forEach(p => {
    const page = p.privilege_items.slug;
    const action = p.privilege_actions.slug;
    if (!map.has(page)) map.set(page, new Set());
    map.get(page)!.add(action);
  });

  return map;
}

/**
 * Cek izin dari permission map (tanpa query tambahan).
 * Digunakan di client component setelah map di-pass dari server.
 */
export function hasPermission(
  permMap: Map<string, Set<string>>,
  pageSlug: string,
  action: string
): boolean {
  return permMap.get(pageSlug)?.has(action) ?? false;
}
```

#### Penerapan 3 Layer di Next.js

##### Layer 1: Page Guard (Server Component)

Padanan `admin::checkRole("DSPL")` di [data_mahasiswa.php:L19](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/controllers/data_mahasiswa.php#L19) — redirect jika tidak punya izin View:

```tsx
// app/(admin)/admin/packages/page.tsx (Server Component)
import { checkPermission } from "@/lib/check-permission";

export default async function PackagesPage() {
  // ═══ PAGE GUARD ═══
  // Padanan PHP: admin::checkRole("DSPL")
  // Jika user tidak punya izin 'view' untuk halaman 'packages' → redirect /denied
  await checkPermission("packages", "view", "page");

  // ... fetch data & render
  return <PackagesClient ... />;
}
```

##### Layer 2: Button & UI Visibility (Client Component)

Padanan `admin::checkRole("CRT","b")`, `admin::checkRole("DEL","b")`, `admin::checkRole("UPDT","b")` di [dsp_btn_action.php](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_btn_action.php) dan [dsp_list.php:L9,L28,L40,L45](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_list.php):

```tsx
// app/(admin)/admin/packages/PackagesClient.tsx
import { hasPermission } from "@/lib/check-permission";

interface Props {
  packages: Package[];
  permMap: Map<string, Set<string>>; // Dikirim dari Server Component
}

export default function PackagesClient({ packages, permMap }: Props) {
  // ═══ BUTTON VISIBILITY ═══
  // Padanan PHP: admin::checkRole("CRT","b")
  const canCreate = hasPermission(permMap, "packages", "create");
  // Padanan PHP: admin::checkRole("UPDT","b")
  const canEdit   = hasPermission(permMap, "packages", "edit");
  // Padanan PHP: admin::checkRole("DEL","b")
  const canDelete = hasPermission(permMap, "packages", "delete");

  return (
    <div>
      {/* ═══ Tombol Tambah — hanya muncul jika canCreate ═══ */}
      {/* Padanan PHP: <?php if(admin::checkRole("CRT","b")){?> <a href="/add"> <?php } ?> */}
      {canCreate && (
        <Link href="/admin/packages/create">
          <Plus /> Tambah Package
        </Link>
      )}

      <table>
        <thead>
          <tr>
            {/* ═══ Kolom checkbox Delete — hanya muncul jika canDelete ═══ */}
            {/* Padanan PHP: <?php if(admin::checkRole("DEL","b")){ ?> <th>☐</th> <?php } ?> */}
            {canDelete && <th><Checkbox id="checkall" /></th>}

            {/* ═══ Kolom Edit — hanya muncul jika canEdit ═══ */}
            {/* Padanan PHP: <?php if(admin::checkRole("UPDT","b")){?> <th>&nbsp;</th> <?php } ?> */}
            {canEdit && <th>Aksi</th>}

            <th>Nama</th>
            <th>Harga</th>
            {/* ... kolom lainnya ... */}

            {/* ═══ Kolom tombol Delete per baris ═══ */}
            {/* Padanan PHP L28-30: <?php if(admin::checkRole("DEL","b")){ ?> <th>&nbsp;</th> <?php } ?> */}
            {canDelete && <th>Hapus</th>}
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              {/* ═══ Checkbox select per baris ═══ */}
              {canDelete && <td><Checkbox value={pkg.id} /></td>}

              {/* ═══ Tombol Edit per baris ═══ */}
              {canEdit && (
                <td>
                  <Link href={`/admin/packages/${pkg.id}/edit`}>
                    <Pencil />
                  </Link>
                </td>
              )}

              <td>{pkg.name}</td>
              <td>{pkg.price}</td>

              {/* ═══ Tombol Delete per baris ═══ */}
              {canDelete && (
                <td>
                  <button onClick={() => handleDelete(pkg.id)}>
                    <Trash2 />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ═══ Bulk Delete button ═══ */}
      {canDelete && (
        <button onClick={handleBulkDelete}>
          <Trash2 /> Hapus Terpilih
        </button>
      )}
    </div>
  );
}
```

##### Layer 3: Sidebar Filter (Layout)

Padanan `admin::checkRoleSidebar()` di [dsp_sidebar.php:L63,L79](file:///e:/Coding/Project/pribadi/bemfisipunpad/app/views/template/dsp_sidebar.php#L63):

```tsx
// app/(admin)/admin/layout.tsx
import { getPermissionMap } from "@/lib/check-permission";

// Fetch permission map untuk current admin
const permMap = await getPermissionMap(currentAdminRoleId);

// ═══ SIDEBAR FILTER ═══
// Padanan PHP: admin::checkRoleSidebar($privilege_item['alias'])
const filteredNavGroups = staticNavGroups
  .map(group => ({
    ...group,
    items: group.items.filter(item =>
      // Halaman hanya ditampilkan jika admin punya izin 'view'
      permMap.get(item.module)?.has("view") === true
    ),
  }))
  .filter(group => group.items.length > 0);  // Sembunyikan grup kosong
```

##### Layer 4 (Opsional): Server Action / API Route Guard

Di PHP, pengecekan di controller mencegah akses langsung via URL. Di Next.js, hal yang sama perlu diterapkan di **Server Actions** atau **API Routes**:

```typescript
// app/(admin)/admin/packages/actions.ts
"use server";
import { checkPermission } from "@/lib/check-permission";

export async function createPackage(formData: FormData) {
  // ═══ SERVER ACTION GUARD ═══
  // Meskipun tombol Create sudah hidden di UI, user bisa saja
  // memanggil action ini secara langsung. Harus dicek ulang.
  const allowed = await checkPermission("packages", "create", "button");
  if (!allowed) throw new Error("Tidak memiliki izin untuk membuat package");

  // ... proses create
}

export async function deletePackage(id: string) {
  const allowed = await checkPermission("packages", "delete", "button");
  if (!allowed) throw new Error("Tidak memiliki izin untuk menghapus package");

  // ... proses delete
}
```

#### Ringkasan Pemetaan PHP → Next.js

| PHP | Next.js | Lokasi | Kapan Dijalankan |
|-----|---------|--------|------------------|
| `admin::checkRole("DSPL")` (mode `"p"`) | `await checkPermission(slug, "view", "page")` | **Server Component** (`page.tsx`) | Sebelum halaman dirender — redirect `/denied` jika tidak punya izin |
| `admin::checkRole("CRT","b")` | `hasPermission(permMap, slug, "create")` | **Client Component** (`*Client.tsx`) | Show/hide tombol "Tambah" |
| `admin::checkRole("UPDT","b")` | `hasPermission(permMap, slug, "edit")` | **Client Component** (`*Client.tsx`) | Show/hide tombol "Edit" per baris |
| `admin::checkRole("DEL","b")` | `hasPermission(permMap, slug, "delete")` | **Client Component** (`*Client.tsx`) | Show/hide checkbox & tombol "Delete" per baris |
| `admin::checkRoleSidebar()` | `permMap.get(slug)?.has("view")` | **Layout** (`layout.tsx`) | Filter menu sidebar |
| Controller-level check | `await checkPermission(slug, action, "button")` | **Server Action** / **API Route** | Guard di backend agar user tidak bypass UI |

---

## 7. Frontend Registry (Opsional Cache)

File `lib/admin-page-registry.ts` tetap bisa dipakai sebagai **cache statis** agar frontend tidak perlu query tabel `privilege_items` setiap kali render sidebar. Namun sumber kebenaran utama kini ada di database.

```typescript
// lib/admin-page-registry.ts
// Cache statis — HARUS sinkron dengan data di tabel privilege_items
// Update file ini setiap kali tabel privilege_items berubah

export interface PageCapability {
  slug: string;
  label: string;
  group: string;
  hasView: boolean;   // selalu true
  hasCreate: boolean;
  hasEdit: boolean;
  hasDelete: boolean;
}

export const ADMIN_PAGE_REGISTRY: PageCapability[] = [
  { slug: "members",       label: "Membership",       group: "DATA CENTER", hasView: true, hasCreate: false, hasEdit: true,  hasDelete: false },
  { slug: "transactions",  label: "Transactions",      group: "DATA CENTER", hasView: true, hasCreate: false, hasEdit: false, hasDelete: false },
  { slug: "attendance",    label: "Attendance",        group: "DATA CENTER", hasView: true, hasCreate: true,  hasEdit: false, hasDelete: false },
  { slug: "packages",      label: "Packages",          group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "voucher",       label: "Voucher",           group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "payment",       label: "Payment",           group: "AKADEMI",     hasView: true, hasCreate: false, hasEdit: false, hasDelete: false },
  { slug: "mentoring",     label: "Mentoring",         group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: false },
  { slug: "resources",     label: "Resources",         group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "acara",         label: "Acara & Event",     group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: false, hasDelete: true  },
  { slug: "venue",         label: "Venue",             group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "partner",       label: "Partner",           group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "cms_komunitas", label: "Landing Komunitas", group: "CMS",         hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "cms_akademi",   label: "Landing Akademi",   group: "CMS",         hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "cms_galeri",    label: "Kelola Galeri",     group: "CMS",         hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "media_library", label: "Media Library",     group: "CMS",         hasView: true, hasCreate: true,  hasEdit: false, hasDelete: true  },
  { slug: "analytics",     label: "Analytics",         group: "ANALYTICS",   hasView: true, hasCreate: false, hasEdit: false, hasDelete: false },
  { slug: "system",        label: "System & Logs",     group: "SYSTEM",      hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
];
```

---

## 8. Urutan Pengerjaan

| # | Task | Target | Prioritas |
|---|------|--------|-----------|
| 1 | SQL: Buat tabel `privilege_groups`, `privilege_actions`, `privilege_items` + seed data | Supabase Migration | 🔴 Pertama |
| 2 | SQL: Buat tabel `admin_roles` (tanpa JSONB permissions) + constraint warna | Supabase Migration | 🔴 Pertama |
| 3 | SQL: Buat tabel `admin_role_permissions` | Supabase Migration | 🔴 Pertama |
| 4 | SQL: Tambahkan UNIQUE constraints di `members` (email, wa, username) | Supabase Migration | 🔴 Pertama |
| 5 | SQL: Seed `admin_roles` untuk admin existing + permission rows | Supabase SQL | 🔴 Pertama |
| 6 | Buat `lib/constants.ts` (COLOR_RANGERS dengan label "Rangers [X]") | New File | 🔴 Pertama |
| 7 | Buat `lib/admin-page-registry.ts` (cache statis) | New File | 🟠 Kedua |
| 8 | **Buat `lib/check-permission.ts`** — utility `checkPermission()`, `getPermissionMap()`, `hasPermission()` | New File | 🟠 Kedua |
| 9 | Buat Self-Onboarding: `admins/onboarding/page.tsx` + `OnboardingClient.tsx` | New Files | 🟠 Kedua |
| 10 | Update `admins/page.tsx` — query JOIN privilege tables | Server Component | 🟠 Kedua |
| 11 | Refactor `AdminsClient.tsx` — filter, kolom baru, tombol Detail | Modify | 🟠 Kedua |
| 12 | Buat Detail Page: `admins/[id]/page.tsx` + `AdminDetailClient.tsx` | New Files | 🟠 Kedua |
| 13 | Implement permission matrix di Detail (query `privilege_items` + `admin_role_permissions`) | `AdminDetailClient.tsx` | 🟠 Kedua |
| 14 | Implement approval flow: generate username/password, Supabase Auth, kirim email | API/Server Action | 🟡 Ketiga |
| 15 | Update `layout.tsx` — **sidebar RBAC** (Layer 3) dari `admin_role_permissions` | Modify | 🟡 Ketiga |
| 16 | **Terapkan Layer 1 (Page Guard)**: Tambahkan `checkPermission(slug, "view", "page")` di setiap `page.tsx` admin | Semua `page.tsx` | 🟡 Ketiga |
| 17 | **Terapkan Layer 2 (Button Visibility)**: Kirim `permMap` dari `page.tsx` ke `*Client.tsx`, gunakan `hasPermission()` untuk show/hide tombol CRUD | Semua `*Client.tsx` | 🟡 Ketiga |
| 18 | **Terapkan Layer 4 (Server Action Guard)**: Tambahkan `checkPermission()` di semua server actions yang melakukan mutasi data | Semua `actions.ts` | 🟡 Ketiga |
| 19 | SQL: Drop kolom `members.admin_role` lama | Supabase Migration | 🟢 Terakhir |

---

## 9. Catatan Teknis

- **RLS Policy**:
  - `INSERT` ke `admin_roles` → siapapun yang sudah login (self-onboarding).
  - `SELECT/UPDATE/DELETE` `admin_roles` + `admin_role_permissions` → hanya admin dengan permission `system:edit`.
  - `SELECT` `privilege_*` tabel → semua admin yang sudah login (untuk render form).

- **Guard Super Admin**: Sebelum revoke, cek apakah target satu-satunya admin dengan `system:edit`. Jika iya, blokir.

- **Pending badge**: Badge count di sidebar untuk admin pending.

- **Sinkronisasi registry**: Jika tabel `privilege_items` diubah (misal: halaman baru ditambahkan), file `admin-page-registry.ts` harus diupdate juga agar cache statis sinkron.

- **Backward compatibility**: `members.admin_role` string lama digunakan sebagai fallback selama migrasi.

- **Memperluas aksi di masa depan**: Jika ingin menambahkan aksi baru (misal: "Export", "Approve"), cukup INSERT ke `privilege_actions` dan tambahkan UUID-nya ke `available_actions` di `privilege_items` yang relevan. Sistem otomatis menampilkan checkbox baru di form. Ini keunggulan arsitektur relasional vs flat JSONB.
