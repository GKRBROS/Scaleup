"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";

interface ImageItem {
    id: number;
    src: string;
    alt: string;
}


const filters = ["Dubai", "2025", "2024", "All"];

export default function AboutSection() {
    

    return (
        <section className="relative w-full py-16 px-6 md:px-16 max-w-full mx-auto" id="about">
            {/* ---------------- Desktop View ---------------- */}
            <div className="grid md:flex flex-col md:flex-row items-start gap-12 md:gap-14 mb-12 w-full">
                {/* Left SVG */}
                <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col">
                    <div className="grid justify-center gap-2">
                        <span className="text-[170px] font-bold h-fit" style={{ fontFamily: "PlusJakartaSans" }}>03</span>
                        <div className="inline-flex items-center justify-center border rounded-full  py-3">
                            <p className="text-[32px] leading-none px-4">
                                About Scaleup
                            </p>
                        </div>

                    </div>
                    <div className="flex justify-center items-center mt-4">
                        <img
                            src="/assets/images/abouticons.svg"
                            alt="About Icons"
                            className="w-16 md:w-20 h-auto"
                        />
                    </div>
                </div>

                {/* Right Text */}
                <div className="flex-1 w-full md:w-2/3 space-y-6 mt-12">
                    <p
                        style={{ color: "#202020" }}
                        className="font-plusJakartaSans font-normal text-[27.95px] leading-[36px] tracking-[0px]"
                    >
                        ScaleUp Conclave hosted by ScaleUp Village, bringing together entrepreneurs, investors, and aspiring business leaders.
                    </p>
                    <p
                        style={{ color: "#202020" }}
                        className="font-plusJakartaSans font-normal text-[27.95px] leading-[36px] tracking-[0px]"
                    >
                        ScaleUp Village is a unique hub in India supporting startups and businesses. As an incubator and accelerator, it offers tools, guidance, and connections to help entrepreneurs grow and succeed.
                    </p>
                </div>
            </div>
        </section>
    );
}