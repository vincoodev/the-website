"use client";

import { useEffect, useRef } from "react";

export default function DelayCursor({ delay = 0.12 }) {
  const cursorRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const ghost = useRef({ x: 0, y: 0 });
  const started = useRef(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    document.body.style.cursor = "none";

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      // set awal supaya tidak mulai dari (0,0)
      if (!started.current) {
        started.current = true;
        ghost.current.x = e.clientX;
        ghost.current.y = e.clientY;

        if (cursorRef.current) {
          cursorRef.current.style.transform =
            `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      if (started.current) {
        ghost.current.x += (target.current.x - ghost.current.x) * delay;
        ghost.current.y += (target.current.y - ghost.current.y) * delay;

        if (cursorRef.current) {
          cursorRef.current.style.transform =
            `translate3d(${ghost.current.x}px, ${ghost.current.y}px, 0) translate(-50%, -50%)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "default";
    };
  }, [delay]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: "2px solid #ff4d4d",
        background: "rgba(255,77,77,0.12)",
        pointerEvents: "none",
        zIndex: 999999,
        willChange: "transform",
      }}
    />
  );
}
