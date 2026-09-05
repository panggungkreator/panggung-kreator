import { useState, useEffect, useRef } from "react";
import { checkEmailExistsAction, checkWhatsappExistsAction } from "@/lib/actions/auth-actions";
import { getFieldError, validateFields, clearFieldError, scrollToFirstError } from "@/lib/formValidation";

export function useCollectionFormState(
  onSuccess: (data: any) => void,
  setErrorMsg: (msg: string) => void,
  isLoading: boolean,
  errorMsg?: string
) {
  const [currentSection, setCurrentSection] = useState(1);

  // Bagian 1: Profil Singkat
  const [fullName, setFullNameState] = useState("");
  const [birthDate, setBirthDateState] = useState("");
  const [address, setAddressState] = useState("");
  const [whatsappNumber, setWhatsappNumberState] = useState("");
  const [email, setEmailState] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [instagramUsername, setInstagramUsernameState] = useState("");
  const [tiktokUsername, setTiktokUsernameState] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [occupation, setOccupationState] = useState("");

  // Bagian 2: Tantangan & Kendala (Public Speaking)
  const [psChallenges, setPsChallenges] = useState<string[]>([]);
  const [confidenceScale, setConfidenceScaleState] = useState<number | null>(null);
  const [nervousTrigger, setNervousTriggerState] = useState<string>("");

  // Bagian 3: Minat Belajar
  const [skillsToMaster, setSkillsToMasterState] = useState("");
  const [customSkillsToMaster, setCustomSkillsToMasterState] = useState("");
  const [roleModel, setRoleModelState] = useState("");
  const [monetizationInterest, setMonetizationInterestState] = useState("");
  const [customMonetizationInterest, setCustomMonetizationInterestState] = useState("");

  // Bagian 4: Visi & Karier
  const [careerGoal, setCareerGoalState] = useState("");
  const [firstOpportunity, setFirstOpportunityState] = useState("");

  // Bagian 5: Eksplorasi Topik & Pesan Utama
  const [mainTopic, setMainTopicState] = useState("");
  const [customMainTopic, setCustomMainTopicState] = useState("");
  const [mainMessage, setMainMessageState] = useState("");
  const [targetAudience, setTargetAudienceState] = useState("");
  const [expertDesire, setExpertDesireState] = useState("");

  // Bagian 6: Komitmen & Waktu
  const [activeCommunities, setActiveCommunitiesState] = useState("");
  const [careerObstacle, setCareerObstacleState] = useState("");
  const [timeCommitment, setTimeCommitmentState] = useState("");
  const [subscribedNewsletter, setSubscribedNewsletter] = useState(true);

  // Validation rules
  const validationRules = {
    fullName: "required|min:3",
    whatsappNumber: "required|phone",
    email: "required|email",
    instagramUsername: "no_at",
    tiktokUsername: "no_at",
  };

  const validationMessages: Record<string, string> = {
    "fullName.required": "Nama Lengkap wajib diisi!",
    "fullName.min": "Nama Lengkap minimal 3 karakter!",
    "whatsappNumber.required": "No. WhatsApp wajib diisi!",
    "whatsappNumber.phone": "No. WhatsApp harus antara 9 - 13 digit!",
    "email.required": "Email wajib diisi!",
    "email.email": "Format email tidak valid!",
    "instagramUsername.no_at": "Tulis username tanpa menggunakan '@'",
    "tiktokUsername.no_at": "Tulis username tanpa menggunakan '@'",
    "birthDate.required": "Tanggal lahir wajib diisi!",
    "address.required": "Alamat tinggal wajib diisi!",
    "occupation.required": "Pekerjaan / kesibukan saat ini wajib diisi!",
    "psChallenges.required": "Pilih setidaknya 1 kendala public speaking!",
    "confidenceScale.required": "Pilih skala percaya diri kamu (1-10)!",
    "nervousTrigger.required": "Pilih situasi yang paling membuat kamu nervous!",
    "skillsToMaster.required": "Pilih skill yang paling ingin kamu kuasai saat ini!",
    "roleModel.required": "Tuliskan sosok public speaker / creator panutan kamu!",
    "monetizationInterest.required": "Pilih jalur monetisasi yang paling kamu minati!",
    "careerGoal.required": "Tuliskan target karier impianmu dalam 2-3 tahun ke depan!",
    "firstOpportunity.required": "Tuliskan peluang impian yang ingin kamu kejar pertama kali!",
    "mainTopic.required": "Pilih atau tuliskan topik besar yang akan kamu bahas!",
    "mainMessage.required": "Tuliskan pesan utama yang ingin kamu tanamkan di pikiran audiens!",
    "targetAudience.required": "Tuliskan target audiens yang ingin kamu sapa!",
    "expertDesire.required": "Pilih seberapa besar keinginanmu untuk dikenal sebagai ahli!",
    "activeCommunities.required": "Tuliskan komunitas yang kamu ikuti secara aktif!",
    "careerObstacle.required": "Tuliskan kendala terbesar dalam berkarya / karir kamu!",
    "timeCommitment.required": "Pilih seberapa besar waktu yang siap kamu luangkan!",
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    let error = "";

    if (validationRules[fieldName as keyof typeof validationRules]) {
      error = getFieldError(fieldName, typeof value === "string" ? value : "", validationRules, validationMessages);
    } else {
      switch (fieldName) {
        case "birthDate":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["birthDate.required"];
          }
          break;
        case "address":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["address.required"];
          }
          break;
        case "occupation":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["occupation.required"];
          }
          break;
        case "psChallenges":
          if (!value || !Array.isArray(value) || value.length === 0) {
            error = validationMessages["psChallenges.required"];
          }
          break;
        case "confidenceScale":
          if (value === null || value === undefined) {
            error = validationMessages["confidenceScale.required"];
          }
          break;
        case "nervousTrigger":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["nervousTrigger.required"];
          }
          break;
        case "skillsToMaster":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["skillsToMaster.required"];
          } else if (value === "Lainnya" && !customSkillsToMaster.trim()) {
            error = validationMessages["skillsToMaster.required"];
          }
          break;
        case "customSkillsToMaster":
          if (skillsToMaster === "Lainnya" && (!value || !value.trim())) {
            error = validationMessages["skillsToMaster.required"];
          } else if (skillsToMaster === "Lainnya" && value && value.trim()) {
            setFieldErrors((prev) => clearFieldError(prev, "skillsToMaster"));
          }
          break;
        case "roleModel":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["roleModel.required"];
          }
          break;
        case "monetizationInterest":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["monetizationInterest.required"];
          } else if (value === "Lainnya" && !customMonetizationInterest.trim()) {
            error = validationMessages["monetizationInterest.required"];
          }
          break;
        case "customMonetizationInterest":
          if (monetizationInterest === "Lainnya" && (!value || !value.trim())) {
            error = validationMessages["monetizationInterest.required"];
          } else if (monetizationInterest === "Lainnya" && value && value.trim()) {
            setFieldErrors((prev) => clearFieldError(prev, "monetizationInterest"));
          }
          break;
        case "careerGoal":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["careerGoal.required"];
          }
          break;
        case "firstOpportunity":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["firstOpportunity.required"];
          }
          break;
        case "mainTopic":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["mainTopic.required"];
          } else if (value === "Lainnya" && !customMainTopic.trim()) {
            error = validationMessages["mainTopic.required"];
          }
          break;
        case "customMainTopic":
          if (mainTopic === "Lainnya" && (!value || !value.trim())) {
            error = validationMessages["mainTopic.required"];
          } else if (mainTopic === "Lainnya" && value && value.trim()) {
            setFieldErrors((prev) => clearFieldError(prev, "mainTopic"));
          }
          break;
        case "mainMessage":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["mainMessage.required"];
          }
          break;
        case "targetAudience":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["targetAudience.required"];
          }
          break;
        case "expertDesire":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["expertDesire.required"];
          }
          break;
        case "activeCommunities":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["activeCommunities.required"];
          }
          break;
        case "careerObstacle":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["careerObstacle.required"];
          }
          break;
        case "timeCommitment":
          if (!value || (typeof value === "string" && !value.trim())) {
            error = validationMessages["timeCommitment.required"];
          }
          break;
        default:
          break;
      }
    }

    setFieldErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error };
      }
      return clearFieldError(prev, fieldName);
    });
  };

  // Field setters with dynamic validation error clearing
  const setFullName = (val: string) => {
    setFullNameState(val);
    handleFieldChange("fullName", val);
  };

  const setBirthDate = (val: string) => {
    setBirthDateState(val);
    handleFieldChange("birthDate", val);
  };

  const setAddress = (val: string) => {
    setAddressState(val);
    handleFieldChange("address", val);
  };

  const setWhatsappNumber = (val: string) => {
    setWhatsappNumberState(val);
    handleFieldChange("whatsappNumber", val);
  };

  const setEmail = (val: string) => {
    setEmailState(val);
    handleFieldChange("email", val);
  };

  const setInstagramUsername = (val: string) => {
    setInstagramUsernameState(val);
    handleFieldChange("instagramUsername", val);
  };

  const setTiktokUsername = (val: string) => {
    setTiktokUsernameState(val);
    handleFieldChange("tiktokUsername", val);
  };

  const setOccupation = (val: string) => {
    setOccupationState(val);
    handleFieldChange("occupation", val);
  };

  const togglePsChallenge = (val: string) => {
    setPsChallenges((prev) => {
      let next: string[];
      if (prev.includes(val)) {
        next = prev.filter((item) => item !== val);
      } else if (prev.length >= 3) {
        next = prev;
      } else {
        next = [...prev, val];
      }
      handleFieldChange("psChallenges", next);
      return next;
    });
  };

  const setConfidenceScale = (val: number) => {
    setConfidenceScaleState(val);
    handleFieldChange("confidenceScale", val);
  };

  const setNervousTrigger = (val: string) => {
    setNervousTriggerState(val);
    handleFieldChange("nervousTrigger", val);
  };

  const setSkillsToMaster = (val: string) => {
    setSkillsToMasterState(val);
    handleFieldChange("skillsToMaster", val);
  };

  const setCustomSkillsToMaster = (val: string) => {
    setCustomSkillsToMasterState(val);
    handleFieldChange("customSkillsToMaster", val);
  };

  const setRoleModel = (val: string) => {
    setRoleModelState(val);
    handleFieldChange("roleModel", val);
  };

  const setMonetizationInterest = (val: string) => {
    setMonetizationInterestState(val);
    handleFieldChange("monetizationInterest", val);
  };

  const setCustomMonetizationInterest = (val: string) => {
    setCustomMonetizationInterestState(val);
    handleFieldChange("customMonetizationInterest", val);
  };

  const setCareerGoal = (val: string) => {
    setCareerGoalState(val);
    handleFieldChange("careerGoal", val);
  };

  const setFirstOpportunity = (val: string) => {
    setFirstOpportunityState(val);
    handleFieldChange("firstOpportunity", val);
  };

  const setMainTopic = (val: string) => {
    setMainTopicState(val);
    handleFieldChange("mainTopic", val);
  };

  const setCustomMainTopic = (val: string) => {
    setCustomMainTopicState(val);
    handleFieldChange("customMainTopic", val);
  };

  const setMainMessage = (val: string) => {
    setMainMessageState(val);
    handleFieldChange("mainMessage", val);
  };

  const setTargetAudience = (val: string) => {
    setTargetAudienceState(val);
    handleFieldChange("targetAudience", val);
  };

  const setExpertDesire = (val: string) => {
    setExpertDesireState(val);
    handleFieldChange("expertDesire", val);
  };

  const setActiveCommunities = (val: string) => {
    setActiveCommunitiesState(val);
    handleFieldChange("activeCommunities", val);
  };

  const setCareerObstacle = (val: string) => {
    setCareerObstacleState(val);
    handleFieldChange("careerObstacle", val);
  };

  const setTimeCommitment = (val: string) => {
    setTimeCommitmentState(val);
    handleFieldChange("timeCommitment", val);
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

      if (fieldErrors.whatsappNumber) {
        errors.whatsappNumber = fieldErrors.whatsappNumber;
      }

      if (fieldErrors.email) {
        errors.email = fieldErrors.email;
      }

      if (!birthDate || !birthDate.trim()) {
        errors.birthDate = validationMessages["birthDate.required"];
      }

      if (!address || !address.trim()) {
        errors.address = validationMessages["address.required"];
      }

      if (!occupation || !occupation.trim()) {
        errors.occupation = validationMessages["occupation.required"];
      }
    } else if (section === 2) {
      if (!psChallenges || psChallenges.length === 0) {
        errors.psChallenges = validationMessages["psChallenges.required"];
      }
      if (confidenceScale === null || confidenceScale === undefined) {
        errors.confidenceScale = validationMessages["confidenceScale.required"];
      }
      if (!nervousTrigger || !nervousTrigger.trim()) {
        errors.nervousTrigger = validationMessages["nervousTrigger.required"];
      }
    } else if (section === 3) {
      if (!skillsToMaster || !skillsToMaster.trim() || (skillsToMaster === "Lainnya" && !customSkillsToMaster.trim())) {
        errors.skillsToMaster = validationMessages["skillsToMaster.required"];
      }
      if (!roleModel || !roleModel.trim()) {
        errors.roleModel = validationMessages["roleModel.required"];
      }
      if (!monetizationInterest || !monetizationInterest.trim() || (monetizationInterest === "Lainnya" && !customMonetizationInterest.trim())) {
        errors.monetizationInterest = validationMessages["monetizationInterest.required"];
      }
    } else if (section === 4) {
      if (!careerGoal || !careerGoal.trim()) {
        errors.careerGoal = validationMessages["careerGoal.required"];
      }
      if (!firstOpportunity || !firstOpportunity.trim()) {
        errors.firstOpportunity = validationMessages["firstOpportunity.required"];
      }
    } else if (section === 5) {
      if (!mainTopic || !mainTopic.trim() || (mainTopic === "Lainnya" && !customMainTopic.trim())) {
        errors.mainTopic = validationMessages["mainTopic.required"];
      }
      if (!mainMessage || !mainMessage.trim()) {
        errors.mainMessage = validationMessages["mainMessage.required"];
      }
      if (!targetAudience || !targetAudience.trim()) {
        errors.targetAudience = validationMessages["targetAudience.required"];
      }
      if (!expertDesire || !expertDesire.trim()) {
        errors.expertDesire = validationMessages["expertDesire.required"];
      }
    } else if (section === 6) {
      if (!activeCommunities || !activeCommunities.trim()) {
        errors.activeCommunities = validationMessages["activeCommunities.required"];
      }
      if (!careerObstacle || !careerObstacle.trim()) {
        errors.careerObstacle = validationMessages["careerObstacle.required"];
      }
      if (!timeCommitment || !timeCommitment.trim()) {
        errors.timeCommitment = validationMessages["timeCommitment.required"];
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

  // WhatsApp validation and duplicate checking debounced
  useEffect(() => {
    if (!whatsappNumber) {
      setFieldErrors((prev) => clearFieldError(prev, "whatsappNumber"));
      return;
    }

    const formatErr = getFieldError("whatsappNumber", whatsappNumber, validationRules, validationMessages);
    if (formatErr) {
      setFieldErrors((prev) => ({
        ...prev,
        whatsappNumber: formatErr,
      }));
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const exists = await checkWhatsappExistsAction(whatsappNumber);
        if (exists) {
          setFieldErrors((prev) => ({
            ...prev,
            whatsappNumber: "No. WhatsApp sudah terdaftar",
          }));
        } else {
          setFieldErrors((prev) => clearFieldError(prev, "whatsappNumber"));
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [whatsappNumber]);

  // Email validation and duplicate checking debounced
  useEffect(() => {
    if (!email) {
      setFieldErrors((prev) => clearFieldError(prev, "email"));
      return;
    }

    const formatErr = getFieldError("email", email, validationRules, validationMessages);
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

  // Auto-redirect to Section 1 if server error involves WhatsApp or Email
  useEffect(() => {
    if (errorMsg && (errorMsg.includes("WhatsApp") || errorMsg.includes("Email"))) {
      setCurrentSection(1);
    }
  }, [errorMsg]);

  const lastSectionChangeTime = useRef<number>(0);

  // Reset field errors whenever switching sections so new section starts clean
  useEffect(() => {
    setFieldErrors({});
    lastSectionChangeTime.current = Date.now();
  }, [currentSection]);

  const handleNextSection = () => {
    setErrorMsg("");
    if (currentSection >= 6) return;
    const isValid = validateSection(currentSection);
    if (!isValid) {
      return;
    }
    setFieldErrors({});
    lastSectionChangeTime.current = Date.now();
    setCurrentSection((prev) => prev + 1);
  };

  const handlePrevSection = () => {
    setErrorMsg("");
    setFieldErrors({});
    if (currentSection > 1) {
      lastSectionChangeTime.current = Date.now();
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentSection < 6) {
      handleNextSection();
      return;
    }

    // Mencegah trigger validasi otomatis jika baru saja berpindah ke Section 6 (misal karena double-click Lanjut atau Enter key)
    if (Date.now() - lastSectionChangeTime.current < 400) {
      return;
    }

    const isValid = validateSection(6);
    if (!isValid) {
      return;
    }

    onSuccess({
      profile: {
        full_name: fullName,
        birth_date: birthDate || null,
        address: address || null,
        whatsapp_number: whatsappNumber,
        email: email || null,
        social_media: {
          instagram: instagramUsername || null,
          tiktok: tiktokUsername || null,
          youtube: youtubeUrl || null,
          linkedin: linkedinUrl || null,
        },
        occupation: occupation,
        subscribed_newsletter: subscribedNewsletter,
      },
      interests: {
        primary_interests: ["Public Speaking & Personal Branding"],
        ps_challenges: psChallenges,
        confidence_scale: confidenceScale,
        nervous_trigger: nervousTrigger,
        skills_to_master: skillsToMaster === "Lainnya" ? customSkillsToMaster : skillsToMaster,
        role_model: roleModel,
        monetization_interest: monetizationInterest === "Lainnya" ? customMonetizationInterest : monetizationInterest,
        career_goal: careerGoal,
        first_opportunity: firstOpportunity,
        main_topic: mainTopic === "Lainnya" ? customMainTopic : mainTopic,
        main_message: mainMessage,
        target_audience: targetAudience,
        expert_desire: expertDesire,
        active_communities: activeCommunities,
        career_obstacle: careerObstacle,
        time_commitment: timeCommitment,
      },
    });
  };

  return {
    currentSection,
    setCurrentSection,
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    address,
    setAddress,
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
    occupation,
    setOccupation,
    psChallenges,
    togglePsChallenge,
    confidenceScale,
    setConfidenceScale,
    nervousTrigger,
    setNervousTrigger,
    skillsToMaster,
    setSkillsToMaster,
    customSkillsToMaster,
    setCustomSkillsToMaster,
    roleModel,
    setRoleModel,
    monetizationInterest,
    setMonetizationInterest,
    customMonetizationInterest,
    setCustomMonetizationInterest,
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
    activeCommunities,
    setActiveCommunities,
    careerObstacle,
    setCareerObstacle,
    timeCommitment,
    setTimeCommitment,
    subscribedNewsletter,
    setSubscribedNewsletter,
    handleFieldChange,
    handleNextSection,
    handlePrevSection,
    handleSubmit,
  };
}
