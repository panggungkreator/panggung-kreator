"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

const OCCUPATION_OPTIONS = [
  "Pelajar",
  "Mahasiswa",
  "Karyawan Swasta",
  "Wirausaha / Pengusaha",
  "Content Creator / Influencer",
  "Freelancer",
  "Professional Speaker / Trainer",
  "Lainnya",
];

const PS_CHALLENGE_OPTIONS = [
  "Gugup / nge-blank saat melihat audiens",
  "Bingung menyusun materi dan alur pembicaraan yang menarik",
  "Artikulasi dan intonasi kurang jelas (belibet)",
  "Kurang percaya diri dengan suara atau penampilan fisik",
  "Sulit berinteraksi dan menguasai suasana panggung",
  "Lainnya",
];

const LEARNING_TOPIC_OPTIONS = [
  "Teknik Vokal & Artikulasi (Voice Over/MC)",
  "Storytelling & Cara Menyusun Presentasi",
  "Gestur & Bahasa Tubuh (Body Language)",
  "Content Creation & Pembuatan Script Video Pendek",
  "Cara Melatih Kepercayaan Diri & Mengatasi Gugup",
  "Lainnya",
];

const MAIN_TOPIC_OPTIONS = [
  "Edukasi Bisnis, Karir & Keuangan",
  "Pengembangan Diri & Kesehatan Mental (Self-Development)",
  "Hiburan, Komedi & Lifestyle",
  "Opini Isu Sosial & Berita Terkini",
  "Review Teknologi, Seni & Hobi",
  "Lainnya",
];

const EXPERT_DESIRE_OPTIONS = [
  "Sangat Ingin (Ingin jadi profesi utama)",
  "Cukup Ingin (Sebagai sampingan/personal branding saja)",
  "Belum Tahu (Masih dalam tahap eksplorasi)",
];

const OBSTACLE_OPTIONS = [
  "Tidak tahu harus mulai dari mana (Butuh panduan/mentor)",
  "Sibuk bekerja/kuliah (Tidak punya waktu luang)",
  "Kurang alat tempur (Kamera, Mic, Laptop, dll)",
  "Takut di-judge atau dikomentari teman sendiri (Insecure)",
  "Lainnya",
];

const TIME_COMMITMENT_OPTIONS = [
  "Cuman bisa ikutan 1 - 2 Jam",
  "Siap ikutan kelas rutin seminggu sekali/sebulan dua kali",
  "Fleksibel (Menyesuaikan jadwal)",
];

const INVESTMENT_OPTIONS = [
  "Siap investasi berapapun untuk program yang terbukti berdampak",
  "Siap investasi dengan budget menengah (Rp100.000 - Rp500.000)",
  "Siap investasi asalkan harganya sangat terjangkau (Di bawah Rp100.000)",
  "Saat ini hanya bisa mengikuti program yang 100% gratis",
];

const SECTION_TITLES = [
  "Bagian 1: Profil Singkat",
  "Bagian 2: Tantangan & Kendala (Public Speaking)",
  "Bagian 3: Minat Belajar (Personal Branding)",
  "Bagian 4: Visi & Karier",
  "Bagian 5: Eksplorasi Topik & Pesan Utama",
  "Bagian 6: Komitmen, Waktu, & Investasi",
];

interface StepEssentialProps {
  onSuccess: (data: any) => void;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  isLoading: boolean;
  initialReferralCode?: string | null;
}

