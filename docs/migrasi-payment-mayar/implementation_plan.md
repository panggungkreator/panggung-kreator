# Migrasi Pembayaran Manual → Mayar.id (QRIS Otomatis) & Otomasi Komisi Afiliasi

## Latar Belakang

Sistem pembayaran Panggung Kreator saat ini sepenuhnya manual: pengguna checkout → melihat gambar QRIS statis → transfer dengan kode unik 3 digit → kirim bukti bayar ke WhatsApp → admin verifikasi manual di dashboard. Proses ini lambat, rawan human error, dan menghambat skalabilitas.

Dokumen ini merancang migrasi ke **Mayar.id** sebagai payment gateway otomatis (fokus QRIS dinamis) dan otomasi pencatatan komisi afiliator dengan skema saldo mengendap + penarikan mandiri.

---

## Arsitektur Sistem Saat Ini (AS-IS)

```
Checkout Form → registerMemberAction()
  ├── Auth: createUser (Supabase Auth Admin)
  ├── DB: upsert members (status=pending, final_price=harga+uniqueCode)
  ├── DB: insert transactions (status=pending)
  ├── Email: instruksi transfer manual + QRIS statis
  └── Return: username, password, finalPrice, uniqueCode

Verifikasi (Admin Manual) → verifyMemberPaymentAction() / confirmPaymentWithRewardAction()
  ├── DB: update transactions.status = 'paid'
  ├── DB: update members.payment_status = 'paid'
  ├── DB: credit commission_balance (jika ada referral)
  ├── DB: insert commission_ledger (type=credit)
  ├── DB: insert referral_rewards (status=confirmed)
  ├── Email: kredensial akun + link grup WA ke pembeli
  └── Email: notifikasi reward ke afiliator
```

### Komponen Terdampak

| File | Fungsi |
|------|--------|
| `front/lib/actions/checkout-actions.ts` | `registerMemberAction`, `verifyMemberPaymentAction` |
| `front/lib/actions/referral-actions.ts` | `confirmPaymentWithRewardAction`, `sendReferralRewardNotificationEmail` |
| `front/lib/actions/settings-actions.ts` | `getReferralCommissionSettingsAction` |
| `front/app/(akademi)/akademi/checkout/CheckoutClient.tsx` | UI checkout, QRIS display, referral input |
| `front/app/(admin)/admin/payment/PaymentClient.tsx` | Panel verifikasi admin |
| DB: `transactions` | `status`, `order_id`, `payment_method`, `unique_code` |
| DB: `members` | `payment_status`, `commission_balance` |
| DB: `commission_ledger` | Buku besar kredit/debit |
| DB: `referral_rewards` | Pelacakan reward per transaksi |

---

## Arsitektur Target (TO-BE)

```
Checkout Form → registerMemberAction()
  ├── Auth: createUser (Supabase Auth Admin)
  ├── DB: upsert members (status=pending)
  ├── DB: insert transactions (status=pending)
  ├── API Mayar: POST /hl/v1/invoice/create
  │     → Response: { id, transactionId, link, expiredAt }
  ├── DB: update transactions.mayar_invoice_id, mayar_payment_url
  └── Return: username, password, paymentUrl (hosted Mayar / QRIS)

Webhook Otomatis (Mayar → Server) → POST /api/webhooks/mayar
  ├── Validasi payload event === "payment.received"
  ├── Lookup transactions by mayar_invoice_id
  ├── Panggil confirmPaymentWithRewardAction(transactionId)
  │     ├── DB: update transactions.status = 'paid'
  │     ├── DB: update members.payment_status = 'paid'
  │     ├── DB: credit commission_balance + insert commission_ledger
  │     └── Email: kredensial + reward notification
  └── Return 200 OK

Pencairan Mandiri (Afiliator) → /myprofile → "Tarik Saldo"
  ├── UI: form rekening tujuan + nominal
  ├── Server: requestWithdrawalAction()
  │     ├── Validasi saldo >= nominal + minimum threshold
  │     ├── DB: insert withdrawal_requests (status=pending)
  │     └── Email: notifikasi admin ada request baru
  └── Admin: approveWithdrawalAction()
        ├── DB: update withdrawal_requests.status = 'approved'
        ├── DB: debit commission_balance + insert commission_ledger (type=debit)
        └── Email: notifikasi afiliator dana sedang diproses
```

