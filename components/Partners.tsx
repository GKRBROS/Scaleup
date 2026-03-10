"use client";

import { useEffect, useState } from "react";

export default function PartnersSection() {

  const defaultPartners = [
    { logo: "/assets/images/image.png" },
    { logo: "/assets/images/image.png" },
    { logo: "/assets/images/image.png" },
    { logo: "/assets/images/image.png" },
  ];

  const [partners, setPartners] = useState(defaultPartners);

  useEffect(() => {

    const stored = localStorage.getItem("partners");

    if (stored) {

      const adminPartners = JSON.parse(stored);

      if (adminPartners.length > 0) {
        setPartners(adminPartners);
      }

    }

  }, []);

  return (

    <section className="relative py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}

        <div className="flex justify-center mb-14">

          <span className="inline-block border border-b-black rounded-4xl px-10 py-2.5 text-[20px] font-bold tracking-[0.3em] uppercase text-black bg-white ">
            Partners
          </span>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {partners.map((partner: any, index) => (

            <div
              key={index}
              className="flex items-center justify-center h-28 rounded-2xl border bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer px-6 py-4"
            >

              <img
                src={partner.logo}
                className="max-h-full object-contain opacity-80 hover:opacity-100"
              />

            </div>

          ))}

        </div>

      </div>

    </section>

  );
}