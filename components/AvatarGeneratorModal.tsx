"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Shield,
  Briefcase,
  Sword,
  Download,
  Share2,
  ChevronDown,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData?: {
    name: string;
    email: string;
    phone_no: string;
    district: string;
    category: string;
    organization: string;
  };
}

type GenerationType = "superhero" | "professional" | "medieval";

const generationOptions: {
  id: GenerationType;
  title: string;
  subtitle: string;
  icon: any;
  previewImg: string;
}[] = [
  {
    id: "superhero",
    title: "Superhero",
    subtitle: "Turns you into a superhero",
    icon: Shield,
    previewImg: "/superhero.png",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "A well curated professional shot",
    icon: Briefcase,
    previewImg: "/professional.png",
  },
  {
    id: "medieval",
    title: "Medieval Warrior",
    subtitle: "An ancient fierce warrior",
    icon: Sword,
    previewImg: "/medieval.png",
  },
];

const loadingForegroundImages = [
  "/assets/images/1_eng.png",
  "/assets/images/1_mal.png",
  "/assets/images/2_eng.png",
  "/assets/images/2_mal.png",
  "/assets/images/3_eng.png",
  "/assets/images/3_mal.png",
];

const loadingMessages = [
  "Creating your unique avatar...",
  "Adding magical touches...",
  "Transforming your image...",
  "Almost there...",
  "Finalizing your masterpiece...",
];

