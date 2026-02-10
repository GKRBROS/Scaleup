"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const companies = [
  "Startups",
  "Working Professionals",
  "Students",
  "Business Owners",
  "NRI / Gulf Retunees",
  "Government Officials",
];

function TypeCard({
  active,
  title,
  subtitle,
  icon: Icon,
  onClick,
  testId,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: any;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "relative flex flex-col items-center justify-center border-[1.5px] transition-all duration-300",
        "w-[100px] h-[70px] rounded-xl p-2",
        "lg:w-[182px] lg:h-[98px] lg:p-0",
        active
          ? "bg-black text-white border-black scale-[1.02] lg:scale-100"
          : "bg-white text-[#5E5E5E] border-[#E5E5E5] hover:border-gray-300 lg:hover:shadow-md",
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 mb-1",
          "lg:absolute lg:top-4 lg:w-6 lg:h-6 lg:mb-0",
          active ? "brightness-0 invert" : "opacity-40",
        )}
      />
      <div
        className={cn(
          "text-[9px] font-bold",
          "lg:text-base lg:font-normal lg:mt-8 lg:mb-2",
        )}
        style={{
          fontFamily:
            window.innerWidth >= 1024
              ? "Cal Sans, sans-serif"
              : "Geist, sans-serif",
        }}
      >
        {title}
      </div>
      <div
        className={cn(
          "hidden lg:block text-xs px-2",
          active ? "opacity-100" : "opacity-60",
        )}
        style={{ fontFamily: "Cal Sans, sans-serif" }}
      >
        {subtitle}
      </div>
    </button>
  );
}

