"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ScaleupEventRoster — Next.js + Tailwind CSS
// Matches the "05 Scaleup Event roster" section from the design reference.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";

// ─── Data ─────────────────────────────────────────────────────────────────────

const events = [
  {
    id: "discussions",
    title: "Discussions",
    description:
      "Engage in panel discussions with experts sharing insights, tackling challenges, and offering actionable ideas to drive growth and innovation.",
    image: "/assets/images/roster1.jpg",
  },
  {
    id: "expert-talks",
    title: "Expert Talks",
    description:
      "Hear from industry leaders sharing practical advice, experiences, and strategies to empower you with knowledge for personal and professional growth.",
    image: "/assets/images/roster1.jpg",
  },
  {
    id: "workshops",
    title: "Workshops",
    description:
      "Join 50+ workshops covering technical skills, creativity, business strategies, and personal development, offering hands-on learning and expert guidance.",
    image: "/assets/images/roster1.jpg",
  },
  {
    id: "startup-jam",
    title: "Startup JAM",
    description:
      "Startup Jam at ScaleUp Conclave 2025 is your chance to showcase your startup, share your journey, and inspire others at Kerala's biggest business event. Don't miss out!",
    image: "/assets/images/roster1.jpg",
  },
  {
    id: "competitions",
    title: "Competitions",
    description:
      "Compete in Business Challenges, Live Pitch Battles, Drone Racing, and Stand-Up Comedy, showcasing creativity and talent for recognition and rewards.",
    image: "/assets/images/roster1.jpg",
  },
  {
    id: "exhibitions",
    title: "Exhibitions",
    description:
      "Explore 50+ stalls showcasing innovations, services, and products. Discover opportunities and connect with industry leaders shaping the future.",
    image: "/assets/images/roster1.jpg",
  },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

function ExxtraBadge() {
  return (
    <div className="absolute top-3 left-3 z-20 bg-black backdrop-blur-sm  px-2.5 py-1.5 leading-tight">
      <p className="text-[8px] font-medium text-gray-300 tracking-[0.2em] uppercase" style={{ fontFamily: 'Calsans, sans-serif' }}>
        EXXTRA
      </p>
      <p className="text-[11px] font-black text-white tracking-[0.15em] uppercase" style={{ fontFamily: 'Calsans, sans-serif' }}>
        INFORMATION
      </p>
    </div>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────

function EventCard({ event }: { event: (typeof events)[number] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-72 lg:h-96">
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Badge */}
      <ExxtraBadge />

      {/* Bottom text with gradient background */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 bg-gradient-to-t from-blue-600 via-blue-600 to-transparent">
        <h3 className="text-white font-light text-2xl leading-tight mb-1.5 drop-shadow-lg" style={{ fontFamily: 'Calsans, sans-serif' }}>
          {event.title}
        </h3>
        <p className="text-white/90 text-[11.5px] font-extralight leading-relaxed line-clamp-3 " style={{ fontFamily: 'Calsans, sans-serif' }}>
          {event.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScaleupEventRoster() {
  const topRow = events.slice(0, 4);
  const bottomRow = events.slice(4);

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16">
      {/* Header */}
       <div className="mb-10 lg:mb-16 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-center">

          {/* Left */}
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tight text-center lg:text-left">
              05
            </span>

            <div className="mt-3 inline-flex items-center justify-center px-5 py-2.5 border-2 border-black rounded-full bg-white">
              <span className="text-lg sm:text-xl lg:text-3xl font-normal">
Scaleup Event rosters              </span>
            </div>
          </div>

          {/* Right */}
          <p className="text-base sm:text-lg lg:text-2xl text-gray-600 font-normal leading-snug text-center lg:text-left lg:max-w-3xl">
            ScaleUp 2026 brings diverse experts, leaders, innovators empowering entrepreneurs with global insights,
            collaboration, and unstoppable business growth.
          </p>
        </div>

      {/* Grid */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRow.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bottomRow.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}