---

## Analisis Teknis Mayar.id

### Kapabilitas yang Tersedia

| Fitur | Status | Endpoint |
|-------|--------|----------|
| Dynamic QRIS | Tersedia | `POST /hl/v1/qrcode/create` |
| Invoice / Payment Link | Tersedia | `POST /hl/v1/invoice/create` |
| Webhook `payment.received` | Tersedia | Konfigurasi via Dashboard Mayar |
| Register Webhook URL | Tersedia | `POST /hl/v1/webhook/register` |
| Sandbox / Testing | Tersedia | Base URL: `api.mayar.io` |
| Disbursement / Payout API | Tidak tersedia | Manual via Dashboard Mayar |

### Pilihan Mekanisme Pembayaran

> [!IMPORTANT]
> **Rekomendasi: Invoice API** (`/hl/v1/invoice/create`)
>
> Dibanding QRIS endpoint murni (`/qrcode/create`), Invoice API lebih kaya fitur karena:
> - Menghasilkan `transactionId` dan `invoiceId` yang bisa dilacak via webhook
> - Mendukung `expiredAt` untuk auto-expire
> - Mendukung `extraData` untuk menyimpan metadata (member_id, order_id)
> - Tetap menampilkan opsi QRIS sebagai metode pembayaran

### Webhook `payment.received` Payload

```json
{
  "event": "payment.received",
  "data": {
    "id": "23fa41c5-...",
    "amount": 49000,
    "status": "paid",
    "paymentMethod": "QRIS",
    "invoiceId": "df65d192-...",
    "customer": {
      "name": "Nama Member",
      "email": "member@email.com",
      "mobile": "08xxxx"
    },
    "extraData": {
      "memberId": "uuid-member",
      "orderId": "PK-AKAD-xxx",
      "transactionId": "uuid-transaksi-internal"
    }
  }
}
```

### Keterbatasan: Pencairan Dana (Disbursement)

Mayar.id **tidak menyediakan API disbursement/payout**. Pencairan saldo Mayar hanya bisa dilakukan secara manual melalui Dashboard Mayar oleh pemilik akun.

Implikasi untuk komisi afiliator:

| Opsi | Mekanisme | Pro | Kontra |
|------|-----------|-----|--------|
| A. Manual Admin Transfer | Afiliator request → Admin approve → Admin transfer manual via bank | Simpel, tanpa integrasi tambahan | Tidak otomatis, butuh effort admin |
| B. Disbursement API pihak ketiga | Integrasikan Flip.id / Xendit Disbursement terpisah | Fully automated | Biaya tambahan, kompleksitas integrasi |
| C. Redeem ke membership upgrade | Afiliator tukar saldo menjadi perpanjangan membership | Tanpa transfer uang | Terbatas, tidak fleksibel |

> [!IMPORTANT]
> **Rekomendasi: Opsi A (Manual Admin Transfer) untuk fase awal.**
>
> Saldo komisi dicatat otomatis di sistem (`commission_ledger`). Afiliator mengajukan penarikan via UI. Admin memproses transfer bank secara manual dan menandai request sebagai selesai.
>
> Jika volume penarikan meningkat signifikan, baru pertimbangkan integrasi disbursement API (Opsi B) di fase selanjutnya.

---

## Perubahan yang Diperlukan

### 1. Environment Variables

```env
# Mayar.id
MAYAR_API_KEY=<your-mayar-api-key>
MAYAR_WEBHOOK_SECRET=<optional-webhook-signing-secret>
MAYAR_BASE_URL=https://api.mayar.id/hl/v1
# Sandbox: https://api.mayar.io/hl/v1
```