const AvatarGeneratorModal: React.FC<AvatarGeneratorModalProps> = ({
  isOpen,
  onClose,
  registrationData,
}) => {
  const [previewType, setPreviewType] = useState<GenerationType>("superhero");
  const [generationType, setGenerationType] =
    useState<GenerationType>("superhero");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [generatedUserId, setGeneratedUserId] = useState<string>("");

  // Form data with initial values from registration
  const [formData, setFormData] = useState({
    name: registrationData?.name || "",
    email: registrationData?.email || "",
    phone_no: registrationData?.phone_no || "",
    district: registrationData?.district || "",
    category: registrationData?.category || "",
    organization: registrationData?.organization || "",
  });

  // Update form data when registration data changes
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
    [previewType],
  );

  // Auto-cycle preview images on desktop every 4 seconds
  useEffect(() => {
    if (!isOpen || isGenerated) return;

    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    const interval = setInterval(() => {
      setPreviewType((prev) => {
        const currentIndex = generationOptions.findIndex(
          (opt) => opt.id === prev,
        );
        const nextIndex = (currentIndex + 1) % generationOptions.length;
        return generationOptions[nextIndex].id;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isGenerated]);

  useEffect(() => {
    if (!generatedImageUrl || !formData.email) return;
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        `scaleup2026:final_image_url:${formData.email}`,
        generatedImageUrl,
      );
    } catch (error) {
      console.error("Failed to store generated image URL:", error);
    }
  }, [generatedImageUrl, formData.email]);

  // Map generationType to prompt_type
  const getPromptType = (type: GenerationType): string => {
    const mapping = {
      superhero: "prompt1",
      professional: "prompt2",
      medieval: "prompt3",
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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



  const handleGenerate = async () => {
    // Validation
    if (!photoFile) {
      toast.error("Please upload a photo");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone_no ||
      !formData.district ||
      !formData.category ||
      !formData.organization
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsGenerating(true);

    const fetchGeneratedImageUrl = async (userId: string) => {
      const maxAttempts = 30;
      const delayMs = 2000;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await fetch(
            `https://scaleup.frameforge.one/scaleup2026/user/${userId}`,
          );

          let result;
          try {
            const text = await response.text();
            console.log(`Polling attempt ${attempt + 1} raw response:`, text);
            result = text ? JSON.parse(text) : {};
          } catch (parseError) {
            console.error(
              `Polling attempt ${attempt + 1} - Failed to parse JSON:`,
              parseError,
            );
            continue; // Skip to next attempt
          }

          console.log(`Polling attempt ${attempt + 1}:`, {
            status: response.status,
            result,
            hasFinalImageUrl: !!result.final_image_url,
            finalImageUrlValue: result.final_image_url,
            allKeys: Object.keys(result),
          });

          if (response.ok && result.final_image_url) {
            console.log("Image URL found:", result.final_image_url);
            return result.final_image_url as string;
          }

          // Check alternative field names
          if (response.ok && result.generated_image_url) {
            console.log(
              "Image URL found (generated_image_url):",
              result.generated_image_url,
            );
            return result.generated_image_url as string;
          }

          if (response.ok && result.image_url) {
            console.log("Image URL found (image_url):", result.image_url);
            return result.image_url as string;
          }
        } catch (error) {
          console.error("Error polling generated image:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      console.error("Max polling attempts reached without finding image");
      return "";
    };

    const fetchGeneratedImageUrlByEmail = async (email: string) => {
      const maxAttempts = 30;
      const delayMs = 2000;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await fetch(
            `https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(email)}`,
          );

          let result;
          try {
            const text = await response.text();
            console.log(
              `Polling by phone attempt ${attempt + 1} raw response:`,
              text,
            );
            result = text ? JSON.parse(text) : {};
          } catch (parseError) {
            console.error(
              `Polling by phone attempt ${attempt + 1} - Failed to parse JSON:`,
              parseError,
            );
            continue;
          }

          console.log(`Polling by phone attempt ${attempt + 1}:`, {
            status: response.status,
            result,
            hasFinalImageUrl: !!result.final_image_url,
            finalImageUrlValue: result.final_image_url,
            allKeys: Object.keys(result),
          });

          if (response.ok && result.final_image_url) {
            console.log("Image URL found:", result.final_image_url);
            return result.final_image_url as string;
          }

          if (response.ok && result.generated_image_url) {
            console.log(
              "Image URL found (generated_image_url):",
              result.generated_image_url,
            );
            return result.generated_image_url as string;
          }

          if (response.ok && result.image_url) {
            console.log("Image URL found (image_url):", result.image_url);
            return result.image_url as string;
          }
        } catch (error) {
          console.error("Error polling generated image by email:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      console.error(
        "Max polling attempts reached without finding image (email lookup)",
      );
      return "";
    };

    try {
      // Create FormData for API
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone_no", formData.phone_no);
      apiFormData.append("district", formData.district);
      apiFormData.append("category", formData.category);
      apiFormData.append("organization", formData.organization);
      apiFormData.append("prompt_type", getPromptType(generationType));
      apiFormData.append("photo", photoFile);

      // Call API
      const response = await fetch("https://scaleup.frameforge.one/scaleup2026/generate", {
        method: "POST",
        body: apiFormData,
      });

      let result;
      try {
        const text = await response.text();
        console.log("Raw response:", text);
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        toast.error("Server returned invalid response. Please try again.");
        setIsGenerating(false);
        return;
      }

      console.log("Generate API Response:", {
        status: response.status,
        data: result,
      });

      const isBackendProcessing =
        response.status === 202 ||
        result?.error === "Backend processing" ||
        result?.status === 504;

      if (isBackendProcessing) {
        toast(
          "Image generation started. Please wait a moment and try again to view the result.",
        );
        setIsGenerating(false);
        return;
      }

      // Always store user_id when available
      if (result?.user_id) {
        setGeneratedUserId(result.user_id);
      }

      const finalImageUrl = extractFinalImageUrl(result);

      // Handle 202 Accepted (async processing) - immediately start polling
      if (response.status === 202 && result?.user_id) {
        console.log(
          "Backend is processing asynchronously (202), starting to poll...",
        );
        const imageUrl = await fetchGeneratedImageUrl(result.user_id);
        if (imageUrl) {
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);
          setIsGenerating(false);
          return;
        }
        // If polling failed, show message
        toast("Image generation in progress. Please try again in a moment.");
        setIsGenerating(false);
        return;
      }

      if (response.status === 202 && formData.email) {
        console.log(
          "Backend is processing asynchronously (202), polling by email...",
        );
        const imageUrl = await fetchGeneratedImageUrlByEmail(formData.email);
        if (imageUrl) {
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);
          setIsGenerating(false);
          return;
        }
        toast("Image generation in progress. Please try again in a moment.");
        setIsGenerating(false);
        return;
      }

      // Check if response is not ok (4xx, 5xx errors)
      if (!response.ok) {
        // Even with error, try to get image if user_id exists
        if (result?.user_id) {
          console.log(
            "Response not OK but user_id exists, polling for image...",
          );
          setGeneratedUserId(result.user_id);
          const imageUrl = await fetchGeneratedImageUrl(result.user_id);
          if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
            setIsGenerated(true);
            setIsGenerating(false);
            return;
          }
        }

        if (formData.email) {
          console.log(
            "Response not OK, polling for image by email...",
            formData.email,
          );
          const imageUrl = await fetchGeneratedImageUrlByEmail(
            formData.email,
          );
          if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
            setIsGenerated(true);
            setIsGenerating(false);
            return;
          }
        }

        const errorMsg =
          result?.details || result?.error || "Failed to generate avatar";
        console.error("Generate API Error:", errorMsg);

        // For 504 timeout, suggest retry
        if (response.status === 504) {
          toast.error(`${errorMsg}. Please wait a moment and try again.`);
        } else {
          toast.error(`Error: ${errorMsg}`);
        }

        setIsGenerating(false);
        return;
      }

      // Success - check various response formats
      // Backend might return: { success: true, final_image_url, user_id } OR { final_image_url, user_id }
      if (finalImageUrl) {
        console.log("Setting generated image URL:", finalImageUrl);
        setGeneratedImageUrl(finalImageUrl);
        setIsGenerated(true);
        setIsGenerating(false);
        return;
      }

      if (result.user_id) {
        console.log("Polling for image with user_id:", result.user_id);
        const imageUrl = await fetchGeneratedImageUrl(result.user_id);
        if (imageUrl) {
          console.log("Image URL received from polling:", imageUrl);
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);
        } else {
          toast(
            "Image generation is taking longer than expected. Please try again.",
          );
        }
        setIsGenerating(false);
        return;
      }

      if (formData.email) {
        console.log("Polling for image with email:", formData.email);
        const imageUrl = await fetchGeneratedImageUrlByEmail(formData.email);
        if (imageUrl) {
          console.log("Image URL received from email polling:", imageUrl);
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);
        } else {
          toast(
            "Image generation is taking longer than expected. Please try again.",
          );
        }
        setIsGenerating(false);
        return;
      }

      // If we get here, success response but no useful data
      console.error(
        "Success response but missing image URL and user_id:",
        result,
      );
      toast.error(
        "Image generation completed but image URL is missing. Please contact support.",
      );
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
        const response = await fetch(
          `https://scaleup.frameforge.one/scaleup2026/user/${generatedUserId}`,
        );
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

    if (!imageUrl && formData.email) {
      try {
        const response = await fetch(
          `https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(formData.email)}`,
        );
        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        const fetchedUrl = extractFinalImageUrl(result);
        if (response.ok && fetchedUrl) {
          imageUrl = fetchedUrl;
          setGeneratedImageUrl(fetchedUrl);
        }
      } catch (error) {
        console.error("Error fetching generated image by email:", error);
      }
    }

    if (!imageUrl) return;

    try {
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
    // Reset state
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-7xl h-[92vh] lg:h-[85vh] mx-4 rounded-3xl bg-white shadow-[var(--shadow-lg)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 transition hover:bg-zinc-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-zinc-900" />
            </button>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto scrollbar-hide bg-white text-zinc-950">
              <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                  <div
                    className={cn(
                      "grid items-start gap-8 transition-all duration-500",
                      isGenerated
                        ? "lg:grid-cols-1"
                        : "lg:grid-cols-[220px_1fr_500px]",
                    )}
                  >
                    {/* Left Sidebar - Options */}
                    <AnimatePresence>
                      {!isGenerated && (
                        <motion.aside
                          initial={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="order-1 lg:order-none"
                        >
                          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-[18px] lg:w-[218px] lg:bg-[#F9FAFB] lg:border lg:border-[rgba(152,152,152,0.5)] lg:rounded-xl lg:p-[18px]">
                            {generationOptions.map((opt) => (
                              <TypeCard
                                key={opt.id}
                                active={previewType === opt.id}
                                title={opt.title}
                                subtitle={opt.subtitle}
                                icon={opt.icon}
                                onClick={() => setPreviewType(opt.id)}
                                testId={`button-generation-${opt.id}`}
                              />
                            ))}
                          </div>
                        </motion.aside>
                      )}
                    </AnimatePresence>

                    {/* Center - Preview/Result */}
                    <section
                      className={cn(
                        "order-2 flex h-full items-start",
                        isGenerated && "mx-auto w-full max-w-2xl",
                      )}
                    >
                      <div className="mx-auto w-full max-w-[380px] md:max-w-[400px] lg:max-w-none lg:self-stretch">
                        <div
                          data-testid="img-poster-preview"
                          className={cn(
                            "relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 lg:aspect-auto lg:border-0",
                            isGenerated
                              ? "lg:h-[70vh] lg:max-h-[70vh] lg:w-auto"
                              : "lg:h-auto",
                          )}
                        >
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={isGenerated ? "generated" : previewType}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              transition={{ duration: 0.4 }}
                              src={
                                isGenerated
                                  ? generatedImageUrl
                                  : activeOption.previewImg
                              }
                              alt="Avatar preview"
                              className="h-full w-full object-cover lg:object-contain"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  generatedImageUrl,
                                );
                                e.currentTarget.src = activeOption.previewImg;
                              }}
                              onLoad={() =>
                                console.log(
                                  "Image loaded successfully:",
                                  isGenerated
                                    ? generatedImageUrl
                                    : activeOption.previewImg,
                                )
                              }
                            />
                          </AnimatePresence>

                          {/* AI Loading Overlay */}
                          <AnimatePresence>
                            {isGenerating && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                              >
                                <motion.div
                                  animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1],
                                  }}
                                  transition={{
                                    rotate: {
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "linear",
                                    },
                                    scale: { duration: 2, repeat: Infinity },
                                  }}
                                >
                                  <Sparkles className="h-12 w-12 text-white" />
                                </motion.div>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 text-lg font-bold text-white"
                                >
                                  AI is crafting your avatar...
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Action Buttons for Generated Image */}
                        <AnimatePresence>
                          {isGenerated && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-8 flex items-center justify-center gap-4"
                            >
                              <button
                                onClick={handleDownload}
                                data-testid="button-download"
                                className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-8 py-3 font-semibold text-white transition hover:bg-zinc-800"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>

                    {/* Right - Form */}
                    <AnimatePresence>
                      {!isGenerated && (
                        <motion.main
                          initial={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="order-3"
                        >
                          <div className="max-w-xl">
                            <h1
                              data-testid="text-title"
                              className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl"
                            >
                              Generate your avatar
                            </h1>
                            <p
                              data-testid="text-description"
                              className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-500 sm:text-base"
                            >
                              To generate your avatar, upload a clear, well-lit,
                              front-facing photo without filters. We only do one
                              generation, and it can take about a minute.
                            </p>

                            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label
                                  data-testid="label-name"
                                  className="text-sm font-semibold text-zinc-800"
                                  htmlFor="name"
                                >
                                  Your Name
                                </label>
                                <input
                                  id="name"
                                  data-testid="input-name"
                                  name="name"
                                  placeholder="Michael"
                                  value={formData.name}
                                  onChange={handleFormChange}
                                  className="mt-2 h-[66px] w-full rounded-[16.5px] border border-[#E5E5E5] bg-white px-[16.5px] text-[20.625px] font-semibold tracking-[-0.04em] text-zinc-900 outline-none transition focus:ring-2 focus:ring-black placeholder:text-[#A1A1A1]"
                                  style={{ fontFamily: "Geist, sans-serif" }}
                                />
                              </div>
                              <div>
                                <label
                                  data-testid="label-company"
                                  className="text-sm font-semibold text-zinc-800"
                                  htmlFor="organization"
                                >
                                  Organization Name
                                </label>
                                <input
                                  id="organization"
                                  data-testid="input-organization"
                                  name="organization"
                                  placeholder="Enter organization"
                                  value={formData.organization}
                                  onChange={handleFormChange}
                                  className="mt-2 h-[66px] w-full rounded-[16.5px] border border-[#E5E5E5] bg-white px-[16.5px] text-[20.625px] font-semibold tracking-[-0.04em] text-zinc-900 outline-none transition focus:ring-2 focus:ring-black placeholder:text-[#A1A1A1]"
                                  style={{ fontFamily: "Geist, sans-serif" }}
                                />
                              </div>
                            </div>

                            <div className="mt-6">
                              <div
                                data-testid="text-type-of-generation"
                                className="text-sm font-semibold text-zinc-800"
                              >
                                Type Of Generation
                              </div>
                              <div className="mt-3 grid grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-3">
                                {generationOptions.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    data-testid={`button-type-${opt.id}`}
                                    onClick={() => setGenerationType(opt.id)}
                                    className={cn(
                                      "h-[66px] rounded-[16.5px] border px-2 text-sm font-semibold transition",
                                      "lg:px-4 lg:text-[20.625px]",
                                      generationType === opt.id
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-black border-[#E5E5E5]",
                                    )}
                                  >
                                    {opt.title === "Professional"
                                      ? "Professional Suit"
                                      : opt.title}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="mt-6">
                              <div
                                data-testid="text-optional"
                                className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                              >
                                Optional
                              </div>

                              <div className="mt-3">
                                <div
                                  data-testid="label-upload"
                                  className="text-sm font-semibold text-zinc-800"
                                >
                                  Upload image{" "}
                                  <span className="text-red-500">*</span>
                                </div>
                                <input
                                  type="file"
                                  id="photo-upload"
                                  data-testid="input-photo-upload"
                                  onChange={handleFileChange}
                                  accept="image/jpeg,image/png"
                                  className="mt-2 h-44 w-full rounded-[32px] border-2 border-dashed border-gray-100 bg-[#F9FAFB] p-4 cursor-pointer transition hover:border-gray-300"
                                />
                                <div
                                  data-testid="text-upload-hint"
                                  className="mt-2 text-xs text-zinc-500"
                                >
                                  Upload a clear, well-lit photo (JPEG or PNG).
                                  Max size: 2MB
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleGenerate}
                              disabled={isGenerating}
                              data-testid="button-send-message"
                              className="relative mt-6 flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:bg-zinc-800 active:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isGenerating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                "Send Message"
                              )}
                              {isGenerating && (
                                <motion.div
                                  className="absolute inset-0 bg-white/10"
                                  initial={{ x: "-100%" }}
                                  animate={{ x: "100%" }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "linear",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </motion.main>
                      )}
                    </AnimatePresence>
                  </div>
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
