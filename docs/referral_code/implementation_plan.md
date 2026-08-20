# Implementation Plan: Referral Code System — Panggung Kreator

> **Dibuat:** 17 Agustus 2026  
> **Cakupan:** Audit sistem referral eksisting, analisis gap, dan rencana implementasi fitur referral lengkap dengan reward dinamis, konfirmasi admin, dan notifikasi email otomatis.

---

## 1. Ringkasan Eksekutif

Sistem referral Panggung Kreator saat ini memiliki **dua mekanisme paralel yang belum terintegrasi**: sistem `referral_codes` (didesain di arsitektur awal) dan sistem `affiliate_code` (diimplementasikan di fase 1 migration). Dokumen ini mengaudit keduanya, mengidentifikasi gap, dan merancang sistem referral terpadu yang mendukung: input kode referral → status pending → konfirmasi admin (setelah pembayaran lunas + reward dinamis) → email notifikasi otomatis ke pemilik kode.

---

## 2. Audit Database Supabase

### 2.1 Skema Tabel Terkait Referral (Status Saat Ini)

#### A. Tabel `referral_codes` — Sudah Ada di Dev DB

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` | ID unik |
| `code` | TEXT | `UNIQUE NOT NULL` | Kode referral (e.g. `RIZAL2026`) |
| `owner_member_id` | UUID | FK → `members.id` ON DELETE CASCADE | Pemilik kode (admin inti) |
| `description` | TEXT | nullable | Deskripsi kode |
| `is_active` | BOOLEAN | `DEFAULT true` | Status aktif |
| `usage_count` | INTEGER | `DEFAULT 0` | Counter penggunaan |
| `total_revenue` | INTEGER | `DEFAULT 0` | Agregat revenue yang dihasilkan |
| `created_at` | TIMESTAMPTZ | `DEFAULT now()` | — |
| `updated_at` | TIMESTAMPTZ | `DEFAULT now()` | — |

**RLS Policies:**
- ✅ Owner bisa lihat kode sendiri (`owner_member_id = auth.uid()`)
- ✅ Super Admin bisa CRUD semua kode (`has_privilege(auth.uid(), 'system', 'view'/'edit')`)
- ✅ Publik bisa validasi kode aktif (`is_active = true`, SELECT only)

**Indexes:**
- `idx_referral_code` on `code`
- `idx_referral_owner` on `owner_member_id`

---

#### B. Kolom Referral di Tabel `members`

| Kolom | Tipe | Asal | Status |
|---|---|---|---|
| `my_referral_code` | TEXT UNIQUE | Arsitektur awal | ⚠️ Kolom ada tapi **BELUM dipakai** di kode aplikasi |
| `referred_by_member_id` | UUID FK → members.id | Arsitektur awal | ⚠️ Hanya diupdate oleh fungsi `use_referral_code()` |
| `affiliate_code` | TEXT UNIQUE | Fase 1 migration | ✅ **Aktif dipakai** — auto-generated format `PK-<NAME>-<RAND>` |
| `referred_by` | UUID FK → members.id | Fase 1 migration | ✅ **Aktif dipakai** — diset saat profil member melampirkan `referred_by_code` |
| `commission_balance` | NUMERIC DEFAULT 0 | Fase 1 migration | ⚠️ Kolom ada, **ditampilkan di UI**, tapi **belum pernah di-increment** |
| `referral_source` | TEXT | Original schema | Survei darimana tahu Pangkreas (bukan referral code) |

---

#### C. Kolom Referral di Tabel `transactions`

| Kolom | Tipe | Asal | Status |
|---|---|---|---|
| `referral_code` | TEXT | Arsitektur awal | ⚠️ **BELUM diisi** di flow checkout manapun |
| `referred_by_id` | UUID FK → members.id | Arsitektur awal | ⚠️ **BELUM diisi** di flow checkout manapun |
| `affiliate_code_used` | TEXT | Fase 1 migration | ⚠️ Kolom ada, **BELUM diisi** di flow checkout |
| `commission_earned` | NUMERIC DEFAULT 0 | Fase 1 migration | ⚠️ Kolom ada, **BELUM pernah diset** |

**Index:**
- `idx_transactions_referral` on `referred_by_id` WHERE `referred_by_id IS NOT NULL`

---

#### D. Fungsi Database `use_referral_code()`

```sql
CREATE OR REPLACE FUNCTION public.use_referral_code(p_code TEXT, p_member_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral_id UUID;
  v_owner_id    UUID;
BEGIN
  SELECT id, owner_member_id INTO v_referral_id, v_owner_id
  FROM public.referral_codes
  WHERE code = p_code AND is_active = true;

  IF v_referral_id IS NULL THEN RETURN NULL; END IF;

  UPDATE public.referral_codes
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = v_referral_id;

  UPDATE public.members
  SET referred_by_member_id = v_owner_id WHERE id = p_member_id;

  RETURN v_owner_id;
END;
$$;
```

**Analisis:** Fungsi ini hanya menangani tabel `referral_codes` dan kolom `referred_by_member_id` dari arsitektur awal. **Tidak terintegrasi** dengan kolom `affiliate_code` / `referred_by` yang dipakai di production.

---

### 2.2 Diagnosis: Dua Sistem Paralel

```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  SISTEM 1 (Arsitektur Awal)         │    │  SISTEM 2 (Fase 1 Migration)        │
│  ─────────────────────────          │    │  ─────────────────────────          │
│  Tabel: referral_codes              │    │  Kolom: members.affiliate_code      │
│  Kolom: members.my_referral_code    │    │  Kolom: members.referred_by         │
│  Kolom: members.referred_by_member_id│   │  Kolom: members.commission_balance  │
│  Kolom: tx.referral_code            │    │  Kolom: tx.affiliate_code_used      │
│  Kolom: tx.referred_by_id           │    │  Kolom: tx.commission_earned        │
│  Fungsi: use_referral_code()        │    │  Logic: route.ts (profile API)      │
│                                     │    │  UI: AffiliatePanel.tsx             │
│  STATUS: ❌ Tidak dipakai di kode   │    │  STATUS: ⚠️ Parsial — flow belum    │
│          aplikasi                   │    │          lengkap (reward belum aktif)│
└─────────────────────────────────────┘    └─────────────────────────────────────┘
```

> [!WARNING]
> **GAP KRITIS:** Kedua sistem tidak saling terhubung. Referral tercatat di `members.referred_by` saat profil disimpan, tetapi:
> 1. **Tidak ada kaitan ke `transactions`** — kolom `affiliate_code_used` dan `commission_earned` tidak pernah diisi.
> 2. **Tidak ada mekanisme reward** — `commission_balance` selalu 0.
> 3. **Tidak ada notifikasi** ke pemilik kode saat referral berhasil bayar.
> 4. **Tidak ada flow pending → confirmed** untuk referral reward.

---

### 2.3 Skema Email Notifikasi Eksisting

| Trigger | Aksi | File |
|---|---|---|
| Registrasi member | Email kredensial + instruksi pembayaran | `checkout-actions.ts` → `registerMemberAction()` |
| Verifikasi pembayaran | Email konfirmasi lunas + link WA Group | `checkout-actions.ts` → `verifyMemberPaymentAction()` |
| Approval admin baru | Email kredensial admin | `admin-actions.ts` → `approveAdminAction()` |
| Kirim ulang kredensial | Email re-send password ke member | `admin/members/actions.ts` → `sendMemberCredentialsAction()` |

**Transport:** Nodemailer via SMTP Gmail (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).

---

## 3. Alur Sistem yang Dirancang

### 3.1 Flow Diagram Lengkap

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           REFERRAL CODE FLOW                                     │
│                                                                                  │
│  ┌─────────┐    ┌────────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ MEMBER  │───▶│ CHECKOUT FORM  │───▶│  REGISTRASI  │───▶│   TRANSAKSI      │   │
│  │ BARU    │    │ Input referral │    │  Simpan data │    │   status:pending  │   │
│  └─────────┘    │ code (opsional)│    │  member +    │    │   referral_code   │   │
│                 └────────────────┘    │  validasi    │    │   referred_by_id  │   │
│                        │              │  kode        │    └───────┬──────────┘   │
│                        ▼              └──────────────┘            │               │
│                 ┌────────────────┐                                │               │
│                 │ VALIDASI KODE  │                                │               │
│                 │ Query tabel    │                                ▼               │
│                 │ referral_codes │                    ┌──────────────────────┐    │
│                 │ (is_active=T)  │                    │  ADMIN DASHBOARD     │    │
│                 └────────────────┘                    │  /admin/payment      │    │
│                                                      │  Lihat tx pending    │    │
│                                                      │  + info referral     │    │
│                                                      └──────────┬───────────┘    │
│                                                                 │                │
│                                                                 ▼                │
│                                                      ┌──────────────────────┐    │
│                                                      │  KONFIRMASI LUNAS    │    │
│                                                      │  Admin input:        │    │
│                                                      │  ✓ Status → paid     │    │
│                                                      │  ✓ Nominal reward    │    │
│                                                      │    (dinamis/manual)  │    │
│                                                      └──────────┬───────────┘    │
│                                                                 │                │
│                                          ┌──────────────────────┼─────────┐      │
│                                          ▼                      ▼         ▼      │
│                                   ┌────────────┐    ┌──────────────┐ ┌────────┐  │
│                                   │ UPDATE DB  │    │ EMAIL NOTIF  │ │REFERRAL│  │
│                                   │ • tx.status│    │ ke PEMILIK   │ │CODES   │  │
│                                   │ • member   │    │ KODE:        │ │update: │  │
│                                   │   .tier    │    │ "Member X    │ │usage+1 │  │
│                                   │ • member   │    │  bayar lunas │ │revenue │  │
│                                   │   .comm_   │    │  reward Rp Y"│ │+amount │  │
│                                   │   balance  │    └──────────────┘ └────────┘  │
│                                   └────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Detail Step-by-Step

#### Step 1: Input Kode Referral (Checkout)

**Lokasi:** `/akademi/checkout` — form registrasi member baru.

1. Tambahkan field **"Kode Referral (opsional)"** di checkout form.
2. Saat user mengetik kode, lakukan **real-time validation** via query ke `referral_codes`:
   ```sql
   SELECT id, code, owner_member_id
   FROM referral_codes
   WHERE code = '{input}' AND is_active = true;
   ```
3. Tampilkan indikator visual:
   - ✅ Hijau + "Kode valid" jika ditemukan
   - ❌ Merah + "Kode tidak valid" jika tidak ada/non-aktif
4. Kode referral **tidak memberikan diskon** — ini berbeda dengan voucher. Referral hanya untuk tracking & reward ke pemilik kode.

#### Step 2: Simpan Data Transaksi dengan Referral

**Lokasi:** `registerMemberAction()` di `checkout-actions.ts`.

Saat registrasi berhasil, simpan kode referral ke transaksi:
```typescript
// Di bagian insert transactions
const { error: txError } = await supabaseAdmin
  .from("transactions")
  .insert({
    member_id: user.id,
    // ... kolom existing ...
    referral_code: payload.referralCode || null,        // ← BARU
    referred_by_id: referralOwnerId || null,            // ← BARU
    affiliate_code_used: payload.referralCode || null,   // ← Sinkronisasi
  });
```

Juga update `members.referred_by_member_id`:
```typescript
if (referralOwnerId) {
  await supabaseAdmin.rpc('use_referral_code', {
    p_code: payload.referralCode,
    p_member_id: user.id
  });
}
```

**Status transaksi:** `pending` — menunggu pembayaran.

#### Step 3: Konfirmasi Admin + Reward Dinamis

**Lokasi:** `/admin/payment` — `PaymentClient.tsx`.

Saat admin mengklik **"Konfirmasi Lunas"** pada transaksi yang memiliki referral:

1. **Deteksi referral:** Cek apakah transaksi memiliki `referral_code` / `referred_by_id`.
2. **Input reward dinamis:** Tampilkan modal/dialog tambahan:
   ```
   ┌─────────────────────────────────────────┐
   │  Konfirmasi Pembayaran Lunas            │
   │                                         │
   │  Member: Dwipayani Aulia                │
   │  Paket: Akademi Membership              │
   │  Total Bayar: Rp 49.259                 │
   │                                         │
   │  ── Referral Info ──────────────────     │
   │  Kode Referral: RIZAL2026               │
   │  Pemilik Kode: Rizal Firmansyah         │
   │                                         │
   │  Nominal Reward (Rp):                   │
   │  ┌─────────────────────────────┐        │
   │  │ 10000                       │        │
   │  └─────────────────────────────┘        │
   │                                         │
   │  [Batalkan]         [Konfirmasi Lunas]  │
   └─────────────────────────────────────────┘
   ```
3. Admin **mengisi nominal reward secara manual** (dinamis, bukan persentase tetap).

#### Step 4: Proses Backend Konfirmasi

**Server Action baru:** `confirmPaymentWithReferralReward()`

```
Input:
  - transactionId: string
  - rewardAmount: number (nominal yang diisi admin)

Proses:
  1. Update transactions.status = 'paid', paid_at = now()
  2. Update members.membership_tier = package.tier
  3. IF referral exists:
     a. Update members.commission_balance += rewardAmount (pemilik kode)
     b. Update transactions.commission_earned = rewardAmount
     c. Update referral_codes.total_revenue += transaction.final_amount
     d. Update referral_codes.usage_count (sudah di-increment saat registrasi)
     e. Kirim email notifikasi ke pemilik kode
```

#### Step 5: Email Notifikasi ke Pemilik Kode

**Trigger:** Dipanggil di akhir step 4, hanya jika transaksi memiliki referral.

```
───────────────────────────────────────────
Subjek: 🎉 Reward Referral Masuk — Panggung Kreator

Halo {nama_pemilik_kode},

Kabar baik! Member baru telah bergabung menggunakan kode 
referral Anda "{kode_referral}" dan pembayarannya telah 
dikonfirmasi lunas oleh Admin.

── Detail Referral ──────────────────────
• Member Baru    : {nama_member_baru}
• Paket          : {nama_paket}
• Nominal Bayar  : Rp {final_amount}
• Reward Anda    : Rp {reward_amount}
• Saldo Komisi   : Rp {new_commission_balance}
─────────────────────────────────────────

Terima kasih telah membantu memperluas komunitas 
Panggung Kreator! 🙏

Salam hangat,
Tim Panggung Kreator
───────────────────────────────────────────
```

---

## 4. Perubahan yang Diperlukan

### 4.1 Database (Supabase Migration Baru)

#### [NEW] Migration: `YYYYMMDD_unify_referral_system.sql`

```sql
-- ============================================================
-- Migration: Unify Referral System
-- Menggabungkan sistem referral_codes + affiliate menjadi satu
-- ============================================================

-- 1. Tambah tabel log reward referral (audit trail)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  referral_code_id  UUID REFERENCES public.referral_codes(id) ON DELETE SET NULL,
  referrer_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  referred_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  reward_amount     NUMERIC NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'redeemed', 'paid_out', 'cancelled')),
  confirmed_by      UUID REFERENCES public.members(id) ON DELETE SET NULL,
  confirmed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrer can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Admin can manage all rewards"
  ON public.referral_rewards FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_transaction ON public.referral_rewards(transaction_id);

