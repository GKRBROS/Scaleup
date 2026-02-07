"use client";

import { Instagram, MoveLeft, X } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { allCountries } from "country-telephone-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AvatarGeneratorModal from "@/components/AvatarGeneratorModal";

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

type TicketStep = "form" | "ticket" | "success";
type TicketType = "general" | "vip";

interface TicketTypeModalProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<"form" | "ticket" | "success">>;
  modalWidth: string;

  selectedTicket: TicketType | null;
  setSelectedTicket: React.Dispatch<React.SetStateAction<TicketType | null>>;

  handleRegister: () => void;
  loading: boolean;
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

  console.log("allCountries allCountries", allCountries);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<"form" | "ticket" | "success">("form");
  const [modalWidth, setModalWidth] = useState("50%");
  const [ticketID, setTicketID] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setModalWidth(`${Math.min(window.innerWidth / 2, 600)}px`);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Disable background scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scroll when modal closes
      document.body.style.overflow = "";
    }
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //commented oct30
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form6666666666666666666666submitted:", formData);
    const url =
      "https://api.makemypass.com/makemypass/public-form/f9290cc6-d840-4492-aefb-76f189df5f5e/validate-rsvp/";
    const formData1 = new FormData();
    formData1.append("name", formData.name);
    formData1.append("phone", formData.countryCode + formData.phone);
    formData1.append("email", formData.email);
    formData1.append("district", formData.district);
    formData1.append("organization", formData.organization);
    formData1.append("category", formData.category);
    formData1.append("did_you_attend_the_previous_scaleup_conclave_", "Yes");
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData1,
      });
      const result = await response.json();
      console.log("Success:", result);
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
      key: orderData.client_id, // from backend
      amount: orderData.amount, // IN PAISE (e.g. 12100)
      currency: orderData.currency,
      name: "Scaleup Conclave 2025",
      description: "VIP Ticket Payment",
      image: "/rpay.webp",

      order_id: orderData.order_id, // Razorpay order_id (CRITICAL)

      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
      }) {
        try {
          // ✅ Verify payment
          const verifyRes = await fetch(
            "https://api.makemypass.com/makemypass/public-form/validate-payment/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                gateway: "Razorpay",
              }),
            },
          );

          const verifyResult = await verifyRes.json();
          console.log("toasssssssssssssssst", verifyResult);
          if (verifyRes.ok && !verifyResult.hasError) {
            toast.success("Payment successful ");
            setTicketID(verifyResult.response.event_register_id);
            setStep("success");
            setIsAvatarModalOpen(true);
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

  //sadasivan's code started here.
  const handleRegister = async () => {
    setLoading(true);

    try {
      // ✅ Front-end validation
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
        formData.previousAttendance,
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
        {
          ticket_id: "f3acf45a-f23e-41c8-9e1a-26417da55fdf",
          count: 1,
          my_ticket: true,
        },
        {
          ticket_id: "062fbabb-6242-4adc-84c4-e6e20f9434c5",
          count: 1,
          my_ticket: true,
        },
      ];

      if (selectedTicket === "general") {
        payload.append("__tickets[]", JSON.stringify(tickets[0]));
      } else if (selectedTicket === "vip") {
        payload.append("__tickets[]", JSON.stringify(tickets[1]));
      }

      payload.append(
        "__tickets[]",
        JSON.stringify({
          ticket_id:
            selectedTicket === "vip" ? "VIP_TICKET_ID" : "FREE_TICKET_ID",
          count: 1,
          my_ticket: true,
        }),
      );

      //  API CALL - UNCOMMENTED FOR REAL FLOW
      const response = await fetch(
        "https://api.makemypass.com/makemypass/public-form/f9290cc6-d840-4492-aefb-76f189df5f5e/submit/",
        { method: "POST", body: payload },
      );

      const result = await response.json();
      console.log(" API response:", result);

      //  Validation error
      if (result.hasError) {
        const key = Object.keys(result.message)[0];
        toast.error(result.message[key][0]);
        setLoading(false);
        return;
      }

      //  PAYMENT REQUIRED
      if (result.response?.gateway) {
        console.log(" Opening Razorpay");
        payWithRazorpay(result.response);
        setLoading(false);
        return;
      }

      //  SUCCESS - Call /scaleup2026/register API
      console.log("Registration successful, calling /scaleup2026/register API");
      
      const registerPayload = {
        name: formData.name,
        email: formData.email,
        phone_no: `${formData.countryCode}${formData.phone}`,
        district: formData.district,
        category: formData.category,
        organization: formData.organization,
      };

      // try {
      //   const registerResponse = await fetch(
      //     "/scaleup2026/register",
      //     {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify(registerPayload),
      //     }
      //   );

      //   const registerResult = await registerResponse.json();
      //   console.log("Register API Response:", registerResult);

      //   if (!registerResponse.ok) {
      //     console.error("Register API error:", registerResult);
      //     toast.error("Registration to backend failed. Please try again.");
      //     setLoading(false);
      //     return;
      //   }
      // } catch (registerError) {
      //   console.error("Register API call error:", registerError);
      //   toast.error("Failed to complete registration. Please try again.");
      //   setLoading(false);
      //   return;
      // }

      // SUCCESS - Show success and open avatar modal with registration data
      toast.success("Registration successful ");
      setTicketID(
        result.response?.event_register_id || "TEST-TICKET-" + Date.now(),
      );
      setStep("success");
      setIsAvatarModalOpen(true);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //sadasivan's code end  here.

  if (!isOpen) return null;

  const getBoxStyle = (fieldName: string): React.CSSProperties => ({
    backgroundColor: "#F2F2F2",
    borderColor: focusedField === fieldName ? "#418CFF" : "#D1D5DB",
    color: "#586161",
    outline: "none",
    borderRadius: "8px",
    borderWidth: "1px",
  });

  return (
    <>
      {/* Overlay */}

      <div className="fixed inset-0 z-50 backdrop-blur-sm">
        {/* Right Side Modal Container */}
        <div
          className="absolute top-1/2 md:top-1/2 lg:top-1/2 right-0 transform -translate-y-1/2 
             w-full lg:w-1/2 p-6 bg-white shadow-lg 
             max-h-[100vh] overflow-y-auto 
             transition-transform duration-300 ease-in-out"
          // absolute top-1/2 lg:right-0 lg:-translate-x-0 lg:left-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-fit bg-white shadow-2xl overflow-y-auto rounded-2xl
          style={{
            // width: isMobile ? "100%" : modalWidth,
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          {step === "form" && (
            <RegistrationForm
              formData={formData}
              handleChange={handleChange}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              getBoxStyle={getBoxStyle}
              handleSubmit={handleSubmit}
              onClose={onClose}
            />
          )}

          {step === "ticket" && (
            <TicketTypeModal
              onClose={onClose}
              setStep={setStep}
              modalWidth={modalWidth}
              handleRegister={handleRegister}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              loading={loading}
            />
          )}

          {/* {step === "ticket" && (
            <TicketTypeModal
              onClose={onClose}
              setStep={setStep}
              modalWidth={modalWidth}
            />
          )} */}

          {step === "success" && (
            <SuccessModal
              onClose={() => {
                onClose();
                setIsAvatarModalOpen(true);
              }}
              setStep={setStep}
              modalWidth={modalWidth}
              ticketID={ticketID}
            />
          )}
        </div>
      </div>

      {/* Avatar Generator Modal */}
      <AvatarGeneratorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        registrationData={{
          name: formData.name,
          email: formData.email,
          phone_no: formData.countryCode + formData.phone,
          district: formData.district,
          category: formData.category,
          organization: formData.organization,
        }}
      />

      <Toaster position="top-center" reverseOrder={false} />
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
}) {
  return (
    <div className="p-6 relative z-50 h-[90vh] overflow-y-auto rounded-2xl">
      <div className="flex justify-between items-center w-full">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-600 transition"
        >
          <X size={22} style={{ color: "red" }} />
        </button>

        <img
          src="/assets/images/abouticons.svg"
          alt="About Icons"
          className="w-16 md:w-20 h-auto"
        />
      </div>

      {/* fixed inset-0 flex items-center justify-end z-50 */}

      <h1
        className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 text-start"
        style={{ fontFamily: "Plus Jakarta Sans" }}
      >
        Register Now!
      </h1>

      <p
        className="text-sm md:text-base mt-1 font-semibold text-start"
        style={{ color: "#3E3E3E" }}
      >
        Secure your spot and be part of the excitement! Register now to receive
        your entry pass.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            className="mt-1 p-3 w-full border rounded-lg text-gray-700 h-[40px] placeholder-[#8D9396]"
            style={getBoxStyle("name")}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 placeholder-[#8D9396]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-20 pl-2 border rounded-lg text-gray-700 overflow-y-auto"
              // className="w-20 pl-2 border rounded-lg h-[40px] text-gray-700"
              style={getBoxStyle("countryCode")}
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
              className="flex-1 p-3 border rounded-lg h-[40px] text-gray-700"
              style={getBoxStyle("phone")}
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 p-3 w-full border h-[40px] rounded-lg text-gray-700"
            style={getBoxStyle("email")}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            District <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="pl-2 w-full border rounded-lg h-[40px] text-gray-700"
            style={getBoxStyle("district")}
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
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="pl-2 w-full border rounded-lg h-[40px] text-gray-700"
            style={getBoxStyle("category")}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Startups">Startups</option>
            <option value="Working Professionals">Working Professionals</option>
            <option value="Students">Students</option>
            <option value="Business Owners">Business Owners</option>
            <option value="NRI / Gulf Retunees">NRI / Gulf Retunees</option>
            <option value="Government Officials">Government Officials</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className="mt-1 p-3 w-full border rounded-lg h-[40px] text-gray-700"
            style={getBoxStyle("organization")}
            placeholder="Enter your organization's name"
          />
        </div>

        {/* Previous Attendance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Did you attend the previous ScaleUp Conclave (2025)?{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            name="previousAttendance"
            value={formData.previousAttendance}
            onChange={handleChange}
            className="pl-2 w-full border rounded-lg h-[40px] text-gray-700"
            style={getBoxStyle("previousAttendance")}
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition shadow-sm"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Ticket Selection Modal ---------------- */
const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
  onClose,
  setStep,
  modalWidth,
  selectedTicket,
  handleRegister,
  setSelectedTicket,
  loading,
}) => {
  const handleSelect = (type: "general" | "vip") => setSelectedTicket(type);

  return (
    <div className="p-6 h-[90vh] lg:right-0 lg:-translate-x-0 relative">
      {/* Close Button */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4">
        {/* Left: Close Button */}
        <button
          onClick={() => setStep("form")}
          className="text-gray-500 hover:text-red-600 transition"
        >
          {/* <X size={20} style={{ color: "red" }} /> */}
          <MoveLeft size={30} style={{ color: "black" }} />
        </button>

        {/* Right: Image */}
        <img
          src="/assets/images/abouticons.svg"
          alt="About Icons"
          className="w-16 md:w-20 h-auto"
        />
      </div>

      {/* Top Icons */}
      <div className="flex justify-end gap-1 mb-3">
        {/* Uncomment if needed */}
        {/* <span className="text-purple-500 text-xl">sparkles</span>
          <span className="text-blue-500 text-xl">star</span>
          <span className="text-green-500 text-xl">leaf</span> */}
      </div>

      {/* Title & Subtitle - LEFT ALIGNED */}
      <div className="mt-20 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          Select Ticket Type
        </h2>
        <p
          className="text-sm  max-w-md leading-relaxed"
          style={{ color: "#3E3E3E" }}
        >
          Select the type of pass that suits you best
        </p>
      </div>

      {/* Ticket Cards - Increased Height + Hover + #418CFF40 Background */}
      <div className="space-y-4 mb-8">
        {/* General Pass Card */}
        <div
          onClick={() => handleSelect("general")}
          className={`
              group cursor-pointer transition-all duration-300 rounded-md p-6 border-2
              hover:shadow-xl active:scale-[0.98]
              ${
                selectedTicket === "general"
                  ? "border-[#418CFF] bg-[#418CFF40] shadow-lg"
                  : "border-transparent bg-[#F2F2F2] hover:bg-[#418CFF40] hover:border-[#418CFF]/30"
              }
            `}
          style={{
            minHeight: "160px",
            boxShadow:
              selectedTicket === "general"
                ? "0 8px 25px rgba(65, 140, 255, 0.2)"
                : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 mb-1">
                General Pass
              </p>
            </div>
            <p
              className={`text-2xl font-black transition-colors ${
                selectedTicket === "general"
                  ? "text-[#418CFF]"
                  : "text-gray-900"
              }`}
            >
              Free
            </p>
          </div>
        </div>

        {/* VIP Pass Card */}
        <div
          onClick={() => handleSelect("vip")}
          className={`
              group cursor-pointer transition-all duration-300 rounded-md p-6 border-2
              hover:shadow-xl active:scale-[0.98]
              ${
                selectedTicket === "vip"
                  ? "border-[#418CFF] bg-[#418CFF40] shadow-lg"
                  : "border-transparent bg-[#F2F2F2] hover:bg-[#418CFF40] hover:border-[#418CFF]/30"
              }
            `}
          style={{
            minHeight: "160px",
            boxShadow:
              selectedTicket === "vip"
                ? "0 8px 25px rgba(65, 140, 255, 0.2)"
                : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 mb-1">VIP Pass</p>
            </div>
            <p className="text-2xl font-black text-gray-900">₹ 10,000</p>
          </div>
        </div>
      </div>

      {/* Register Button */}
      <div className="flex justify-end">
        {/* <button
            onClick={() => setStep("success")}
            className="px-12 py-3 bg-blue-500 text-white font-medium text-sm rounded-full hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
            }}
          >
            Register
          </button> */}
        <button
          onClick={handleRegister}
          className="px-8 py-3 bg-[#418CFF] text-white font-medium rounded-full hover:bg-blue-600 transition"
          disabled={loading}
        >
          Register
        </button>
      </div>
    </div>
  );
};
/* ---------------- Success Modal ---------------- */
function SuccessModal({
  onClose,
  setStep,
  modalWidth,
  ticketID,
}: {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<"form" | "ticket" | "success">>;
  modalWidth: string;
  ticketID: string;
}) {
  return (
    // <div className="flex items-center justify-center h-full relative p-6 ">

    //   <button
    //     onClick={() => {
    //       setStep("form");
    //       onClose();
    //     }}
    //     className="absolute top-4 left-4 text-gray-500 hover:text-red-600 transition"
    //     style={{ color: "red" }}
    //   >
    //     <X size={24} style={{ color: "red" }} />
    //   </button>

    //   <div className="text-center mx-auto w-full">
    //     <h2 className="text-4xl font-bold mt-8" style={{ color: "#4028C8" }}>
    //       You’re In!
    //     </h2>
    //     <p className="text-lg mt-4" style={{ color: "#3E3E3E" }}>
    //       Your spot is confirmed —Your event ticket has been sent to your email.</p>

    //     <div className="flex justify-center items-center mt-4">
    //       <img
    //         src="/assets/images/abouticons.svg"
    //         alt="About Icons"
    //         className="w-16 md:w-20 h-auto"
    //       />
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col items-center justify-center min-h-[90vh]  relative p-6">
      <button
        onClick={() => {
          setStep("form");
          onClose();
        }}
        className="absolute top-4 left-4 text-gray-500 hover:text-red-600 transition"
        style={{ color: "red" }}
      >
        <X size={24} style={{ color: "red" }} />
      </button>

      <div className="text-center mx-auto w-full max-w-md">
        <h2 className="text-5xl font-bold mt-8" style={{ color: "#4028C8" }}>
          {/* You’re In! */}
          Your Ticket Is Confirmed!
        </h2>
        <a
          href={`https://app.makemypass.com/scaleup-conclave-2026/view-ticket/${ticketID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-5 gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#4028C8] to-[#6B5CFF] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Download Ticket
        </a>

        <p className="text-md mt-4" style={{ color: "#3E3E3E" }}>
          Your spot is confirmed —A copy of your ticket has been sent to your
          registered WhatsApp number and email address. Please check your inbox
          for confirmation and entry details.
        </p>
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/scaleUp_Village"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#4028C8] text-[#4028C8] hover:bg-[#4230CA]
    hover:text-white transition"
          >
            <Instagram size={18} color="#E4405F" />
            Follow on Instagram
          </a>

          {/* WhatsApp */}

          <a
            href="https://chat.whatsapp.com/DDdiTix9PosBX7PMLrB74U"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle h-5 w-5 md:h-7 md:w-7"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Join WhatsApp Group
          </a>
        </div>

        <div className="flex justify-center items-center mt-6">
          <img
            src="/assets/images/abouticons.svg"
            alt="About Icons"
            className="w-16 md:w-20 h-auto"
          />
        </div>
        {/* Contact Info */}
        <div className="mt-8 text-sm text-gray-600">
          <p className="font-medium">For any inquiries, reach out to us</p>
          <p className="mt-2">
            <a
              href="tel:+919048170077"
              className="hover:underline text-[#4c2cff]"
            >
              +91 90481 70077
            </a>
          </p>
          <p>
            <a
              href="mailto:info@scaleupconclave.com"
              className="hover:underline text-[#4c2cff]"
            >
              info@scaleupconclave.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
