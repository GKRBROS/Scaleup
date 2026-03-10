"use client";

import { useEffect, useMemo, useState } from "react";

interface Speaker {
  name: string;
  role: string;
  image: string;
  icon: string;
  color: "purple" | "blue" | "green" | "yellow";
}

export default function SpeakersSection() {

  const defaultSpeakers: Speaker[] = [
    { name: "Anoop P Ambika", role: "CEO, Kerala Startup Mission", image: "/assets/images/speakers/sp5.png", icon: "", color: "green" },
   
  ];

  const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);

  useEffect(() => {
    const stored = localStorage.getItem("speakers");

    if (stored) {
      const adminSpeakers = JSON.parse(stored);

      if (adminSpeakers.length > 0) {
        setSpeakers(
          adminSpeakers.map((s: any) => ({
            name: s.name,
            role: s.role,
            image: s.image,
            icon: "",
            color: "yellow",
          }))
        );
      }
    }
  }, []);

  const icons = [
    "/assets/images/icon1.png",
    "/assets/images/icon2.png",
    "/assets/images/icon3.png",
    "/assets/images/icon4.png",
  ];

  const randomIcons = useMemo(() => {
    return speakers.map(
      () => icons[Math.floor(Math.random() * icons.length)]
    );
  }, [speakers]);

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center">

          <div className="flex flex-col items-center lg:items-start">
            <span className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tight text-center lg:text-left">
              04
            </span>

            <div className="mt-3 inline-flex items-center justify-center px-5 py-2.5 border-2 border-black rounded-full bg-white">
              <span className="text-lg sm:text-xl lg:text-3xl font-normal">
                Scaleup Speakers
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg lg:text-2xl text-gray-600 font-normal leading-snug text-center lg:text-left lg:max-w-3xl">
            ScaleUp 2026 brings diverse experts, leaders, innovators empowering entrepreneurs with global insights,
            collaboration, and unstoppable business growth.
          </p>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

          {speakers.map((speaker, index) => (

            <div
              key={index}
              className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer transition-transform duration-300 lg:hover:scale-[1.03]"
            >

              {/* IMAGE */}
              <div className="absolute inset-0">

                <img
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />

              </div>

              {/* HOVER */}
              <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/10 transition-colors duration-300" />

              {/* INFO */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-black/90 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between transition-all duration-300 lg:group-hover:bg-black">

                <div className="flex-1 min-w-0">

                  <h3 className="text-white font-semibold text-lg sm:text-xl lg:text-2xl truncate">
                    {speaker.name}
                  </h3>

                  <p className="text-gray-400 text-xs sm:text-sm truncate font-normal">
                    {speaker.role}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}