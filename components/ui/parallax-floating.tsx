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

  /**
   * PENTING:
   * - Jangan set top/left via framer motion (biar Tailwind finalPosition kepakai)
   * - Motion cuma mainkan translate/opacity/scale
   * - Start dari tengah = kasih translate offset besar, lalu animate ke 0
   */

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

// ============= IMAGE DATA (dengan safe positioning) =============
const floatingImages = [
  {
    url: "https://images.unsplash.com/photo-1727341554370-80e0fe9ad082?q=80&w=2276&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "top-[10%] left-[6%]",
    size: "w-20 h-20 md:w-24 md:h-24",
    depth: 0.5,
    z: "z-[1]",
  },
  {
    url: "https://images.unsplash.com/photo-1640680608781-2e4199dd1579?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "top-[12%] left-[22%]",
    size: "w-24 h-32 md:w-28 md:h-36",
    depth: 1,
    z: "z-[1]",
  },
  {
    url: "https://images.unsplash.com/photo-1726083085160-feeb4e1e5b00?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "top-[8%] left-[48%]",
    size: "w-28 h-40 md:w-36 md:h-48",
    depth: 2,
    z: "z-[2]",
  },
  {
    url: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?q=80&w=2838&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "top-[11%] right-[6%]",
    size: "w-20 h-20 md:w-24 md:h-24",
    depth: 1,
    z: "z-[1]",
  },
  {
    url: "https://images.unsplash.com/photo-1624344965199-ed40391d20f2?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "top-[48%] left-[4%]",
    size: "w-24 h-28 md:w-32 md:h-36",
    depth: 1,
    z: "z-[1]",
  },
  {
    url: "https://images.unsplash.com/photo-1689553079282-45df1b35741b?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "bottom-[14%] left-[12%]",
    size: "w-36 h-36 md:w-44 md:h-44",
    depth: 4,
    z: "z-[2]",
  },
  {
    url: "https://images.unsplash.com/photo-1721968317938-cf8c60fccd1a?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "bottom-[16%] left-[48%]",
    size: "w-28 h-24 md:w-36 md:h-32",
    depth: 1,
    z: "z-[1]",
  },
  {
    url: "https://images.unsplash.com/photo-1677338354108-223e807fb1bd?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3",
    position: "bottom-[12%] right-[8%]",
    size: "w-32 h-40 md:w-40 md:h-48",
    depth: 2,
    z: "z-[2]",
  },
];

// ============= FLOAT IMAGE COMPONENT =============
interface FloatImgProps {
  src: string;
  className: string;
}

function FloatImg({ src, className }: FloatImgProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 ${className}`}
    >
      <img src={src} alt="" className="block w-full h-full object-cover" />
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
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* TEXT CENTER */}
        <div
          className={`relative z-10 text-center space-y-4 items-center flex flex-col transition-all duration-900 ${
            centerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <p className="text-6xl md:text-8xl text-white italic tracking-tight">
            Uncu Wokrlabs.
          </p>
          <button className="text-sm bg-white text-black rounded-full px-6 py-2 hover:scale-105 transition-transform">
            Download
          </button>
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
              <FloatImg src={image.url} className={image.size} />
            </FloatingElement>
          ))}
        </Floating>

        {/* vignette biar aesthetic */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.9)_70%)]" />
      </div>
    </div>
  );
}

export { Floating, FloatingElement };
