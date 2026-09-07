"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Search,
  ExternalLink,
  RotateCcw,
  Image as ImageIcon,
  Gift,
  Upload,
  X,
  CreditCard,
  Building,
  User,
  FileText,
  Loader2,
  Check,
  ChevronRight,
  Wallet,
  CheckCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  processAffiliatePayoutAction,
  getAffiliatePayoutDataAction,
  deleteAffiliateRecordAction,
} from "@/lib/actions/referral-actions";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

interface Affiliator {
  id: string;
  full_name: string;
  stage_name: string | null;
  email: string;
  phone_number: string;
  affiliate_code: string;
  commission_balance: number;
  total_payout_paid: number;
  joined_at: string;
  last_affiliated_at?: string | null;
}

interface PayoutRecord {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_code: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  proof_url: string | null;
  notes: string | null;
  status: string;
  confirmed_by_name: string;
  created_at: string;
}

interface CommissionMutation {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_code: string;
  type: "credit" | "debit" | string;
  amount: number;
  balance_after: number;
  source: string;
  description: string;
  created_at: string;
}

export interface AffiliateTransaction {
  id: string;
  member_id: string;
  member_name: string;
  stage_name: string | null;
  full_name: string;
  member_email: string;
  member_code: string;
  phone_number: string;
  affiliated_at: string;
  commission_amount: number;
  member_balance: number;
  description: string;
  is_paid: boolean;
  paid_at: string | null;
  payout_record?: any;
}

interface AffiliatePayoutClientProps {
  initialAffiliators: Affiliator[];
  initialPayouts: PayoutRecord[];
  initialMutations?: CommissionMutation[];
  initialTransactions?: AffiliateTransaction[];
}

