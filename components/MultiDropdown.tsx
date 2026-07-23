"use client";

import type { FacetOption } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface MultiDropdownProps {
  label: string;
  placeholder: string;
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function MultiDropdown({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: MultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length <= 3
        ? [...selected].sort((a, b) => Number(b) - Number(a)).join(", ")
        : `${selected.length} selected`;

  return (
    <div className="relative" ref={rootRef}>
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-stone-500">
        {label}
      </span>

      <div
        className="glow-field flex items-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-3.5 py-2.5"
        data-open={open}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 truncate text-left text-sm outline-none"
        >
          <span className={selected.length ? "text-stone-900" : "text-stone-400"}>
            {summary}
          </span>
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            aria-label="Clear years"
            onClick={() => onChange([])}
            className="grid size-5 shrink-0 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-3.5">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle years"
          className="shrink-0"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className={`size-4 text-stone-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <ul className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-stone-200 bg-white/95 p-1 shadow-xl shadow-orange-900/5 backdrop-blur">
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-stone-400">No years</li>
          )}
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isSelected ? "bg-orange-50 text-stone-900" : "text-stone-600"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`grid size-4 place-items-center rounded border transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 20 20" fill="none" className="size-3">
                          <path
                            d="M4 10l4 4 8-8"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {option.value}
                  </span>
                  {typeof option.count === "number" && (
                    <span className="shrink-0 font-mono text-[10px] text-stone-400">
                      {option.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
