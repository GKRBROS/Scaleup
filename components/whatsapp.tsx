"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Whatsapp({ open, setOpen }: Props) {
  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent
        className="fixed w-[90%] md:w-full max-w-md rounded-xl p-6"
        style={{
          backgroundColor: "#fff",
          color: "var(--neutral-50)",
        }}
      >
        <DialogClose asChild />
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="p-2 md:p-3 rounded-full bg-green-500 text-white">
            {/* SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle h-5 w-5 md:h-7 md:w-7"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </div>

          {/* FIXED TITLE */}
          <DialogTitle className="text-lg font-[700]">
            Join ScaleUp AI Community
          </DialogTitle>
        </DialogHeader>

        <div className="relative grid gap-2">
          <p className="text-gray-500 text-xs md:text-lg leading-relaxed text-center">
            Event ticket booking will open soon. Join our WhatsApp group to
            receive timely updates and essential information.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <a
            href="https://chat.whatsapp.com/L6MYoQikKvlJIskD6uFnRQ?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1 md:gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 md:py-3 px-4 md:px-6 rounded-full transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle h-4 w-4 md:h-5 md:w-5"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Join WhatsApp Group
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-right h-3 w-3 md:h-4 md:w-4"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
