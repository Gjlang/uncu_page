"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  RefObject,
  useState,
} from "react";
import { useAnimationFrame, motion } from "framer-motion";
import { Meteors } from "@/components/ui/meteors";

// ============= CONSTANTS =============
const SCROLL_THRESHOLD = 120; // px

// ============= MOUSE POSITION HOOK =============
type Position = { x: number; y: number };

const useMousePositionRef = <T extends HTMLElement | SVGElement>(
  containerRef?: RefObject<T | null>
) => {
  const positionRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      const el = containerRef?.current;

      if (el) {
        const rect = el.getBoundingClientRect();
        positionRef.current = {
          x: x - rect.left,
          y: y - rect.top,
        };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY);
    };

    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
    };

    const touchOptions: AddEventListenerOptions = { passive: true };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, touchOptions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove, touchOptions);
    };
  }, [containerRef]);

  return positionRef;
};

// ============= FLOATING CONTEXT =============
interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void;
  unregisterElement: (id: string) => void;
  phase: "enter" | "shown" | "exit" | "hidden";
}

const FloatingContext = createContext<FloatingContextType | null>(null);

// ============= FLOATING COMPONENT =============
interface FloatingProps {
  children: ReactNode;
  className?: string;
  sensitivity?: number;
  easingFactor?: number;
  phase: "enter" | "shown" | "exit" | "hidden";
}

function Floating({
  children,
  className,
  sensitivity = 1,
  easingFactor = 0.05,
  phase,
  ...props
}: FloatingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement;
        depth: number;
        currentPosition: { x: number; y: number };
      }
    >()
  );

  const mousePositionRef = useMousePositionRef(containerRef);

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      });
    },
    []
  );

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id);
  }, []);

  useAnimationFrame(() => {
    if (!containerRef.current) return;
    if (phase !== "shown") return;

    elementsMap.current.forEach((data) => {
      const strength = (data.depth * sensitivity) / 20;

      const newTargetX = mousePositionRef.current.x * strength;
      const newTargetY = mousePositionRef.current.y * strength;

      const dx = newTargetX - data.currentPosition.x;
      const dy = newTargetY - data.currentPosition.y;

      data.currentPosition.x += dx * easingFactor;
      data.currentPosition.y += dy * easingFactor;

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`;
    });
  });

  return (
    <FloatingContext.Provider
      value={{ registerElement, unregisterElement, phase }}
    >
      <div
        ref={containerRef}
        className={`absolute top-0 left-0 w-full h-full ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  );
}

// ============= FLOATING ELEMENT COMPONENT =============
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  finalPosition: string;
  index: number;
}

function FloatingElement({
  children,
  className,
  depth = 1,
  finalPosition,
  index,
}: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const context = useContext(FloatingContext);

  const rid = useId();
  const elementId = useMemo(() => `fe-${rid.replace(/:/g, "")}`, [rid]);

  useEffect(() => {
    if (!context) return;
    const el = elementRef.current;
    if (!el) return;

    context.registerElement(elementId, el, depth ?? 0.01);
    return () => context.unregisterElement(elementId);
  }, [context, elementId, depth]);

  if (!context) return null;
  const { phase } = context;

  // Spread direction - bikin "meledak" ke semua arah
  const angle = (index / 8) * Math.PI * 2;
  const spreadX = Math.cos(angle) * 420;
  const spreadY = Math.sin(angle) * 300;

  const collapsing = phase === "exit" || phase === "hidden";

  return (
    <motion.div
      className={`absolute ${finalPosition} ${className || ""}`}
      initial={{
        opacity: 0,
        scale: 0.75,
        filter: "blur(12px)",
        x: -spreadX,
        y: -spreadY,
      }}
      animate={
        collapsing
          ? {
              opacity: 0,
              scale: 0.75,
              filter: "blur(12px)",
              x: -spreadX,
              y: -spreadY,
              transition: { duration: 0.65, ease: [0.32, 0, 0.67, 0] },
            }
          : {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              x: 0,
              y: 0,
              transition: { duration: 1.0, ease: [0.19, 1, 0.22, 1] },
            }
      }
    >
      <div ref={elementRef} className="w-full h-full will-change-transform">
        {children}
      </div>
    </motion.div>
  );
}

type FloatingMedia = {
  type?: "image" | "video";
  url: string;
  position: string;
  size: string;
  depth: number;
  z: string;
  imgClassName?: string; // for image
  mediaClassName?: string; // for image/video
};

// ============= IMAGE DATA =============
const floatingImages: FloatingMedia[] = [
  {
    type: "image",
    url: "/images/logowhite.png",
    position: "top-[10%] left-[6%]",
    size: "w-28 h-28 md:w-36 md:h-36",
    depth: 0.5,
    z: "z-[1]",
  },

  // {
  //   url: "/images/vinyl.png",
  //   position: "top-[12%] left-[22%]",
  //   size: "w-24 h-24 md:w-28 md:h-28",
  //   depth: 1,
  //   z: "z-[1]",
  // },
  {
    url: "/images/logo-v2.png",
    position: "top-[11%] right-[6%]",
    size: "w-20 h-20 md:w-24 md:h-24",
    depth: 1,
    z: "z-[1]",
  },
  {
    type: "image",
    url: "/images/mice.png",
    position: "top-[37%] left-[10%]",
    size: "w-[380px] h-[650px]",
    depth: 1,
    z: "z-[1] animate-[floatSlow_6s_ease-in-out_infinite]",
  },

  // {
  //   type: "video",
  //   url: "/videos/skate.webm",
  //   position: "bottom-[14%] left-[12%]",
  //   size: "w-36 h-36 md:w-44 md:h-44",
  //   depth: 4,
  //   z: "z-[2]",
  // },
  // {
  //   type: "image",
  //   url: "/images/mice.png",
  //   position: "bottom-[12%] left-[48%]",
  //   size: "w-32 h-32 md:w-40 md:h-40",
  //   depth: 1,
  //   z: "z-[1] animate-[floatSlow_6s_ease-in-out_infinite]",
  // },

  {
    type: "video",
    url: "/videos/vinyl.webm",
    position: "bottom-[12%] right-[8%]",
    size: "w-[260px] h-[260px]",
    depth: 2,
    z: "z-[2]",
    mediaClassName: "object-contain scale-[1.35] origin-center",
  },

  {
    type: "image",
    url: "/images/goose.png",
    position: "top-[1%] right-[5%]",
    size: "w-[300px] h-[250px]",
    depth: 1.2,
    z: "z-[1] animate-[floatSlow_6s_ease-in-out_infinite]",
  },
];

// ============= FLOAT IMAGE COMPONENT =============
interface FloatMediaProps {
  src: string;
  type?: "image" | "video";
  className: string;
  mediaClassName?: string;
}

function FloatMedia({
  src,
  type = "image",
  className,
  mediaClassName,
}: FloatMediaProps) {
  return (
    <div className={className}>
      {type === "video" ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className={`block w-full h-full ${
            mediaClassName ?? "object-contain"
          }`}
        />
      ) : (
        <img
          src={src}
          alt=""
          className={`block w-full h-full ${
            mediaClassName ?? "object-contain"
          }`}
        />
      )}
    </div>
  );
}

