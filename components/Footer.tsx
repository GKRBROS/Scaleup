"use client";
import React from "react";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Youtube,
} from "lucide-react";

function Footer() {
  const socialIcons = [
    {
      type: "icon",
      icon: <Facebook size={25} />,
      alt: "Facebook",
      link: "https://www.facebook.com/scaleupvillage/",
    },
    {
      type: "icon",
      icon: <Instagram size={25} />,
      alt: "Instagram",
      link: "https://www.instagram.com/scaleup_village/?igsh=MTMzYXhhOTBzbnRsNQ%3D%3D",
    },
    {
      type: "icon",
      icon: <Linkedin size={25} />,
      alt: "LinkedIn",
      link: "https://www.linkedin.com/company/scaleupvillage/",
    },
    {
      type: "icon",
      icon: <Youtube size={25} />,
      alt: "Youtube",
      link: "http://www.youtube.com/@scaleup_village",
    },
  ];

  return (
    <footer className="w-full mt-5 md:mt-24 px-1 md:px-2">
      <div
        className="relative mx-auto mb-6 max-w-10xl rounded-3xl overflow-hidden"
        style={{ backgroundColor: "#202020", color: "#FFFFFF" }}
      >
        <Image
          src="/assets/images/scale.svg"
          alt="ScaleUp background text"
          width={1200}
          height={200}
          className="absolute bottom-0 left-0 w-full h-auto z-0 select-none"
          loading="lazy"
        />

        <div className="relative z-10 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* --- Right section (AI Summit + Location + Map for desktop) --- */}
            <div className="order-1 md:order-2 flex flex-col items-start md:items-end gap-5 text-left md:text-right">
              <Image
                className="ml-43 w-30"
                src="/assets/images/ai_summit_icon.svg"
                alt="The AI Summit logo"
                width={140}
                height={60}
              />
              {/* Location + Map ONLY visible on md and above */}
              <div className="hidden md:block">
                <p
                  className="text-base font-gilmer"
                  style={{ color: "#D1D5DB" }}
                >
                  <strong>Location:</strong> Shifa Convention Center, <br />
                  Perinthalmanna
                </p>
                <div className="w-[250px] h-[160px] overflow-hidden rounded-md mb-9 mt-5">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1567.9919025620663!2d76.24524726026954!3d10.97852349230604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cda1960f1e95%3A0x971882d6dc32948e!2sShifa%20Convention%20Center!5e0!3m2!1sen!2sin!4v1758707799289!5m2!1sen!2sin"
                    width="600"
                    height="450"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* --- Left section (Scale to Intelligence + socials) --- */}
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-6">
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
                <h2
                  className="font-gilmer text-2xl md:text-4xl font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  Scale to <br /> Intelligence
                </h2>
              </div>
              <p
                className="font-gilmer text-xl mb-8 leading-relaxed"
                style={{ color: "#D1D5DB" }}
              >
                Kerala&apos;s biggest AI & Technology <br /> conclave bringing
                together innovators, <br />
                entrepreneurs, and thought leaders to scale to <br />{" "}
                intelligence.
              </p>

              <div
                className="font-gilmer flex items-center gap-2 text-lg font-medium mb-3"
                style={{ color: "#D1D5DB" }}
              >
                <Phone size={20} />
                <a
                  href="tel:+919048170077"
                  className="hover:underline font-gilmer"
                >
                  +91 90481 70077
                </a>
              </div>
              <div
                className="font-gilmer flex items-center gap-2 text-lg font-medium mb-3"
                style={{ color: "#D1D5DB" }}
              >
                <Mail size={20} />
                <a
                  href="mailto:info@scaleupconclave.com"
                  className="hover:underline font-gilmer"
                >
                  info@scaleupconclave.com
                </a>
              </div>

              <div className="flex gap-4 mb-6">
                {socialIcons.map((icon, index) => (
                  <a
                    href={icon.link}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    {icon.icon}
                  </a>
                ))}
              </div>

              {/* Location + Map ONLY visible on mobile */}
              <div className="block md:hidden">
                <p
                  className="text-base font-gilmer"
                  style={{ color: "#D1D5DB" }}
                >
                  <strong>Location:</strong> Shifa Convention Center, <br />
                  Perinthalmanna
                </p>
                <div className="w-[250px] h-[160px] overflow-hidden rounded-md mb-9 mt-5">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1567.9919025620663!2d76.24524726026954!3d10.97852349230604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cda1960f1e95%3A0x971882d6dc32948e!2sShifa%20Convention%20Center!5e0!3m2!1sen!2sin!4v1758707799289!5m2!1sen!2sin"
                    width="600"
                    height="450"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* --- Bottom copyright --- */}
          <div
            className="mb-16 mt-20 pb-8 p-2 md:pl-59"
            style={{ borderColor: "rgba(107, 114, 128, 0.5)" }}
          >
            <p
              className="font-gilmer text-center mb-15 md:text-left text-lg"
              style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: "200" }}
            >
              © 2026 ScaleUp Conclave. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
