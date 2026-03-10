"use client";

import Image from "next/image";
import { useMemo } from "react";

interface Speaker {
  name: string;
  role: string;
  image: string;
  icon: string;
  color: "purple" | "blue" | "green" | "yellow";
}

export default function SpeakersSection() {
 const speakers: Speaker[] = [
        { name: "Anoop P Ambika", role: "CEO, Kerala Startup Mission", image: "/assets/images/speakers/sp5.png", icon: "", color: "green" },
            { name: "Ajeesh Achuthan", role: "CTO,Open Financial Technologies", image: "/assets/images/speakers/sp6.png", icon: "", color: "yellow" },
                { name: "Rejah Rahim", role: "Co-Founder & CEO, Beagle Security", image: "/assets/images/speakers/sp9.png", icon: "", color: "yellow" },
{ name: "Ambras KT", role: "Founder,EDEX Life School", image: "/assets/images/speakers/sp4.png", icon: "", color: "yellow" },
    { name: "Himanshu Srivastava", role: "Senior Manager,NSE Indiar", image: "/assets/images/speakers/sp7.png", icon: "", color: "purple" },
    { name: "Razak Aviyoor", role: "Founder,De Bright Study MBBS Abroad Consultancy", image: "/assets/images/speakers/sp8.png", icon: "", color: "blue" },


    { name: "Afthab Shoukath P V", role: "CEO, Xpresso Global", image: "/assets/images/speakers/sp1.png", icon: "", color: "purple" },
    { name: "Ajmal TP", role: "CEO, Fusfu", image: "/assets/images/speakers/sp2.png", icon: "", color: "blue" },
    { name: "Aksa Rose", role: "AI/ML Developer", image: "/assets/images/speakers/sp3.png", icon: "", color: "green" },
        { name: "B P Nassar", role: "Founder,Frontline Logistics", image: "/assets/images/speakers/s13.png", icon: "", color: "yellow" },

        { name: "Deena Jacob", role: "CFO,Open Financial Technologies", image: "/assets/images/speakers/s16.png", icon: "", color: "yellow" },
            { name: "Dr Abdulla Khaleel", role: "Sports Surgeon,KIMS Al Shifa", image: "/assets/images/speakers/s19.png", icon: "", color: "yellow" },


    
    { name: "Dr Vandana Jayakumar", role: "Co-Founder,Curate Health", image: "/assets/images/speakers/s10.png", icon: "", color: "yellow" },
        { name: "Dr. Mohammed Fahed VP", role: "The RFC Titan", image: "/assets/images/speakers/s14.png", icon: "", color: "yellow" },
            { name: "CA Naufal Mahammad", role: "Founder & Managing Director,Naufal M & Company", image: "/assets/images/speakers/s12.png", icon: "", color: "yellow" },


        { name: "Dr. P Unneen", role: "Vice Chairman & Executive Director,KIMS AL-SHIFA", image: "/assets/images/speakers/s11.png", icon: "", color: "yellow" },
            { name: "CA Praveen P K", role: "Founder & Partner,Praveen Shabana & Co LLP", image: "/assets/images/speakers/s20.png", icon: "", color: "yellow" },
                { name: "Dr. Thomas George K (Thomman)", role: "Director & Chairman,LEAD College", image: "/assets/images/speakers/s17.png", icon: "", color: "yellow" },
    { name: "Helen Monai", role: "Security Analyst,EY", image: "/assets/images/speakers/s15.png", icon: "", color: "yellow" },
        { name: "Ansar M P", role: "Founder & CEO,NoteAI", image: "/assets/images/speakers/s21.png", icon: "", color: "yellow" },


    { name: "Basheer Pinnacle", role: "Founder & CEO,Pinnacle Stamps & Advertising", image: "/assets/images/speakers/s18.png", icon: "", color: "yellow" },


    


  ];

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
  }, []);

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center">

          {/* Left */}
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

          {/* Right */}
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
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/10 transition-colors duration-300" />

              {/* Bottom Info */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-black/90 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between transition-all duration-300 lg:group-hover:bg-black">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg sm:text-xl lg:text-2xl truncate">
                    {speaker.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate font-normal">
                    {speaker.role}
                  </p>
                </div>

                {/* ICON */}
                {/* <div className="ml-2 flex-shrink-0 transition-transform duration-300 lg:group-hover:scale-110">
                  <Image
                    src={randomIcons[index]}
                    alt="icon"
                    width={16}
                    height={16}
                    className="object-contain sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  />
                </div> */}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