---

### 2. Database Migration

#### [NEW] `front/supabase/migrations/YYYYMMDD_mayar_payment_gateway.sql`

```sql
-- 1. Tambah kolom Mayar ke tabel transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS mayar_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS mayar_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS mayar_payment_url TEXT,
  ADD COLUMN IF NOT EXISTS mayar_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_transactions_mayar_invoice
  ON transactions(mayar_invoice_id);

-- 2. Tabel withdrawal_requests (penarikan komisi afiliator)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES members(id),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Members can insert own withdrawals"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = auth.uid() AND members.role = 'admin'
    )
  );

-- 3. Tambah kolom bank info ke members (untuk prefill form penarikan)
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;

-- 4. Pengaturan minimum penarikan di system_settings
INSERT INTO system_settings (key, value, description)
VALUES
  ('withdrawal_minimum', '50000', 'Minimum saldo untuk penarikan komisi (dalam Rupiah)'),
  ('withdrawal_fee', '0', 'Biaya admin penarikan (dalam Rupiah)')
ON CONFLICT (key) DO NOTHING;
```

---

### 3. Server Actions

#### [NEW] `front/lib/actions/mayar-actions.ts`

Modul baru untuk interaksi dengan Mayar API:

```typescript
// Fungsi utama:
createMayarInvoice({
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  description: string,
  extraData: { memberId, orderId, transactionId }
}) → { invoiceId, transactionId, paymentUrl, expiredAt }
```

#### [MODIFY] `front/lib/actions/checkout-actions.ts`

Perubahan pada `registerMemberAction`:
- Hapus logika generate `uniqueCode` (3 digit random) — tidak diperlukan lagi karena Mayar menangani identifikasi transaksi
- Setelah insert `transactions`, panggil `createMayarInvoice()` dengan `extraData` berisi `member_id` dan `order_id`
- Simpan `mayar_invoice_id` dan `mayar_payment_url` ke tabel `transactions`
- Return `paymentUrl` dari Mayar (bukan finalPrice + uniqueCode)
- Email instruksi pembayaran diubah: tautan ke halaman bayar Mayar (bukan instruksi transfer manual)

Perubahan pada `verifyMemberPaymentAction`:
- Tetap dipertahankan sebagai mekanisme fallback admin untuk kasus edge
- Tambah pengecekan: jika `transactions.mayar_invoice_id` ada, tampilkan warning bahwa pembayaran seharusnya otomatis via webhook

#### [NEW] `front/lib/actions/withdrawal-actions.ts`

```typescript
// requestWithdrawalAction(amount, bankName, accountNumber, accountHolder)
//   - Validasi saldo >= amount + minimum threshold
//   - Insert withdrawal_requests (status=pending)
//   - Email notifikasi ke admin
//   - Return success

// getMyWithdrawalsAction()
//   - Ambil riwayat withdrawal milik user yang login

// approveWithdrawalAction(withdrawalId, adminNotes?)
//   - Admin only
//   - Update withdrawal_requests.status = 'approved' → 'processing'
//   - Debit commission_balance
//   - Insert commission_ledger (type=debit, source=cash_out)
//   - Email notifikasi ke afiliator

// completeWithdrawalAction(withdrawalId)
//   - Admin only, setelah transfer bank selesai
//   - Update status = 'completed', completed_at = now()
//   - Email konfirmasi ke afiliator

// rejectWithdrawalAction(withdrawalId, reason)
//   - Admin only
//   - Update status = 'rejected', rejection_reason
//   - Email notifikasi ke afiliator
```

---

### 4. Webhook Endpoint

#### [NEW] `front/app/api/webhooks/mayar/route.ts`

Next.js Route Handler untuk menerima callback dari Mayar:

