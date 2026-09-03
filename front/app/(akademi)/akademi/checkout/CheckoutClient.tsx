"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { signout } from '@/lib/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';
import { registerMemberAction, validateVoucherAction } from '@/lib/actions/checkout-actions';
import { validateReferralCodeAction } from '@/lib/actions/referral-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/Modal';
import { InputLine } from '@/components/ui/style-line/InputLine';
import { PhoneNumberLine } from '@/components/ui/style-line/PhoneNumberLine';

const formatWhatsapp = (value: string) => {
  let digits = value.replace(/\D/g, '');

  // Jika diawali 62, ubah ke 0
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }

  // Jika tidak kosong dan tidak diawali 0, tambahkan 0 di depan
  if (digits.length > 0 && !digits.startsWith('0')) {
    digits = '0' + digits;
  }

  const truncated = digits.slice(0, 13);
  const parts = [];
  for (let i = 0; i < truncated.length; i += 4) {
    parts.push(truncated.slice(i, i + 4));
  }
  return parts.join('-');
};

export default function CheckoutClient({ selectedPackage }: { selectedPackage: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrisGenerated, setQrisGenerated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbMember, setDbMember] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [generatedAccount, setGeneratedAccount] = useState<{ username: string, password: string } | null>(null);
  const [error, setError] = useState("");
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  // Voucher State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string, discountNominal: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Referral Code State
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [appliedReferral, setAppliedReferral] = useState<{ code: string, ownerName: string } | null>(null);
  const [referralMessage, setReferralMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isReferralFromUrl, setIsReferralFromUrl] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    stageName: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    email: '',
    profession: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      // Check localStorage for cached checkout state first to load payment section instantly
      const cachedStateStr = typeof window !== 'undefined' ? localStorage.getItem("pangkreas_checkout_state") : null;
      if (cachedStateStr) {
        try {
          const cached = JSON.parse(cachedStateStr);
          if (cached && cached.expiry && Date.now() < cached.expiry) {
            setGeneratedAccount(cached.accountData);
            setDbMember(cached.memberData);
            setQrisGenerated(true);
            setLoadingSession(false);

            // Fetch session in the background to verify/redirect if paid
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              setCurrentUser(session.user);
              const { data: member } = await supabase
                .from("members")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();

              if (member) {
                if (member.role === 'admin') {
                  localStorage.removeItem("pangkreas_checkout_state");
                  setCurrentUser(null);
                  setDbMember(null);
                  setQrisGenerated(false);
                } else if (member.payment_status === 'paid') {
                  localStorage.removeItem("pangkreas_checkout_state");
                  router.push('/myprofile');
                } else {
                  const { data: transaction } = await supabase
                    .from("transactions")
                    .select("unique_code")
                    .eq("member_id", session.user.id)
                    .eq("status", "pending")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                  const derivedUniqueCode = transaction?.unique_code || (member.final_price ? member.final_price % 1000 : 0);
                  const updatedMemberData = {
                    ...member,
                    unique_code: derivedUniqueCode
                  };
                  setDbMember(updatedMemberData);
                  localStorage.setItem("pangkreas_checkout_state", JSON.stringify({
                    accountData: cached.accountData,
                    memberData: updatedMemberData,
                    expiry: cached.expiry
                  }));
                }
              } else {
                // If member record doesn't exist in database (e.g. deleted by admin), clear session and cache
                await supabase.auth.signOut();
                localStorage.removeItem("pangkreas_checkout_state");
                setCurrentUser(null);
                setDbMember(null);
                setQrisGenerated(false);
              }
            }
            return;
          } else {
            localStorage.removeItem("pangkreas_checkout_state");
          }
        } catch (e) {
          console.error("Error parsing cached checkout state:", e);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);

        // Fetch member profile
        const { data: member } = await supabase
          .from("members")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (member) {
          if (member.role === 'admin') {
            // Jika admin, biarkan form kosong dan jangan ambil data admin ke form
            setCurrentUser(null);
            setDbMember(null);
            setQrisGenerated(false);
          } else {
            if (member.payment_status === 'paid') {
              // Redirect member yang sudah lunas ke dashboard akademi
              localStorage.removeItem("pangkreas_checkout_state");
              router.push('/akademi/dashboard');
            } else {
              // Fetch pending transaction to get unique_code
              const { data: transaction } = await supabase
                .from("transactions")
                .select("unique_code")
                .eq("member_id", session.user.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              const derivedUniqueCode = transaction?.unique_code || (member.final_price ? member.final_price % 1000 : 0);
              const memberData = {
                ...member,
                unique_code: derivedUniqueCode
              };
              setDbMember(memberData);
              // Set values to form
              setFormData({
                fullName: member.full_name || '',
                stageName: member.stage_name || '',
                instagram: member.instagram_username || '',
                tiktok: member.tiktok_username || '',
                whatsapp: member.whatsapp_number || '',
                email: member.email || session.user.email || '',
                profession: member.occupation || ''
              });
              // Set applied voucher if exists
              if (member.used_voucher_code && member.final_price) {
                // Determine base price based on member's package or fallback to selectedPackage
                const parsedPrice = selectedPackage?.price ? parseInt(selectedPackage.price.replace(/\D/g, ""), 10) : 49000;
                const activeBasePrice = isNaN(parsedPrice) ? 49000 : parsedPrice;

                const discount = activeBasePrice - (member.final_price - (transaction?.unique_code || 0));
                setAppliedVoucher({
                  code: member.used_voucher_code,
                  discountNominal: discount > 0 ? discount : 0
                });
              }
              if (member.payment_status === 'pending') {
                setQrisGenerated(true);
                // Cache this state
                localStorage.setItem("pangkreas_checkout_state", JSON.stringify({
                  accountData: null,
                  memberData,
                  expiry: Date.now() + 3 * 60 * 60 * 1000 // 3 hours
                }));
              }
            }
          }
        } else {
          // If logged in via Auth but no record in members table (deleted by admin), clear session and cache
          await supabase.auth.signOut();
          localStorage.removeItem("pangkreas_checkout_state");
          setCurrentUser(null);
          setDbMember(null);
          setQrisGenerated(false);
          setFormData({
            fullName: '',
            stageName: '',
            instagram: '',
            tiktok: '',
            whatsapp: '',
            email: '',
            profession: ''
          });
        }
      }
      setLoadingSession(false);
    };

    // Auto-detect referral code from URL parameter (?ref=... or ?referral=...)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || urlParams.get('referral');
      if (refParam) {
        const cleanRef = refParam.trim().toUpperCase();
        setReferralCodeInput(cleanRef);
        setShowReferralInput(true);
        setIsReferralFromUrl(true);

        validateReferralCodeAction(cleanRef).then((res) => {
          if (res.success) {
            setAppliedReferral({ code: res.code!, ownerName: res.ownerName! });
            setReferralMessage({ type: 'success', text: `Kode referral terpasang` });
          } else {
            setReferralMessage({ type: 'error', text: res.error || "Kode referral dari link tidak valid." });
          }
        });
      }
    }

    checkSession();
  }, []);

  // Validation Errors State
  const [errors, setErrors] = useState({
    fullName: '',
    whatsapp: '',
    email: ''
  });

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      whatsapp: '',
      email: ''
    };
    let isValid = true;

    // Nama Lengkap validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama Lengkap wajib diisi';
      isValid = false;
    }

    // WhatsApp validation
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
      isValid = false;
    } else {
      const cleanWa = formData.whatsapp.replace(/\D/g, '');
      if (cleanWa.length < 10 || cleanWa.length > 13) {
        newErrors.whatsapp = 'Nomor WhatsApp harus terdiri dari 10-13 digit angka';
        isValid = false;
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Alamat Email wajib diisi';
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Format email tidak valid (contoh: nama@email.com)';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Bersihkan karakter @ di awal jika user mengetikkan secara manual
    const cleanValue = value.startsWith('@') ? value.slice(1) : value;
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formatted = formatWhatsapp(value);

    setFormData(prev => ({ ...prev, whatsapp: formatted }));
    if (errors.whatsapp) {
      setErrors(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherMessage(null);

    try {
      const result = await validateVoucherAction(voucherCodeInput.trim());
      if (result.success) {
        let discountNominal = 0;
        const parsedBase = selectedPackage?.price ? parseInt(selectedPackage.price.replace(/\D/g, ""), 10) : 49000;
        const dynamicBasePrice = isNaN(parsedBase) ? 49000 : parsedBase;

        if (result.discount_type === 'nominal') {
          discountNominal = result.discount_value!;
        } else if (result.discount_type === 'percentage') {
          discountNominal = (dynamicBasePrice * result.discount_value!) / 100;
        }

        setAppliedVoucher({
          code: voucherCodeInput.trim().toUpperCase(),
          discountNominal
        });
        setVoucherMessage({ type: 'success', text: `Voucher berhasil digunakan! Diskon Rp ${discountNominal.toLocaleString('id-ID')}` });
      } else {
        setVoucherMessage({ type: 'error', text: result.error || "Voucher tidak valid." });
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherMessage({ type: 'error', text: "Gagal memvalidasi voucher." });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setVoucherMessage(null);
  };

  const handleApplyReferral = async () => {
    if (!referralCodeInput.trim()) return;
    setIsValidatingReferral(true);
    setReferralMessage(null);

    try {
      const result = await validateReferralCodeAction(referralCodeInput.trim());
      if (result.success) {
        setAppliedReferral({
          code: result.code!,
          ownerName: result.ownerName!,
        });
        setReferralMessage({
          type: 'success',
          text: `Kode referral terpasang`
        });
      } else {
        setReferralMessage({ type: 'error', text: result.error || "Kode referral tidak valid." });
        setAppliedReferral(null);
      }
    } catch (err) {
      setReferralMessage({ type: 'error', text: "Gagal memvalidasi kode referral." });
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralCodeInput("");
    setReferralMessage(null);
    setIsReferralFromUrl(false);
  };

  const handleGenerateQris = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Panggil server action untuk register member & generate akun login
      const payloadData = {
        ...formData,
        fullName: formData.fullName.trim(),
        stageName: formData.stageName.trim() || formData.fullName.trim(),
        instagram: formData.instagram.replace(/^@+/, "").trim(),
        tiktok: formData.tiktok.replace(/^@+/, "").trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        profession: formData.profession.trim(),
        packageId: selectedPackage?.id,
        usedVoucherCode: appliedVoucher?.code,
        referralCode: appliedReferral?.code
      };
      const result = await registerMemberAction(payloadData);

      if (result.success) {
        const accountData = {
          username: result.username!,
          password: result.password!
        };
        const memberData = {
          username: result.username!,
          final_price: result.finalPrice!,
          unique_code: result.uniqueCode!,
          used_voucher_code: appliedVoucher?.code || null
        };

        setGeneratedAccount(accountData);
        setDbMember(memberData);
        setQrisGenerated(true);

        // Save to localStorage to persist across reloads (expires in 3 hours)
        localStorage.setItem("pangkreas_checkout_state", JSON.stringify({
          accountData,
          memberData,
          expiry: Date.now() + 3 * 60 * 60 * 1000 // 3 hours
        }));

        // Refresh session state local
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        }
      } else {
        setError(result.error || "Gagal memproses pendaftaran.");
      }
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      setError("Terjadi kesalahan sistem, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signout();
      setCurrentUser(null);
      setDbMember(null);
      setQrisGenerated(false);
      localStorage.removeItem("pangkreas_checkout_state");
      setFormData({
        fullName: '',
        stageName: '',
        instagram: '',
        tiktok: '',
        whatsapp: '',
        email: '',
        profession: ''
      });
      router.push('/login');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  const activeUsername = dbMember?.username || generatedAccount?.username || '';
  const activePassword = generatedAccount?.password || '';

  const parsedBasePrice = selectedPackage?.price ? parseInt(selectedPackage.price.replace(/\D/g, ""), 10) : 49000;
  const basePrice = isNaN(parsedBasePrice) ? 49000 : parsedBasePrice;

  const finalPrice = (dbMember && qrisGenerated)
    ? dbMember.final_price
    : (appliedVoucher ? Math.max(0, basePrice - appliedVoucher.discountNominal) : basePrice);

  const uniqueCode = (dbMember && qrisGenerated)
    ? (dbMember.unique_code || (dbMember.final_price ? dbMember.final_price % 1000 : 0))
    : 0;

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#2c2c2c] dark:text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#bc151b] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium animate-pulse">Memuat sesi pendaftaran...</p>
        </div>
      </div>
    );
  }

  const renderQrisBlock = (isMobile = false) => (
    <div className="w-full">
      <img src="/qris.jpeg" alt="QRIS Panggung Kreator" className={`${isMobile ? "w-64" : "w-80 md:w-96"} h-auto mx-auto object-contain`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#2c2c2c] dark:text-white font-sans transition-colors duration-300 selection:bg-[#bc151b] selection:text-white">
      {/* Header Minimalis */}
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-xl font-title font-bold uppercase mb-1 text-zinc-900 dark:text-white">
            Pendaftaran <span className="text-[#bc151b]">Panggung Kreator Akademi</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs">
            {qrisGenerated
              ? "Selesaikan pembayaran manual Anda untuk mengaktifkan akun."
              : "Lengkapi data diri lo dan selesaikan pembayaran untuk bergabung."
            }
          </p>
        </div>

        {qrisGenerated ? (
          /* TAMPILAN 2 KOLOM UNTUK PEMBAYARAN (QRIS GENERATED) */
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full max-w-5xl mx-auto">
            {/* Kolom Kiri: Info Pendaftaran, Rincian, Langkah, & WhatsApp Button (Tanpa Background Card, Ditambah Separator Kanan) */}
            <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-4 animate-fade-in transition-colors duration-300 lg:border-r lg:border-zinc-200 dark:lg:border-zinc-800 lg:pr-8">
              <div className="space-y-4">
                {/* Header: Status Pendaftaran */}
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                    ✓
                  </div>
                  <div>
                    <h2 className="font-title font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                      Pendaftaran Berhasil diproses
                    </h2>
                    <p className="text-[10px] text-zinc-400">Akun Anda sedang disiapkan di sistem</p>
                  </div>
                </div>

                {/* Rincian Tagihan & Nominal */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200 dark:border-white/5 text-xs">
                  <div className="flex justify-between items-center mb-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                    <span>Panggung Kreator Akademi</span>
                    <span className="uppercase tracking-wider font-semibold">({selectedPackage?.name || "Paket Advanced"})</span>
                  </div>
                  <div className="space-y-1.5 text-zinc-500 dark:text-zinc-400 text-[14px]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {appliedVoucher && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Diskon ({appliedVoucher.code})</span>
                        <span>- Rp {appliedVoucher.discountNominal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {uniqueCode > 0 && (
                      <div className="flex justify-between">
                        <span>Kode Unik</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ Rp {uniqueCode.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-dashed border-zinc-200 dark:border-white/10 my-2 pt-2 flex justify-between items-center font-bold text-zinc-900 dark:text-white text-sm">
                    <span>Total Transfer</span>
                    <span className="text-[#bc151b] text-base">Rp {finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* QRIS Code (Mobile Only - Tampil di bawah Total Transfer) */}
                <div className="lg:hidden mt-2">
                  {renderQrisBlock(true)}
                </div>

                {/* Langkah Pembayaran */}
                <div className="text-[14px] text-zinc-600 dark:text-zinc-400 space-y-1.5 border-t border-zinc-100 dark:border-white/5 pt-3">
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    <span>Transfer tepat <strong className="text-red-600 font-semibold">Rp {finalPrice.toLocaleString('id-ID')}</strong> (termasuk kode unik).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-600">2.</span>
                    <span>Ambil screenshot bukti transfer sukses Anda.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-600">3.</span>
                    <span>Kirim bukti transfer ke WhatsApp admin menggunakan tombol di bawah.</span>
                  </div>
                </div> <div className="pt-3 border-t border-zinc-100 dark:border-white/5">
                  {/* Tombol CTA WhatsApp */}
                  <a
                    href={`https://wa.me/6281111156736?text=Halo%20Admin%20Panggung%20Kreator%2C%20saya%20sudah%20melakukan%20pembayaran%20pendaftaran%20Akademi.%20Berikut%20bukti%20transfernya.%0A%0AUsername%20Login%20Saya%3A%20${activeUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.15)] text-xs"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.472.945 6.037.945 1.611 5.316 1.607 10.744c-.002 1.716.446 3.39 1.298 4.872L1.876 21.09l5.771-1.936z" />
                    </svg>
                    Kirim Bukti Transfer ke WhatsApp
                  </a>

                  {/* Keamanan */}

                </div>
              </div>
              <div className="flex mb-2 items-center gap-1.5 justify-center text-[10px] text-zinc-400">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                <span>Transaksi aman & terverifikasi manual oleh Admin</span>
              </div>

            </div>

            {/* Kolom Kanan: QRIS Code (Desktop Only - Diperbesar, Tanpa Background Card) */}
            <div className="hidden lg:flex w-full lg:w-5/12 flex-col justify-center items-center space-y-4 animate-fade-in transition-colors duration-300 lg:pl-8">
              {renderQrisBlock(false)}
            </div>
          </div>
        ) : (
          /* TATA LETAK 2 KOLOM (FORM PENGISIAN DATA DIRI & CHECKOUT) */
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Kolom Kiri: Form Data Diri */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xs relative shadow-lg dark:shadow-none transition-colors duration-300">
                <h2 className="font-title font-bold text-md text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
                  <span className="w-6 h-6 rounded-full bg-[#bc151b]/20 flex items-center justify-center text-[#bc151b] text-sm">1</span>
                  Informasi Personal
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-[#bc151b] flex items-center gap-2 font-medium animate-fade-in">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form id="checkout-form" onSubmit={handleGenerateQris} className="space-y-6" noValidate>
                  {/* Nama Lengkap */}
                  <InputLine
                    label="Nama Lengkap *"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Sesuai KTP/Identitas"
                    error={errors.fullName}
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                    required
                  />

                  {/* Nama Panggung */}
                  <InputLine
                    label="Nama Panggung"
                    type="text"
                    name="stageName"
                    value={formData.stageName}
                    onChange={handleChange}
                    placeholder="Nama panggilan/panggung"
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                  />

                  {/* No WA */}
                  <PhoneNumberLine
                    label="Nomor WhatsApp *"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={(formattedVal) => {
                      setFormData((prev) => ({ ...prev, whatsapp: formattedVal }));
                      if (errors.whatsapp) {
                        setErrors((prev) => ({ ...prev, whatsapp: '' }));
                      }
                    }}
                    error={errors.whatsapp}
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                  />

                  {/* Email */}
                  <InputLine
                    label="Alamat Email *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@contoh.com"
                    error={errors.email}
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                    required
                  />

                  {/* Instagram */}
                  <InputLine
                    label="Akun Instagram"
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleSocialChange}
                    placeholder="username"
                    prefixText="@"
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                  />

                  {/* TikTok */}
                  <InputLine
                    label="Akun TikTok"
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleSocialChange}
                    placeholder="username"
                    prefixText="@"
                    focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                  />

                  {/* Profesi */}
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">Profesi Saat Ini</label>
                    <Select
                      value={formData.profession}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, profession: value }))}
                    >
                      <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 rounded-none px-0 py-1.5 h-auto text-zinc-900 dark:text-white focus:ring-0 focus:border-[#bc151b] focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 transition-all cursor-pointer shadow-none">
                        <SelectValue placeholder="Pilih Profesi" />
                      </SelectTrigger>
                      <SelectContent side="top" className="bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white shadow-xl z-50 w-full max-h-[220px]">
                        <SelectItem value="mahasiswa">Mahasiswa / Pelajar</SelectItem>
                        <SelectItem value="karyawan">Karyawan / Profesional</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="content_creator">Content Creator</SelectItem>
                        <SelectItem value="entrepreneur">Entrepreneur / Bisnis</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </div>
            </div>

            {/* Kolom Kanan: Order Summary & Pembayaran */}
            <div className="w-full lg:w-2/5">
              <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-xl p-4 md:p-5 sticky top-28 shadow-md dark:shadow-xl transition-colors duration-300">
                <h2 className="font-title font-bold text-md text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
                  <span className="w-6 h-6 rounded-full bg-[#bc151b]/20 flex items-center justify-center text-[#bc151b] text-sm">2</span>
                  Pembayaran
                </h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Panggung Kreator Akademi</h3>
                      <button
                        type="button"
                        onClick={() => setIsBenefitsModalOpen(true)}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#bc151b] transition-colors cursor-pointer flex items-center gap-1 font-semibold underline decoration-dotted text-left uppercase tracking-wider"
                      >
                        {selectedPackage?.name || "Paket Advanced"}
                      </button>
                    </div>
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Rp {basePrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="border-t border-b border-zinc-200 dark:border-white/10 py-3 mb-4 space-y-4">
                  {/* Subtotal, Biaya Layanan & Total Pembayaran (Moved to top) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span>Rp {basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {appliedVoucher && (
                      <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Diskon ({appliedVoucher.code})</span>
                        <span>- Rp {appliedVoucher.discountNominal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {uniqueCode > 0 && (
                      <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Kode Unik</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ Rp {uniqueCode.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500 pb-1.5">
                      <span>Biaya Layanan</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-base mt-2 text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-white/10 pt-2.5">
                      <span>Total Pembayaran</span>
                      <span className="text-[#bc151b]">Rp {finalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-150 dark:border-zinc-800/80 my-3" />

                  {/* Kolom Input Voucher */}
                  <div className="pb-3 border-b border-zinc-200 dark:border-white/10">
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {appliedVoucher.code} Terpasang
                        </span>
                        <button onClick={handleRemoveVoucher} className="text-zinc-400 hover:text-red-500 text-xs font-medium transition-colors cursor-pointer">
                          Hapus
                        </button>
                      </div>
                    ) : !showVoucherInput ? (
                      <button
                        type="button"
                        onClick={() => setShowVoucherInput(true)}
                        className="text-xs font-semibold text-[#bc151b] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Punya Kode Voucher?
                      </button>
                    ) : (
                      <div className="flex items-end gap-2 w-full animate-fade-in">
                        <div className="flex-1">
                          <InputLine
                            label="Punya Kode Voucher?"
                            type="text"
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                            placeholder="Masukkan kode"
                            focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                          />
                        </div>
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidatingVoucher || !voucherCodeInput.trim()}
                          className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer h-[30px] flex items-center justify-center shrink-0 mb-0.5"
                        >
                          {isValidatingVoucher ? "Cek..." : "Terapkan"}
                        </button>
                      </div>
                    )}
                    {voucherMessage && (
                      <p className={`mt-1.5 text-[9px] font-medium ${voucherMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {voucherMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Kolom Input Kode Referral */}
                  <div className="pb-1">
                    {appliedReferral && !isReferralFromUrl ? (
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {appliedReferral.code} ({appliedReferral.ownerName})
                        </span>
                        <button onClick={handleRemoveReferral} className="text-zinc-400 hover:text-red-500 text-xs font-medium transition-colors cursor-pointer">
                          Hapus
                        </button>
                      </div>
                    ) : !showReferralInput ? (
                      <button
                        type="button"
                        onClick={() => setShowReferralInput(true)}
                        className="text-xs font-semibold text-[#bc151b] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Punya Kode Referral?
                      </button>
                    ) : (
                      <div className="flex items-end gap-2 w-full animate-fade-in">
                        <div className="flex-1">
                          <InputLine
                            label={isReferralFromUrl ? "Kode Referral (Dari Link)" : "Punya Kode Referral? (Opsional)"}
                            type="text"
                            value={referralCodeInput}
                            disabled={isReferralFromUrl}
                            onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                            placeholder="Contoh: RIZAL2026"
                            focusClassName="focus-within:border-[#bc151b] dark:focus-within:border-[#bc151b]"
                            className={isReferralFromUrl ? "opacity-75 cursor-not-allowed font-semibold text-blue-600 dark:text-blue-400 select-none" : ""}
                          />
                        </div>
                        {isReferralFromUrl ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-2.5 py-1.5 flex items-center shrink-0 mb-0.5 h-[30px]">
                            Terpasang
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleApplyReferral}
                            disabled={isValidatingReferral || !referralCodeInput.trim()}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer h-[30px] flex items-center justify-center shrink-0 mb-0.5"
                          >
                            {isValidatingReferral ? "Cek..." : "Gunakan"}
                          </button>
                        )}
                      </div>
                    )}
                    {referralMessage && (
                      <p className={`mt-1.5 text-[9px] font-medium ${referralMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                        {referralMessage.text}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#bc151b] hover:bg-[#bc151b]/90 text-white font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(188,21,27,0.3)] hover:shadow-[0_0_20px_rgba(188,21,27,0.5)] text-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mendaftarkan Akun...
                    </span>
                  ) : (
                    "Daftar & Dapatkan QRIS"
                  )}
                </button>

                <div className="mt-3.5 flex items-start gap-2 text-[10px] text-zinc-500 leading-normal">
                  <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                  <p>Pendaftaran Anda aman. Akun Anda akan aktif setelah diverifikasi oleh admin melalui chat bukti transfer WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={isBenefitsModalOpen}
        onClose={() => setIsBenefitsModalOpen(false)}
        title="Fasilitas Termasuk"
        subtitle={selectedPackage?.name || "Paket Advanced"}
      >
        <div className="space-y-3">
          {selectedPackage?.benefits ? (
            selectedPackage.benefits.map((benefit: any, idx: number) => benefit.isIncluded && (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{benefit.text}</span>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Akses Penuh Keanggotaan Panggung Kreator</span>
            </div>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
