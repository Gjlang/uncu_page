"use client";

import * as React from "react";
import { HTMLMotionProps, MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TextStaggerHoverProps {
  text: string;
  index: number;
}

interface HoverSliderImageProps {
  index: number;
  imageUrl: string;
}

type HoverSliderProps = {
  children?: React.ReactNode;
};

interface HoverSliderContextValue {
  activeSlide: number;
  changeSlide: (index: number) => void;
}

function splitText(text: string) {
  const words = text.split(" ").map((word) => word.concat(" "));
  const characters = words.map((word) => word.split("")).flat(1);

  return {
    words,
    characters,
  };
}

const HoverSliderContext = React.createContext<
  HoverSliderContextValue | undefined
>(undefined);

function useHoverSliderContext() {
  const context = React.useContext(HoverSliderContext);
  if (context === undefined) {
    throw new Error(
      "useHoverSliderContext must be used within a HoverSliderProvider"
    );
  }
  return context;
}

export const HoverSlider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & HoverSliderProps
>(({ children, className, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState<number>(0);
  const changeSlide = React.useCallback(
    (index: number) => setActiveSlide(index),
    [setActiveSlide]
  );
  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </HoverSliderContext.Provider>
  );
});
HoverSlider.displayName = "HoverSlider";

const WordStaggerHover = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("relative inline-block origin-bottom overflow-hidden")}
      {...props}
    >
      {children}
    </span>
  );
});
WordStaggerHover.displayName = "WordStaggerHover";

export const TextStaggerHover = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & TextStaggerHoverProps
>(({ text, index, children, className, ...props }, ref) => {
  const { activeSlide, changeSlide } = useHoverSliderContext();
  const { characters } = splitText(text);
  const isActive = activeSlide === index;
  const handleMouse = () => changeSlide(index);

  return (
    <span
      className={cn(
        "relative inline-block origin-bottom overflow-hidden cursor-pointer transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-40 hover:opacity-70",
        className
      )}
      {...props}
      ref={ref}
      onMouseEnter={handleMouse}
    >
      {characters.map((char, charIndex) => (
        <span
          key={`${char}-${charIndex}`}
          className="relative inline-block overflow-hidden"
        >
          <MotionConfig
            transition={{
              delay: charIndex * 0.02,
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <motion.span
              className="inline-block"
              initial={{ y: "0%" }}
              animate={isActive ? { y: "-120%" } : { y: "0%" }}
            >
              {char}
              {char === " " && charIndex < characters.length - 1 && <>&nbsp;</>}
            </motion.span>

            <motion.span
              className="absolute left-0 top-0 inline-block"
              initial={{ y: "120%" }}
              animate={isActive ? { y: "0%" } : { y: "120%" }}
            >
              {char}
            </motion.span>
          </MotionConfig>
        </span>
      ))}
    </span>
  );
});
TextStaggerHover.displayName = "TextStaggerHover";

export const clipPathVariants = {
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    opacity: 1,
    scale: 1,
  },
  hidden: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    opacity: 0,
    scale: 1.05,
  },
};

export const HoverSliderImageWrap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid overflow-hidden [&>*]:col-start-1 [&>*]:col-end-1 [&>*]:row-start-1 [&>*]:row-end-1 [&>*]:size-full",
        className
      )}
      {...props}
    />
  );
});
HoverSliderImageWrap.displayName = "HoverSliderImageWrap";

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<"img"> & HoverSliderImageProps
>(({ index, imageUrl, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext();

  return (
    <motion.img
      ref={ref}
      src={imageUrl}
      className={cn("inline-block align-middle", className)}
      transition={{
        ease: [0.34, 1.56, 0.64, 1],
        duration: 0.9,
        opacity: { duration: 0.5 },
      }}
      variants={clipPathVariants}
      initial="hidden"
      animate={activeSlide === index ? "visible" : "hidden"}
      {...props}
    />
  );
});

HoverSliderImage.displayName = "HoverSliderImage";

// ✅ IMPROVED: Complete Section Component with better spacing and smooth animations
export function AnimatedSlideshowSection() {
  return (
    <section className="relative w-full bg-black py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header with fade-in animation */}
        <motion.div
          className="text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <h3 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
            Inside the Labs.
          </h3>
          <p className="mt-4 text-white/50 text-sm md:text-base tracking-wider uppercase">
            Explore Our Capabilities
          </p>
        </motion.div>

        {/* Main slider content */}
        <HoverSlider className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* LEFT: hover text */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <div className="space-y-6 text-3xl md:text-4xl lg:text-5xl font-bold">
              <TextStaggerHover
                index={0}
                text="Brand Strategy"
                className="block"
              />
              <TextStaggerHover
                index={1}
                text="UI/UX Design"
                className="block"
              />
              <TextStaggerHover
                index={2}
                text="Web Development"
                className="block"
              />
              <TextStaggerHover
                index={3}
                text="Content & Marketing"
                className="block"
              />
            </div>
          </motion.div>

          {/* RIGHT: slideshow images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <HoverSliderImageWrap className="aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 overflow-hidden shadow-2xl shadow-white/5 backdrop-blur-sm">
              <HoverSliderImage
                index={0}
                imageUrl="/images/vinyl.png"
                alt="Application Development"
                className="w-full h-full object-cover"
              />
              <HoverSliderImage
                index={1}
                imageUrl="/images/goose.png"
                alt="AI Solutions"
                className="w-full h-full object-cover"
              />
              <HoverSliderImage
                index={2}
                imageUrl="/images/mice.png"
                alt="Web Development"
                className="w-full h-full object-cover"
              />
              <HoverSliderImage
                index={3}
                imageUrl="/images/octopus.png"
                alt="System Development"
                className="w-full h-full object-cover"
              />
            </HoverSliderImageWrap>
          </motion.div>
        </HoverSlider>
      </div>
    </section>
  );
}
