"use client";

import { useEffect, useMemo, useState } from "react";

interface Speaker {
  name: string;
  role: string;
  image: string;
}

export default function SpeakersSection() {

  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {

    fetch(
      "https://docs.google.com/spreadsheets/d/1AFLLBXt2K6IbA5dXCdtke_dd_6S0Jo0lRxbOdh9ZWL4/gviz/tq?tqx=out:json&gid=0"
    )
      .then(res => res.text())
      .then(data => {

        const json = JSON.parse(data.substring(47).slice(0, -2));

        const rows = json.table.rows.map((row: any) => {

          const link = row.c[2]?.v || "";
          let image = link;

          const match = link.match(/\/d\/(.*?)\//);

          if (match) {
            image = `https://lh3.googleusercontent.com/d/${match[1]}`;
          }

          return {
            name: row.c[0]?.v || "",
            role: row.c[1]?.v || "",
            image
          };

        });

        setSpeakers(rows);

      });

  }, []);

  const icons = [
    "/assets/images/ele1.png",
    "/assets/images/ele2.png",
    "/assets/images/ele3.png",
    "/assets/images/ele4.png",
  ];

  const speakerIcons = useMemo(() => {
    return speakers.map((_, i) => icons[i % icons.length]);
  }, [speakers]);

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Title Section */}

        <div className="mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center">

          <div className="flex flex-col items-center lg:items-start">

            <span className="text-6xl sm:text-7xl lg:text-9xl font-bold">
              04
            </span>

            <div className="mt-3 inline-flex items-center justify-center px-5 py-2.5 border-2 border-black rounded-full bg-white">
              <span className="text-lg sm:text-xl lg:text-3xl">
                Scaleup Speakers
              </span>
            </div>

          </div>

          <p className="text-base sm:text-lg lg:text-2xl text-gray-600">
            ScaleUp 2026 brings diverse experts, leaders, innovators empowering entrepreneurs with global insights.
          </p>

        </div>


        {/* Speakers Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

          {speakers.map((speaker, index) => (

            <div
              key={index}
              className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer transition-transform duration-300 lg:hover:scale-[1.03]"
            >

              {/* Speaker Image */}

              <div className="absolute inset-0">
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover Overlay */}

              <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/10 transition-colors duration-300" />

              {/* Name + Role + Icon */}

              <div className="absolute bottom-2 left-2 right-2 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">

                {/* Text */}

                <div className="flex-1 min-w-0">

                  <h3 className="text-white font-semibold text-lg leading-tight truncate">
                    {speaker.name}
                  </h3>

                  <p className="text-gray-400 text-sm truncate">
                    {speaker.role}
                  </p>

                </div>

                {/* Element Icon */}

                <img
                  src={speakerIcons[index]}
                  alt="icon"
                  className="w-9 h-9 flex-shrink-0 object-contain"
                />

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}