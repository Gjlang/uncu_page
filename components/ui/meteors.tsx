"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

// deterministic 0..1 (pure)
function rand01(seed: number) {
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}

export const Meteors = ({
  number = 24,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = Array.from({ length: number }, (_, idx) => {
    const rTop = rand01(idx * 99991 + 17); // 0..1
    const rLeft = rand01(idx * 7919 + 101); // 0..1
    const rDelay = rand01(idx * 104729 + 7); // 0..1
    const rDur = rand01(idx * 15485863 + 3); // 0..1

    // full page distribution
    const top = `${rTop * 100}%`;
    const left = `${rLeft * 100}%`;

    // timing
    const delay = `${rDelay * 5}s`; // 0..5s
    const duration = `${3 + rDur * 3}s`; // 3..6s

    // size + tail length (optional)
    const tail = `${30 + rand01(idx * 97 + 11) * 70}px`; // 30..100px

    return { top, left, delay, duration, tail };
  });

  return (
    <motion.div
      className={cn("absolute inset-0 pointer-events-none", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {meteors.map((m, idx) => (
        <span
          key={`meteor-${idx}`}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-400/80 shadow-[0_0_0_1px_#ffffff10]"
          )}
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          {/* tail */}
          <span
            className="absolute top-1/2 h-[1px] -translate-y-1/2 bg-gradient-to-r from-slate-400/70 to-transparent"
            style={{ width: m.tail }}
          />
        </span>
      ))}
    </motion.div>
  );
};
