"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

interface FlushPreviewUser {
  id: string;
  email: string;
  name: string;
  phone_no: string;
  photo_url?: string;
  generated_image_url?: string;
  aws_key?: string;
}

type AdminStep = "auth" | "dashboard";
type AdminSection = "flush" | "analytics";
type AdminTheme = "light" | "dark";

export default function AdminPage() {
  const [step, setStep] = useState<AdminStep>("auth");
  const [activeSection, setActiveSection] = useState<AdminSection>("flush");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUser, setPreviewUser] = useState<FlushPreviewUser | null>(null);
  const [hasPreview, setHasPreview] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>("light");
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const adminPasswordHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || "";

  const hashPassword = async (value: string): Promise<string> => {
    if (typeof window === "undefined" || !window.crypto?.subtle) {
      return value;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (adminPasswordHash) {
        const inputHash = await hashPassword(password);
        if (inputHash === adminPasswordHash) {
          toast.success("Login successful");
          setStep("dashboard");
          setPassword("");
          return;
        }
        toast.error("Invalid admin password");
        return;
      }

      if (adminPassword && password === adminPassword) {
        toast.success("Login successful");
        setStep("dashboard");
        setPassword("");
        return;
      }

      toast.error("Invalid admin password");
    } catch {
      toast.error("Unable to verify admin password");
    }
  };

  const handleFetchPreview = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter an email");
      return;
    }
    setIsLoading(true);
    setPreviewUser(null);
    setHasPreview(false);
    try {
      const res = await fetch("https://scaleup.frameforge.one/scaleup2026/flush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.error || "Failed to fetch user data";
        toast.error(message);
        return;
      }

      if (!data?.user) {
        toast.error("No user data returned from backend");
        return;
      }

      setPreviewUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone_no: data.user.phone_no,
        photo_url: data.user.photo_url,
        generated_image_url: data.user.generated_image_url,
        aws_key: data.user.aws_key,
      });
      setHasPreview(true);
      toast.success("User data fetched");
    } catch {
      toast.error("Network error while fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmFlush = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter an email");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("https://scaleup.frameforge.one/scaleup2026/flush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmed, confirm: true }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.error || "Failed to clear generated image";
        toast.error(message);
        return;
      }

      toast.success("User image generation data flushed successfully");
      setPreviewUser(null);
      setHasPreview(false);
    } catch {
      toast.error("Network error while clearing generated image");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "auth") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4 text-slate-900">
          <h1 className="text-xl font-semibold text-center">Admin Access</h1>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-16 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition shadow shadow-indigo-500/40"
            >
              Continue
            </button>
          </form>
        </div>
      </main>
    );
  }

  const isDark = theme === "dark";

  return (
    <main
      className={
        "min-h-screen flex " +
        (isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
          : "bg-gray-50 text-slate-900")
      }
    >
      <aside
        className={
          "hidden md:flex w-64 flex-col border-r " +
          (isDark ? "border-white/10 bg-slate-950/70 backdrop-blur-xl" : "border-gray-200 bg-white")
        }
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div
            className={
              "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-500/40 " +
              (isDark ? "bg-indigo-500/80" : "bg-indigo-600/90")
            }
          >
            <span className="text-xs font-semibold text-white">ADM</span>
          </div>
          <div>
            <div
              className={
                "text-xs uppercase tracking-widest " +
                (isDark ? "text-slate-400" : "text-slate-500")
              }
            >
              ScaleUp
            </div>
            <div
              className={
                "text-sm font-semibold " + (isDark ? "text-slate-100" : "text-slate-900")
              }
            >
              Admin Dashboard
            </div>
          </div>
        </div>
        <nav className="mt-4 px-3 space-y-2">
          <div
            className={
              "px-3 text-[11px] font-medium uppercase tracking-[0.16em] " +
              (isDark ? "text-slate-500" : "text-slate-400")
            }
          >
            Sections
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("flush")}
            className={
              "mt-2 w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition " +
              (activeSection === "flush"
                ? "bg-indigo-600 text-slate-50 shadow shadow-indigo-500/40"
                : isDark
                  ? "text-slate-300 hover:text-slate-50 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-gray-100")
            }
          >
            <span
              className={
                "inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] " +
                (isDark ? "bg-slate-900/80 text-slate-200" : "bg-gray-100 text-slate-700")
              }
            >
              F
            </span>
            <span>Flush</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("analytics")}
            className={
              "w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition " +
              (activeSection === "analytics"
                ? "bg-indigo-600 text-slate-50 shadow shadow-indigo-500/40"
                : isDark
                  ? "text-slate-300 hover:text-slate-50 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-gray-100")
            }
          >
            <span
              className={
                "inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] " +
                (isDark ? "bg-slate-900/80 text-slate-200" : "bg-gray-100 text-slate-700")
              }
            >
              A
            </span>
            <span>Analytics</span>
          </button>
        </nav>
      </aside>

      <section className="flex-1 flex flex-col min-w-0">
        <header
          className={
            "flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 border-b " +
            (isDark
              ? "border-white/10 bg-slate-950/80 backdrop-blur-xl"
              : "border-gray-200 bg-white")
          }
        >
          <div>
            <div
              className={
                "text-xs uppercase tracking-[0.16em] " +
                (isDark ? "text-slate-400" : "text-slate-500")
              }
            >
              Admin Console
            </div>
            <div
              className={
                "text-sm font-semibold " + (isDark ? "text-slate-50" : "text-slate-900")
              }
            >
              {activeSection === "flush" ? "Flush User Generated Image" : "Analytics Overview"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={
                "hidden md:inline-flex items-center justify-center rounded-full h-10 w-10 border " +
                (isDark
                  ? "border-white/20 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
                  : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100")
              }
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Moon className="h-4.5 w-4.5 text-indigo-300" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              )}
            </button>
            <div
              className={
                "flex md:hidden items-center gap-1 rounded-full border px-1 py-1 text-[11px] " +
                (isDark
                  ? "border-white/15 bg-slate-900/80"
                  : "border-gray-200 bg-gray-50")
              }
            >
              <button
                type="button"
                onClick={() => setActiveSection("flush")}
                className={
                  "px-3 py-1 rounded-full transition " +
                  (activeSection === "flush"
                    ? isDark
                      ? "bg-slate-50 text-slate-950 font-semibold shadow-sm"
                      : "bg-slate-900 text-white font-semibold shadow-sm"
                    : isDark
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-500 hover:bg-gray-100")
                }
              >
                Flush
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("analytics")}
                className={
                  "px-3 py-1 rounded-full transition " +
                  (activeSection === "analytics"
                    ? isDark
                      ? "bg-slate-50 text-slate-950 font-semibold shadow-sm"
                      : "bg-slate-900 text-white font-semibold shadow-sm"
                    : isDark
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-500 hover:bg-gray-100")
                }
              >
                Analytics
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-8 pt-4">
          <div className="w-full max-w-6xl mx-auto">
            {activeSection === "flush" ? (
              <div className="flex items-start justify-center">
                <div
                  className={
                    "w-full max-w-xl rounded-3xl border p-6 space-y-6 " +
                    (isDark
                      ? "border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 shadow-xl shadow-slate-950/60"
                      : "border-gray-200 bg-white shadow-sm")
                  }
                >
                <h1
                  className={
                    "text-xl font-semibold " + (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  Flush User Generated Image
                </h1>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label
                      className={
                        "block text-sm font-medium " +
                        (isDark ? "text-slate-300" : "text-slate-600")
                      }
                    >
                      User Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={
                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 " +
                        (isDark
                          ? "border-white/15 bg-slate-900/80 text-slate-100 placeholder:text-slate-500"
                          : "border-gray-300 bg-white text-slate-900 placeholder:text-slate-400")
                      }
                      placeholder="Enter user email"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={hasPreview ? handleConfirmFlush : handleFetchPreview}
                      disabled={isLoading}
                      className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm shadow-indigo-500/40"
                    >
                      {hasPreview ? "Clear Generated Image" : "Fetch Data"}
                    </button>
                    {hasPreview && (
                      <span
                        className={
                          "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                        }
                      >
                        Preview loaded. Click to clear generated image for this user.
                      </span>
                    )}
                  </div>
                </div>

                {previewUser && (
                  <div
                    className={
                      "border rounded-2xl p-4 space-y-2 " +
                      (isDark
                        ? "border-white/10 bg-slate-900/80"
                        : "border-gray-200 bg-gray-50")
                    }
                  >
                    <div className="text-sm">
                      <span
                        className={
                          "font-medium " + (isDark ? "text-slate-300" : "text-slate-600")
                        }
                      >
                        Name:{" "}
                      </span>
                      <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                        {previewUser.name}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span
                        className={
                          "font-medium " + (isDark ? "text-slate-300" : "text-slate-600")
                        }
                      >
                        Email:{" "}
                      </span>
                      <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                        {previewUser.email}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span
                        className={
                          "font-medium " + (isDark ? "text-slate-300" : "text-slate-600")
                        }
                      >
                        Phone:{" "}
                      </span>
                      <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                        {previewUser.phone_no}
                      </span>
                    </div>
                    {previewUser.photo_url && (
                      <div className="text-sm break-all">
                        <span
                          className={
                            "font-medium " +
                            (isDark ? "text-slate-300" : "text-slate-600")
                          }
                        >
                          Photo URL:{" "}
                        </span>
                        <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                          {previewUser.photo_url}
                        </span>
                      </div>
                    )}
                    {previewUser.generated_image_url && (
                      <div className="text-sm break-all">
                        <span
                          className={
                            "font-medium " +
                            (isDark ? "text-slate-300" : "text-slate-600")
                          }
                        >
                          Generated Image URL:{" "}
                        </span>
                        <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                          {previewUser.generated_image_url}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            ) : (
              <AnalyticsDashboard theme={isDark ? "dark" : "light"} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
