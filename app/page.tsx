"use client";
import { useState, useEffect, useRef } from "react";
import Banner from "@/components/Banner";
import Date from "@/components/Date";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Involved from "@/components/Involved";
import Navbar from "@/components/Navbar";
import { Whatsapp } from "@/components/whatsapp";
import Marque from "@/components/Marque";
import { analytics } from "@/lib/analytics";
import Speaker from "@/components/Speakers"
import PartnersSection from "@/components/Partners";
import ScaleupEventRoster from "@/components/EventRoster";
import About from "@/components/About";


export default function Home() {
  const [open, setOpen] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    analytics.flowStart();
  }, []);

  useEffect(() => {
    // Check if showing for the first time (safe for environments without localStorage)
    if (hasShown.current) return;

    let hasSeen = false;
    if (typeof window !== "undefined") {
      try {
        hasSeen =
          window.localStorage.getItem("scaleup2026:whatsapp_seen") === "true";
      } catch {
        hasSeen = false;
      }
    }

    if (hasSeen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("whatsapp-modal-opened"));
        try {
          window.localStorage.setItem("scaleup2026:whatsapp_seen", "true");
        } catch {
          // Ignore storage failures in restricted environments
        }
      }
      hasShown.current = true;
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for external close events (e.g. from AiModalPop)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const closeHandler = () => setOpen(false);
    window.addEventListener("close-whatsapp-modal", closeHandler);
    return () => window.removeEventListener("close-whatsapp-modal", closeHandler);
  }, []);
  return (
    <main className="flex flex-col overflow-hidden">
       <Navbar />
      <Marque />
      <Hero />
      <Date />
      {/* <About/> */}
      <Speaker/>
      
      <Banner />
      <Involved />
      {/* <ScaleupEventRoster/> */}
      <PartnersSection/>
      <Footer />
      <Whatsapp open={open} setOpen={setOpen} />
    </main>
  );
}