export default function AffiliatePayoutClient({
  initialAffiliators,
  initialPayouts,
  initialMutations = [],
  initialTransactions = [],
}: AffiliatePayoutClientProps) {
  const [affiliators, setAffiliators] = useState<Affiliator[]>(initialAffiliators);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(initialPayouts);
  const [mutations, setMutations] = useState<CommissionMutation[]>(initialMutations);
  const [transactions, setTransactions] = useState<AffiliateTransaction[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal Payout States (Per-Transaction)
  const [selectedPayoutTransaction, setSelectedPayoutTransaction] = useState<AffiliateTransaction | null>(null);

  // Upload Bukti State
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Preview Bukti
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Modal Detail Mutasi Per Affiliator
  const [detailLedgerAffiliator, setDetailLedgerAffiliator] = useState<Affiliator | null>(null);

  // Modal Delete / Reset Per Affiliator / Transaksi
  const [selectedDeleteTransaction, setSelectedDeleteTransaction] = useState<AffiliateTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await getAffiliatePayoutDataAction();
      if (res.success && res.data) {
        setAffiliators(res.data.affiliators);
        setPayouts(res.data.payouts);
        setMutations(res.data.mutations || []);
        if (res.data.transactions) {
          setTransactions(res.data.transactions);
        }
      } else if (res.error) {
        console.error("Gagal menyegarkan data payout:", res.error);
      }
    } catch (err) {
      console.error("Gagal menyegarkan data payout:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Metrics Calculations (Murni dihitung dari tabel commission_ledger)
  const metrics = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Saldo Belum Dibayar: Total amount komisi pending dari commission_ledger
    const totalUnpaidBalance = transactions
      .filter((t) => !t.is_paid)
      .reduce((sum, t) => sum + (t.commission_amount || 0), 0);

    // Total Payout Bulan Ini: Total amount komisi paid dari commission_ledger pada bulan berjalan
    const monthPaid = mutations
      .filter((m) => m.type === "paid" && new Date(m.created_at) >= startOfMonth)
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    // Affiliator Aktif: Jumlah unik kreator/affiliator yang memiliki komisi pending di commission_ledger
    const activeAffiliatorsCount = new Set(
      transactions.filter((t) => !t.is_paid).map((t) => t.member_id)
    ).size;

    return {
      totalUnpaidBalance,
      monthPaid,
      activeAffiliatorsCount,
    };
  }, [transactions, mutations]);

  // Filtered Transactions (Hanya data transaksi affiliate, berurutan berdasarkan tanggal)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchName = t.member_name?.toLowerCase().includes(q) || false;
      const matchEmail = t.member_email?.toLowerCase().includes(q) || false;
      const matchCode = t.member_code?.toLowerCase().includes(q) || false;
      const matchDesc = t.description?.toLowerCase().includes(q) || false;
      return matchName || matchEmail || matchCode || matchDesc;
    });
  }, [transactions, search]);

  // Handle Buka & Tutup Modal Konfirmasi Payout
  const handleOpenPayoutModalFromTransaction = (item: AffiliateTransaction) => {
    setSelectedPayoutTransaction(item);
    setProofFile(null);
    setProofPreviewUrl(null);
    setCompressionInfo(null);
  };

  const handleClosePayoutModal = () => {
    setSelectedPayoutTransaction(null);
    setProofFile(null);
    setProofPreviewUrl(null);
    setCompressionInfo(null);
    setIsSubmitting(false);
  };

  const handleOpenDetailModalFromTransaction = (item: AffiliateTransaction) => {
    const affiliatorObj: Affiliator = {
      id: item.member_id,
      full_name: item.full_name,
      stage_name: item.stage_name,
      email: item.member_email,
      phone_number: item.phone_number,
      affiliate_code: item.member_code,
      commission_balance: item.member_balance,
      total_payout_paid: 0,
      joined_at: item.affiliated_at,
    };
    setDetailLedgerAffiliator(affiliatorObj);
  };

  // Handle Pilih & Kompresi Foto Bukti Transfer (WebP High Readability & Small Size)
  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    const originalSizeKb = (file.size / 1024).toFixed(1);
    setIsCompressingProof(true);

    try {
      const compressed = await compressImageForTarget(file, "proof");
      const compressedSizeKb = (compressed.size / 1024).toFixed(1);

      setProofFile(compressed);
      setProofPreviewUrl(URL.createObjectURL(compressed));
      setCompressionInfo(
        `Kompresi cerdas: ${originalSizeKb} KB → ${compressedSizeKb} KB (Hemat ${(
          (1 - compressed.size / file.size) *
          100
        ).toFixed(0)}%)`
      );
    } catch (err) {
      console.warn("Kompresi gagal, menggunakan file asli:", err);
      setProofFile(file);
      setProofPreviewUrl(URL.createObjectURL(file));
      setCompressionInfo(`Ukuran: ${originalSizeKb} KB`);
    } finally {
      setIsCompressingProof(false);
    }
  };

  // Handle Submit Payout
  const handleSubmitPayout = async () => {
    if (!selectedPayoutTransaction) return;

    const rawNum = selectedPayoutTransaction.commission_amount;
    if (isNaN(rawNum) || rawNum <= 0) {
      toast.error("Nominal pembayaran harus lebih dari Rp 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedProofUrl: string | null = null;

      // 1. Upload Bukti Transfer jika dilampirkan
      if (proofFile) {
        const supabase = createClient();
        const fileExt = proofFile.type === "image/webp" ? "webp" : "jpg";
        const fileName = `${selectedPayoutTransaction.member_id}_${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("payout-proofs")
          .upload(filePath, proofFile, {
            contentType: proofFile.type,
            upsert: false,
          });

        if (uploadErr) {
          console.error("Upload bukti transfer error:", uploadErr);
          const proceed = confirm(
            `Gagal mengunggah foto bukti transfer (${uploadErr.message}). Tetap lanjutkan konfirmasi tanpa foto bukti?`
          );
          if (!proceed) {
            setIsSubmitting(false);
            return;
          }
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("payout-proofs")
            .getPublicUrl(uploadData.path);
          uploadedProofUrl = publicUrlData.publicUrl;
        }
      }

      // 2. Eksekusi Server Action
      const result = await processAffiliatePayoutAction({
        memberId: selectedPayoutTransaction.member_id,
        amount: rawNum,
        ledgerId: selectedPayoutTransaction.id,
        proofUrl: uploadedProofUrl,
      });

      if (!result.success) {
        throw new Error(result.error || "Gagal memproses konfirmasi payout.");
      }

      toast.success(
        `Pembayaran komisi ${formatCurrency(rawNum)} kepada ${
          selectedPayoutTransaction.stage_name || selectedPayoutTransaction.member_name
        } berhasil dikonfirmasi!`
      );

      handleClosePayoutModal();
      await refreshData();
    } catch (err: any) {
      console.error("Payout error:", err);
      toast.error("Error: " + (err.message || "Gagal memproses payout."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete / Reset Record Affiliator
  const handleConfirmDelete = async () => {
    if (!selectedDeleteTransaction) return;
    setIsDeleting(true);
    try {
      const res = await deleteAffiliateRecordAction({
        memberId: selectedDeleteTransaction.member_id,
        ledgerId: selectedDeleteTransaction.id,
      });
      if (!res.success) {
        throw new Error(res.error || "Gagal menghapus data affiliate.");
      }
      toast.success("Data transaksi berhasil dihapus.");
      setSelectedDeleteTransaction(null);
      await refreshData();
    } catch (err: any) {
      console.error("Delete affiliate record error:", err);
      toast.error("Error: " + (err.message || "Gagal menghapus data affiliate."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-text-primary">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/60">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ DATA CENTER ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Konfirmasi Pembayaran Affiliate
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manajemen pencairan komisi (payout) ke rekening atau e-wallet affiliator
          </p>
        </div>

        {/* Action Header Button: Refresh Data */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto disabled:opacity-50 active:scale-95"
        >
          <RotateCcw size={13} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? "Menyegarkan..." : "Segarkan"}</span>
        </button>
      </div>

      {/* ═══ COMPACT CAPSULE SUMMARY PILLS BAR ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-start gap-2 shadow-2xs">
        {/* Saldo Belum Dibayar */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bg-well/80 border border-border-default/60 text-xs font-mono text-text-secondary shrink-0">
          <span className="text-[10px] uppercase font-bold text-text-muted">SALDO BELUM DIBAYAR:</span>
          <span className="font-bold text-text-primary">{formatCurrency(metrics.totalUnpaidBalance)}</span>
        </div>

        {/* Total Payout Bulan Ini */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700 dark:text-amber-300 shrink-0">
          <span className="text-[10px] uppercase font-bold text-amber-600/80 dark:text-amber-400/80">TOTAL PAYOUT (BULAN INI):</span>
          <span className="font-extrabold">{formatCurrency(metrics.monthPaid)}</span>
        </div>

        {/* Affiliator Aktif */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#dcfce7]/80 dark:bg-emerald-950/40 border border-emerald-300/30 text-xs font-mono text-[#15803d] dark:text-emerald-300 shrink-0">
          <span className="text-[10px] uppercase font-bold opacity-80">AFFILIATOR AKTIF:</span>
          <span className="font-black">{metrics.activeAffiliatorsCount} Kreator</span>
        </div>
      </div>

      {/* Tabs & Search Controls (Horizontal Capsule Pills - Pola 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* Quick Search Input (Tinggi h-9, rounded-full) */}
        <div className="relative w-full sm:w-[280px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-bg-well/70 border border-border-default rounded-full focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted text-text-primary shadow-2xs"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* DAFTAR AFFILIATOR                                         */}
      {/* ========================================================= */}
          {/* Mobile Cards View (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="rounded-3xl p-8 border border-border-default/70 bg-bg-card text-center text-xs text-text-secondary">
                Tidak ada data transaksi affiliate yang ditemukan.
              </div>
            ) : (
              filteredTransactions.map((item) => {
                const isUnpaid = !item.is_paid && item.member_balance > 0;
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl p-5 border border-border-default/70 bg-bg-card shadow-xs active:scale-[0.99] transition-all space-y-3.5"
                  >
                    {/* Header: Nama & Kode Referral */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-text-primary">
                          {item.stage_name || item.full_name}
                        </div>
                        {item.stage_name && (
                          <div className="text-[11px] text-text-secondary">
                            {item.full_name}
                          </div>
                        )}
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {item.member_email}
                        </div>
                      </div>
                      <span className="font-mono font-bold px-2 py-0.5 bg-bg-well rounded-md border border-border-default text-[10px] text-text-primary shrink-0">
                        {item.member_code}
                      </span>
                    </div>

                    {/* Metadata: Tanggal Berhasil Diaffiliatekan & Saldo */}
                    <div className="p-3 bg-bg-well/50 rounded-2xl border border-border-default/60 text-xs flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-text-secondary">Tanggal Berhasil Diaffiliatekan:</div>
                        <div className="font-semibold text-text-primary text-[11px] mt-0.5">
                          {formatDate(item.affiliated_at)}
                        </div>
                        <div className="text-[9px] text-text-muted line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-text-secondary">Komisi Transaksi:</div>
                        <div
                          className={`font-extrabold text-sm ${
                            isUnpaid
                              ? "text-green-600 dark:text-green-400"
                              : "text-text-primary"
                          }`}
                        >
                          {formatCurrency(item.commission_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Konfirmasi & Aksi */}
                    <div className="pt-1 border-t border-border-default/40 flex items-center justify-between">
                      <div>
                        {isUnpaid ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Menunggu Konfirmasi
                          </span>
                        ) : (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={11} /> Dibayar: {formatDateOnly(item.paid_at || item.affiliated_at)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Icon Button Detail */}
                        <button
                          onClick={() => handleOpenDetailModalFromTransaction(item)}
                          className="w-8 h-8 rounded-xl bg-bg-well hover:bg-bg-page border border-border-default text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                          title="Lihat Detail Mutasi Komisi"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Icon Button Delete */}
                        <button
                          onClick={() => setSelectedDeleteTransaction(item)}
                          className="w-8 h-8 rounded-xl bg-bg-well hover:bg-red-500/10 border border-border-default hover:border-red-500/30 text-text-secondary hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                          title="Hapus Data Transaksi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Tombol Konfirmasi jika belum dibayar */}
                    {isUnpaid && (
                      <button
                        onClick={() => handleOpenPayoutModalFromTransaction(item)}
                        className="w-full h-10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 shadow-xs"
                      >
                        <CreditCard size={13} />
                        <span>Konfirmasi Pembayaran</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block rounded-3xl border border-border-default/70 bg-bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-default/70 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="py-3.5 px-6 border-r border-border-default/60 font-semibold text-text-secondary">
                    Nama Afiliator
                  </th>
                  <th className="py-3.5 px-6 border-r border-border-default/60 font-semibold text-text-secondary">
                    Tanggal Transaksi
                  </th>
                  <th className="py-3.5 px-6 border-r border-border-default/60 font-semibold text-text-secondary text-right">
                    Komisi Transaksi
                  </th>
                  <th className="py-3.5 px-6 border-r border-border-default/60 font-semibold text-text-secondary text-center">
                    Konfirmasi
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-text-secondary text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40 text-text-primary">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-text-secondary">
                      Tidak ada data transaksi affiliate yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item) => {
                    const isUnpaid = !item.is_paid;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                      >
                        {/* Nama Afiliator & Kode & Email */}
                        <td className="py-4 px-6 border-r border-border-default/40">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-text-primary">
                              {item.stage_name || item.full_name}
                            </div>
                            <span className="font-mono font-bold px-2 py-0.5 bg-bg-well rounded-md border border-border-default text-[10px] text-text-primary">
                              {item.member_code}
                            </span>
                          </div>
                          {item.stage_name && (
                            <div className="text-[11px] text-text-secondary">
                              {item.full_name}
                            </div>
                          )}
                          <div className="text-[10px] text-text-muted mt-0.5">
                            {item.member_email}
                          </div>
                        </td>

                        {/* Tanggal Transaksi */}
                        <td className="py-4 px-6 border-r border-border-default/40 whitespace-nowrap">
                          <div className="font-medium text-text-primary">
                            {formatDate(item.affiliated_at)}
                          </div>
                          <span className="text-[10px] text-text-muted line-clamp-1">
                            {item.description || "Komisi Penjualan"}
                          </span>
                        </td>

                        {/* Komisi yang Harus Dikirim */}
                        <td className="py-4 px-6 border-r border-border-default/40 text-right">
                          <div
                            className={`font-extrabold text-sm ${
                              isUnpaid
                                ? "text-green-600 dark:text-green-400"
                                : "text-text-primary"
                            }`}
                          >
                            {formatCurrency(item.commission_amount)}
                          </div>
                          {isUnpaid ? (
                            <span className="inline-block mt-0.5 text-[9px] px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold">
                              Siap Cair
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[9px] text-text-muted">
                              Lunas
                            </span>
                          )}
                        </td>

                        {/* Kolom Konfirmasi */}
                        <td className="py-4 px-6 border-r border-border-default/40 text-center">
                          {isUnpaid ? (
                            <button
                              onClick={() => handleOpenPayoutModalFromTransaction(item)}
                              className="h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95"
                            >
                              <CreditCard size={13} />
                              <span>Konfirmasi</span>
                            </button>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs inline-flex items-center gap-1">
                                <CheckCircle size={12} />
                                {formatDateOnly(item.paid_at || item.affiliated_at)}
                              </span>
                              <span className="text-[10px] text-text-muted mt-0.5">
                                Sudah Dibayar
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Kolom Aksi (Icon Button Detail & Delete -> Modal Confirmation) */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Button Detail -> Modal Detail Mutasi */}
                            <button
                              onClick={() => handleOpenDetailModalFromTransaction(item)}
                              className="w-8 h-8 rounded-xl bg-bg-well hover:bg-bg-page border border-border-default text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                              title="Lihat Detail Mutasi Komisi"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Button Delete -> Modal Konfirmasi Hapus */}
                            <button
                              onClick={() => setSelectedDeleteTransaction(item)}
                              className="w-8 h-8 rounded-xl bg-bg-well hover:bg-red-500/10 border border-border-default hover:border-red-500/30 text-text-secondary hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                              title="Hapus Data Transaksi"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>


      {/* ========================================================= */}
      {/* MODAL: DETAIL RIWAYAT MUTASI INDIVIDUAL AFFILIATOR       */}
      {/* ========================================================= */}
      {detailLedgerAffiliator && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border-0 sm:border border-border-default rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
            <div className="px-6 py-4 border-b border-border-default/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <History size={18} />
                  <span>Riwayat Mutasi Komisi</span>
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {detailLedgerAffiliator.stage_name || detailLedgerAffiliator.full_name} ({detailLedgerAffiliator.email})
                </p>
              </div>
              <button
                onClick={() => setDetailLedgerAffiliator(null)}
                className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-bg-well/60 border border-border-default/70 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-bold">Kode Referral</div>
                  <div className="font-mono font-bold text-sm text-text-primary">
                    {detailLedgerAffiliator.affiliate_code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-text-secondary">Saldo Saat Ini</div>
                  <div className="text-base font-extrabold text-green-600 dark:text-green-400">
                    {formatCurrency(detailLedgerAffiliator.commission_balance)}
                  </div>
                </div>
              </div>

              {/* Tabel Mutasi Affiliator Terpilih */}
              <div className="rounded-2xl border border-border-default/70 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-default/70 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <th className="py-2.5 px-4 font-semibold text-text-secondary">Tanggal</th>
                      <th className="py-2.5 px-4 font-semibold text-text-secondary">Keterangan</th>
                      <th className="py-2.5 px-4 font-semibold text-text-secondary text-center">Tipe</th>
                      <th className="py-2.5 px-4 font-semibold text-text-secondary text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/40 text-text-primary">
                    {mutations.filter((m) => m.member_id === detailLedgerAffiliator.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text-secondary">
                          Belum ada transaksi mutasi untuk affiliator ini.
                        </td>
                      </tr>
                    ) : (
                      mutations
                        .filter((m) => m.member_id === detailLedgerAffiliator.id)
                        .map((m) => {
                          const isPaid = m.type === "paid";
                          return (
                            <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                              <td className="py-3 px-4 text-text-secondary font-mono text-[11px]">
                                {formatDate(m.created_at)}
                              </td>
                              <td className="py-3 px-4 font-medium text-text-primary">
                                {m.description}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                                    isPaid
                                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  }`}
                                >
                                  {isPaid ? "TERBAYAR" : "PENDING"}
                                </span>
                              </td>
                              <td
                                className={`py-3 px-4 text-right font-mono font-bold ${
                                  isPaid ? "text-text-primary" : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {isPaid ? "" : "+"} {formatCurrency(m.amount)}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-default/70 bg-bg-well/40 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailLedgerAffiliator(null)}
                className="h-10 px-5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: KONFIRMASI PEMBAYARAN AFFILIATE (MODAL COMPONENT)  */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!selectedPayoutTransaction}
        onClose={handleClosePayoutModal}
        title="Konfirmasi Pembayaran Affiliate"
        subtitle={`Pencairan komisi untuk ${selectedPayoutTransaction?.stage_name || selectedPayoutTransaction?.member_name || "Affiliator"}`}
        icon={<CreditCard size={18} />}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={handleClosePayoutModal}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-bold bg-bg-card border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmitPayout}
              disabled={isSubmitting || isCompressingProof}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Konfirmasi Pembayaran</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedPayoutTransaction && (
          <div className="space-y-4 text-xs pt-1">
            {/* 1. Nama Penerima & Info Komisi (Pure dari amount) */}
            <div className="bg-bg-well/60 border border-border-default/70 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Nama Penerima
                </span>
                <div className="font-bold text-text-primary text-sm mt-0.5">
                  {selectedPayoutTransaction.stage_name || selectedPayoutTransaction.member_name}
                </div>
                <div className="text-[11px] text-text-secondary mt-0.5">
                  {selectedPayoutTransaction.member_email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-text-secondary">Komisi Dicairkan</div>
                <div className="text-base font-extrabold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedPayoutTransaction.commission_amount)}
                </div>
              </div>
            </div>

            {/* 2. Upload Bukti Pembayaran (Opsional) */}
            <div>
              <label className="font-semibold text-text-primary flex items-center justify-between mb-1.5">
                <span>Bukti Pembayaran <span className="text-text-muted font-normal">(Opsional)</span></span>
                {isCompressingProof && (
                  <span className="text-blue-500 inline-flex items-center gap-1 text-[10px]">
                    <Loader2 size={10} className="animate-spin" /> Mengompres cerdas...
                  </span>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProofFileChange}
                className="hidden"
              />

              {proofPreviewUrl ? (
                <div className="relative border border-border-default rounded-2xl p-3 bg-bg-well/50 flex items-center gap-3">
                  <img
                    src={proofPreviewUrl}
                    alt="Preview Bukti"
                    className="w-14 h-14 object-cover rounded-xl border border-border-default shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary truncate text-xs">
                      {proofFile?.name || "Bukti Transfer"}
                    </div>
                    {compressionInfo && (
                      <div className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">
                        {compressionInfo}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-blue-500 hover:underline font-semibold mt-0.5 block cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreviewUrl(null);
                      setCompressionInfo(null);
                    }}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-bg-well transition-colors cursor-pointer shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-default/80 hover:border-text-secondary rounded-2xl p-5 text-center cursor-pointer bg-bg-well/30 hover:bg-bg-well/60 transition-colors"
                >
                  <Upload className="mx-auto w-5 h-5 text-text-secondary mb-1.5" />
                  <div className="font-semibold text-text-primary text-xs">
                    Klik untuk unggah struk / bukti pembayaran
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    JPG, PNG, WebP (Otomatis dikompres &amp; hemat storage)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL: PREVIEW BUKTI TRANSFER                    */}
      {/* ========================================================= */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-bg-card border border-border-default rounded-3xl overflow-hidden shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-border-default/70 mb-3">
              <span className="font-bold text-xs text-text-primary">
                Foto Bukti Transfer
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 px-3 rounded-full bg-bg-well border border-border-default text-text-secondary hover:text-text-primary cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink size={13} />
                  <span>Buka Tab Baru</span>
                </a>
                <button
                  onClick={() => setPreviewModalUrl(null)}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-auto flex justify-center bg-black/5 dark:bg-black/40 rounded-2xl p-2 border border-border-default/40">
              <img
                src={previewModalUrl}
                alt="Bukti Transfer Payout"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
      {/* MODAL: KONFIRMASI HAPUS DATA AFFILIATE                    */}
      {/* ========================================================= */}
      {selectedDeleteTransaction && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border-0 sm:border border-border-default rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle size={20} />
              </div>
              <button
                onClick={() => setSelectedDeleteTransaction(null)}
                className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-text-primary">
                Konfirmasi Hapus Data Transaksi
              </h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus data transaksi affiliate untuk{" "}
                <span className="font-bold text-text-primary">
                  {selectedDeleteTransaction.member_name}
                </span>{" "}
                ({selectedDeleteTransaction.member_email}) senilai{" "}
                <span className="font-bold text-text-primary">
                  {formatCurrency(selectedDeleteTransaction.commission_amount)}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDeleteTransaction(null)}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-bg-card border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Hapus Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
