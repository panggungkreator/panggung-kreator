import { useState, useEffect } from "react";
import { checkEmailExistsAction } from "@/lib/actions/auth-actions";
import { getFieldError, validateFields, clearFieldError, scrollToFirstError } from "@/lib/formValidation";
import { FALLBACK_CITIES } from "./constants";

export function usePriorityFormState(
  onSuccess: (data: any) => void,
  setErrorMsg: (msg: string) => void,
  isLoading: boolean
) {
  const [currentSection, setCurrentSection] = useState(1);

  // Bagian 1: Profil Singkat
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [instagramUsername, setInstagramUsername] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [city, setCity] = useState("");
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
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

  // Laravel-style validation rules
  const validationRules = {
    fullName: "required|min:3",
    whatsappNumber: "required|phone",
    email: "required|email",
    instagramUsername: "no_at",
    tiktokUsername: "no_at",
  };

  const validationMessages = {
    "fullName.required": "Nama Lengkap wajib diisi!",
    "fullName.min": "Nama Lengkap minimal 3 karakter!",
    "whatsappNumber.required": "No. WhatsApp wajib diisi!",
    "whatsappNumber.phone": "No. WhatsApp harus antara 9 - 13 digit!",
    "email.required": "Email wajib diisi!",
    "email.email": "Format email tidak valid!",
    "instagramUsername.no_at": "Tulis username tanpa menggunakan '@'",
    "tiktokUsername.no_at": "Tulis username tanpa menggunakan '@'",
  };

  const checkFieldError = (fieldName: string, value: string): string => {
    return getFieldError(fieldName, value, validationRules, validationMessages);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    const error = checkFieldError(fieldName, value);
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const validateSection = (section: number): boolean => {
    const errors: Record<string, string> = {};

    if (section === 1) {
      const { errors: ruleErrors } = validateFields(
        { fullName, whatsappNumber, email, instagramUsername, tiktokUsername },
        validationRules,
        validationMessages
      );
      Object.assign(errors, ruleErrors);

      if (fieldErrors.email) {
        errors.email = fieldErrors.email; // Keep duplicate check error
      }

      if (!city || !city.trim()) {
        errors.city = "Domisili (Kota/Kabupaten) wajib diisi!";
      }

      if (!occupation || !occupation.trim() || (occupation === "Lainnya" && !customOccupation.trim())) {
        errors.occupation = "Profesi / kesibukan wajib dipilih!";
      }
    } else if (section === 2) {
      if (!psChallenges || psChallenges.length === 0 || (psChallenges.includes("Lainnya") && !customPsChallenge.trim())) {
        errors.psChallenges = "Pilih setidaknya 1 kendala public speaking yang kamu rasakan!";
      }
      if (confidenceScale === null || confidenceScale === undefined) {
        errors.confidenceScale = "Pilih skala percaya diri kamu (1-10)!";
      }
      if (!nervousTrigger || !nervousTrigger.trim()) {
        errors.nervousTrigger = "Pilih situasi yang paling membuat kamu nervous!";
      }
      if (!blunderStory || !blunderStory.trim()) {
        errors.blunderStory = "Ceritakan momen blunder atau kegagalan public speaking kamu!";
      }
    } else if (section === 3) {
      if (pbImportance === null || pbImportance === undefined) {
        errors.pbImportance = "Pilih tingkat kepentingan personal branding (1-5)!";
      }
      if (!learningTopics || learningTopics.length === 0 || (learningTopics.includes("Lainnya") && !customLearningTopic.trim())) {
        errors.learningTopics = "Pilih setidaknya 1 topik yang paling ingin kamu pelajari!";
      }
      if (!roleModel || !roleModel.trim()) {
        errors.roleModel = "Tuliskan sosok public speaker / creator panutan kamu!";
      }
    } else if (section === 4) {
      if (!careerGoal || !careerGoal.trim()) {
        errors.careerGoal = "Tuliskan target karier impianmu dalam 2-3 tahun ke depan!";
      }
      if (!firstOpportunity || !firstOpportunity.trim()) {
        errors.firstOpportunity = "Tuliskan peluang impian yang ingin kamu kejar pertama kali!";
      }
    } else if (section === 5) {
      if (!mainTopic || !mainTopic.trim() || (mainTopic === "Lainnya" && !customMainTopic.trim())) {
        errors.mainTopic = "Pilih atau tuliskan topik besar yang akan kamu bahas!";
      }
      if (!mainMessage || !mainMessage.trim()) {
        errors.mainMessage = "Tuliskan pesan utama yang ingin kamu tanamkan di pikiran audiens!";
      }
      if (!targetAudience || !targetAudience.trim()) {
        errors.targetAudience = "Tuliskan target audiens yang ingin kamu sapa!";
      }
      if (!expertDesire || !expertDesire.trim()) {
        errors.expertDesire = "Pilih seberapa besar keinginanmu untuk dikenal sebagai ahli!";
      }
    } else if (section === 6) {
      if (!pbObstacle || !pbObstacle.trim() || (pbObstacle === "Lainnya" && !customPbObstacle.trim())) {
        errors.pbObstacle = "Pilih atau tuliskan hambatan terbesar kamu saat ini!";
      }
      if (!timeCommitment || !timeCommitment.trim()) {
        errors.timeCommitment = "Pilih seberapa besar waktu yang siap kamu luangkan!";
      }
      if (!investmentBudget || !investmentBudget.trim()) {
        errors.investmentBudget = "Pilih komitmen investasi yang kamu siap luangkan!";
      }
    }

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      scrollToFirstError(errorKeys[0]);
      return false;
    }
    return true;
  };

  // Load Indonesian cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/regencies.json");
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((item: any) => {
            const name = item.name.split(" ").map((word: string) => {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(" ");
            return { id: item.id, name };
          });
          setCitiesList(formatted);
        } else {
          setCitiesList(FALLBACK_CITIES);
        }
      } catch (err) {
        console.error("Gagal memuat daftar kota:", err);
        setCitiesList(FALLBACK_CITIES);
      }
    };
    fetchCities();
  }, []);

  // Email validation and duplicate checking debounced
  useEffect(() => {
    if (!email) {
      setFieldErrors((prev) => clearFieldError(prev, "email"));
      return;
    }

    const formatErr = checkFieldError("email", email);
    if (formatErr) {
      setFieldErrors((prev) => ({
        ...prev,
        email: formatErr,
      }));
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const exists = await checkEmailExistsAction(email);
        if (exists) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "Email sudah digunakan sebelumnya",
          }));
        } else {
          setFieldErrors((prev) => clearFieldError(prev, "email"));
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

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
    const isValid = validateSection(currentSection);
    if (!isValid) {
      return;
    }
    setFieldErrors({});
    if (currentSection < 6) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handlePrevSection = () => {
    setErrorMsg("");
    setFieldErrors({});
    if (currentSection > 1) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSection < 6) {
      handleNextSection();
      return;
    }

    const isValid = validateSection(6);
    if (!isValid) {
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

  return {
    currentSection,
    setCurrentSection,
    fullName,
    setFullName,
    whatsappNumber,
    setWhatsappNumber,
    email,
    setEmail,
    fieldErrors,
    instagramUsername,
    setInstagramUsername,
    tiktokUsername,
    setTiktokUsername,
    youtubeUrl,
    setYoutubeUrl,
    linkedinUrl,
    setLinkedinUrl,
    city,
    setCity,
    citiesList,
    occupation,
    setOccupation,
    customOccupation,
    setCustomOccupation,
    psChallenges,
    customPsChallenge,
    setCustomPsChallenge,
    confidenceScale,
    setConfidenceScale,
    nervousTrigger,
    setNervousTrigger,
    blunderStory,
    setBlunderStory,
    pbImportance,
    setPbImportance,
    learningTopics,
    customLearningTopic,
    setCustomLearningTopic,
    roleModel,
    setRoleModel,
    careerGoal,
    setCareerGoal,
    firstOpportunity,
    setFirstOpportunity,
    mainTopic,
    setMainTopic,
    customMainTopic,
    setCustomMainTopic,
    mainMessage,
    setMainMessage,
    targetAudience,
    setTargetAudience,
    expertDesire,
    setExpertDesire,
    pbObstacle,
    setPbObstacle,
    customPbObstacle,
    setCustomPbObstacle,
    timeCommitment,
    setTimeCommitment,
    investmentBudget,
    setInvestmentBudget,
    subscribedNewsletter,
    setSubscribedNewsletter,
    handleFieldChange,
    togglePsChallenge,
    toggleLearningTopic,
    handleNextSection,
    handlePrevSection,
    handleSubmit,
  };
}