export default function StepEssential({ onSuccess, errorMsg, setErrorMsg, isLoading, initialReferralCode }: StepEssentialProps) {
  const [currentSection, setCurrentSection] = useState(1);

  // Bagian 1: Profil Singkat
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [customOccupation, setCustomOccupation] = useState("");

  // Bagian 2: Tantangan & Kendala (Public Speaking)
  const [psChallenges, setPsChallenges] = useState<string[]>([]);
  const [customPsChallenge, setCustomPsChallenge] = useState("");
  const [confidenceScale, setConfidenceScale] = useState<number | null>(null);
  const [nervousTrigger, setNervousTrigger] = useState<string>("");
  const [blunderStory, setBlunderStory] = useState("");

  // Bagian 3: Minat Belajar (Personal Branding)
  const [pbImportance, setPbImportance] = useState<number | null>(null);
  const [learningTopics, setLearningTopics] = useState<string[]>([]);
  const [customLearningTopic, setCustomLearningTopic] = useState("");
  const [roleModel, setRoleModel] = useState("");

  // Bagian 4: Visi & Karier
  const [careerGoal, setCareerGoal] = useState("");
  const [firstOpportunity, setFirstOpportunity] = useState("");

  // Bagian 5: Eksplorasi Topik & Pesan Utama
  const [mainTopic, setMainTopic] = useState("");
  const [customMainTopic, setCustomMainTopic] = useState("");
  const [mainMessage, setMainMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [expertDesire, setExpertDesire] = useState("");

  // Bagian 6: Komitmen, Waktu, & Investasi
  const [pbObstacle, setPbObstacle] = useState("");
  const [customPbObstacle, setCustomPbObstacle] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [investmentBudget, setInvestmentBudget] = useState("");

  const [subscribedNewsletter, setSubscribedNewsletter] = useState(true);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleaned = e.target.value.replace(/\D/g, "");
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '0' + cleaned;
    }
    cleaned = cleaned.slice(0, 13);

    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));
    if (cleaned.length > 8) parts.push(cleaned.slice(8, 13));

    setWhatsappNumber(parts.join("-"));
  };

  const togglePsChallenge = (val: string) => {
    setPsChallenges((prev) => {
      if (prev.includes(val)) {
        return prev.filter((item) => item !== val);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, val];
    });
  };

  const toggleLearningTopic = (val: string) => {
    setLearningTopics((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleNextSection = () => {
    setErrorMsg("");
    if (currentSection === 1) {
      if (!fullName.trim() || !whatsappNumber.trim()) {
        setErrorMsg("Nama Lengkap dan No. WhatsApp wajib diisi!");
        return;
      }
    }
    if (currentSection < 6) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handlePrevSection = () => {
    setErrorMsg("");
    if (currentSection > 1) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsappNumber.trim()) {
      setErrorMsg("Nama Lengkap dan No. WhatsApp wajib diisi!");
      setCurrentSection(1);
      return;
    }

    onSuccess({
      profile: {
        full_name: fullName,
        whatsapp_number: whatsappNumber,
        email: email || null,
        instagram_username: instagramUsername || null,
        tiktok_username: tiktokUsername || null,
        youtube_url: youtubeUrl || null,
        linkedin_url: linkedinUrl || null,
        city: city || null,
        occupation: occupation === "Lainnya" ? customOccupation : occupation,
        subscribed_newsletter: subscribedNewsletter,
      },
      interests: {
        primary_interests: learningTopics.length > 0 ? learningTopics : ["Public Speaking & Personal Branding"],
        ps_challenges: psChallenges.map((c) => (c === "Lainnya" ? customPsChallenge : c)),
        confidence_scale: confidenceScale,
        nervous_trigger: nervousTrigger,
        blunder_story: blunderStory,
        pb_importance: pbImportance,
        learning_topics: learningTopics.map((t) => (t === "Lainnya" ? customLearningTopic : t)),
        role_model: roleModel,
        career_goal: careerGoal,
        first_opportunity: firstOpportunity,
        main_topic: mainTopic === "Lainnya" ? customMainTopic : mainTopic,
        main_message: mainMessage,
        target_audience: targetAudience,
        expert_desire: expertDesire,
        pb_obstacle: pbObstacle === "Lainnya" ? customPbObstacle : pbObstacle,
        time_commitment: timeCommitment,
        investment_budget: investmentBudget,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-zinc-900 dark:text-white">
      {/* STEP PROGRESS INDICATOR */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
          <span>{SECTION_TITLES[currentSection - 1].toUpperCase()}</span>
          <span>LANGKAH {currentSection} DARI 6</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-none overflow-hidden">
          <div
            className="bg-black dark:bg-white h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentSection / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* BAGIAN 1: PROFIL SINGKAT */}
      {currentSection === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              NAMA LENGKAP *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              NO. WHATSAPP *
            </label>
            <input
              type="tel"
              required
              placeholder="0812-3456-7890"
              value={whatsappNumber}
              onChange={handleWhatsappChange}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="budi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
                AKUN INSTAGRAM
              </label>
              <input
                type="text"
                placeholder="@username"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
                AKUN TIKTOK
              </label>
              <input
                type="text"
                placeholder="@username"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
                AKUN YOUTUBE
              </label>
              <input
                type="text"
                placeholder="Channel / @handle"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
                AKUN LINKEDIN
              </label>
              <input
                type="text"
                placeholder="linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              DOMISILI (KOTA/KABUPATEN)
            </label>
            <input
              type="text"
              placeholder="Bandung, Jakarta Selatan, Surabaya, dll."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              APA KESIBUKAN / PROFESI KAMU SAAT INI?
            </label>
            <RadioGroup value={occupation} onValueChange={setOccupation} className="space-y-2">
              {OCCUPATION_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`occ-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`occ-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {occupation === "Lainnya" && (
              <input
                type="text"
                placeholder="Tuliskan profesi / kesibukanmu..."
                value={customOccupation}
                onChange={(e) => setCustomOccupation(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            )}
          </div>
        </div>
      )}

      {/* BAGIAN 2: TANTANGAN & KENDALA (PUBLIC SPEAKING) */}
      {currentSection === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              APA KENDALA TERBESAR YANG KAMU RASAKAN SAAT HARUS BICARA DI DEPAN UMUM? (PILIH MAKSIMAL 3)
            </label>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-3">
              Tersisa {3 - psChallenges.length} pilihan
            </span>
            <div className="space-y-2">
              {PS_CHALLENGE_OPTIONS.map((item) => {
                const isSelected = psChallenges.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePsChallenge(item)}
                    className={`w-full text-left p-3 border text-xs transition-all outline-none rounded-none cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                        : "bg-transparent border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <span className="font-mono text-[10px] uppercase">[✓]</span>}
                  </button>
                );
              })}
            </div>
            {psChallenges.includes("Lainnya") && (
              <input
                type="text"
                placeholder="Tuliskan kendala lainnya..."
                value={customPsChallenge}
                onChange={(e) => setCustomPsChallenge(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              DALAM SKALA 1-10, SEBERAPA PERCAYA DIRI KAMU SAAT INI JIKA DIMINTA BICARA MENDADAK?
            </label>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
              <span>1 (TERENDAH)</span>
              <span>10 (TERTINGGI)</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConfidenceScale(val)}
                  className={`py-2 text-xs font-bold font-mono transition-all border cursor-pointer ${
                    confidenceScale === val
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              MANA YANG LEBIH BIKIN KAMU GEMETER BAIK SEBELUM TAMPIL MAUPUN PADA SAAT TAMPIL?
            </label>
            <RadioGroup value={nervousTrigger} onValueChange={setNervousTrigger} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Bicara tatap muka langsung di depan orang banyak" id="nt-1" className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                <Label htmlFor="nt-1" className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                  Bicara tatap muka langsung di depan orang banyak
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Bicara di depan kamera untuk konten (IG/tiktok dll)" id="nt-2" className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                <Label htmlFor="nt-2" className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                  Bicara di depan kamera untuk konten (IG/TikTok dll)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              CERITAKAN SATU MOMEN "BLUNDER" ATAU KEGAGALAN SAAT PUBLIC SPEAKING YANG PALING MEMBEKAS BAGI KAMU?
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan pengalamanmu di sini..."
              value={blunderStory}
              onChange={(e) => setBlunderStory(e.target.value)}
              className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 p-2.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* BAGIAN 3: MINAT BELAJAR (PERSONAL BRANDING) */}
      {currentSection === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              SEBERAPA PENTING MENURUTMU PERSONAL BRANDING UNTUK MENUNJANG KARIRMU?
            </label>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
              <span>1 (SANGAT TIDAK PENTING)</span>
              <span>5 (SANGAT PENTING)</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPbImportance(val)}
                  className={`py-2 text-xs font-bold font-mono transition-all border cursor-pointer ${
                    pbImportance === val
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              TOPIK APA YANG PALING INGIN KAMU PELAJARI LEBIH DALAM?
            </label>
            <div className="space-y-2">
              {LEARNING_TOPIC_OPTIONS.map((item) => {
                const isSelected = learningTopics.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleLearningTopic(item)}
                    className={`w-full text-left p-3 border text-xs transition-all outline-none rounded-none cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                        : "bg-transparent border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <span className="font-mono text-[10px] uppercase">[✓]</span>}
                  </button>
                );
              })}
            </div>
            {learningTopics.includes("Lainnya") && (
              <input
                type="text"
                placeholder="Tuliskan topik lainnya..."
                value={customLearningTopic}
                onChange={(e) => setCustomLearningTopic(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              SIAPA SOSOK PUBLIC SPEAKER ATAU CREATOR YANG JADI PANUTAN KAMU SAAT INI?
            </label>
            <input
              type="text"
              placeholder="Contoh: Raditya Dika, Merry Riana, GaryVee, dll."
              value={roleModel}
              onChange={(e) => setRoleModel(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* BAGIAN 4: VISI & KARIER */}
      {currentSection === 4 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              APA CITA-CITA ATAU TARGET KARIER IMPIANMU DALAM 2-3 TAHUN KE DEPAN?
            </label>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-2">
              Contoh: Menjadi Speaker Nasional, Manajer di perusahaan, Influencer, dll.
            </span>
            <textarea
              rows={3}
              placeholder="Tuliskan target kariermu..."
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 p-2.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              JIKA KAMU SUDAH JAGO PUBLIC SPEAKING & PUNYA PERSONAL BRANDING YANG KUAT, PELUANG APA YANG INGIN KAMU KEJAR PERTAMA KALI?
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan peluang impianmu..."
              value={firstOpportunity}
              onChange={(e) => setFirstOpportunity(e.target.value)}
              className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 p-2.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* BAGIAN 5: EKSPLORASI TOPIK & PESAN UTAMA */}
      {currentSection === 5 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              JIKA HARI INI KAMU DIBERI PANGGUNG SELAMA 15 MENIT ATAU KESEMPATAN MEMBUAT 1 VIDEO VIRAL, TOPIK BESAR APA YANG AKAN KAMU BAHAS?
            </label>
            <RadioGroup value={mainTopic} onValueChange={setMainTopic} className="space-y-2">
              {MAIN_TOPIC_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`mt-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`mt-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {mainTopic === "Lainnya" && (
              <input
                type="text"
                placeholder="Tuliskan topik besar lainnya..."
                value={customMainTopic}
                onChange={(e) => setCustomMainTopic(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              APA "PESAN UTAMA" YANG INGIN KAMU TANAMKAN DI PIKIRAN AUDIENSMU?
            </label>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-2">
              Contoh: "Saya ingin orang tahu bahwa mulai bisnis itu tidak harus modal besar"
            </span>
            <textarea
              rows={3}
              placeholder="Tuliskan pesan utamamu..."
              value={mainMessage}
              onChange={(e) => setMainMessage(e.target.value)}
              className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 p-2.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
              SIAPA TARGET AUDIENS YANG PALING INGIN KAMU SAPA MELALUI KONTEN ATAU BICARAMU?
            </label>
            <input
              type="text"
              placeholder="Contoh: Mahasiswa tingkat akhir, Ibu rumah tangga berbisnis, Gen Z, dll."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              SEBERAPA BESAR KEINGINANMU UNTUK DIKENAL SEBAGAI "AHLI" DI BIDANG TERSEBUT?
            </label>
            <RadioGroup value={expertDesire} onValueChange={setExpertDesire} className="space-y-2">
              {EXPERT_DESIRE_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`ed-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`ed-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )}

      {/* BAGIAN 6: KOMITMEN, WAKTU, & INVESTASI */}
      {currentSection === 6 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              APA HAMBATAN TERBESAR KAMU BUAT MULAI BANGUN PERSONAL BRANDING HARI INI?
            </label>
            <RadioGroup value={pbObstacle} onValueChange={setPbObstacle} className="space-y-2">
              {OBSTACLE_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`obs-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`obs-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {pbObstacle === "Lainnya" && (
              <input
                type="text"
                placeholder="Tuliskan hambatan lainnya..."
                value={customPbObstacle}
                onChange={(e) => setCustomPbObstacle(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              KALAU PANGGUNG KREATOR MENGADAKAN SESI MENTORING ATAU SHARING INTENSIF BUAT BAHAS KENDALA KAMU DI ATAS, SEBERAPA BESAR WAKTU YANG SIAP KAMU LUANGKAN?
            </label>
            <RadioGroup value={timeCommitment} onValueChange={setTimeCommitment} className="space-y-2">
              {TIME_COMMITMENT_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`tc-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`tc-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
              SEBERAPA BERANI KAMU INVESTASI (BIAYA) UNTUK IKUT KELAS PROFESIONAL BUAT NINGKATIN SKILL PUBLIC SPEAKING & PERSONAL BRANDING KAMU?
            </label>
            <RadioGroup value={investmentBudget} onValueChange={setInvestmentBudget} className="space-y-2">
              {INVESTMENT_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`inv-${opt}`} className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white" />
                  <Label htmlFor={`inv-${opt}`} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Newsletter Opt-in */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 max-w-md">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">BERLANGGANAN NEWSLETTER</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">Dapatkan tips public speaking, personal branding, & info kelas gratis berkala.</span>
            </div>
            <Switch
              checked={subscribedNewsletter}
              onCheckedChange={setSubscribedNewsletter}
              className="data-[state=checked]:bg-[#bc151b] dark:data-[state=checked]:bg-[#bc151b] border border-zinc-300 dark:border-zinc-700"
            />
          </div>
        </div>
      )}

      {/* STEP NAVIGATION & SUBMIT BUTTONS */}
      <div className="pt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
        {currentSection > 1 ? (
          <button
            type="button"
            onClick={handlePrevSection}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white font-bold text-[11px] uppercase tracking-wider rounded-none transition-all cursor-pointer"
          >
            &larr; Kembali
          </button>
        ) : (
          <div />
        )}

        {currentSection < 6 ? (
          <button
            type="button"
            onClick={handleNextSection}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-all flex items-center gap-2 cursor-pointer"
          >
            Lanjut &rarr;
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] hover:text-white dark:hover:text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>Kirim Assessment & Selesaikan Onboarding &rarr;</>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
