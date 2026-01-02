import { RefObject, useEffect, useRef } from "react";

type Position = { x: number; y: number };

export const useMousePositionRef = <T extends HTMLElement | SVGElement>(
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

    // ✅ options disimpan biar konsisten
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
