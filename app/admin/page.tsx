"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface FlushPreviewUser {
  id: string;
  email: string;
  name: string;
  phone_no: string;
  photo_url?: string;
  generated_image_url?: string;
  aws_key?: string;
}

type AdminStep = "auth" | "email";

export default function AdminPage() {
  const [step, setStep] = useState<AdminStep>("auth");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUser, setPreviewUser] = useState<FlushPreviewUser | null>(null);
  const [hasPreview, setHasPreview] = useState(false);
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
          setStep("email");
          setPassword("");
          return;
        }
        toast.error("Invalid admin password");
        return;
      }

      if (adminPassword && password === adminPassword) {
        toast.success("Login successful");
        setStep("email");
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Network error while clearing generated image");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "auth") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 space-y-4">
          <h1 className="text-xl font-semibold text-gray-900 text-center">Admin Access</h1>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Continue
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Flush User Generated Image</h1>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter user email"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={hasPreview ? handleConfirmFlush : handleFetchPreview}
              disabled={isLoading}
              className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {hasPreview ? "Clear Generated Image" : "Fetch Data"}
            </button>
            {hasPreview && (
              <span className="text-xs text-gray-500">
                Preview loaded. Click to clear generated image for this user.
              </span>
            )}
          </div>
        </div>

        {previewUser && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-gray-50">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Name: </span>
              <span className="text-gray-900">{previewUser.name}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Email: </span>
              <span className="text-gray-900">{previewUser.email}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Phone: </span>
              <span className="text-gray-900">{previewUser.phone_no}</span>
            </div>
            {previewUser.photo_url && (
              <div className="text-sm break-all">
                <span className="font-medium text-gray-700">Photo URL: </span>
                <span className="text-gray-900">{previewUser.photo_url}</span>
              </div>
            )}
            {previewUser.generated_image_url && (
              <div className="text-sm break-all">
                <span className="font-medium text-gray-700">Generated Image URL: </span>
                <span className="text-gray-900">{previewUser.generated_image_url}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
