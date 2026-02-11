"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast, Toaster } from "react-hot-toast";
import AvatarGeneratorModal from "@/components/AvatarGeneratorModal";

interface AvatarRegistrationData {
  name: string;
  email: string;
  phone_no?: string;
  district: string;
  category: string;
  organization: string;
}

const MAKEMYPASS_VALIDATE_URL =
  "https://api.makemypass.com/makemypass/public-form/f9290cc6-d840-4492-aefb-76f189df5f5e/validate-rsvp/";

const FIXED_VALIDATE_PAYLOAD = {
  name: "John Doe",
  phone: "+917736526607",
  district: "Kannur",
  category: "Students",
  organization: "tfg",
  did_you_attend_the_previous_scaleup_conclave_: "No",
};

interface AiModalPopProps {
  showFloatingIcon?: boolean;
  showFloatingform?: boolean;
  onOpenRegistration?: () => void;
}

export function AiModalPop({
  showFloatingIcon = true,
  showFloatingform = true,
  onOpenRegistration,
}: AiModalPopProps) {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showExistingImageModal, setShowExistingImageModal] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [avatarRegistrationData, setAvatarRegistrationData] =
    useState<AvatarRegistrationData | null>(null);
  
  const [mail, setMail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [shouldOpenAvatarAfterOtp, setShouldOpenAvatarAfterOtp] =
    useState(false);

  const OTP_VERIFY_TTL_MS = 5 * 60 * 1000;

  const getAbsoluteUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `https://scaleup.frameforge.one/${cleanUrl}`;
  };

  const getVerifiedAt = (email: string) => {
    if (!email || typeof window === "undefined") return 0;
    const raw = localStorage.getItem(
      `scaleup2026:otp_verified_at:${email}`,
    );
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const setVerifiedAt = (email: string) => {
    if (!email || typeof window === "undefined") return;
    localStorage.setItem(
      `scaleup2026:otp_verified_at:${email}`,
      Date.now().toString(),
    );
  };

  const clearVerifiedAt = (email: string) => {
    if (!email || typeof window === "undefined") return;
    localStorage.removeItem(`scaleup2026:otp_verified_at:${email}`);
  };

  const isVerifiedRecently = (email: string) => {
    const verifiedAt = getVerifiedAt(email);
    if (!verifiedAt) return false;
    const expired = Date.now() - verifiedAt > OTP_VERIFY_TTL_MS;
    if (expired) {
      clearVerifiedAt(email);
      return false;
    }
    return true;
  };

  // Timer for OTP resend
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timeLeft]);
  
  useEffect(() => {
    const openAiPop = () => {
      setShowPhoneModal(true); // this opens the OTP / phone modal
    };

    window.addEventListener("open-aipop", openAiPop as EventListener);

    return () => {
      window.removeEventListener("open-aipop", openAiPop as EventListener);
    };
  }, []);


  useEffect(() => {
    const handleRegistrationOpen = () => setIsExternalModalOpen(true);
    const handleRegistrationClose = () => setIsExternalModalOpen(false);
    const handleAvatarOpen = () => setIsExternalModalOpen(true);
    const handleAvatarClose = () => setIsExternalModalOpen(false);
    const handleRegistrationTrigger = () => setIsExternalModalOpen(true);

    window.addEventListener(
      "registration-modal-opened",
      handleRegistrationOpen as EventListener,
    );
    window.addEventListener(
      "open-registration-modal",
      handleRegistrationTrigger as EventListener,
    );
    window.addEventListener(
      "registration-modal-closed",
      handleRegistrationClose as EventListener,
    );
    window.addEventListener(
      "avatar-modal-opened",
      handleAvatarOpen as EventListener,
    );
    window.addEventListener(
      "avatar-modal-closed",
      handleAvatarClose as EventListener,
    );

    return () => {
      window.removeEventListener(
        "registration-modal-opened",
        handleRegistrationOpen as EventListener,
      );
      window.removeEventListener(
        "open-registration-modal",
        handleRegistrationTrigger as EventListener,
      );
      window.removeEventListener(
        "registration-modal-closed",
        handleRegistrationClose as EventListener,
      );
      window.removeEventListener(
        "avatar-modal-opened",
        handleAvatarOpen as EventListener,
      );
      window.removeEventListener(
        "avatar-modal-closed",
        handleAvatarClose as EventListener,
      );
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const openRegistrationModal = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("open-registration-modal"));
  };

  const getStoredImageUrl = (email: string) => {
    if (!email || typeof window === "undefined") return "";
    try {
      return (
        localStorage.getItem(`scaleup2026:final_image_url:${email}`) || ""
      );
    } catch (error) {
      console.error("Failed to read stored image URL:", error);
      return "";
    }
  };

  const handleShowExistingImage = (url: string) => {
    const absUrl = getAbsoluteUrl(url);
    setExistingImageUrl(absUrl);
    setShowExistingImageModal(true);
    setShowPhoneModal(false);
    if (mail) {
      setVerifiedAt(mail);
    }
  };

  const handleSendMail = async () => {
    if (!mail.trim()) {
      toast.error("Please enter your registered email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const formData = new FormData();
    formData.append("name", FIXED_VALIDATE_PAYLOAD.name);
    formData.append("phone", FIXED_VALIDATE_PAYLOAD.phone);
    formData.append("district", FIXED_VALIDATE_PAYLOAD.district);
    formData.append("category", FIXED_VALIDATE_PAYLOAD.category);
    formData.append("organization", FIXED_VALIDATE_PAYLOAD.organization);
    formData.append(
      "did_you_attend_the_previous_scaleup_conclave_",
      FIXED_VALIDATE_PAYLOAD.did_you_attend_the_previous_scaleup_conclave_
    );
    formData.append("email", mail);

    setLoading(true);
    try {
      // 1. Validate with MakeMyPass API
      const makemypassRes = await fetch(MAKEMYPASS_VALIDATE_URL, {
        method: "POST",
        body: formData,
      });

      const makemypassData = await makemypassRes.json().catch(() => ({}));

      // Handle response based on status
      if (makemypassRes.status === 400) {
        // User exists but needs verification -> Redirect to OTP verification
        // Call /scaleup2026/otp/generate endpoint to create OTP
        const otpRes = await fetch("https://scaleup.frameforge.one/scaleup2026/otp/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: mail,
            phone_no: "0000000000",
          }),
        });

        const otpData = await otpRes.json().catch(() => ({}));

        if (otpRes.ok) {
          setOtpSent(true);
          setTimeLeft(600);
          toast.success("OTP sent to your email");
        } else {
          console.error("Failed to send OTP", otpData);
          if (otpRes.status === 404) {
            toast.error("Email not registered. Please register first.");
            if (onOpenRegistration) {
              onOpenRegistration();
              setShowPhoneModal(false);
            }
          } else {
            toast.error(otpData.error || "Failed to send OTP. Please try again.");
          }
        }
      } else if (makemypassRes.status === 404 || makemypassRes.status === 200) {
        // User not registered -> Redirect to registration form
        toast.error("You are not registered. Please register first.");
        if (onOpenRegistration) {
          onOpenRegistration();
          setShowPhoneModal(false);
        }
        setLoading(false);
        return;
      } else {
        console.error("MakeMyPass API validation failed", makemypassData);
        toast.error(
          makemypassData.error ||
            "MakeMyPass API validation failed. Please try again."
        );
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error sending mail or validating MakeMyPass API:", err);
      toast.error(
        "Error sending OTP or validating MakeMyPass API. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    console.log("handleVerifyOtp called with OTP:", otp);
    if (!otp || !otp.trim()) {
      console.log("OTP is empty");
      toast.error("Please enter OTP");
      return;
    }

    if (otp.length !== 6) {
      console.log("OTP length is not 6:", otp.length);
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://scaleup.frameforge.one/scaleup2026/otp/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
        email: mail,
        phone_no: "0000000000", // The backend only needs email for OTP lookup, but we keep this for compatibility
        otp,
      }),
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        // Check if backend response contains generated_image_url (nested in user object)
        const user = responseData.user || {};
        const rawBackendImageUrl =
          user.generated_image_url ||
          responseData.generated_image_url;
        
        if (rawBackendImageUrl) {
          const backendImageUrl = getAbsoluteUrl(rawBackendImageUrl);
          console.log("OTP Verification: Found generated image URL:", backendImageUrl);
          // Store it in localStorage for future use
          if (typeof window !== "undefined") {
            localStorage.setItem(
              `scaleup2026:final_image_url:${mail}`,
              backendImageUrl,
            );
          }
          handleShowExistingImage(backendImageUrl);
          setLoading(false);
          return;
        }

        toast.success("Verified successfully!");
        handleOpenAvatarGenerator(user);
      } else {
        toast.error(responseData.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    handleSendMail();
  };

  const handleOpenAvatarGenerator = (userData?: any) => {
    console.log("handleOpenAvatarGenerator called with userData:", userData);
    setShowPhoneModal(false);
    
    // Try to recover missing fields from localStorage if they aren't in userData
    let recoveredData = { ...userData };
    if (typeof window !== "undefined" && mail) {
      const storageKey = `scaleup2026:registration_data:${mail.toLowerCase().trim()}`;
      const stored = localStorage.getItem(storageKey);
      console.log("LocalStorage data for key", storageKey, ":", stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          // Merge logic: API data takes precedence, but only if it's truthy
          // This prevents empty strings from API overwriting truthy values from localStorage
          const mergeFields = ['name', 'phone_no', 'district', 'category', 'organization'];
          
          recoveredData = { ...parsed };
          
          if (userData) {
            Object.keys(userData).forEach(key => {
              if (userData[key]) {
                recoveredData[key] = userData[key];
              }
            });
          }
          
          console.log("Final merged recoveredData:", recoveredData);
        } catch (e) {
          console.error("Error parsing stored registration data:", e);
        }
      }
    }

    const finalRegistrationData = {
      name: recoveredData?.name || "",
      email: mail.trim(),
      phone_no: recoveredData?.phone_no || recoveredData?.phone || "",
      district: recoveredData?.district || "",
      category: recoveredData?.category || "",
      organization: recoveredData?.organization || "",
    };
    
    console.log("Setting avatarRegistrationData to:", finalRegistrationData);
    setAvatarRegistrationData(finalRegistrationData);
    setIsAvatarModalOpen(true);
    setShouldOpenAvatarAfterOtp(false);
  };

  const openPhoneModal = () => {
    if (mail && isVerifiedRecently(mail)) {
      const storedUrl = getStoredImageUrl(mail);
      if (storedUrl) {
        handleShowExistingImage(storedUrl);
        return;
      }
      handleOpenAvatarGenerator();
      return;
    }

    setShowPhoneModal(true);
  };

  const resetForm = () => {
    setMail("");
    setOtp("");
    setOtpSent(false);
    setTimeLeft(600);
    setShouldOpenAvatarAfterOtp(false);
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    resetForm();
  };

  const handleDownloadExistingImage = async () => {
    if (!existingImageUrl) {
      console.warn("handleDownloadExistingImage: No existingImageUrl available");
      return;
    }

    console.log("handleDownloadExistingImage: Starting with URL:", existingImageUrl);

    try {
      // Use proxy to fetch image to bypass CORS and force download
      const filename = `avatar-${mail || "user"}.png`;
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
        existingImageUrl
      )}&filename=${encodeURIComponent(filename)}&disposition=attachment`;

      console.log("handleDownloadExistingImage: Using proxy URL:", proxyUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        console.error("handleDownloadExistingImage: Proxy response not OK:", response.status);
        throw new Error("Failed to fetch image via proxy");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      console.log("handleDownloadExistingImage: Created blob URL:", url);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("handleDownloadExistingImage: Error during download process:", error);
      toast.error("Error downloading image. Opening in new tab instead.");
      window.open(existingImageUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Email & OTP Modal - Fully Responsive */}
      <Dialog open={showPhoneModal} onOpenChange={handleClosePhoneModal}>
        <DialogContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="w-[95vw] sm:w-[90vw] md:w-[600px] lg:w-[700px] max-w-[700px] h-auto max-h-[90vh] md:h-[372px] p-0 overflow-hidden rounded-xl [&>button]:text-white"
        >
          <VisuallyHidden>
            <DialogTitle>Email Verification</DialogTitle>
          </VisuallyHidden>

          <div className="flex flex-col-reverse md:flex-row h-full">

            {/* LEFT SIDE - Forms - Responsive Padding */}
            <div
              className={`w-full md:w-1/2 ${
                !otpSent ? "flex" : "grid"
              } items-center overflow-y-auto bg-white p-4 sm:p-6 md:p-4`}
            >

              {!otpSent ? (
                <>
                  <div className="space-y-3 w-full">
                    <p style={{ fontFamily: 'Calsans, sans-serif' }} className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Your email address helps us verify your registration status and ensure a smooth experience.
                      Once verified, we’ll direct you to the right step—whether it’s registration, AI image generation, or downloading created assets.
                    </p>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter Email Address"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        className="flex-1 px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 rounded-lg focus:ring-2 outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSendMail}
                      disabled={loading}
                      className="w-full px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sending..." : "Get Code"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 w-full">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm sm:text-base font-bold text-gray-900 block">
                        Enter OTP
                      </label>
                      <p className="text-xs text-gray-500">
                        OTP sent to <span className="font-medium text-indigo-600">{mail}</span>
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        maxLength={6}
                        className="w-full px-4 py-3 sm:py-4 border-2 border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-center text-2xl sm:text-3xl font-bold tracking-[0.5em] sm:tracking-[0.75em] transition-all placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm"
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : "Verify & Continue"}
                    </button>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Didn't receive code?</span>
                        {timeLeft > 0 ? (
                          <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">
                            {formatTime(timeLeft)}
                          </span>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            className="text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setOtpSent(false);
                        }}
                        className="w-full py-2 text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
                      >
                        ← Use a different email
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* RIGHT SIDE - Images/GIF - Shows at top on mobile, right side on md+ */}
            <div className="block md:w-1/2 w-full h-40 sm:h-48 md:h-auto relative bg-gray-900">
              <div className="absolute inset-0 flex items-center justify-center p-0">
                <img
                  src="/assets/images/reg1.png"
                  alt="Register"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* Existing Image Modal - Fully Responsive */}
      <Dialog
        open={showExistingImageModal}
        onOpenChange={setShowExistingImageModal}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] max-w-2xl rounded-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: "#fff",
            color: "var(--neutral-50)",
          }}
        >
          <DialogClose asChild />
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <DialogTitle className="text-base sm:text-lg font-[700]">
              Your Generated Avatar
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              We found your previous AI avatar. You can download it below.
            </p>
          </DialogHeader>

          <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4">
            <div className="w-full max-h-[50vh] sm:max-h-[60vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-zinc-50 flex items-center justify-center">
              <img
                src={`/api/proxy-image?url=${encodeURIComponent(existingImageUrl)}&disposition=inline`}
                alt="Generated avatar"
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
              />
            </div>
            <button
              onClick={handleDownloadExistingImage}
              className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-zinc-900 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-zinc-800"
            >
              Download
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Generator Modal */}
      <AvatarGeneratorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        registrationData={avatarRegistrationData || undefined}
      />

      {/* Floating Icon - Fully Responsive - Scales down on mobile */}
      {showFloatingIcon &&
        !showPhoneModal &&
        !showExistingImageModal &&
        !isAvatarModalOpen &&
        !isExternalModalOpen && (
          <button
            onClick={openPhoneModal}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 !z-[99] w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full transition-all flex items-center justify-center hover:scale-110 transform duration-300 animate-bounce"
            style={{ position: 'fixed' }}
            title="Generate AI Avatar"
          >
            <img 
              src="/AI.png" 
              alt="AI" 
              className="w-full h-full object-contain" 
            />
          </button>
        )}
    </>
  );
}

export default AiModalPop;
