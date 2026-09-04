"use client";

import { useState, useEffect } from "react";
import { getFieldError, clearFieldError, scrollToFirstError } from "@/lib/formValidation";

export interface InitialOnboardingData {
  fullName?: string;
  stageName?: string;
  email?: string;
  whatsappNumber?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

export function useOnboardingFormState(
  initialData: InitialOnboardingData,
  onSubmitAction: (data: any) => void,
  setErrorMsg: (msg: string) => void,
  isLoading: boolean
) {
  const [currentSection, setCurrentSection] = useState(1);

  // Bagian 1: Profil Singkat (Auto-filled)
  const [fullName, setFullNameState] = useState(initialData.fullName || "");
  const [birthDate, setBirthDateState] = useState(initialData.birthDate || "");
  const [address, setAddressState] = useState(initialData.address || "");
  const [whatsappNumber, setWhatsappNumberState] = useState(initialData.whatsappNumber || "");
  const [email, setEmailState] = useState(initialData.email || "");
  const [instagramUsername, setInstagramUsernameState] = useState(initialData.instagramUsername || "");
  const [tiktokUsername, setTiktokUsernameState] = useState(initialData.tiktokUsername || "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialData.youtubeUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl || "");
  const [occupation, setOccupationState] = useState(initialData.occupation || "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  // Update states if initialData changes
  useEffect(() => {
    if (initialData.fullName && !fullName) setFullNameState(initialData.fullName);
    if (initialData.birthDate && !birthDate) setBirthDateState(initialData.birthDate);
    if (initialData.address && !address) setAddressState(initialData.address);
    if (initialData.whatsappNumber && !whatsappNumber) setWhatsappNumberState(initialData.whatsappNumber);
    if (initialData.email && !email) setEmailState(initialData.email);
    if (initialData.instagramUsername && !instagramUsername) setInstagramUsernameState(initialData.instagramUsername);
    if (initialData.tiktokUsername && !tiktokUsername) setTiktokUsernameState(initialData.tiktokUsername);
    if (initialData.youtubeUrl && !youtubeUrl) setYoutubeUrl(initialData.youtubeUrl);
    if (initialData.linkedinUrl && !linkedinUrl) setLinkedinUrl(initialData.linkedinUrl);
    if (initialData.occupation && !occupation) setOccupationState(initialData.occupation);
  }, [initialData]);

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
          if (!value) error = validationMessages["birthDate.required"];
          break;
        case "address":
          if (!value || !value.trim()) error = validationMessages["address.required"];
          break;
        case "occupation":
          if (!value || !value.trim()) error = validationMessages["occupation.required"];
          break;
        case "psChallenges":
          if (!value || (Array.isArray(value) && value.length === 0)) {
            error = validationMessages["psChallenges.required"];
          }
          break;
        case "confidenceScale":
          if (value === null || value === undefined) {
            error = validationMessages["confidenceScale.required"];
          }
          break;
        case "nervousTrigger":
          if (!value || !value.trim()) {
            error = validationMessages["nervousTrigger.required"];
          }
          break;
        case "skillsToMaster":
          if (!value || !value.trim()) {
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
          if (!value || !value.trim()) error = validationMessages["roleModel.required"];
          break;
        case "monetizationInterest":
          if (!value || !value.trim()) {
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
          if (!value || !value.trim()) error = validationMessages["careerGoal.required"];
          break;
        case "firstOpportunity":
          if (!value || !value.trim()) error = validationMessages["firstOpportunity.required"];
          break;
        case "mainTopic":
          if (!value || !value.trim()) {
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
          if (!value || !value.trim()) error = validationMessages["mainMessage.required"];
          break;
        case "targetAudience":
          if (!value || !value.trim()) error = validationMessages["targetAudience.required"];
          break;
        case "expertDesire":
          if (!value || !value.trim()) error = validationMessages["expertDesire.required"];
          break;
        case "activeCommunities":
          if (!value || !value.trim()) error = validationMessages["activeCommunities.required"];
          break;
        case "careerObstacle":
          if (!value || !value.trim()) error = validationMessages["careerObstacle.required"];
          break;
        case "timeCommitment":
          if (!value || !value.trim()) error = validationMessages["timeCommitment.required"];
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
      if (!fullName || fullName.trim().length < 3) {
        errors.fullName = validationMessages["fullName.required"];
      }
      if (!birthDate) {
        errors.birthDate = validationMessages["birthDate.required"];
      }
      if (!address || !address.trim()) {
        errors.address = validationMessages["address.required"];
      }
      if (!whatsappNumber || whatsappNumber.replace(/\D/g, "").length < 9) {
        errors.whatsappNumber = validationMessages["whatsappNumber.required"];
      }
      if (!email || !email.includes("@")) {
        errors.email = validationMessages["email.required"];
      }
      if (!occupation || !occupation.trim()) {
        errors.occupation = validationMessages["occupation.required"];
      }
      if (instagramUsername && instagramUsername.includes("@")) {
        errors.instagramUsername = validationMessages["instagramUsername.no_at"];
      }
      if (tiktokUsername && tiktokUsername.includes("@")) {
        errors.tiktokUsername = validationMessages["tiktokUsername.no_at"];
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

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((prev) => Math.min(prev + 1, 6));
      setErrorMsg("");
    }
  };

  const handlePrevSection = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 1));
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    for (let sec = 1; sec <= 6; sec++) {
      if (!validateSection(sec)) {
        setCurrentSection(sec);
        setErrorMsg(`Silakan lengkapi Bagian ${sec} terlebih dahulu.`);
        return;
      }
    }

    const payload = {
      fullName,
      birthDate,
      address,
      whatsappNumber,
      email,
      instagramUsername,
      tiktokUsername,
      youtubeUrl,
      linkedinUrl,
      occupation,
      psChallenges,
      confidenceScale,
      nervousTrigger,
      skillsToMaster,
      customSkillsToMaster,
      roleModel,
      monetizationInterest,
      customMonetizationInterest,
      careerGoal,
      firstOpportunity,
      mainTopic,
      customMainTopic,
      mainMessage,
      targetAudience,
      expertDesire,
      activeCommunities,
      careerObstacle,
      timeCommitment,
    };

    onSubmitAction(payload);
  };

  return {
    currentSection,
    handleNextSection,
    handlePrevSection,
    handleSubmit,
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
    fieldErrors,
    handleFieldChange,
  };
}
