"use client";

// ─────────────────────────────────────────────────────────────────────────────
// PartnersSection — Next.js + Tailwind CSS
// Matches the static 4×2 partners grid from the design reference.
// Drop this file into your Next.js project and import it wherever needed.
// ─────────────────────────────────────────────────────────────────────────────

const partners = [
  // Row 1
  {
    id: "profinz",
    logo: "/assets/images/image.png"
  },
  {
    id: "thara-cart",
    logo: "/assets/images/image.png"
  },
  {
    id: "karikku",
    logo: "/assets/images/image.png"
  },
  {
    id: "voxbay",
    logo: "/assets/images/image.png"
  },

  // Row 2
  {
    id: "shifa",
    logo: "/assets/images/image.png"
  },
  {
    id: "fulva",
    logo: "/assets/images/image.png"
  },
  {
    id: "haymed",
    logo: "/assets/images/image.png"
  },
  {
    id: "dcsmat",
    logo: "/assets/images/image.png"
  },
];

// ─── Single partner card ──────────────────────────────────────────────────────
function PartnerCard({ partner }: { partner: (typeof partners)[number] }) {
  return (
    <div className="group flex items-center justify-center h-28 rounded-2xl border  bg-white  hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer px-6 py-4">
      <div className="opacity-75 group-hover:opacity-100 transition-opacity duration-300">
        {partner.logo}
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export default function PartnersSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-full h-full"
      >
        <div className="absolute -top-16 left-1/3 w-80 h-80 rounded-2xl bg-blue-50 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pill label */}
        <div className="flex justify-center mb-14">
          <span className="inline-block border border-b-black rounded-4xl px-10 py-2.5 text-[20px] font-bold tracking-[0.3em] uppercase text-black bg-white ">
            Partners
          </span>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {partners.map((partner) => (
            <img key={partner.id} src={partner.logo} />
          ))}
        </div>
      </div>
    </section>
  );
}