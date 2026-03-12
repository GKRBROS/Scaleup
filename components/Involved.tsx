"use client";

import React, { useState } from "react";

const cards = [
  {
    id: 1,
    title: "Become a Sponsor",
    description: "Partner with us to shape the future of AI innovation.",
    link: "https://docs.google.com/forms/d/e/1FAIpQLScvtPBj8e9o1v2s7heNDGGW_iz2AwCQB_FKBqEv2OKITxcyzg/viewform",
    icon: "/assets/images/svg01.svg",
  },
  {
    id: 2,
    title: "Become a Speaker",
    description: "Share your expertise and insights with the AI community.",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSfAZZpitA5SliZ1ivPH0PmQled6eyuyaHUnKLIY5TP1YXjRIQ/viewform",
    icon: "/assets/images/svg02.svg",
  },
  {
    id: 3,
    title: "Become an Exhibitor",
    description:
      "Showcase your AI solutions and connect with industry leaders.",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSdAu78_Eh1Cbt-_M4k6YBSZe-kOnuSdcC4TBqNdF3yDFfZCQw/viewform",
    icon: "/assets/images/svg03.svg",
  },
  {
    id: 4,
    title: "Join as Volunteer",
    description: "Be part of the organizing team and gain valuable experience.",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSccyRPittAjflEQYAdpnfXjQ4MoA1xNs6LnwwkrX8Y0Stas7g/viewform",
    icon: "/assets/images/svg04.svg",
  },
];

export default function Involved() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-12 gap-6">
        <div className="flex-1">
          <h2 className="font-semibold font-plusJakarta text-4xl sm:text-5xl lg:text-[60px] text-[#202020]">
            Get Involved
          </h2>

          <p className="mt-4 font-light font-plusJakarta text-base sm:text-lg lg:text-[28px] leading-snug lg:leading-[36px] text-gray-600">
            Be part of Kerala's biggest AI & Technology Conclave and connect
            <br className="hidden sm:block" />
            with innovators, leaders, and enthusiasts from across the country.
          </p>
        </div>

        {/* Decorative icon only on laptop */}
        <img
          src="/assets/images/img_icon2.svg"
          alt="Decorative icons"
          className="hidden lg:block h-10"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isActive = activeCard === card.id;

          const arrow = isActive
            ? "/assets/images/arrow_icon_green.svg"
            : "/assets/images/arrow_icon_blue.svg";

          return (
            <div
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className="flex h-full flex-col overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer"
            >
              {/* Color Band */}
              <div
                className="h-10 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/assets/images/color.jpg')",
                }}
              />

              {/* Content */}
              <div
                className="flex flex-1 flex-col justify-between p-6 sm:p-7 lg:p-8 rounded-2xl -mt-3 transition-colors duration-300"
                style={{
                  backgroundColor: isActive ? "#1E1E1E" : "#2A2A2A",
                  color: "#FFFFFF",
                }}
              >
                <div>
                  {/* Icon */}
                  <div
                    className="inline-flex items-center justify-center rounded-xl p-3 sm:p-4"
                    style={{ backgroundColor: "#1E90FF" }}
                  >
                    <img
                      src={card.icon}
                      alt={card.title}
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      style={{
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  </div>

                  <h3 className="mt-6 sm:mt-8 font-bold font-plusJakarta text-lg sm:text-xl lg:text-2xl text-white">
                    {card.title}
                  </h3>

                  <p className="mt-3 font-plusJakarta text-sm sm:text-[15px] leading-relaxed text-gray-400">
                    {card.description}
                  </p>
                </div>

                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-between font-semibold font-plusJakarta text-sm sm:text-base text-white no-underline"
                >
                  <span>Apply Now</span>

                  <img
                    src={arrow}
                    alt="Arrow icon"
                    className="h-10 w-12 sm:h-12 sm:w-14 lg:h-14 lg:w-16 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
