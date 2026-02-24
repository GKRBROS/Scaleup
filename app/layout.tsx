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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PNFLS5WH87"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PNFLS5WH87');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
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
