"use client";

import React, { useEffect, useState } from "react";

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

function Involved() {
  const [activeCard, setActiveCard] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div className="flex-1">
          <h2
            className="font-semibold"
            style={{ fontSize: isMobile ? "40px" : "60px", color: "#202020" }}
          >
            Get Involved
          </h2>
          <p
            className="mt-4 font-light"
            style={{
              fontSize: isMobile ? "18px" : "28px",
              lineHeight: isMobile ? "22px" : "36px",
              color: "#4B5563",
            }}
          >
            Be part of Kerala's biggest AI & Technology Conclave and connect
            <br />
            with innovators, leaders, and enthusiasts from across the country.
          </p>
        </div>
        {!isMobile && (
          <img
            src="/assets/images/img_icon2.svg"
            alt="Decorative icons"
            className="h-8"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isActive = activeCard === card.id;
          const rectangle = isActive
            ? "/assets/images/rectangle_green.svg"
            : "/assets/images/rectangle_blue.svg";
          const arrow = isActive
            ? "/assets/images/arrow_icon_green.svg"
            : "/assets/images/arrow_icon_blue.svg";

          return (
            <div
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className="flex h-full flex-col justify-between rounded-3xl border p-8 shadow-sm transition hover:shadow-lg cursor-pointer"
              style={{
                borderColor: "#000",
                backgroundColor: isActive ? "#1E90FF" : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#202020",
              }}
            >
              <div>
                {/* Rectangle with inner icon */}
                <div className="relative inline-block">
                  <img
                    src={rectangle}
                    alt="Card background icon"
                    className="h-12 w-12"
                  />
                  <img
                    src={card.icon}
                    style={{
                      filter: isActive ? "none" : "brightness(0) invert(1)",
                    }}
                    alt={card.title}
                    className="absolute inset-0 m-auto h-6 w-6"
                  />
                </div>

                <h3
                  className="mt-8 text-2xl font-bold"
                  style={{ fontSize: isMobile ? "20px" : "24px" }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    lineHeight: "22px",
                  }}
                >
                  {card.description}
                </p>
              </div>

              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-4 font-semibold no-underline"
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  color: isActive ? "#FFFFFF" : "black",
                }}
              >
                <span>Apply Now</span>
                <img
                  src={arrow}
                  alt="Arrow icon"
                  style={{
                    height: isMobile ? "40px" : "56px",
                    width: isMobile ? "48px" : "64px",
                  }}
                />
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Involved;
