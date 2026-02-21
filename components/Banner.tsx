"use client";

import React from "react";
import Image from "next/image";

function Banner() {
  return (
    <div className="p-6">
      <section
        className="w-full rounded-2xl max-w-8xl mx-auto flex flex-col md:flex-row items-center justify-between overflow-hidden"
        style={{ backgroundColor: "var(--color-banner-bg)" }}
      >
        {/* Left Content */}
        <div className="flex flex-col gap-6 md:w-1/2">
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-medium leading-snug p-6 md:p-9"
            style={{ color: "var(--color-bg)" }}
          >
            Want to Get <br /> Notified when we <br />
            release amazings?
          </h1>

          <div className="flex flex-wrap items-center gap-4 px-6 mb-6 md:px-9">
            <a
              href="https://chat.whatsapp.com/L6MYoQikKvlJIskD6uFnRQ?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-[220px] flex items-center gap-2 rounded-full shadow-md hover:shadow-lg transition px-4 py-2"
              style={{
                backgroundColor: "var(--color-button-bg)",
                color: "var(--color-button-text)",
                textDecoration: "none",
              }}
            >
              <Image
                src="/assets/images/whatsapp.svg"
                alt="WhatsApp"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="font-gilmer font-medium text-sm md:text-base">
                Join Whatsapp
              </span>
              <Image
                src="/assets/images/arrow_icon_blue.svg"
                alt="arrow"
                width={60}
                height={30}
                className="absolute right-1 h-[30px] w-auto"
              />
            </a>

            <Image
              src="/assets/images/img_icons.svg"
              alt=""
              width={80}
              height={80}
              className="w-16 sm:w-20"
            />
          </div>
        </div>

        {/* Right Image */}
        <div className="relative md:w-1/2 w-full flex justify-center md:justify-end mt-6 md:mt-0">
          <Image
            src="/assets/images/banner_img.png"
            alt="img"
            width={600}
            height={400}
            className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain"
          />
        </div>
      </section>
    </div>
  );
}

export default Banner;
