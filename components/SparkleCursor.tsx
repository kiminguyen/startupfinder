"use client";

import { useEffect, useRef } from "react";

export function SparkleCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on devices with a precise pointer (mouse / trackpad).
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let lastEmit = 0;

    // Spawn a small sparkle at (x, y) that falls and fades, then removes itself.
    function emit(x: number, y: number) {
      const trail = trailRef.current;
      if (!trail) return;
      const spark = document.createElement("span");
      spark.className = "cursor-spark";
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 22}px`);
      spark.style.setProperty("--dy", `${34 + Math.random() * 48}px`);
      spark.style.setProperty("--rot", `${(Math.random() * 2 - 1) * 140}deg`);
      spark.style.setProperty("--s", (0.55 + Math.random() * 0.7).toFixed(2));
      trail.appendChild(spark);
      window.setTimeout(() => spark.remove(), 1300);
    }

    function move(e: MouseEvent) {
      root.classList.add("sparkle-active");
      el!.style.opacity = "1";
      el!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (!reduceMotion) {
        const now = performance.now();
        if (now - lastEmit > 70) {
          lastEmit = now;
          emit(e.clientX, e.clientY);
        }
      }
    }
    function hide() {
      el!.style.opacity = "0";
    }
    function down() {
      el!.classList.add("sparkle-click");
    }
    function up() {
      el!.classList.remove("sparkle-click");
    }

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      root.classList.remove("sparkle-active");
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      />
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 will-change-transform"
        style={{ transform: "translate(-100px, -100px)" }}
      >
      <div className="sparkle-cursor relative -translate-x-1/2 -translate-y-1/2">
        <span className="sparkle-aura" />
        <svg
          className="sparkle-star relative"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"
            fill="url(#sparkleGrad)"
          />
          <defs>
            <linearGradient id="sparkleGrad" x1="2" y1="2" x2="22" y2="22">
              <stop stopColor="#fde3b8" />
              <stop offset="0.55" stopColor="#f6a256" />
              <stop offset="1" stopColor="#f5c15a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      </div>
    </>
  );
}
