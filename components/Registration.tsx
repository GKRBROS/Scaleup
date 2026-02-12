"use client";

import { Instagram, MoveLeft, X } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { allCountries } from "country-telephone-data";
import AvatarGeneratorModal from "@/components/AvatarGeneratorModal";
import AiModalPop from "./AiModalPop";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormFields = {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  district: string;
  category: string;
  organization: string;
  previousAttendance: string;
};

type TicketStep = "form" | "ticket" | "success" | "avatar";
type TicketType = "general" | "vip";

interface TicketTypeModalProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<TicketStep>>;
  handleRegister: () => void;
  selectedTicket: TicketType | null;
  setSelectedTicket: React.Dispatch<React.SetStateAction<TicketType | null>>;
  loading: boolean;
  registerStatus: "idle" | "submitting" | "submitted";
}

export default function RegistrationModal({
  isOpen,
  onClose,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState<FormFields>({
    name: "",
    countryCode: "+91",
    phone: "",
    email: "",
    district: "",
    category: "",
    organization: "",
    previousAttendance: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState<TicketStep>("form");
  const [ticketID, setTicketID] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<
    "idle" | "submitting" | "submitted"
  >("idle");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("registration-modal-opened"));
      
      // Reset form and step when opening
      setStep("form");
      setFormData({
        name: "",
        countryCode: "+91",
        phone: "",
        email: "",
        district: "",
        category: "",
        organization: "",
        previousAttendance: "",
      });
      setRegisterStatus("idle");
      setSelectedTicket(null);
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("registration-modal-closed"));
      setRegisterStatus("idle");
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    const url =
      "https://api.makemypass.com/makemypass/public-form/f9290cc6-d840-4492-aefb-76f189df5f5e/validate-rsvp/";
    const formData1 = new FormData();
    formData1.append("name", formData.name);
    formData1.append("phone", formData.countryCode + formData.phone);
    formData1.append("email", formData.email);
    formData1.append("district", formData.district);
    formData1.append("organization", formData.organization);
    formData1.append("category", formData.category);

    formData1.append(
      "did_you_attend_the_previous_scaleup_conclave_",
      formData.previousAttendance
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData1,
      });

      const result = await response.json();

      if (result.statusCode === 400) {
        result.message?.email && toast.error(result.message?.email);
        result.message?.phone && toast.error(result.message?.phone);
        return;
      }
    } catch (error) {
      console.error("API Error:", error);
    }

    setStep("ticket");
  };

  const payWithRazorpay = (orderData: any) => {
    const options = {
      key: orderData.client_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Scaleup Conclave 2025",
      description: "VIP Ticket Payment",
      image: "/rpay.webp",
      order_id: orderData.order_id,
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
      }) {
        try {
          const verifyRes = await fetch(
            "https://api.makemypass.com/makemypass/public-form/validate-payment/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                gateway: "Razorpay",
              }),
            }
          );

          const verifyResult = await verifyRes.json();

          if (verifyRes.ok && !verifyResult.hasError) {
            toast.success("Payment successful");
            setTicketID(verifyResult.response.event_register_id);
            setStep("success");
          } else {
            toast.error("Payment verification failed");
          }
        } catch (err) {
          toast.error("Payment verification error");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleRegister = async () => {
    setLoading(true);
    setRegisterStatus("submitting");

    try {
      // Front-end validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.district ||
        !formData.organization ||
        !formData.category
      ) {
        toast.error("Please fill all required fields");
        setLoading(false);
        setRegisterStatus("idle");
        return;
      }

      const payload = new FormData();
      payload.append("district", formData.district);
      payload.append("name", formData.name);
      payload.append("phone", `${formData.countryCode}${formData.phone}`);
      payload.append("email", formData.email);
      payload.append("organization", formData.organization);
      payload.append("category", formData.category);
      payload.append(
        "did_you_attend_the_previous_scaleup_conclave_",
        formData.previousAttendance
      );

      const tickets = [
        {
          ticket_id: "4afaaaaa-28fe-493c-82a6-e65f27551ded",
          count: 1,
          my_ticket: true,
        },
        {
          ticket_id: "a85d92b1-0e14-4975-9ac1-f8c5194a5ac5",
          count: 1,
          my_ticket: true,
        },
      ];

      if (selectedTicket === "general") {
        payload.append("__tickets[]", JSON.stringify(tickets[0]));
      } else if (selectedTicket === "vip") {
        payload.append("__tickets[]", JSON.stringify(tickets[1]));
      }

      // Call MakeMy Pass API
      const response = await fetch(
        "https://api.makemypass.com/makemypass/public-form/f9290cc6-d840-4492-aefb-76f189df5f5e/submit/",
        {
          method: "POST",
          body: payload,
        }
      );

      const result = await response.json();
      console.log("MakeMyPass API response:", result);

      // Validation error
      if (result.hasError) {
        const key = Object.keys(result.message)[0];
        toast.error(result.message[key][0]);
        setLoading(false);
        setRegisterStatus("idle");
        return;
      }

      // PAYMENT REQUIRED
      if (result.response?.gateway) {
        payWithRazorpay(result.response);
        setLoading(false);
        setRegisterStatus("idle");
        return;
      }

      // SUCCESS - Call backend registration API
      console.log("Registration successful, calling backend register API");
      
      // Store user data in localStorage for recovery in case of exit
      if (typeof window !== "undefined") {
        const userDataToStore = {
          name: formData.name,
          email: formData.email,
          phone_no: formData.phone,
          dial_code: formData.countryCode,
          district: formData.district,
          category: formData.category,
          organization: formData.organization,
        };
        const storageKey = `scaleup2026:registration_data:${formData.email.toLowerCase().trim()}`;
        console.log("Storing registration data to localStorage with key:", storageKey);
        localStorage.setItem(storageKey, JSON.stringify(userDataToStore));
      }

      const registerPayload = {
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone,
        dial_code: formData.countryCode,
        district: formData.district,
        category: formData.category,
        organization: formData.organization,
      };

      try {
        const registerResponse = await fetch(
          "https://scaleup.frameforge.one/scaleup2026/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(registerPayload),
          }
        );

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
          console.error("Backend register API error:", registerResult);
          toast.error("Registration to backend failed. Please try again.");
          setLoading(false);
          setRegisterStatus("idle");
          return;
        }

        // Capture user_id from backend response
        if (registerResult.user_id) {
          console.log("Captured user_id from backend:", registerResult.user_id);
          // Store user_id in localStorage for later use
          if (typeof window !== "undefined") {
            const storageKey = `scaleup2026:registration_data:${formData.email.toLowerCase().trim()}`;
            const storedData = JSON.parse(localStorage.getItem(storageKey) || "{}");
            storedData.user_id = registerResult.user_id;
            localStorage.setItem(storageKey, JSON.stringify(storedData));
          }
        }
      } catch (registerError) {
        console.error("Backend Register API call error:", registerError);
        toast.error("Failed to complete registration. Please try again.");
        setLoading(false);
        setRegisterStatus("idle");
        return;
      }

      // SUCCESS - Show success and open avatar modal
      toast.success("Registration successful");
      setTicketID(
        result.response?.event_register_id || "TEST-TICKET-" + Date.now()
      );
      setRegisterStatus("submitted");
      setStep("success");
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
      setRegisterStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getBoxStyle = (fieldName: string): React.CSSProperties => ({
    backgroundColor: "#FFFFFF",
    borderColor: focusedField === fieldName ? "#418CFF" : "#E5E7EB",
    color: "#111827",
    outline: "none",
    borderRadius: "8px",
    borderWidth: "1px",
  });

  return (
    <>
      {/* Overlay with backdrop blur */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start md:items-center justify-center"
      >
        {/* Modal Container - Full screen on mobile, split on desktop */}
        <div className="relative w-full min-h-full md:min-h-0 md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col md:flex-row m-0 md:m-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-gray-600 hover:text-red-600 transition p-2 bg-white/80 rounded-full md:bg-transparent"
          >
            <X size={26} />
          </button>

          {/* LEFT SIDE - Forms */}
          <div className={`w-full overflow-y-auto bg-white flex-1 ${step === "avatar" ? "" : "md:w-1/2"}`}>
            {step === "form" && (
              <RegistrationForm
                formData={formData}
                handleChange={handleChange}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                getBoxStyle={getBoxStyle}
                handleSubmit={handleSubmit}
                onClose={onClose}
                showPhoneModal={showPhoneModal}
                setShowPhoneModal={setShowPhoneModal}
              />
            )}

            {step === "ticket" && (
              <TicketTypeModal
                onClose={onClose}
                setStep={setStep}
                handleRegister={handleRegister}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
                loading={loading}
                registerStatus={registerStatus}
              />
            )}

            {step === "success" && (
              <SuccessModal
                onClose={onClose}
                setStep={setStep}
                ticketID={ticketID}
              />
            )}

            {step === "avatar" && (
              <div className="w-full h-full">
                <AvatarGeneratorModal
                  isOpen={true}
                  onClose={() => {
                    // When avatar closes, close the entire registration flow
                    onClose();
                  }}
                  registrationData={{
                    user_id: JSON.parse(localStorage.getItem(`scaleup2026:registration_data:${formData.email.toLowerCase().trim()}`) || "{}").user_id || "",
                    name: formData.name,
                    email: formData.email,
                    phone_no: formData.phone,
                    dial_code: formData.countryCode,
                    district: formData.district,
                    category: formData.category,
                    organization: formData.organization,
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Images/GIF */}
          {step !== "avatar" && (
            <div className="hidden md:block md:w-1/2 relative bg-gray-900 overflow-hidden">
              {step === "form" && (
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
              )}

              {step === "ticket" && (
                <div className="absolute inset-0 flex items-center justify-center p-0">
                  <img
                    src="/assets/images/reg1.png"
                    alt="Choose Ticket"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {step === "success" && (
                <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
                  <SuccessRightSide ticketID={ticketID} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
      {showPhoneModal && <AiModalPop />}
    </>
  );
}

/* ---------------- Registration Form ---------------- */
function RegistrationForm({
  formData,
  handleChange,
  focusedField,
  setFocusedField,
  getBoxStyle,
  handleSubmit,
  onClose,
  showPhoneModal,
  setShowPhoneModal
}: {
  formData: FormFields;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  focusedField: string | null;
  setFocusedField: React.Dispatch<React.SetStateAction<string | null>>;
  getBoxStyle: (fieldName: string) => React.CSSProperties;
  handleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  showPhoneModal: boolean;
  setShowPhoneModal: (value: boolean) => void;
}) {
  return (
    <div className="p-8 md:p-10 lg:p-12 relative h-full bg-white">
      <h1
        className="text-4xl md:text-5xl font-normal text-gray-900 mb-2"
        style={{ fontFamily: 'Calsans, sans-serif' }}
      >
        Register Now!
      </h1>
      <p className="text-lg md:text-base mb-8 text-gray-500 ">
        Secure your spot and be part of the excitement! Register now to receive your entry pass.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            className="p-3 w-full lg:w-[85%] border rounded-lg text-gray-700 h-[45px] placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ ...getBoxStyle("name")}}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            className="p-3 w-full lg:w-[85%] border h-[45px] rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ ...getBoxStyle("email")}}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 w-full lg:w-[85%]">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="appearance-none w-24 pl-3 pr-2 border rounded-lg text-gray-700 h-[45px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{ ...getBoxStyle("countryCode")}}
            >
              <option value="+91">+91</option>
              {allCountries && allCountries.length > 0 ? (
                allCountries.map((country, index) => (
                  <option key={index} value={"+" + country.dialCode}>
                    +{country.dialCode}
                  </option>
                ))
              ) : (
                <option value="+91">+91</option>
              )}
            </select>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              className="flex-1 p-3 border rounded-lg h-[45px] text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{ ...getBoxStyle("phone")}}
              placeholder="Enter your number"
              required
            />
          </div>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            District <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="pl-3 w-full lg:w-[85%] appearance-none border rounded-lg h-[45px] text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ ...getBoxStyle("district") }}
            required
          >
            <option value="" disabled>
              Select your district
            </option>
            {[
              "Thiruvananthapuram",
              "Kollam",
              "Pathanamthitta",
              "Alappuzha",
              "Kottayam",
              "Idukki",
              "Ernakulam",
              "Thrissur",
              "Palakkad",
              "Malappuram",
              "Kozhikode",
              "Wayanad",
              "Kannur",
              "Kasaragod",
              "Others",
            ].map((d) => (
              <option key={d} value={d} className="text-gray-900">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="pl-3 w-full lg:w-[85%] appearance-none border rounded-lg h-[45px] text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ ...getBoxStyle("category") }}
            required
          >
            <option value="" disabled>
              Select your category
            </option>
            <option value="Startups" className="text-gray-900">Startups</option>
            <option value="Working Professionals" className="text-gray-900">Working Professionals</option>
            <option value="Students" className="text-gray-900">Students</option>
            <option value="Business Owners" className="text-gray-900">Business Owners</option>
            <option value="NRI / Gulf Retunees" className="text-gray-900">NRI / Gulf Retunees</option>
            <option value="Government Officials" className="text-gray-900">Government Officials</option>
            <option value="Other" className="text-gray-900">Other</option>
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            School / College / Organization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            onFocus={() => setFocusedField("organization")}
            onBlur={() => setFocusedField(null)}
            className="p-3 w-full lg:w-[85%] border rounded-lg text-gray-700 h-[45px] placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ ...getBoxStyle("organization")}}
            placeholder="Enter your organization"
            required
          />
        </div>

        {/* Previous Attendance */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Did you attend the previous ScaleUp Conclave? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="previousAttendance"
                value="Yes"
                checked={formData.previousAttendance === "Yes"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="previousAttendance"
                value="No"
                checked={formData.previousAttendance === "No"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition">No</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-10">
          <button
            type="submit"
            className="w-full lg:w-[85%] py-4 bg-[#3399FF] text-white rounded-xl font-semibold text-lg hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
          >
            Continue to Choose Ticket
          </button>
        </div>

        <div className="text-left pb-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <span
  onClick={() => {
    onClose(); // close registration modal
    window.dispatchEvent(new CustomEvent("open-aipop"));
  }}
  className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
>
  Go here
</span>

          </p>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Ticket Selection Modal ---------------- */
const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
  onClose,
  setStep,
  selectedTicket,
  handleRegister,
  setSelectedTicket,
  loading,
  registerStatus,
}) => {
  const handleSelect = (type: "general" | "vip") => setSelectedTicket(type);

  return (
    <div className="p-8 md:p-10 lg:p-12 h-full relative bg-white">
      <div className="flex justify-start items-center mb-8">
        <button
          onClick={() => setStep("form")}
          className="text-gray-700 hover:text-gray-900 transition"
        >
          <MoveLeft size={30} />
        </button>
      </div>

      <div className="mb-8">
        <h2
          className="text-3xl md:text-4xl font-normal text-gray-900 mb-2"
          style={{ fontFamily: 'Calsans, sans-serif' }}
        >
          Choose your ticket type
        </h2>
        <p className="text-sm md:text-base text-gray-500">
          Both types will have different levels of access
        </p>
      </div>

      <div className="space-y-4 mb-8 max-w-md">
        {/* General Pass Card */}
        <div
          onClick={() => handleSelect("general")}
          className={`group cursor-pointer transition-all duration-200 rounded-2xl p-5 border-2 ${
            selectedTicket === "general"
              ? "border-gray-900 shadow-lg"
              : "border-gray-300 hover:border-gray-400"
          }`}
          style={{ fontFamily: 'Calsans, sans-serif' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-normal text-gray-900">General Pass</h3>
            <span className="text-xl font-normal text-gray-900">Free</span>
          </div>
          <div className="flex justify-center">
            <img
              src="/assets/images/general.png"
              alt="General Pass"
              className="w-full max-w-[280px] h-auto rounded-lg shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* VIP Pass Card */}
        <div
          onClick={() => handleSelect("vip")}
          className={`group cursor-pointer transition-all duration-200 rounded-2xl p-5 border-2 ${
            selectedTicket === "vip"
              ? "border-gray-900 shadow-lg"
              : "border-gray-300 hover:border-gray-400"
          }`}
          style={{ fontFamily: 'Calsans, sans-serif' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-normal text-gray-900">Vip Pass</h3>
            <span className="text-xl font-normal text-gray-900">₹10,000</span>
          </div>
          <div className="flex justify-center">
            <img
              src="/assets/images/vip.png"
              alt="VIP Pass"
              className="w-full max-w-[280px] h-auto rounded-lg shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      <div className="pt-2 pb-4 max-w-md">
        <button
          onClick={handleRegister}
          disabled={loading || !selectedTicket || registerStatus === "submitted"}
          className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '16px' }}
        >
          {loading ? "Processing..." : registerStatus === "submitted" ? "Submitted" : "Continue"}
        </button>
      </div>
    </div>
  );
};

/* ---------------- Success Right Side Component ---------------- */
function SuccessRightSide({ ticketID }: { ticketID: string }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Full-cover Background */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover scale-105"
        style={{
          backgroundImage: "url('/assets/images/base.png')",
        }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full px-6 py-10 pb-20">
        {/* Top Heading Image */}
        <div className="pt-6 md:pt-0">
          <img
            src="/assets/images/title.png"
            alt="Title"
            className="w-[200px] md:w-[260px] lg:w-[300px] object-contain drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Center GIF / Avatar */}
        <div className="flex-1 flex items-center justify-center ">
          <img
            src="/assets/images/avatar.gif"
            alt="Avatar"
            className="w-[220px] md:w-[320px] lg:w-[460px] object-contain rounded-2xl shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = "/assets/images/avatar.png";
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Success Modal ---------------- */
function SuccessModal({
  onClose,
  setStep,
  ticketID,
}: {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<"form" | "ticket" | "success" | "avatar">>;
  ticketID: string;
}) {
  const [guestData, setGuestData] = useState<any>(null);
  const [ticketImageUrl, setTicketImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuestData = async () => {
      try {
        const response = await fetch(
          `https://api.makemypass.com/makemypass/manage-guest/f9290cc6-d840-4492-aefb-76f189df5f5e/guest/${ticketID}/download-ticket/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Guest data:", data);
          setGuestData(data);
        } else {
          console.error("Failed to fetch guest data");
        }
      } catch (error) {
        console.error("Error fetching guest data:", error);
      }
    };

    const fetchTicketImage = async () => {
      try {
        const ticketResponse = await fetch(
          `https://api.makemypass.com/makemypass/manage-guest/f9290cc6-d840-4492-aefb-76f189df5f5e/guest/${ticketID}/download-ticket/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (ticketResponse.ok) {
          const ticketData = await ticketResponse.json();
          console.log("Ticket download response:", ticketData);

          const imageUrl =
            ticketData?.response?.image ||
            ticketData?.image ||
            ticketData?.image_url ||
            ticketData?.ticket_url;

          if (imageUrl) {
            console.log("Ticket image URL:", imageUrl);
            setTicketImageUrl(imageUrl);
          } else {
            console.error("No image URL found in response:", ticketData);
          }
        } else {
          console.error("Failed to fetch ticket image, status:", ticketResponse.status);
        }
      } catch (error) {
        console.error("Error fetching ticket image:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ticketID) {
      fetchGuestData();
      fetchTicketImage();
    }
  }, [ticketID]);

  const userName = guestData?.name || "Guest";
  const userEmail = guestData?.email || "email@example.com";
  const userPhone = guestData?.phone || "+91XXXXXXXXXX";
  const ticketCode = guestData?.id || ticketID;

  return (
    <div className="p-8 md:p-10 lg:p-12 pt-12 md:pt-8 lg:pt-24 lg:mt-10 lg:pb-12 relative h-full bg-white flex flex-col justify-center">
      <div className="max-w-lg">
        <h1
          className="text-4xl md:text-5xl font-normal text-gray-900 mb-4"
          style={{ fontFamily: 'Calsans, sans-serif' }}
        >
          Congrats your ticket has been generated
        </h1>

        {loading ? (
          <div className="flex items-center gap-2 mb-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <p className="text-base text-gray-600">Loading your ticket details...</p>
          </div>
        ) : (
          <p className="text-base text-gray-600 mb-8">
            Great news! Your ticket has been sent to your email{" "}
            and WhatsApp along with the invoice. Please check them to confirm.
          </p>
        )}

        {/* Ticket Image Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200">
          {loading ? (
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Generating your ticket...</p>
              </div>
            </div>
          ) : ticketImageUrl ? (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={ticketImageUrl}
                alt="Your Event Ticket"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  console.error("Failed to load ticket image:", ticketImageUrl);
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                      <p class="text-gray-600 text-sm">Ticket image unavailable. Check your email for the ticket.</p>
                    </div>`;
                  }
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center px-4">
                <p className="text-gray-600 text-sm mb-2">Ticket image not available</p>
                <p className="text-gray-500 text-xs">Your ticket has been sent to your email</p>
              </div>
            </div>
          )}
        </div>

        {/* Download Ticket Button */}
        {ticketImageUrl && !loading && (
          <a
            href={`/api/proxy-image?url=${encodeURIComponent(ticketImageUrl)}&filename=scaleup-ticket-${ticketCode}.png&disposition=attachment`}
            download={`scaleup-ticket-${ticketCode}.png`}
            className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-sm mb-4 flex items-center justify-center gap-2"
            style={{ fontSize: '14px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Ticket
          </a>
        )}

        {/* Next Step Button */}
        <button
          onClick={() => setStep("avatar")}
          disabled={loading}
          className="w-full py-4 mb-10 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Next Step : Generate your AI Avatar"}
        </button>
      </div>
    </div>
  );
}