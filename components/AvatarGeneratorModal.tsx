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

interface AvatarRegistrationData {
  user_id?: string;
  name: string;
  email: string;
  phone_no?: string;
  dial_code?: string;
  district: string;
  category: string;
  organization: string;
}

interface AvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData?: AvatarRegistrationData;
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

const getAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `https://scaleup.frameforge.one/${cleanUrl}`;
};

const AvatarGeneratorModal: React.FC<AvatarGeneratorModalProps> = ({
  isOpen,
  onClose,
  registrationData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [previewType, setPreviewType] = useState<GenerationType>("superhero");
  const [generationType, setGenerationType] = useState<GenerationType>("superhero");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // Removed userInteractedWithTabs to allow continuous cycling
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

  // Handle scroll position when modal state changes on mobile
  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure the scroll happens after layout settles
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (isGenerated) {
          // Scroll to BOTTOM in success state to show download button
          // Add a small delay to ensure the image has also begun rendering
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          }, 100);
        } else {
          // Scroll to TOP for initial and generating states
          container.scrollTop = 0;
        }
      });
    }
  }, [isOpen, isGenerating, isGenerated, isMobile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      try {
        window.dispatchEvent(new CustomEvent("avatar-modal-opened"));
      } catch { }
    }
    return () => {
      document.body.style.overflow = "";
      try {
        window.dispatchEvent(new CustomEvent("avatar-modal-closed"));
      } catch { }
    };
  }, [isOpen]);

  const [formData, setFormData] = useState({
    userId: registrationData?.user_id || "",
    name: registrationData?.name || "",
    email: registrationData?.email || "",
    phone_no: registrationData?.phone_no || "0000000000",
    dialCode: registrationData?.dial_code || "+91",
    district: registrationData?.district || "",
    category: registrationData?.category || "",
    organization: registrationData?.organization || "",
  });

  useEffect(() => {
    if (registrationData && isOpen) {
      console.log("AvatarGeneratorModal: registrationData or isOpen changed, updating formData:", registrationData);
      setFormData({
        userId: registrationData.user_id || "",
        name: registrationData.name || "",
        email: registrationData.email || "",
        phone_no: registrationData.phone_no || "0000000000",
        dialCode: registrationData.dial_code || "+91",
        district: registrationData.district || "",
        category: registrationData.category || "",
        organization: registrationData.organization || "",
      });
    }
  }, [registrationData, isOpen]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setFgIndex((prev) => (prev + 1) % loadingForegroundImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (isOpen) {
      console.log("AvatarGeneratorModal: Modal opened, resetting local state");
      setIsGenerated(false);
      setIsGenerating(false);
      setGeneratedImageUrl("");
      setGeneratedUserId("");
      setPhotoFile(null);
      // Reset selection to default
      setGenerationType("superhero");
      setPreviewType("superhero");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const activeOption = useMemo(
    () => generationOptions.find((o) => o.id === previewType)!,
    [previewType]
  );

  // Auto-cycle preview images ONLY (Visual Carousel)
  useEffect(() => {
    // Stop cycling if generating, generated, or closed. 
    // Does NOT stop on user interaction anymore, allows continuous showcase.
    if (!isOpen || isGenerated || isGenerating) return;

    const interval = setInterval(() => {
      setPreviewType((prev) => {
        const currentIndex = generationOptions.findIndex((opt) => opt.id === prev);
        const nextIndex = (currentIndex + 1) % generationOptions.length;
        return generationOptions[nextIndex].id;
      });
    }, 4000);

    return () => clearInterval(interval);
    // Added previewType to deps so the timer resets if user manually changes it
  }, [isOpen, isGenerated, isGenerating, previewType]);

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
    if (!generatedImageUrl || !formData.email) return;
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        `scaleup2026:final_image_url:${formData.email}`,
        generatedImageUrl
      );
    } catch (error) {
      console.error("Failed to store generated image URL:", error);
    }
  }, [generatedImageUrl, formData.email]);

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
        const lowerName = (file.name || "").toLowerCase();
        const hasValidExtension =
          lowerName.endsWith(".png") ||
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg");

        if (!hasValidExtension) {
          toast.error("Only PNG, JPEG and JPG images are allowed.");
          e.target.value = "";
          return;
        }
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
    console.log("AvatarGeneratorModal: extractFinalImageUrl processing payload:", JSON.stringify(payload, null, 2));
    if (!payload || typeof payload !== "object") return "";

    const candidates: string[] = [];
    const addIfString = (val: any) => {
      if (typeof val === "string" && val.trim() && val !== "null" && val !== "undefined") {
        candidates.push(val.trim());
      }
    };

    const keys = [
      "download_url",
      "signed_image_url",
      "final_image_url",
      "generated_image_url",
      "image_url",
      "photo_url",
      "photo"
    ];

    // Check direct keys
    keys.forEach(k => addIfString(payload[k]));

    // Check nested objects
    ["user", "data", "result"].forEach(objKey => {
      if (payload[objKey] && typeof payload[objKey] === "object") {
        keys.forEach(k => addIfString(payload[objKey][k]));
      }
    });

    if (candidates.length === 0) {
      const details = payload?.details || payload?.user?.details;
      if (typeof details === "string") {
        try {
          const parsed = JSON.parse(details);
          return extractFinalImageUrl(parsed);
        } catch {
          const match = details.match(/https?:\/\/[^\s"']+/i);
          if (match?.[0]) return match[0];
        }
      }
      return "";
    }

    // --- TIERED PRIORITIZATION ---
    // Tier 1: Final merged images (branded/framed) - HIGHEST PRIORITY
    const tier1 = candidates.filter(url => {
      const lowUrl = url.toLowerCase();
      const isTicket = lowUrl.includes("-ticket") || lowUrl.includes("makemypass.com");
      return !isTicket && (lowUrl.includes("/final/") || lowUrl.includes("merged"));
    });
    if (tier1.length > 0) {
      console.log("AvatarGeneratorModal: Found Tier 1 (Final/Merged) image URL:", tier1[0]);
      return tier1[0];
    }

    // Tier 2: Generated AI images (raw output)
    const tier2 = candidates.filter(url => {
      const lowUrl = url.toLowerCase();
      const isTicket = lowUrl.includes("-ticket") || lowUrl.includes("makemypass.com");
      return !isTicket && (lowUrl.includes("/generated/") || lowUrl.includes("avatar"));
    });
    if (tier2.length > 0) {
      console.log("AvatarGeneratorModal: Found Tier 2 (Generated/Avatar) image URL:", tier2[0]);
      return tier2[0];
    }

    // Tier 3: Avoid original uploads and tickets if possible
    const filtered = candidates.filter(url => {
      const lowUrl = url.toLowerCase();
      return !lowUrl.includes("/uploads/") &&
        !lowUrl.includes("-ticket") &&
        !lowUrl.includes("makemypass.com");
    });
    if (filtered.length > 0) {
      console.log("AvatarGeneratorModal: Found Tier 3 (Filtered) image URL:", filtered[0]);
      return filtered[0];
    }

    console.log("AvatarGeneratorModal: Falling back to first candidate image URL:", candidates[0]);
    return candidates[0];
  };


  const handleGenerate = async () => {
    console.log("handleGenerate called with formData:", formData);
    console.log("Photo file present:", !!photoFile);

    if (!photoFile) {
      toast.error("Please upload a photo");
      return;
    }

    if (!formData.name || !formData.email || !formData.organization) {
      console.log("Validation failed details:", {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        district: formData.district,
        category: formData.category
      });

      let missingFields = [];
      if (!formData.name) missingFields.push("Name");
      if (!formData.email) missingFields.push("Email");
      if (!formData.organization) missingFields.push("Organization");

      if (missingFields.length > 0) {
        toast.error(`Please fill the following required fields: ${missingFields.join(", ")}`);
      } else {
        // This case handles where the fields are present but empty/whitespace only
        toast.error("Please fill all required fields: Name, Email, and Organization");
      }
      return;
    }

    // Capture the current image as "old" before starting a new generation
    // This handles both re-generation by the same user and sequential users
    const oldImageUrl = generatedImageUrl;
    console.log("AvatarGeneratorModal: Starting generation, tracking old image for exclusion:", oldImageUrl);

    setIsGenerating(true);
    setGeneratedImageUrl("");
    setIsGenerated(false);

    // Ensure generationType is valid, fallback to superhero if needed
    // Use the explicitly selected generation type
    const finalGenerationType = generationType;

    const fetchGeneratedImageUrl = async (userId: string, currentOldUrl: string) => {
      const maxAttempts = 60; // Increase to 2 minutes
      const delayMs = 2000;

      console.log(`Starting polling for user ${userId}, ignoring old URL: ${currentOldUrl}...`);

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          // Add dial_code to query params as required by backend for phone number IDs
          // Use encodeURIComponent for userId as it might contain '+' or other special chars
          const url = new URL(`https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(userId)}`);
          // Cache busting for polling
          url.searchParams.append("t", Date.now().toString());
          if (formData.dialCode) {
            url.searchParams.append("dial_code", formData.dialCode);
          }

          const response = await fetch(url.toString(), { cache: 'no-store' });

          // 202 Accepted means still processing - we should continue polling
          if (response.status === 202) {
            if (attempt % 5 === 0) {
              console.log(`Polling attempt ${attempt + 1}: Received 202 (Processing)...`);
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          if (!response.ok) {
            console.warn(`Polling attempt ${attempt + 1}: API returned status ${response.status}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          const text = await response.text();
          let result;
          try {
            result = text ? JSON.parse(text) : {};
          } catch (parseError) {
            console.warn(`Polling attempt ${attempt + 1}: JSON parse error`, parseError);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          const finalUrl = extractFinalImageUrl(result);
          if (finalUrl) {
            const absoluteUrl = getAbsoluteUrl(finalUrl);
            // Add cache buster to the final image URL itself to bypass browser image cache
            // IMPORTANT: Do not add cache buster if it's a presigned S3 URL (contains X-Amz-Signature)
            // as it will invalidate the AWS signature and cause a 403 error.
            const imageWithBuster = absoluteUrl.includes('X-Amz-Signature')
              ? absoluteUrl
              : `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

            // If the URL (without buster) is exactly the same as the old one, it's likely stale data
            if (currentOldUrl && absoluteUrl === currentOldUrl.split('?')[0]) {
              if (attempt % 5 === 0) {
                console.log(`Polling attempt ${attempt + 1}: Found old image URL, still waiting for new one...`);
              }
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              continue;
            }
            console.log(`Polling successful on attempt ${attempt + 1}! Found new image:`, absoluteUrl);
            return imageWithBuster;
          }

          if (attempt % 5 === 0) {
            console.log(`Polling attempt ${attempt + 1}: Image not ready yet...`);
          }
        } catch (error) {
          console.error(`Polling attempt ${attempt + 1}: Network error:`, error);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      console.error("Polling timed out after 120 seconds.");
      return "";
    };

    try {
      const apiFormData = new FormData();
      // Use userId (UUID) if available, otherwise fallback to phone_no as per backend spec
      apiFormData.append("userId", formData.userId || formData.phone_no);
      if (formData.dialCode) {
        apiFormData.append("dial_code", formData.dialCode);
      }
      apiFormData.append("name", formData.name);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone_no", formData.phone_no);
      apiFormData.append("district", formData.district);
      apiFormData.append("category", formData.category);
      apiFormData.append("organization", formData.organization);
      apiFormData.append("prompt_type", getPromptType(finalGenerationType));
      apiFormData.append("photo", photoFile);

      let response;
      try {
        console.log("Sending generation request to backend...");
        response = await fetch("https://scaleup.frameforge.one/scaleup2026/generate", {
          method: "POST",
          body: apiFormData,
        });
      } catch (fetchError) {
        console.error("Network error during initial POST:", fetchError);

        // Robust fallback: if POST fails with a network error, it might still have reached the server!
        // We attempt to poll anyway using the userId we already have.
        const fallbackUserId = formData.userId || formData.phone_no;
        if (fallbackUserId) {
          console.log(`Attempting fallback polling for ${fallbackUserId} after network error...`);
          const imageUrl = await fetchGeneratedImageUrl(fallbackUserId, oldImageUrl);
          if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
            setIsGenerated(true);
            setIsGenerating(false);
            return;
          }
        }

        toast.error("Network error. Please check your connection and try again.");
        setIsGenerating(false);
        return;
      }

      console.log("API Response status:", response.status);

      if (!response.ok) {
        console.error("API returned error status:", response.status);

        // Even on server error, if we have a userId, try polling as a last resort
        const fallbackUserId = formData.userId || formData.phone_no;
        if (fallbackUserId) {
          console.log(`API error ${response.status}, but attempting to poll anyway for ${fallbackUserId}...`);
          const imageUrl = await fetchGeneratedImageUrl(fallbackUserId, oldImageUrl);
          if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
            setIsGenerated(true);
            setIsGenerating(false);
            return;
          }
        }

        toast.error("Your image is in the queue; your generated image will be sent to you shortly.");
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
        toast.error("Your image is in the queue; your generated image will be sent to you shortly.");
        setIsGenerating(false);
        return;
      }

      if (result?.user_id) {
        console.log("Setting generatedUserId to:", result.user_id);
        setGeneratedUserId(result.user_id);
      }

      const finalImageUrl = extractFinalImageUrl(result);
      console.log("Extracted finalImageUrl from initial response:", finalImageUrl);

      // Even if an image is returned in initial response, if it's the same as old one, we must poll
      if (finalImageUrl) {
        const absoluteUrl = getAbsoluteUrl(finalImageUrl);
        // Do not add cache buster if it's a presigned S3 URL
        const imageWithBuster = absoluteUrl.includes('X-Amz-Signature')
          ? absoluteUrl
          : `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

        // Use .split('?')[0] to compare URLs without cache busters
        if (!oldImageUrl || absoluteUrl !== oldImageUrl.split('?')[0]) {
          console.log("Found NEW image in initial response, skipping polling");
          setGeneratedImageUrl(imageWithBuster);
          setIsGenerated(true);
          setIsGenerating(false);

          // After successful generation, update the DB with final image info if user_id is present
          if (result.user_id) {
            const userId = result.user_id;
            try {
              await fetch(`https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(userId)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  generated_image_url: finalImageUrl,
                })
              });
            } catch (updateError) {
              console.error("Failed to update DB with final image info:", updateError);
            }
          }
          return;
        } else {
          console.log("Initial response contained the OLD image URL, proceeding to poll for the new one");
        }
      }

      // Use user_id from response if available, otherwise use the one we have in formData
      const pollUserId = result.user_id || formData.userId || formData.phone_no;

      if (pollUserId) {
        const imageUrl = await fetchGeneratedImageUrl(pollUserId, oldImageUrl);
        if (imageUrl) {
          setGeneratedImageUrl(imageUrl);
          setIsGenerated(true);

          // Also update DB after polling success
          try {
            await fetch(`https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(pollUserId)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                generated_image_url: imageUrl,
              })
            });
          } catch (updateError) {
            console.error("Failed to update DB after polling:", updateError);
          }
        } else {
          toast("Your image is in the queue; your generated image will be sent to you shortly.");
        }
        setIsGenerating(false);
        return;
      }

      toast.error("Your image is in the queue; your generated image will be sent to you shortly.");
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error("Your image is in the queue; your generated image will be sent to you shortly.");
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    let imageUrl = generatedImageUrl;
    console.log("handleDownload: Starting with imageUrl:", imageUrl);

    if (!imageUrl && generatedUserId) {
      console.log("handleDownload: No imageUrl, fetching by userId:", generatedUserId);
      try {
        const response = await fetch(`https://scaleup.frameforge.one/scaleup2026/user/${encodeURIComponent(generatedUserId)}`);
        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        const fetchedUrl = extractFinalImageUrl(result);
        console.log("handleDownload: Fetched URL from API:", fetchedUrl);

        if (response.ok && fetchedUrl) {
          const absUrl = getAbsoluteUrl(fetchedUrl);
          imageUrl = absUrl;
          setGeneratedImageUrl(absUrl);
          console.log("handleDownload: Updated imageUrl to absolute:", absUrl);
        }
      } catch (error) {
        console.error("handleDownload: Error fetching generated image:", error);
      }
    }

    if (!imageUrl) {
      console.error("handleDownload: No generated image URL available");
      toast.error("Image not ready for download yet.");
      return;
    }

    console.log("handleDownload: Starting download for:", imageUrl);
    setIsDownloading(true);

    try {
      const filename = `scaleup-avatar-${registrationData?.user_id || "user"}.png`;

      // If the URL is already a proxy URL, extract the original URL
      let targetUrl = imageUrl;
      if (targetUrl.includes("/api/proxy-image?url=")) {
        const urlParams = new URLSearchParams(targetUrl.split("?")[1]);
        const extracted = urlParams.get("url");
        if (extracted) {
          console.log("handleDownload: Extracted target URL from proxy:", extracted);
          targetUrl = extracted;
        }
      }

      // Safety check: if targetUrl looks like a ticket, warn
      const isTicket = targetUrl.toLowerCase().includes("-ticket") || targetUrl.toLowerCase().includes("makemypass.com");
      if (isTicket) {
        console.warn("handleDownload: WARNING - Target URL looks like a ticket!", targetUrl);
      }

      // Add a cache buster to the target URL ONLY IF it's not a presigned S3 URL
      // Presigned URLs already have a unique signature that shouldn't be tampered with,
      // and they are inherently unique/short-lived.
      let urlForProxy = targetUrl;
      if (!targetUrl.includes("X-Amz-Signature")) {
        urlForProxy = targetUrl.includes("?")
          ? `${targetUrl}&t=${Date.now()}`
          : `${targetUrl}?t=${Date.now()}`;
      }

      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
        urlForProxy
      )}&filename=${encodeURIComponent(filename)}&disposition=attachment`;

      console.log("handleDownload: Fetching via proxy:", proxyUrl);
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image (Status: ${response.status})`);
      }

      const blob = await response.blob();
      console.log(`handleDownload: Received blob of size ${blob.size} and type ${blob.type}`);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log("handleDownload: Download triggered successfully");
      toast.success("Download started!");
    } catch (error) {
      console.error("handleDownload: Error during download process:", error);
      toast.error("Download failed. Opening in new tab.");
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    console.log("AvatarGeneratorModal: handleClose resetting state");
    setPreviewType("superhero");
    setIsGenerating(false);
    setIsGenerated(false);
    setPhotoFile(null);
    setGeneratedImageUrl("");
    setGeneratedUserId("");

    // Explicitly reset the file input if possible
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
        width: 90%;
        max-width: 600px;
        border-radius: 12px;
        box-sizing: border-box;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        font-family: sans-serif;
      ">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          Upload Warning
        </h3>
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          You only have one generation so please use a good photo with proper lighting and direct angles
        </p>
        <img
          src="/Image to use.webp"
          alt="Guidelines"
          style="
            width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 20px;
            object-fit: contain;
            display: block;
          "
        />
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
            "fixed inset-0 z-[1000] flex justify-center bg-black/50 backdrop-blur-sm items-center p-4"
          )}
        // onClick={!isMobile ? handleClose : undefined} // Removed to prevent closing on outside click
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative bg-white shadow-2xl flex flex-col",
              "w-[95%] md:w-full max-w-5xl max-h-[90vh]",
              "rounded-2xl md:rounded-3xl",
              "overflow-hidden"
            )}
          >
            {/* Close button - Always pinned to top-right of the modal frame */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition md:bg-transparent md:hover:bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Content Wrapper */}
            <div
              ref={scrollContainerRef}
              className="w-full h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
            >

              {/* LEFT SIDE - Form */}
              <div
                className={cn(
                  "w-full md:w-1/2 p-4 md:p-12 bg-white transition-all duration-300 md:overflow-y-auto order-2 md:order-1",
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
                        className="text-3xl lg:text-4xl font-normal text-gray-900 mb-2 md:mt-12"
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
                            School / College / Organization
                          </label>
                          <input
                            name="organization"
                            value={formData.organization}
                            onChange={handleFormChange}
                            placeholder="Enter your organization"
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
                                type="button"
                                onClick={() => {
                                  setGenerationType(opt.id); // Set the actual selection
                                  setPreviewType(opt.id);    // Also show it immediately
                                  // Auto-cycle will continue or pick up from here
                                }}
                                className={cn(
                                  "flex-1 h-24 px-2 rounded-xl text-[10px] md:text-xs font-bold transition border relative overflow-hidden flex flex-col items-center justify-center gap-1.5",
                                  generationType === opt.id
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                )}
                              >
                                {generationType === opt.id && (
                                  <motion.div
                                    layoutId="selected-bg"
                                    className="absolute inset-0 bg-black -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <div className={cn(
                                  "relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 shrink-0 transition-transform shadow-sm",
                                  generationType === opt.id ? "border-white scale-105" : "border-gray-200"
                                )}>
                                  <img
                                    src={opt.previewImg}
                                    alt={opt.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="truncate max-w-full">
                                  {opt.title === "Medieval Warrior" ? "Warrior" : opt.title}
                                </span>
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
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 pt-2"
                        style={{ fontFamily: 'Calsans, sans-serif' }}
                      >
                        Awesome your AI avatar has been generated
                      </h1>
                      <p className="text-xs md:text-sm text-gray-600 mb-4">
                        Great news! Your AI Avatar has been sent to your email and WhatsApp. Feel free to share with your friends and on social networks.
                      </p>

                      <button
                        type="button"
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


              {/* RIGHT SIDE - Image Preview */}
              <div
                className={cn(
                  "relative flex-col bg-gray-900 border-b md:border-b-0",
                  "flex w-full md:w-1/2 md:static md:z-auto order-1 md:order-2",
                  // Only add padding if NOT generating (allows full bleed for loading state)
                  !isGenerating && "p-4 lg:p-6"
                )}
              >
                {/* Type Selection Tabs - Header */}
                {!isGenerated && !isGenerating && (
                  <div className="mb-2 mt-16 md:mt-14 w-full">
                    <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 w-full">
                      {generationOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setPreviewType(opt.id);
                            // Only updates view, does not change generation selection
                          }}
                          className={cn(
                            "w-full px-1 py-2 rounded-lg text-[10px] md:text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap",
                            previewType === opt.id
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          {opt.title === "Medieval Warrior" ? (
                            <>
                              <span className="md:hidden">Warrior</span>
                              <span className="hidden md:inline">Medieval Warrior</span>
                            </>
                          ) : (
                            opt.title
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Area */}
                <div
                  className={cn(
                    "relative w-full h-full overflow-hidden flex flex-col",
                    "rounded-none lg:rounded-2xl",
                    "min-h-[400px] md:min-h-0",
                    isGenerating && "bg-black"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "relative w-full overflow-hidden flex flex-col items-center justify-center bg-black",
                          "min-h-[350px] py-8 md:py-0 flex-1",
                          !isGenerating && "rounded-2xl"
                        )}
                      >
                        {/* Pure Black Background - No Image */}

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
                            relative md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                            z-10 max-h-[60%] w-auto md:max-h-[75%] md:max-w-[80%]
                            object-contain rounded-2xl shadow-2xl p-2
                          "
                          />
                        </AnimatePresence>

                        {/* Countdown & Loader */}
                        <div className="relative mt-4 md:mt-0 md:absolute md:bottom-10 z-20 text-center text-white w-full px-4">
                          <div className="text-5xl font-mono font-bold tracking-wider drop-shadow-lg">
                            {formattedCountdown}
                          </div>
                          <p className="text-xs mt-2 text-white/70 font-medium tracking-wide">
                            Generating your AI Avatar...
                          </p>

                          {/* Battery-Style Progress Loader */}
                          <div className="w-40 md:w-56 h-2 mt-4 mx-auto bg-gray-800/50 rounded-full overflow-hidden relative border border-white/10 shadow-inner">
                            {/* Charging Fill */}
                            <motion.div
                              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600"
                              initial={{ width: "0%" }}
                              animate={{
                                width: `${((90 - countdown) / 90) * 100}%`
                              }}
                              transition={{ duration: 0.5, ease: "linear" }}
                            >
                              {/* Electricity / Shimmer Effect inside the fill */}
                              <motion.div
                                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={isGenerated ? "result" : previewType}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full flex-1 flex flex-col items-center justify-start"
                      >
                        <img
                          src={
                            isGenerated
                              ? generatedImageUrl
                              : activeOption.previewImg
                          }
                          alt="Avatar preview"
                          className="max-h-[42vh] md:max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                          onError={(e) => {
                            console.error("Image load failed for URL:", generatedImageUrl);
                            e.currentTarget.src = activeOption.previewImg;
                            // If it's already generated but fails to load, maybe show a hint
                            if (isGenerated) {
                              toast.error("Failed to load generated avatar. Please try downloading it.");
                            }
                          }}
                        />

                        {/* Mobile Download Button */}
                        {/* {isGenerated && isMobile && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="mt-6 w-full max-w-xs h-11 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download AI Avatar
                        </button>
                      )} */}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom branding */}
                  <div className={cn(
                    "pt-4 text-center text-xs shrink-0 pb-4 text-gray-500 opacity-50"
                  )}>
                    Created using FrameForge.one
                  </div>

                  {/* Mobile Scroll Indicator - only visible when not generating/generated */}
                  {!isGenerating && !isGenerated && (
                    <div className="md:hidden flex justify-center w-full pb-6 z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <motion.div
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg"
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-[11px] font-medium text-white uppercase tracking-widest drop-shadow-md">
                            Scroll to start
                          </span>
                          <ChevronDown className="w-4 h-4 text-white drop-shadow-md" />
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
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