-- 2. Tambah trigger updated_at
CREATE TRIGGER set_referral_rewards_updated_at
  BEFORE UPDATE ON public.referral_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Tambah kolom baru di referral_codes (max_usage + default_reward)
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS max_usage INTEGER NOT NULL DEFAULT 0,      -- 0 = unlimited
  ADD COLUMN IF NOT EXISTS default_reward NUMERIC NOT NULL DEFAULT 0; -- nominal default per kode

-- 4. Tambah kolom referral_credit_used di transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS referral_credit_used NUMERIC NOT NULL DEFAULT 0;

-- 5. Tabel commission_ledger (audit trail mutasi saldo)
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount          NUMERIC NOT NULL,
  balance_after   NUMERIC NOT NULL,
  source          TEXT NOT NULL CHECK (source IN (
    'referral_reward',
    'redeem_membership',
    'cash_out',
    'manual_adjustment'
  )),
  reference_id    UUID,
  description     TEXT,
  created_by      UUID REFERENCES public.members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own ledger"
  ON public.commission_ledger FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Admin can manage all ledger"
  ON public.commission_ledger FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_commission_ledger_member ON public.commission_ledger(member_id);
CREATE INDEX idx_commission_ledger_source ON public.commission_ledger(source);

-- 6. Migrasi data affiliate_code → referral_codes (single source of truth)
INSERT INTO public.referral_codes (code, owner_member_id, description, is_active)
SELECT
  affiliate_code, id, 'Auto-migrated dari affiliate_code', true