const AvatarGeneratorModal: React.FC<AvatarGeneratorModalProps> = ({
  isOpen,
  onClose,
  registrationData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewType, setPreviewType] = useState<GenerationType>("superhero");
  const [generationType, setGenerationType] = useState<GenerationType>("superhero");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [generatedUserId, setGeneratedUserId] = useState<string>("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [countdown, setCountdown] = useState(90);
  const [fgIndex, setFgIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    name: registrationData?.name || "",
    email: registrationData?.email || "",
    phone_no: registrationData?.phone_no || "",
    district: registrationData?.district || "",
    category: registrationData?.category || "",
    organization: registrationData?.organization || "",
  });

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setFgIndex((prev) => (prev + 1) % loadingForegroundImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (registrationData) {
      setFormData({
        name: registrationData.name,
        email: registrationData.email,
        phone_no: registrationData.phone_no,
        district: registrationData.district,
        category: registrationData.category,
        organization: registrationData.organization,
      });
    }
  }, [registrationData, isOpen]);

  const activeOption = useMemo(
    () => generationOptions.find((o) => o.id === previewType)!,
    [previewType]
  );

  // Auto-cycle preview images
  useEffect(() => {
    if (!isOpen || isGenerated) return;
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    const interval = setInterval(() => {
      setPreviewType((prev) => {
        const currentIndex = generationOptions.findIndex((opt) => opt.id === prev);
        const nextIndex = (currentIndex + 1) % generationOptions.length;
        return generationOptions[nextIndex].id;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isGenerated]);

  // Rotate loading messages
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Countdown timer
  useEffect(() => {
    if (!isGenerating) {
      setCountdown(90);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [countdown]);

  useEffect(() => {
    if (!generatedImageUrl || !formData.phone_no) return;
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        `scaleup2026:final_image_url:${formData.phone_no}`,
        generatedImageUrl
      );
    } catch (error) {
      console.error("Failed to store generated image URL:", error);
    }
  }, [generatedImageUrl, formData.phone_no]);

  const getPromptType = (type: GenerationType): string => {
    const mapping = {
      superhero: "prompt1",
      professional: "prompt2",
      medieval: "prompt3"
    };
    return mapping[type];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PNG and JPEG images are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        toast.error("Image must be 2MB or smaller.");
        e.target.value = "";
        return;
      }

      setPhotoFile(file);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const extractFinalImageUrl = (payload: any): string => {
    if (!payload || typeof payload !== "object") return "";

    const direct =
      payload.final_image_url ||
      payload.generated_image_url ||
      payload.image_url ||
      payload?.data?.final_image_url ||
      payload?.data?.generated_image_url ||
      payload?.data?.image_url ||
      payload?.result?.final_image_url ||
      payload?.result?.generated_image_url ||
      payload?.result?.image_url;

    if (typeof direct === "string" && direct.trim()) return direct;

    const details = payload?.details;
    if (typeof details === "string") {
      try {
        const parsed = JSON.parse(details);
        const nested = extractFinalImageUrl(parsed);
        if (nested) return nested;
      } catch {
        const match = details.match(/https?:\/\/[^\s"']+/i);
        if (match?.[0]) return match[0];
      }
    }

    return "";
  };

  const handleSendMail = async (finalImageUrl: any) => {
    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: formData.email,
          subject: "ScaleUp Conclave 2026 - Your AI Avatar",
          finalImageUrl: finalImageUrl || "No image URL found",
        }),
      });

      const data = await res.json();
      if (data.success) {
        console.log("Mail sent successfully ✅");
      } else {
        console.error("Failed to send mail ❌");
      }
    } catch (err) {
      console.error("Error sending mail:", err);
    }
  };

  const handleGenerate = async () => {
    if (!photoFile) {
      toast.error("Please upload a photo");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone_no || !formData.district || !formData.category || !formData.organization) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsGenerating(true);

    const fetchGeneratedImageUrl = async (userId: string) => {
      const maxAttempts = 30;
      const delayMs = 2000;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await fetch(`https://scaleup.frameforge.one/scaleup2026/user/${userId}`);
          let result;
          try {
            const text = await response.text();
            result = text ? JSON.parse(text) : {};
          } catch (parseError) {
            continue;
          }

          if (response.ok && result.final_image_url) return result.final_image_url as string;
          if (response.ok && result.generated_image_url) return result.generated_image_url as string;
          if (response.ok && result.image_url) return result.image_url as string;
        } catch (error) {
          console.error("Error polling generated image:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      return "";
    };

    try {
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone_no", formData.phone_no);
      apiFormData.append("district", formData.district);
      apiFormData.append("category", formData.category);
      apiFormData.append("organization", formData.organization);
      apiFormData.append("prompt_type", getPromptType(generationType));
      apiFormData.append("photo", photoFile);

      console.log("Sending request to generate API...");
      console.log("Generation type:", generationType);
      console.log("Prompt type:", getPromptType(generationType));

      let response;
      try {
        response = await fetch("https://scaleup.frameforge.one/scaleup2026/generate", {
          method: "POST",
          body: apiFormData,
        });
      } catch (fetchError) {
        console.error("Network error:", fetchError);
        toast.error("Network error. Please check your connection and try again.");
        setIsGenerating(false);
        return;
      }

      console.log("API Response status:", response.status);

      if (!response.ok) {
        console.error("API returned error status:", response.status);
        toast.error(`Server error (${response.status}). Please try again.`);
        setIsGenerating(false);
        return;
      }

      let result;
      try {
        const text = await response.text();
        console.log("API Response text:", text);
        result = text ? JSON.parse(text) : {};
        console.log("Parsed result:", result);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        toast.error("Server returned invalid response. Please try again.");
        setIsGenerating(false);
        return;
      }

      if (result?.user_id) {
        setGeneratedUserId(result.user_id);
      }

      const finalImageUrl = extractFinalImageUrl(result);
      if (finalImageUrl) {
        setGeneratedImageUrl(finalImageUrl);
        setIsGenerated(true);
        setIsGenerating(false);
        handleSendMail(finalImageUrl);
        return;
      }

      if (result.user_id) {
        const imageUrl = await fetchGeneratedImageUrl(result.user_id);
        if (imageUrl) {
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);
          handleSendMail(imageUrl);
        } else {
          toast("Image generation is taking longer than expected. Please try again.");
        }
        setIsGenerating(false);
        return;
      }

      toast.error("Image generation failed. Please try again.");
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error("Error generating avatar. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    let imageUrl = generatedImageUrl;

    if (!imageUrl && generatedUserId) {
      try {
        const response = await fetch(`https://scaleup.frameforge.one/scaleup2026/user/${generatedUserId}`);
        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        const fetchedUrl = extractFinalImageUrl(result);

        if (response.ok && fetchedUrl) {
          imageUrl = fetchedUrl;
          setGeneratedImageUrl(fetchedUrl);
        }
      } catch (error) {
        console.error("Error fetching generated image:", error);
      }
    }

    if (!imageUrl) return;

    try {
      window.open(imageUrl, "_blank", "noopener,noreferrer");

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `avatar-${formData.name || "user"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error downloading image. Please try again.");
    }
  };

  const handleClose = () => {
    setPreviewType("superhero");
    setGenerationType("superhero");
    setIsGenerating(false);
    setIsGenerated(false);
    setPhotoFile(null);
    setGeneratedImageUrl("");
    setGeneratedUserId("");
    onClose();
  };

  if (!isOpen) return null;

  const handleOpenWithWarning = () => {
    if (document.getElementById("upload-warning-modal")) return;

    const modalHTML = `<div id="upload-warning-modal" style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    ">
      <div style="
        background: white;
        padding: 24px;
        width: 100%;
        max-width: 400px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        font-family: sans-serif;
      ">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          Upload Warning
        </h3>
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Before you continue: This AI generation can be used only once. Make sure your photo is bright, clear, and shows your face fully. For best results, a professionally taken photo is recommended. A good photo = a great result
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button id="warning-cancel" style="
            padding: 8px 14px;
            border-radius: 6px;
            border: 1px solid #ccc;
            background: #fff;
            cursor: pointer;
          ">
            Cancel
          </button>
          <button id="warning-ok" style="
            padding: 8px 14px;
            border-radius: 6px;
            border: none;
            background: #000;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          ">
            OK, Continue
          </button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("upload-warning-modal");
    const okBtn = document.getElementById("warning-ok");
    const cancelBtn = document.getElementById("warning-cancel");

    if (!modal || !okBtn || !cancelBtn) return;

    okBtn.onclick = () => {
      modal.remove();
      fileInputRef.current?.click();
    };

    cancelBtn.onclick = () => {
      modal.remove();
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            isMobile && "static inset-auto p-0"
          )}
          onClick={!isMobile ? handleClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full bg-white shadow-2xl overflow-y-auto flex flex-col-reverse md:flex-row",
              isMobile ? "min-h-screen" : "max-w-5xl max-h-[95vh] rounded-3xl md:overflow-hidden"
            )}
          >
            {/* Close button - positioned differently for mobile */}
            {!isMobile && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}

            {isMobile && (
              <button
                onClick={handleClose}
                className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* LEFT SIDE - Form */}
            {!(isGenerating && isMobile) && (
              <div
                className={cn(
                  "w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 bg-white transition-all duration-300 md:overflow-y-auto",
                  isGenerating && "pointer-events-none blur-sm lg:blur-0 lg:pointer-events-auto"
                )}
              >
                <AnimatePresence mode="wait">
                  {!isGenerated ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h1
                        className="text-3xl lg:text-4xl font-normal text-gray-900 mb-2"
                        style={{ fontFamily: 'Calsans, sans-serif' }}
                      >
                        Generate your avatar
                      </h1>
                      <p className="text-sm text-gray-500 mb-6">
                        To generate your avatar, upload a clear, well-lit, front-facing photo without filters. We only do one generation, and it can take about a minute.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Enter your name
                          </label>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="Enter your name"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Company Name
                          </label>
                          <input
                            name="organization"
                            value={formData.organization}
                            onChange={handleFormChange}
                            placeholder="Company Name"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Choose Type of generation
                          </label>
                          <div className="flex gap-2">
                            {generationOptions.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setGenerationType(opt.id)}
                                className={cn(
                                  "flex-1 h-11 px-3 rounded-lg text-sm font-semibold transition border",
                                  generationType === opt.id
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                                )}
                              >
                                {opt.title === "Medieval Warrior" ? "Warrior" : opt.title}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Upload Photo
                          </label>
                          <div className="relative">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <div
                              onClick={handleOpenWithWarning}
                              className="flex items-center justify-between w-full h-11 px-4 rounded-lg border border-gray-300 cursor-pointer hover:border-gray-400 transition bg-white"
                            >
                              <span className="text-sm text-gray-500">
                                {photoFile
                                  ? photoFile.name.length > 15
                                    ? `${photoFile.name.slice(0, 35)}...`
                                    : photoFile.name
                                  : "Select Image File"}
                              </span>
                              <button
                                type="button"
                                className="bg-black text-white px-4 py-1.5 rounded-md text-sm font-semibold"
                              >
                                Select File
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="w-full h-11 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                          {isGenerating ? "Generating..." : "Submit"}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h1
                        className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 pt-2"
                        style={{ fontFamily: 'Calsans, sans-serif' }}
                      >
                        Awesome your AI avatar has been generated
                      </h1>
                      <p className="text-sm text-gray-600 mb-6">
                        Great news! Your AI Avatar has been sent to your email and WhatsApp. Feel free to share with your friends and on social networks.
                      </p>

                      <button
                        onClick={handleDownload}
                        className="w-full h-11 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download AI Avatar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* RIGHT SIDE - Image Preview */}
            <div
              className={cn(
                "relative flex-col bg-gray-900",
                "flex w-full p-4 md:p-0 md:w-1/2 md:static md:z-auto",
                "md:flex lg:p-6",
                (isGenerating || isGenerated) && "fixed inset-0 z-[999] w-full h-full p-4 md:static md:z-auto"
              )}
            >
              {/* Type Selection Tabs - Header */}
              {!isGenerated && !isGenerating && (
                <div className="mb-6">
                  <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                    {generationOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPreviewType(opt.id)}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5",
                          previewType === opt.id
                            ? "bg-white text-gray-900"
                            : "text-white/70 hover:text-white"
                        )}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Area */}
              <div
                className={cn(
                  "relative w-full h-full overflow-hidden",
                  "rounded-none lg:rounded-2xl"
                )}
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full min-h-[70vh] rounded-2xl overflow-hidden flex items-center justify-center"
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center scale-105"
                        style={{
                          backgroundImage: "url('/assets/images/base.png')",
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                      {/* Foreground Fade Image */}
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={fgIndex}
                          src={loadingForegroundImages[fgIndex]}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="
                            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                            z-10 max-h-[85%] max-w-[90%] lg:max-h-[75%] lg:max-w-[80%]
                            object-contain rounded-2xl shadow-2xl
                          "
                        />
                      </AnimatePresence>

                      {/* Countdown */}
                      <div className="absolute bottom-8 z-20 text-center text-white">
                        <div className="text-5xl font-mono font-bold tracking-wider drop-shadow-lg">
                          {formattedCountdown}
                        </div>
                        <p className="text-xs mt-2 text-white/70">
                          Generating your AI Avatar...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={isGenerated ? "result" : previewType}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full flex flex-col items-center justify-center px-6 pb-16"
                    >
                      <img
                        src={isGenerated ? generatedImageUrl : activeOption.previewImg}
                        alt="Avatar preview"
                        className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                        onError={(e) => {
                          e.currentTarget.src = activeOption.previewImg;
                        }}
                      />

                      {/* Mobile Download Button */}
                      {isGenerated && isMobile && (
                        <button
                          onClick={handleDownload}
                          className="mt-6 w-full max-w-xs h-11 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download AI Avatar
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom branding */}
                <div className="pt-4 text-center text-white/60 text-xs shrink-0">
                  Created using FrameForge.one
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarGeneratorModal;