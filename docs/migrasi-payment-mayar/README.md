# Migrasi Pembayaran Manual → Mayar.id & Otomasi Komisi Afiliasi

## Ringkasan

Dokumen teknis lengkap untuk:
1. Migrasi sistem pembayaran dari transfer manual (QRIS statis + kode unik 3 digit + verifikasi admin) ke gerbang pembayaran otomatis Mayar.id (QRIS dinamis + webhook callback)
2. Otomasi pencatatan komisi afiliator via webhook
3. Skema saldo mengendap dan fitur penarikan mandiri (self-service withdrawal) dengan approval admin

## Struktur Dokumen

- [implementation_plan.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/migrasi-payment-mayar/implementation_plan.md) — Rencana teknis lengkap: arsitektur AS-IS/TO-BE, analisis API Mayar, database migration, server actions, webhook handler, UI changes, alur migrasi 4 fase, dan open questions

## Status

Menunggu review dan approval sebelum eksekusi.