// ============= PREVIEW COMPONENT (MAIN) =============
export default function Preview() {
  const [phase, setPhase] = useState<"enter" | "shown" | "exit" | "hidden">(
    "enter"
  );
  const [centerVisible, setCenterVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Clear timeout helper
  const clearT = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle initial burst animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setCenterVisible(true);
      setPhase("shown");
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll-based collapse/burst
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > SCROLL_THRESHOLD) {
        if (phase === "shown" || phase === "enter") {
          clearT();
          setPhase("exit");
          timeoutRef.current = window.setTimeout(() => setPhase("hidden"), 650);
        }
      } else {
        if (phase === "exit" || phase === "hidden") {
          clearT();
          setPhase("enter");
          timeoutRef.current = window.setTimeout(() => setPhase("shown"), 1100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearT();
    };
  }, [phase, clearT]);

  return (
    <div className="relative min-h-[200vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center relative">
        {/* METEORS BG */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <Meteors number={90} className="opacity-70" />
        </div>

        {/* TEXT CENTER */}
        <div
          className={`relative z-10 text-center space-y-6 items-center flex flex-col transition-all duration-900 ${
            centerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          {/* TITLE WRAPPER (ANCHOR) */}
          <div className="relative inline-block">
            {/* UFO ABOVE TITLE */}
            <motion.div
              className="absolute left-1/2 translate-x-[35%] -top-20 md:-top-28 z-20 pointer-events-none"
              initial={{ opacity: 1, y: 0, scale: 1.1 }}
              animate={
                phase === "exit" || phase === "hidden"
                  ? {
                      opacity: 0,
                      y: -22,
                      scale: 0.95,
                      transition: { duration: 0.55, ease: [0.32, 0, 0.67, 0] },
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1.15,
                      transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] },
                    }
              }
            >
              <img
                src="/images/ufo.png"
                alt=""
                className="w-56 h-56 md:w-72 md:h-72 object-contain"
              />
            </motion.div>

            {/* TITLE */}
            <p className="text-7xl md:text-9xl lg:text-[9.5rem] text-white font-semibold tracking-tight leading-[1.05]">
              Uncu Worklabs.
            </p>
          </div>

          <p className="text-base md:text-lg font-medium uppercase tracking-widest text-gray-300 max-w-2xl px-4">
            TUNING IDEAS FOR REAL RESULTS
          </p>
          <div className="flex gap-4 mt-8">
            <button className="text-sm bg-white text-black rounded-full px-8 py-3 hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 font-medium">
              Contact Us
            </button>
            <button className="text-sm border border-white/30 text-white rounded-full px-8 py-3 hover:scale-105 hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-medium">
              Discover More
            </button>
          </div>
        </div>

        {/* FLOATING LAYER */}
        <Floating
          sensitivity={-1}
          className="pointer-events-none"
          phase={phase}
        >
          {floatingImages.map((image, index) => (
            <FloatingElement
              key={index}
              depth={image.depth}
              className={image.z}
              finalPosition={image.position}
              index={index}
            >
              <FloatMedia
                src={image.url}
                type={image.type}
                className={image.size}
                mediaClassName={image.mediaClassName}
              />
            </FloatingElement>
          ))}
        </Floating>
      </div>
    </div>
  );
}

export { Floating, FloatingElement };
