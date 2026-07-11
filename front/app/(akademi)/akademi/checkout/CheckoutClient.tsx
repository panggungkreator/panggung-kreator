"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { signout } from '@/lib/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';
import { registerMemberAction, validateVoucherAction } from '@/lib/actions/checkout-actions';

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

  // Voucher State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string, discountNominal: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

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
                  router.push('/dashboard');
                } else {
                  const { data: transaction } = await supabase
                    .from("transactions")
                    .select("unique_code")
                    .eq("member_id", session.user.id)
                    .eq("status", "pending")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                  const updatedMemberData = {
                    ...member,
                    unique_code: transaction?.unique_code || 0
                  };
                  setDbMember(updatedMemberData);
                  localStorage.setItem("pangkreas_checkout_state", JSON.stringify({
                    accountData: cached.accountData,
                    memberData: updatedMemberData,
                    expiry: cached.expiry
                  }));
                }
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
            const createdAt = new Date(member.created_at || session.user.created_at);
            const now = new Date();
            const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

            if (member.payment_status === 'pending' && hoursElapsed > 3) {
              // Sesi kedaluwarsa setelah 3 jam
              await supabase.auth.signOut();
              setCurrentUser(null);
              setDbMember(null);
              setQrisGenerated(false);
              localStorage.removeItem("pangkreas_checkout_state");
            } else if (member.payment_status === 'paid') {
              // Redirect member yang sudah lunas ke dashboard akademi
              localStorage.removeItem("pangkreas_checkout_state");
              router.push('/dashboard');
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

              const memberData = {
                ...member,
                unique_code: transaction?.unique_code || 0
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
          setFormData(prev => ({ ...prev, email: session.user.email || '' }));
        }
      }
      setLoadingSession(false);
    };

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

  const handleGenerateQris = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Panggil server action untuk register member & generate akun login
      const payloadData = {
        ...formData,
        packageId: selectedPackage?.id,
        usedVoucherCode: appliedVoucher?.code
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

  const uniqueCode = (dbMember && qrisGenerated) ? (dbMember.unique_code || 0) : 0;

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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#2c2c2c] dark:text-white font-sans transition-colors duration-300 selection:bg-[#bc151b] selection:text-white">
      {/* Header Minimalis */}
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-title font-bold uppercase tracking-wider mb-2 text-zinc-900 dark:text-white">
            Pendaftaran <span className="text-[#bc151b]">Panggung Kreator Akademi</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">
            {qrisGenerated
              ? "Selesaikan pembayaran manual Anda untuk mengaktifkan akun."
              : "Lengkapi data diri lo dan selesaikan pembayaran untuk bergabung."
            }
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Kolom Kiri: Form Data Diri ATAU Panel Akun Pending */}
          <div className="w-full lg:w-3/5">
            {qrisGenerated ? (
              /* PANEL AKUN PENDING & INSTRUKSI WA */
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xs space-y-6 animate-fade-in shadow-lg dark:shadow-none transition-colors duration-300">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-sm font-bold animate-pulse">
                    !
                  </div>
                  <h2 className="font-title font-bold text-xl text-zinc-900 dark:text-white uppercase tracking-wider">
                    Pendaftaran Berhasil diproses
                  </h2>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl p-5 space-y-3 transition-colors duration-300">
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-300 tracking-wider">AKUN LOGIN SEDANG DISIAPKAN</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Kredensial login Anda (Username & Password) sedang disiapkan dan akan dikirimkan langsung ke email Anda setelah pembayaran Anda diverifikasi dan dikonfirmasi oleh Admin.
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    * <strong className="text-[#bc151b]">PENTING:</strong> Pastikan Anda mengirimkan bukti transfer pembayaran ke WhatsApp agar Admin dapat memverifikasi dan mengaktifkan akun Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-title font-bold text-sm text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    LANGKAH VERIFIKASI PEMBAYARAN:
                  </h3>
                  <ol className="list-decimal list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
                    <li>Pindai QRIS manual yang ada di panel sebelah kanan.</li>
                    <li>Bayar sebesar <strong className="text-[#bc151b] dark:text-red-400 text-sm">Rp {finalPrice.toLocaleString('id-ID')}</strong> (pastikan nominal transfer persis sesuai tagihan termasuk 3 digit terakhir).</li>
                    <li>Ambil screenshot bukti transfer Anda.</li>
                    <li>Kirimkan bukti transfer tersebut ke WhatsApp Admin dengan menekan tombol di bawah ini untuk mengonfirmasi pembayaran.</li>
                    <li>Setelah bukti transfer dikirim, Anda akan di-invite ke grup dan menerima email konfirmasi.</li>
                  </ol>

                  <a
                    href={`https://wa.me/6281111156736?text=Halo%20Admin%20Panggung%20Kreator%2C%20saya%20sudah%20melakukan%20pembayaran%20pendaftaran%20Akademi.%20Berikut%20bukti%20transfernya.%0A%0AUsername%20Login%20Saya%3A%20${activeUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-6 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)] text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.472.945 6.037.945 1.611 5.316 1.607 10.744c-.002 1.716.446 3.39 1.298 4.872L1.876 21.09l5.771-1.936z" />
                    </svg>
                    Kirim Bukti Transfer ke WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              /* FORM REGISTRASI/CHECKOUT */
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xs relative overflow-hidden shadow-lg dark:shadow-none transition-colors duration-300">
                <h2 className="font-title font-bold text-xl text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
                  <span className="w-8 h-8 rounded-full bg-[#bc151b]/20 flex items-center justify-center text-[#bc151b] text-sm">1</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nama Lengkap *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Sesuai KTP/Identitas"
                        className={`w-full bg-white dark:bg-[#2c2c2c] border ${errors.fullName ? 'border-[#bc151b] focus:ring-[#bc151b]' : 'border-zinc-200 dark:border-white/10 focus:border-[#bc151b] focus:ring-[#bc151b]'
                          } rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 transition-all`}
                        required
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-xs text-[#bc151b] flex items-center gap-1.5 animate-fade-in font-medium">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Nama Panggung */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nama Panggung</label>
                      <input
                        type="text"
                        name="stageName"
                        value={formData.stageName}
                        onChange={handleChange}
                        placeholder="Nama panggilan/panggung"
                        className="w-full bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-[#bc151b] focus:ring-1 focus:ring-[#bc151b] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* No WA */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nomor WhatsApp *</label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleWhatsappChange}
                        placeholder="0812xxxxxxxx"
                        className={`w-full bg-white dark:bg-[#2c2c2c] border ${errors.whatsapp ? 'border-[#bc151b] focus:ring-[#bc151b]' : 'border-zinc-200 dark:border-white/10 focus:border-[#bc151b] focus:ring-[#bc151b]'
                          } rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 transition-all`}
                        required
                      />
                      {errors.whatsapp && (
                        <p className="mt-1.5 text-xs text-[#bc151b] flex items-center gap-1.5 animate-fade-in font-medium">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.whatsapp}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Alamat Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@contoh.com"
                        className={`w-full bg-white dark:bg-[#2c2c2c] border ${errors.email ? 'border-[#bc151b] focus:ring-[#bc151b]' : 'border-zinc-200 dark:border-white/10 focus:border-[#bc151b] focus:ring-[#bc151b]'
                          } rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 transition-all`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-[#bc151b] flex items-center gap-1.5 animate-fade-in font-medium">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        Akun Instagram
                      </label>
                      <div className="flex items-center w-full bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-lg px-4 focus-within:border-[#bc151b] focus-within:ring-1 focus-within:ring-[#bc151b] transition-all">
                        <span className="text-zinc-400 dark:text-zinc-500 mr-3 select-none font-medium text-base">@</span>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleSocialChange}
                          placeholder="username"
                          className="w-full bg-transparent border-0 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-0 p-0 placeholder-zinc-400 dark:placeholder-zinc-600"
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.13-5.23 1.61-7.23 1.35-1.84 3.48-3 5.75-3.35V11.1c-1.04.14-2.03.62-2.76 1.41-.75.83-1.16 1.96-1.15 3.09.02 1.15.42 2.29 1.18 3.13.78.86 1.9 1.36 3.08 1.42 1.05.05 2.1-.28 2.92-.93.74-.58 1.25-1.42 1.4-2.36.08-.54.08-1.1.08-1.64V.02h2.52z" /></svg>
                        Akun TikTok
                      </label>
                      <div className="flex items-center w-full bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-lg px-4 focus-within:border-[#bc151b] focus-within:ring-1 focus-within:ring-[#bc151b] transition-all">
                        <span className="text-zinc-400 dark:text-zinc-500 mr-3 select-none font-medium text-base">@</span>
                        <input
                          type="text"
                          name="tiktok"
                          value={formData.tiktok}
                          onChange={handleSocialChange}
                          placeholder="username"
                          className="w-full bg-transparent border-0 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-0 p-0 placeholder-zinc-400 dark:placeholder-zinc-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profesi */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Profesi Saat Ini</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-[#bc151b] focus:ring-1 focus:ring-[#bc151b] transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Pilih Profesi</option>
                      <option value="mahasiswa">Mahasiswa / Pelajar</option>
                      <option value="karyawan">Karyawan / Profesional</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="content_creator">Content Creator</option>
                      <option value="entrepreneur">Entrepreneur / Bisnis</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Order Summary & Pembayaran */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 sticky top-24 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <h2 className="font-title font-bold text-xl text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
                <span className="w-8 h-8 rounded-full bg-[#bc151b]/20 flex items-center justify-center text-[#bc151b] text-sm">2</span>
                Pembayaran
              </h2>

              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-md text-zinc-800 dark:text-zinc-100">Panggung Kreator Akademi</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedPackage?.name || "Paket Advanced"}</p>
                  </div>
                  <span className="font-bold text-md text-zinc-800 dark:text-zinc-100">Rp {basePrice.toLocaleString('id-ID')}</span>
                </div>

                <div className="space-y-2 mb-6">
                  {selectedPackage?.benefits ? (
                    selectedPackage.benefits.map((benefit: any, idx: number) => benefit.isIncluded && (
                      <div key={idx} className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-950/50 transition-colors">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {benefit.text}
                        </span>
                        <span className="font-semibold text-[10px] tracking-wider uppercase opacity-80">Included</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-950/50 transition-colors">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Akses Penuh
                      </span>
                      <span className="font-semibold text-xs uppercase">Included</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-b border-zinc-200 dark:border-white/10 py-4 mb-6">

                {/* Kolom Input Voucher */}
                {!qrisGenerated && (
                  <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-white/10">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Punya Kode Voucher?</label>
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">
                        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {appliedVoucher.code} Terpasang
                        </span>
                        <button onClick={handleRemoveVoucher} className="text-zinc-400 hover:text-red-500 text-xs font-medium transition-colors">
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={voucherCodeInput}
                          onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                          placeholder="Masukkan kode"
                          className="flex-1 bg-white dark:bg-[#2c2c2c] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-[#bc151b]"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidatingVoucher || !voucherCodeInput.trim()}
                          className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {isValidatingVoucher ? "Cek..." : "Terapkan"}
                        </button>
                      </div>
                    )}
                    {voucherMessage && (
                      <p className={`mt-2 text-[10px] font-medium ${voucherMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {voucherMessage.text}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  <span>Subtotal</span>
                  <span>Rp {basePrice.toLocaleString('id-ID')}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
                    <span>Diskon ({appliedVoucher.code})</span>
                    <span>- Rp {appliedVoucher.discountNominal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {uniqueCode > 0 && (
                  <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    <span>Kode Unik</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ Rp {uniqueCode.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm text-zinc-400 dark:text-zinc-500 mb-2">
                  <span>Biaya Layanan</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg mt-4 text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-white/10 pt-4">
                  <span>Total Pembayaran</span>
                  <span className="text-[#bc151b]">Rp {finalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Area QRIS */}
              {!qrisGenerated ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#bc151b] hover:bg-[#bc151b]/90 text-white font-bold rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(188,21,27,0.4)] hover:shadow-[0_0_30px_rgba(188,21,27,0.6)] text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mendaftarkan Akun...
                    </span>
                  ) : (
                    "Daftar & Dapatkan QRIS"
                  )}
                </button>
              ) : (
                <div className="animate-fade-in transition-all duration-500">
                  <div className="bg-white rounded-xl p-6 text-center text-black border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <span className="font-bold text-[#bc151b] font-title tracking-wider">QRIS MANUAL</span>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-6" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg inline-block mb-4 relative border border-gray-100">
                      {/* QR code untuk transfer manual menggunakan gambar screenshot qris.jpeg */}
                      <img src="/qris.jpeg" alt="QRIS Panggung Kreator" className="w-48 h-auto mx-auto object-contain" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Total Transfer: Rp {finalPrice.toLocaleString('id-ID')}</p>
                    {uniqueCode > 0 && (
                      <p className="text-[11px] text-emerald-600 font-bold mb-1">
                        * Wajib transfer sesuai nominal sampai 3 digit terakhir (termasuk kode unik Rp {uniqueCode})
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mb-4">Pindai QRIS di atas untuk melakukan transfer</p>

                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs font-semibold flex flex-col gap-2 border border-yellow-100 mb-4 text-left leading-relaxed">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <strong>Menunggu Verifikasi Pembayaran</strong>
                      </div>
                      <p className="text-[11px] text-yellow-700">
                        Kirim bukti transfer ke WhatsApp <strong>081111156736</strong>. Setelah terverifikasi, Anda akan segera di-invite ke grup dan menerima email konfirmasi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 text-xs text-zinc-500">
                <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                <p>Pendaftaran Anda aman. Akun Anda akan aktif setelah diverifikasi oleh admin melalui chat bukti transfer WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