```typescript
export async function POST(request: Request) {
  // 1. Parse JSON body
  // 2. Validasi event === "payment.received"
  // 3. Ekstrak: invoiceId, amount, paymentMethod, customer, extraData
  // 4. Lookup transactions WHERE mayar_invoice_id = invoiceId
  // 5. Guard: skip jika transactions.status sudah 'paid' (idempotency)
  // 6. Panggil confirmPaymentWithRewardAction({ transactionId })
  // 7. Update transactions: webhook_received_at, mayar_payment_method
  // 8. Return Response(200)
}
```

> [!WARNING]
> Endpoint webhook harus bisa diakses publik. Karena middleware (`proxy.ts`) mengecualikan path `/api/*` dari auth guard, endpoint ini sudah otomatis accessible. Namun perlu ditambahkan mekanisme verifikasi payload (misal: cek API key di header, atau whitelist IP Mayar) untuk mencegah spoofing.

---

### 5. Frontend (Checkout UI)

#### [MODIFY] `front/app/(akademi)/akademi/checkout/CheckoutClient.tsx`

- Setelah `registerMemberAction` berhasil, tampilkan tombol / redirect ke `paymentUrl` Mayar (bukan tampilkan gambar QRIS statis + kode unik)
- Tambahkan polling / listener untuk cek status transaksi:
  - `setInterval` memanggil `checkPaymentStatusAction(transactionId)` setiap 5 detik
  - Jika status berubah menjadi `paid`, redirect ke halaman sukses
- Hapus referensi ke `/qris.jpeg` (gambar QRIS statis)
- Hapus display kode unik 3 digit

#### [NEW] `front/app/(akademi)/akademi/checkout/payment-success/page.tsx`

Halaman konfirmasi setelah pembayaran berhasil:
- Tampilkan kredensial akun (username, password)
- Tombol login
- Tombol gabung grup WhatsApp

---

### 6. Admin Panel

#### [MODIFY] `front/app/(admin)/admin/payment/PaymentClient.tsx`

- Tambah kolom `Metode Bayar` (QRIS/VA/dll dari Mayar) pada tabel transaksi
- Tambah badge `Auto-Verified` untuk transaksi yang dikonfirmasi via webhook
- Pertahankan tombol `Konfirmasi Manual` sebagai fallback
- Tambah indikator `Mayar Invoice ID` pada detail transaksi

#### [NEW] `front/app/(admin)/admin/withdrawal/page.tsx` & `WithdrawalManagement.tsx`

Panel admin untuk mengelola request penarikan komisi:
- Tabel request withdrawal: nama afiliator, jumlah, rekening tujuan, status
- Tombol Approve → Processing → Complete (multi-step)
- Tombol Reject dengan alasan
- Filter: Pending, Processing, Completed, Rejected

---

### 7. Fitur Penarikan Mandiri (Member/Afiliator)

#### [MODIFY] `front/app/myprofile/components/ProfileSidebar.tsx` atau tab baru

Tambah section / tab "Saldo & Penarikan" di halaman profil:
- Kartu saldo komisi (commission_balance)
- Riwayat mutasi (commission_ledger: kredit/debit)
- Tombol "Tarik Saldo" → Modal form:
  - Input: Nominal penarikan
  - Input: Nama Bank (dropdown)
  - Input: Nomor Rekening
  - Input: Nama Pemilik Rekening
  - Validasi: nominal >= minimum threshold, nominal <= saldo tersedia
- Tabel riwayat penarikan (withdrawal_requests) dengan status

---

## Alur Migrasi (Urutan Eksekusi)

### Fase 1: Infrastruktur Mayar (Backend)
1. Jalankan database migration (kolom Mayar di transactions + tabel withdrawal_requests)
2. Buat `mayar-actions.ts` (wrapper API Mayar)
3. Buat `app/api/webhooks/mayar/route.ts` (webhook handler)
4. Modifikasi `registerMemberAction` di `checkout-actions.ts`
5. Set environment variables Mayar

### Fase 2: Frontend Checkout
6. Update `CheckoutClient.tsx` (redirect ke Mayar payment page / tampilkan QRIS dinamis)
7. Buat halaman payment-success
8. Tambahkan polling status pembayaran

