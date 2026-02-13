import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ScaleUp Conclave",
  description: "ScaleUp Conclave - 2026",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
