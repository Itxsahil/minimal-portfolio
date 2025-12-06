"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { FourDotLabel } from "./fourdot";

const images = [
  "/india/5cmper.jpg",
  "/india/gow.jpg",
  "/india/yourname.jpg",
  "/india/mydd.jpg",
  "/india/rddobs.jpg",
];

export const IndiaLabel = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 12,
              scale: 1,
              transition: { type: "spring", stiffness: 220, damping: 22 },
            }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
          >
            {/* Bigger Tooltip Container */}
            <div
              className="relative w-[480px] h-[300px] bg-white dark:bg-zinc-900 
              border border-gray-300 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
              style={{
                clipPath:
                  "polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
              }}
            >
              {/* Image Cards Layout */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 p-3">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden shadow
                    ${idx === 0 ? "col-span-2 row-span-2" : ""}`}
                  >
                    <Image
                      src={src}
                      alt="India"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Tag */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[11px] rounded-full">
                Captured Memories
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FourDotLabel>India</FourDotLabel>
    </div>
  );
};
