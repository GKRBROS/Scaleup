"use client";

import { useEffect, useState } from "react";

export default function PartnersSection() {

  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {

    fetch(
      "https://docs.google.com/spreadsheets/d/1AFLLBXt2K6IbA5dXCdtke_dd_6S0Jo0lRxbOdh9ZWL4/gviz/tq?tqx=out:json&gid=1144311292"
    )
      .then(res => res.text())
      .then(data => {

        const json = JSON.parse(data.substring(47).slice(0, -2));

        const rows = json.table.rows.map((row: any) => {

          const link = row.c[0]?.v || "";

          let logo = link;

          const match = link.match(/\/d\/(.*?)\//);

          if (match) {
            logo = `https://lh3.googleusercontent.com/d/${match[1]}`;
          }

          return { logo };

        });

        setPartners(rows);

      });

  }, []);

  return (

    <section className="relative py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-center mb-14">

          <span className="inline-block border border-b-black rounded-4xl px-10 py-2.5 text-[20px] font-bold tracking-[0.3em] uppercase text-black bg-white ">
            Partners
          </span>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {partners.map((partner, index) => (

            <div
              key={index}
              className="flex items-center justify-center h-28 rounded-2xl border bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 px-6 py-4"
            >

              <img
                src={partner.logo}
                className="max-h-full object-contain "
              />

            </div>

          ))}

        </div>

      </div>

    </section>

  );
}