### Fase 3: Penarikan Komisi (Withdrawal)
9. Buat `withdrawal-actions.ts`
10. UI penarikan di `/myprofile`
11. Panel admin withdrawal di `/admin/withdrawal`

### Fase 4: Testing & Go-Live
12. Testing end-to-end di Sandbox Mayar (`api.mayar.io`)
13. Testing webhook lokal via ngrok / Cloudflare Tunnel
14. Migrasi ke production Mayar (`api.mayar.id`)
15. Monitoring: pastikan transaksi pending lama (legacy) tetap bisa di-verify manual

---

## Rencana Verifikasi

### Automated Tests
- Unit test `createMayarInvoice()` dengan mock API response
- Unit test webhook handler: payload valid, payload invalid, duplikat
- Unit test `requestWithdrawalAction`: saldo cukup, saldo kurang, threshold

### Integration Tests (Sandbox)
- Checkout → Mayar Invoice → Simulasi bayar di sandbox → Webhook received → Status paid
- Checkout dengan referral → Bayar → Webhook → Commission credited
- Request withdrawal → Admin approve → Balance deducted → Ledger entry

### Manual Verification
- Cek email pembeli: berisi link bayar Mayar (bukan instruksi transfer manual)
- Cek email afiliator: notifikasi komisi setelah webhook
- Cek admin panel: transaksi auto-verified muncul dengan badge
- Cek profil member: saldo komisi bertambah, bisa request withdrawal

---

## Pertimbangan Keamanan

| Aspek | Mitigasi |
|-------|----------|
| Webhook spoofing | Validasi `mayar_invoice_id` exists di DB sebelum proses. Opsional: whitelist IP Mayar. |
| Idempotency | Cek `transactions.status !== 'paid'` sebelum proses webhook. Guard `webhook_received_at IS NULL`. |
| Withdrawal fraud | Saldo di-debit saat admin approve (bukan saat request). Double-check balance vs amount. |
| Race condition | Gunakan database transaction (BEGIN/COMMIT) saat credit/debit commission_balance. |
| API key exposure | `MAYAR_API_KEY` hanya di server-side (server actions / route handler), tidak pernah di client. |

---

## Estimasi Dampak

| Metrik | Sebelum (Manual) | Sesudah (Mayar) |
|--------|-------------------|------------------|
| Waktu verifikasi pembayaran | 1-24 jam (tunggu admin) | Instan (webhook otomatis) |
| Risiko salah nominal | Tinggi (kode unik manual) | Nol (nominal di-set oleh Mayar) |
| Skalabilitas checkout | Terbatas jam kerja admin | 24/7 otomatis |
| Credit komisi afiliator | Manual oleh admin | Otomatis via webhook callback |
| Pencairan komisi | Belum ada fitur | Self-service + admin approval |

---

## Open Questions

> [!IMPORTANT]
> Pertanyaan berikut perlu dijawab sebelum eksekusi:
>
> 1. **Akun Mayar.id** — Apakah akun Mayar sudah dibuat dan business verification sudah selesai? API Key sudah digenerate?
> 2. **Mode Pembayaran** — Apakah hanya QRIS, atau juga ingin mengaktifkan Virtual Account (VA) dan e-wallet (GoPay, OVO, dll)?
> 3. **Hosted vs Embedded** — Apakah user di-redirect ke halaman bayar Mayar (hosted), atau QRIS image di-embed langsung di halaman checkout kita?
> 4. **Minimum Penarikan** — Berapa batas minimum saldo komisi yang bisa ditarik? (default: Rp 50.000)
> 5. **Biaya Admin Penarikan** — Apakah ada potongan biaya per penarikan? (default: Rp 0)
> 6. **Transaksi Lama** — Bagaimana penanganan transaksi `pending` yang sudah ada sebelum migrasi? Tetap verifikasi manual?
> 7. **Expired Invoice** — Berapa lama invoice Mayar berlaku sebelum expired? (rekomendasi: 24 jam)