FROM public.members
WHERE affiliate_code IS NOT NULL
  AND affiliate_code NOT IN (SELECT code FROM public.referral_codes);

-- 7. Update fungsi use_referral_code (sinkronisasi + max_usage check)
CREATE OR REPLACE FUNCTION public.use_referral_code(p_code TEXT, p_member_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral_id  UUID;
  v_owner_id     UUID;
  v_max_usage    INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Cari di tabel referral_codes (single source of truth)
  SELECT id, owner_member_id, max_usage, usage_count
  INTO v_referral_id, v_owner_id, v_max_usage, v_current_usage
  FROM public.referral_codes
  WHERE code = p_code AND is_active = true;

  IF v_referral_id IS NULL THEN
    RETURN NULL;  -- kode tidak valid atau tidak aktif
  END IF;

  -- Cek limit penggunaan (0 = unlimited)
  IF v_max_usage > 0 AND v_current_usage >= v_max_usage THEN
    RETURN NULL;  -- kode sudah mencapai batas penggunaan
  END IF;

  -- Increment usage count
  UPDATE public.referral_codes
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = v_referral_id;

  -- Sinkronisasi: Update kedua kolom referral di members
  UPDATE public.members
  SET referred_by_member_id = v_owner_id,
      referred_by = v_owner_id
  WHERE id = p_member_id;

  RETURN v_owner_id;
END;
$$;
```

---

### 4.2 Backend — Server Actions

#### [MODIFY] `front/lib/actions/checkout-actions.ts`

Perubahan pada `registerMemberAction()`:
- Tambah parameter `referralCode` di `CheckoutPayload`
- Validasi kode referral via RPC `use_referral_code()` atau query langsung
- Simpan `referral_code`, `referred_by_id`, dan `affiliate_code_used` ke `transactions`
- Sinkronisasi `members.referred_by` dan `members.referred_by_member_id`

Perubahan pada `verifyMemberPaymentAction()` atau **buat action baru**:
- `confirmPaymentWithRewardAction(transactionId, rewardAmount)`:
  1. Update `transactions.status = 'paid'`
  2. Update `members.membership_tier`
  3. Jika ada referral → insert ke `referral_rewards` dengan status `confirmed`
  4. Update `members.commission_balance` pada referrer
  5. Update `referral_codes.total_revenue`
  6. Kirim email notifikasi ke referrer

#### [NEW] `front/lib/actions/referral-actions.ts`

File baru untuk server actions khusus referral:
- `validateReferralCodeAction(code: string)` — validasi kode referral
- `confirmPaymentWithRewardAction(txId: string, rewardAmount: number)` — konfirmasi + reward
- `getReferralStatsAction(memberId: string)` — statistik referral per member
- `sendReferralRewardNotificationEmail(...)` — helper kirim email

---

### 4.3 Frontend — Komponen & Halaman

#### [MODIFY] Checkout Form (Akademi)

**File:** Form registrasi checkout (kemungkinan di `front/app/(form)/` atau halaman checkout akademi)

- Tambah field input **"Kode Referral"** dengan live validation
- Tampilkan badge status validasi (✅ / ❌)
- Kirim `referralCode` sebagai bagian dari payload `registerMemberAction()`

#### [MODIFY] `front/app/(admin)/admin/payment/PaymentClient.tsx`

- Tampilkan info referral pada kartu transaksi pending (kode referral, nama pemilik kode)
- Ganti `handleConfirmPayment()` agar menampilkan dialog konfirmasi yang menyertakan:
  - Info referral (jika ada)
  - Input nominal reward dinamis (jika ada referral)
- Panggil `confirmPaymentWithRewardAction()` alih-alih update langsung via Supabase client

#### [MODIFY] `front/app/myprofile/components/AffiliatePanel.tsx`

- Tambah tabel riwayat reward (query dari `referral_rewards` yang `status = 'confirmed'`)
- Tampilkan breakdown per transaksi: nama member, tanggal, nominal reward

#### [NEW] Admin — Halaman Kelola Referral Codes

**Lokasi:** `/admin/referral` (atau di bawah `/admin/system`)

- CRUD kode referral: buat baru, edit, toggle aktif/non-aktif
- Tabel daftar kode: code, owner, usage_count, total_revenue, status
- Filter: aktif, non-aktif, semua
- Link ke detail owner/admin

---

### 4.4 TypeScript Types

#### [MODIFY] `front/lib/types/member.ts`

```typescript
// Tambah type baru
export interface ReferralReward {
  id: string
  transaction_id: string
  referral_code_id: string | null
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: 'pending' | 'confirmed' | 'paid_out' | 'cancelled'
  confirmed_by: string | null
  confirmed_at: string | null
  notes: string | null
  created_at: string
  // Joined fields
  referred_name?: string
  package_name?: string
  transaction_amount?: number
}

// Extend CheckoutPayload
export interface CheckoutPayload {
  // ... existing fields ...
  referralCode?: string
}
```

---

## 5. Penyimpanan Reward Dinamis

### 5.1 Kenapa Dinamis (Bukan Persentase Tetap)?

Berdasarkan kebutuhan bisnis Panggung Kreator:
- Paket membership memiliki harga bervariasi
- Admin ingin fleksibilitas menentukan reward per kasus (promosi khusus, bonus event)
- Tidak semua referral mendapat reward yang sama

### 5.2 Skema Penyimpanan

```
referral_rewards (tabel baru)
├── reward_amount: NUMERIC    ← Nominal yang diinput admin saat konfirmasi
├── status: TEXT              ← 'pending' → 'confirmed' → 'paid_out'
└── confirmed_by: UUID       ← Admin yang mengkonfirmasi

members
└── commission_balance: NUMERIC  ← Akumulasi total reward (running total)

transactions
└── commission_earned: NUMERIC   ← Reward per transaksi ini
```

### 5.3 Alur Data Reward

```
Admin klik "Konfirmasi Lunas"
  ├── Input: reward_amount = 10000
  │
  ├── INSERT referral_rewards (status='confirmed', reward_amount=10000)
  ├── UPDATE members SET commission_balance = commission_balance + 10000
  │   WHERE id = referrer_id
  ├── UPDATE transactions SET commission_earned = 10000
  │   WHERE id = transaction_id
  └── UPDATE referral_codes SET total_revenue = total_revenue + tx.final_amount
      WHERE id = referral_code_id
```

---

## 6. Strategi Migrasi & Konsolidasi

### 6.1 Fase 1: Konsolidasi Database (Non-Breaking)

> Tidak menghapus kolom apapun — hanya menambahkan tabel baru dan mengupdate fungsi.

1. ✅ Jalankan migration `unify_referral_system.sql`
2. ✅ Tabel `referral_rewards` dibuat
3. ✅ Fungsi `use_referral_code()` diupdate agar sinkron kedua sistem
4. ✅ Data existing di `members.referred_by` tetap aman

### 6.2 Fase 2: Update Checkout Flow

1. Tambah field referral code di checkout form
2. Integrasi validasi + penyimpanan ke `transactions`
3. Testing end-to-end: registrasi → validasi kode → simpan referral data

### 6.3 Fase 3: Admin Confirmation + Reward

1. Update PaymentClient dengan UI reward
2. Buat server action `confirmPaymentWithRewardAction`
3. Integrasi email notifikasi
4. Testing end-to-end: konfirmasi → reward → email

### 6.4 Fase 4: Dashboard & Reporting

1. Halaman admin kelola referral codes
2. Update AffiliatePanel dengan riwayat reward
3. Analytics referral di admin dashboard

---

## 7. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Duplikasi kolom referral (2 sistem) | Inkonsistensi data | Fungsi `use_referral_code()` disinkronkan untuk update kedua set kolom |
| Admin lupa input reward | Referrer tidak mendapat reward | Default reward = 0, tapi UI tetap menampilkan field reward jika ada referral |
| Race condition saat update `commission_balance` | Saldo salah | Gunakan `SET commission_balance = commission_balance + X` (atomic increment) |
| Email gagal kirim | Referrer tidak tahu ada reward | Log error + retry mechanism; saldo tetap terupdate di DB |
| Kode referral milik member non-admin | Kontrol akses | RLS: hanya super_admin yang bisa membuat kode di `referral_codes`; `affiliate_code` auto-generated |

---

## 8. Verifikasi & Testing

### 8.1 Test Cases

| # | Skenario | Expected Result |
|---|---|---|
| 1 | Checkout tanpa referral code | Transaksi tersimpan tanpa `referral_code`, `referred_by_id` = null |
| 2 | Checkout dengan kode valid | Kode tervalidasi, transaksi menyimpan kode + owner ID |
| 3 | Checkout dengan kode tidak valid | Error message "Kode tidak valid", form tidak bisa submit |
| 4 | Checkout dengan kode non-aktif | Error message "Kode tidak aktif" |
| 5 | Admin konfirmasi lunas (tanpa referral) | Status → paid, tier upgrade, **TANPA** dialog reward |
| 6 | Admin konfirmasi lunas (dengan referral, reward=10000) | Status → paid, tier upgrade, reward dicatat, saldo terupdate, email terkirim |
| 7 | Admin konfirmasi lunas (dengan referral, reward=0) | Status → paid, tier upgrade, reward=0 dicatat, **TANPA** email |
| 8 | Pemilik kode cek AffiliatePanel | Saldo & riwayat reward muncul dengan benar |
| 9 | Checkout dengan kode yang sudah mencapai max_usage | Error message "Kode sudah mencapai batas penggunaan" |
| 10 | Checkout dengan kode unlimited (max_usage=0) | Kode tetap valid berapapun penggunaannya |
| 11 | Member redeem saldo untuk bayar membership | `commission_balance` berkurang, `referral_credit_used` terisi di transaksi, ledger entry tercatat |
| 12 | Admin proses pencairan saldo | `commission_balance` berkurang, ledger entry `cash_out` tercatat |
| 13 | Admin konfirmasi lunas (reward pre-filled dari default_reward) | Dialog menampilkan nominal default, admin bisa override |

### 8.2 Verifikasi Database

```sql
-- Cek referral reward tercatat
SELECT rr.*, m.full_name as referrer_name, m2.full_name as referred_name
FROM referral_rewards rr
JOIN members m ON rr.referrer_id = m.id
JOIN members m2 ON rr.referred_id = m2.id
ORDER BY rr.created_at DESC;

-- Cek saldo komisi akurat
SELECT id, full_name, commission_balance, affiliate_code
FROM members
WHERE commission_balance > 0;

-- Cek sinkronisasi referral codes
SELECT rc.code, rc.usage_count, rc.total_revenue, m.full_name as owner
FROM referral_codes rc
JOIN members m ON rc.owner_member_id = m.id;
```

---

## 9. File Terdampak (Ringkasan)

| Aksi | File | Keterangan |
|---|---|---|
| **[NEW]** | `front/supabase/migrations/YYYYMMDD_unify_referral_system.sql` | Migration: `referral_rewards`, `commission_ledger`, kolom baru, fungsi update, migrasi data |
| **[NEW]** | `front/lib/actions/referral-actions.ts` | Server actions: validasi kode, konfirmasi+reward, redeem saldo, pencairan, statistik |
| **[MODIFY]** | `front/lib/actions/checkout-actions.ts` | Integrasi referral di checkout + opsi redeem saldo |
| **[MODIFY]** | `front/lib/types/member.ts` | Tambah types: `ReferralReward`, `CommissionLedgerEntry`, update `CheckoutPayload` |
| **[MODIFY]** | `front/app/(admin)/admin/payment/PaymentClient.tsx` | Dialog reward (pre-filled default) + info referral |
| **[MODIFY]** | `front/app/myprofile/components/AffiliatePanel.tsx` | Riwayat reward + riwayat mutasi saldo (ledger) |
| **[MODIFY]** | `front/app/api/member/profile/route.ts` | Auto-insert ke `referral_codes` saat generate affiliate_code |
| **[MODIFY]** | Form checkout Akademi | Field input referral code + opsi "Gunakan saldo referral" |
| **[NEW]** | `front/app/(admin)/admin/referral/` | Halaman admin: kelola referral codes, set default reward, proses pencairan |

---

## 10. Keputusan Desain (Finalized)

### Q1: Mekanisme Penggunaan Saldo Reward ✅

**Keputusan:** Saldo reward bersifat **dual-use** — bisa dicairkan (paid out) **atau** digunakan sebagai kredit diskon membership selanjutnya.

**Implikasi Teknis:**
- Tabel `referral_rewards` perlu status tambahan: `paid_out` (sudah dicairkan)
- Perlu **mekanisme pencairan** di admin panel:
  - Admin memproses request pencairan → update `referral_rewards.status = 'paid_out'` → kurangi `commission_balance`
- Perlu **mekanisme redeem** di checkout:
  - Member bisa memilih "Gunakan saldo referral" saat checkout → mengurangi `final_amount` dan `commission_balance`
- Tambah kolom `referral_credit_used` (NUMERIC) di tabel `transactions` untuk mencatat berapa saldo referral yang dipakai per transaksi

**Skema Status Reward:**
```
referral_rewards.status:
  'pending'    → Transaksi belum dikonfirmasi admin
  'confirmed'  → Reward masuk ke saldo (commission_balance)
  'redeemed'   → Saldo dipakai untuk membership (potong harga)
  'paid_out'   → Saldo dicairkan ke rekening pemilik kode
  'cancelled'  → Dibatalkan
```

**Tambahan Tabel untuk Pencatatan Penggunaan Saldo:**
```sql
-- Log setiap mutasi saldo (kredit/debit) untuk audit trail lengkap
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount          NUMERIC NOT NULL,
  balance_after   NUMERIC NOT NULL,
  source          TEXT NOT NULL CHECK (source IN (
    'referral_reward',     -- kredit dari reward referral
    'redeem_membership',   -- debit untuk bayar membership
    'cash_out',            -- debit pencairan
    'manual_adjustment'    -- koreksi manual admin
  )),
  reference_id    UUID,        -- FK ke referral_rewards.id atau transactions.id
  description     TEXT,
  created_by      UUID REFERENCES public.members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own ledger"
  ON public.commission_ledger FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Admin can manage all ledger"
  ON public.commission_ledger FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_commission_ledger_member ON public.commission_ledger(member_id);
CREATE INDEX idx_commission_ledger_source ON public.commission_ledger(source);
```

---

### Q2: Konsolidasi Sistem Referral ✅ (Rekomendasi)

**Keputusan:** Migrasi `members.affiliate_code` ke tabel `referral_codes` sebagai **single source of truth**.

**Alasan:**
1. **Satu pintu validasi** — semua kode dicek di satu tabel, menghindari query ganda
2. **Fitur lebih kaya** — `referral_codes` sudah punya `is_active`, `usage_count`, `total_revenue`, `description` yang tidak ada di kolom `affiliate_code`
3. **Admin control** — semua kode bisa dikelola dari satu halaman admin (toggle aktif, set default reward, dsb.)
4. **Backward compatible** — kolom `members.affiliate_code` tetap ada sebagai cache/shortcut, tapi source of truth pindah ke tabel

**Strategi Migrasi Data:**
```sql
-- Migrasi semua affiliate_code yang sudah ada ke tabel referral_codes
INSERT INTO public.referral_codes (code, owner_member_id, description, is_active)
SELECT
  affiliate_code,
  id,
  'Auto-migrated dari affiliate_code',
  true
FROM public.members
WHERE affiliate_code IS NOT NULL
  AND affiliate_code NOT IN (SELECT code FROM public.referral_codes);
```

**Perubahan pada Auto-Generate:**
- [`route.ts`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/api/member/profile/route.ts) `generateAffiliateCode()` tetap generate format `PK-<NAME>-<RAND>`
- Setelah generate, **INSERT ke `referral_codes`** + set `members.affiliate_code` sebagai cache
- Validasi checkout selalu query dari `referral_codes`

---

### Q3: Limit Penggunaan Per Kode ✅ (Rekomendasi)

**Keputusan:** **Unlimited by default**, dengan opsi limit per kode yang bisa diatur admin.

**Alasan:**
1. Program referral paling efektif jika tanpa batas — mendorong pemilik kode untuk terus berbagi
2. Tapi admin tetap butuh fleksibilitas untuk kampanye khusus (contoh: kode promo terbatas untuk event tertentu)
3. Implementasi sederhana — satu kolom tambahan, logic minimal

**Implementasi:**
```sql
-- Tambah kolom di referral_codes
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS max_usage INTEGER DEFAULT 0;
  -- 0 = unlimited, > 0 = limit aktif
```

**Logic Validasi:**
```sql
-- Di fungsi use_referral_code(), tambah pengecekan:
IF v_max_usage > 0 AND v_current_usage >= v_max_usage THEN
  RETURN NULL;  -- kode sudah mencapai batas penggunaan
END IF;
```

**UI Admin:** Toggle sederhana di halaman kelola referral codes:
- Default: "Unlimited" (checkbox)
- Jika unchecked: input angka "Maksimum penggunaan"

---

### Q4: Default Reward per Kode ✅

**Keputusan:** Admin mengatur **default reward** di level kode referral. Saat konfirmasi pembayaran, nominal ini muncul sebagai pre-filled value yang masih bisa di-override admin.

**Implementasi:**
```sql
-- Tambah kolom di referral_codes
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS default_reward NUMERIC NOT NULL DEFAULT 0;
```

**Flow UI:**
```
Admin buat kode → set default_reward = 10000
                                    ↓
Member checkout pakai kode → transaksi pending
                                    ↓
Admin konfirmasi lunas → dialog reward muncul:
  ┌────────────────────────────────────────┐
  │  Nominal Reward:                       │
  │  ┌──────────────────────────────┐      │
  │  │ 10000          (pre-filled) │      │
  │  └──────────────────────────────┘      │
  │  ⓘ Default reward untuk kode ini.     │
  │    Admin dapat mengubah nominal.       │
  └────────────────────────────────────────┘
```

**Benefit:** Admin tidak perlu mengingat nominal reward setiap kode — sudah ter-set otomatis. Tapi tetap fleksibel untuk override per kasus khusus.
