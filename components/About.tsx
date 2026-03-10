"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";


// ── Types ────────────────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  alt: string;
  label?: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const tickerItems: string[] = [
  "17000+ Total attendees",
  "900+ Local Business Heroes",
  "150+ Educational Institutions",
  "200+ Keynote Speakers",
  "30+ Investors in Attendance",
];

const galleryImages: GalleryImage[] = [
  {
    src: "/assets/images/a11.png",
    alt: "Panel discussion at ScaleUp Conclave",
  },
  {
    src: "/assets/images/a2.jpg",
    alt: "Speaker at ScaleUp Conclave",
  },
  {
    src: "/assets/images/a3.png",
    alt: "Opening Ceremony at ScaleUp Conclave",
    label: "Opening Ceremony",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function MarqueeTicker() {
  const repeated = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#00C896] overflow-hidden py-2.5 flex items-center rounded-4xl">
      {/* Label badge */}
      <div className="shrink-0 bg-black text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full z-10 ml-4 mr-3 whitespace-nowrap">
        ScaleUp Numbers
      </div>

      {/* Scrolling track */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {repeated.map((item, i) => (
            <span
              key={i}
              className="text-black text-xs sm:text-sm font-semibold px-4 border-r border-[#00a57e] last:border-r-0"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee { animation: marquee 24s linear infinite; }
      `}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function About() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="bg-gray-50 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div
          className={`mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Left: number + pill + icons */}
           <div className="mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center">

          {/* Left */}
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tight text-center lg:text-left">
              03
            </span>

            <div className="mt-3 inline-flex items-center justify-center px-5 py-2.5 border-2 border-black rounded-full bg-white">
              <span className="text-lg sm:text-xl lg:text-3xl font-normal">
About Scaleup
              </span>
            </div>
          </div>

          {/* Right */}
          <p className="text-base sm:text-lg lg:text-2xl text-gray-600 font-normal leading-snug text-center lg:text-left lg:max-w-3xl">
            ScaleUp 2026 brings diverse experts, leaders, innovators empowering entrepreneurs with global insights,
            collaboration, and unstoppable business growth.
          </p>
        </div>
        </div>

        {/* ── PHOTO GRID ── */}
<div
  className={`grid grid-cols-1 lg:grid-cols-3 gap-4 transition-all duration-700 delay-300 ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  }`}
>
  {/* Left: Large Image */}
  <div className="relative rounded-2xl overflow-hidden bg-gray-200 lg:col-span-2 h-[280px] sm:h-[360px] lg:h-[420px]">
    <Image
      src={galleryImages[0].src}
      alt={galleryImages[0].alt}
      fill
      className="object-cover"
    />
  </div>

  {/* Right Column */}
  <div className="flex flex-col gap-4">
    
    {/* Top Right Image */}
    <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-[130px] sm:h-[170px] lg:h-[200px]">
      <Image
        src={galleryImages[1].src}
        alt={galleryImages[1].alt}
        fill
        className="object-cover"
      />
    </div>

    {/* Bottom Right Image */}
    <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-[130px] sm:h-[170px] lg:h-[200px]">
      <Image
        src={galleryImages[2].src}
        alt={galleryImages[2].alt}
        fill
        className="object-cover"
      />

      {galleryImages[2].label && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-full">
          {galleryImages[2].label}
        </div>
      )}
    </div>

  </div>
</div>

        {/* ── TICKER ── */}
        <div
          className={`mt-8 -mx-4 sm:-mx-6 lg:-mx-8 transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <MarqueeTicker />
        </div>

      </div>
    </section>
  );
}