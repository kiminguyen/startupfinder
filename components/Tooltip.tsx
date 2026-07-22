"use client";

import { useRef, useState } from "react";

interface TooltipState {
  x: number;
  y: number;
  below: boolean;
}

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<TooltipState | null>(null);

  function show() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Flip below the trigger when there isn't room above it.
    const below = rect.top < 140;
    // Keep the (230px-wide) tooltip within the viewport horizontally.
    const half = 119;
    const x = Math.min(
      Math.max(rect.left + rect.width / 2, half + 4),
      window.innerWidth - half - 4
    );
    setPos({ x, y: below ? rect.bottom + 8 : rect.top - 8, below });
  }

  function hide() {
    setPos(null);
  }

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      className="inline-flex outline-none"
    >
      {children}
      {pos && (
        <span
          role="tooltip"
          className={`pointer-events-none fixed z-[9998] w-[230px] -translate-x-1/2 rounded-lg bg-stone-900/95 px-3 py-2 text-[11px] leading-snug text-stone-100 shadow-xl backdrop-blur ${
            pos.below ? "" : "-translate-y-full"
          }`}
          style={{ left: pos.x, top: pos.y }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
