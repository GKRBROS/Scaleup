"use client";

import React from "react";
import Image from "next/image";

function Navbar() {
  return (
    <div>
      <nav
        style={{ backgroundColor: "var(--color-bg)" }}
        className="w-full shadow-sm rounded-4xl px-7 py-3 my-3"
      >
        <div className="flex justify-between items-center">
          {/* Left Logo */}
          <div className="flex items-center">
            <Image
              src="/assets/images/icon.svg"
              alt="ScaleUp 2025"
              width={150}
              height={40}
              className="h-6 md:h-10 w-auto"
            />
          </div>

          {/* Center Text */}
          <div
            className="text-[8px] md:text-base text-center"
            style={{ color: "var(--color-text)" }}
          >
            <span>Previous editions:&nbsp;</span>
            <a
              href="https://2024.scaleupconclave.com/"
              className="underline font-bold"
            >
              2024
            </a>
            <span className="mx-1">|</span>
            <a
              href="https://scaleup2025.netlify.app/"
              className="underline font-bold"
            >
              2025
            </a>
            <span className="mx-1">|</span>
            <a
              href="https://dubai.scaleupconclave.com/"
              className="underline font-bold"
            >
              Dubai
            </a>
          </div>

          {/* Right Logo */}
          <div className="flex items-center">
            <Image
              src="/assets/images/ai_summit_blue.svg"
              alt="The AI Summit"
              width={150}
              height={40}
              className="h-6 md:h-10 w-auto"
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
