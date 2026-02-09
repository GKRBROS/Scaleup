"use client";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import Registration from "./Registration";

function Hero() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  useEffect(() => {
    const handler = () => setIsRegisterModalOpen(true);
    window.addEventListener(
      "open-registration-modal",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "open-registration-modal",
        handler as EventListener,
      );
  }, []);
  return (
    <section className="w-full flex flex-col items-center px-2 py-2 relative overflow-hidden">
      {/* --- RESPONSIVE HEADING SECTION --- */}
      <div className="w-[100%] text-right md:text-center mb-8 md:mb-8 lg:mb-7 pr-4 md:pr-6">
        {/* First Line */}
        <h1 className="text-[23.83px] md:text-[65px] lg:text-[76px] mb-2 md:mb-6 lg:mb-18 text-right pr-4 lg:pr-14">
          <span
            style={{ color: "#418CFF", fontWeight: "600" }}
            className="font-gilmer"
          >
            ScaleUp Conclave
          </span>
          <img
            src="/assets/images/v.svg"
            alt="icon"
            className="inline-block w-5 h-5 md:w-[60px] md:h-[60px] pl-2"
          />
        </h1>

        {/* Second Line */}
        <h1
          className="text-right text-5xl sm:text-6xl -mb-10 -mt-4 md:text-[180px] md:-mt-29 md:mb-5"
          style={{ color: "#4028C8" }}
        >
          <span
            className="font-gilmer !fw-400 sm:text-[56.63px] md:text-[100px] lg:text-[150px] xl:text-[190px]"
            style={{ color: "#060832" }}
          >
            The
          </span>{" "}
          <span
            className="font-gilmer tracking-tight sm:text-[56.63px] md:text-[100px] lg:text-[150px] xl:text-[190px]"
          // style={{ fontWeight: "700" }}
          >
            Ai Summit
          </span>
        </h1>
      </div>

      {/* --- MAIN CARD --- */}
      <div
        className="w-full max-w-md md:max-w-full rounded-3xl md:rounded-4xl 
             p-6 md:p-10 relative flex justify-between 
             mt-0 md:-mt-[76px] leading-normal md:leading-relaxed"
        style={{ backgroundImage: "url('/Rectangle.png')",backgroundSize: "cover", color: "#FFFFFF" }}
      >
        {/* Top Right Icon */}
        <div className="absolute top-6 right-6 md:hidden">
          <img
            src="/assets/images/img_icon2.svg"
            alt="icons"
            className="w-16 sm:w-10 md:w-[120px]"
          />
        </div>

        {/* Top Section of Card */}
        <div>
          {/* Tagline */}
          <p className="font-gilmer text-3xl sm:text-3xl md:text-5xl font-normal leading-tight md:leading-normal">
            ScaleUp <br className="block md:hidden" /> Conclave{" "}
            <span
              className="font-gilmer font-bold underline underline-offset-4 decoration-[3px]"
              style={{ textDecorationColor: "#9CF694" }}
            >
              2026
            </span>{" "}
            <br /> is back and this <br className="block md:hidden" /> time,{" "}
            <span
              className="font-gilmer font-bold underline underline-offset-4 decoration-[3px]"
              style={{ textDecorationColor: "#9CF694" }}
            >
              it’s AI.
            </span>
          </p>

          <div className="flex lg:grid items-center gap-6 mt-10">
            {/* Updated Blue Circle Icon to match the Green Button Icon style */}
            <div className="flex items-center justify-center bg-[#3399FF] rounded-full w-[70px] h-[70px] md:w-[100px] md:h-[100px] shrink-0">
              <svg
                width="104"
                height="104"
                viewBox="0 0 104 104"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="51.8322" cy="51.8327" r="51.8322" />
                <path
                  d="M41.832 29.0979L63.9735 45.704C66.0634 47.2715 67.2935 49.7315 67.2935 52.3439V52.3439C67.2935 54.8909 66.1241 57.2968 64.1214 58.8703L41.832 76.3834"
                  stroke="black"
                  strokeWidth="7.27469"
                />
              </svg>
            </div>

            {/* Text Section */}
            {/* <h2 className="font-gilmer text-4xl md:text-7xl font-semibold text-white leading-[1.05] tracking-tight"> */}
            <h2 className="font-gilmer text-[30.6px] md:text-[70px] font-semibold text-white leading-[1.05] tracking-tight">
              Scale to <br /> Intelligence
            </h2>
          </div>
          <div className="flex mt-10 lg:hidden">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="lg:w-[481px]
                flex items-center justify-between
                bg-[#9df094] hover:bg-[#b0f5a8] 
                text-black font-semibold text-xl md:text-[36px]
                py-4 px-6 md:px-8
                rounded-l-xl rounded-r-[50px]
                transition-all duration-200 active:scale-95
                group relative
              "
            >
              <span className="mr-6 tracking-tight">Book Tickets Now</span>

              <img
                src="/assets/images/arrow_circle.svg"
                alt="arrow button"
                className="w-12 md:w-18 absolute right-0"
              />
              {/* <ChevronRight 
                strokeWidth={3} 
                className="w-8 h-8 group-hover:translate-x-1 transition-transform" 
              /> */}
            </button>
          </div>
          {/* Buttons for MOBILE/TABLET VIEW */}
          <div className="mt-8 flex flex-col md:flex-row items-start gap-3 lg:hidden">
            <button
              className="w-[193px] font-gilmer flex items-center rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl gap-2 px-4 py-2 text-sm text-white"
              style={{ backgroundColor: "#3F26DB" }}
            >
              <img
                src="/assets/images/calender.svg"
                alt="calendar"
                width={18}
                height={18}
              />
              March 25th & 26th, 2026
            </button>
            <button
              className="w-[193px] font-gilmer text-center px-4 py-2 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl text-sm text-white"
              style={{ border: "1px solid #4B4DFF" }}
            >
              Shifa Convention Center
              <br />
              Perinthalmanna
            </button>
          </div>
        </div>

        {/* Vertical white line */}
        <div className="mx-3 hidden lg:flex items-center">
          <span className="block h-full w-px bg-white opacity-70" />
        </div>

        {/* Bottom Section of Card */}
        <div className="mt-8 md:mt-0 w-[581px] hidden lg:flex flex-col items-center">
          {/* Top Icon */}
          <div className="hidden md:flex justify-center mb-3">
            <img
              src="/assets/images/img_icon2.svg"
              alt="icons"
              className="mt-22 w-16 sm:w-10 md:w-[120px]"
            />
          </div>

          {/* Register Button */}
          <div className="flex mb-2 mt-10">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="w-[441px] xl:w-[481px]
      flex items-center justify-between
      bg-[#9df094] hover:bg-[#b0f5a8]
      text-black font-semibold text-xl md:text-[36px]
      py-4 px-6 md:px-8
      rounded-l-xl rounded-r-[50px]
      transition-all duration-200 active:scale-95
      group relative"
            >
              <span className="mr-6 tracking-tight">Book Tickets Now</span>
              <img
                src="/assets/images/arrow_circle.svg"
                alt="arrow button"
                className="w-12 md:w-18 absolute right-0"
              />
            </button>
          </div>

          {/* Date & Location */}
          <div className="hidden lg:flex flex-col md:flex-row items-center gap-2 mt-10">
            <button
              className="font-gilmer flex items-center gap-2 px-4 py-3 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl h-[50px]"
              style={{ backgroundColor: "#3F26DB", color: "#FFFFFF" }}
            >
              <img
                src="/assets/images/calender.svg"
                alt="calendar"
                width={18}
                height={18}
              />
              March 25th & 26th, 2026
            </button>

            <button
              className="font-gilmer flex flex-col justify-center px-4 py-3 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl h-[50px] leading-tight text-sm"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #4B4DFF",
                color: "#FFFFFF",
              }}
            >
              Shifa Convention Center
              <span className="font-gilmer text-xs leading-tight">
                Perinthalmanna
              </span>
            </button>
          </div>
        </div>

        {/* Buttons for DESKTOP VIEW */}
      </div>
      <Registration
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </section>
  );
}

export default Hero;
