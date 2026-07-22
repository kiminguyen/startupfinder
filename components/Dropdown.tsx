"use client";

import type { FacetOption } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

interface DropdownProps {
  label: string;
  placeholder: string;
  options: FacetOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Dropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  function select(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[active]) select(filtered[active].value);
      else setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-stone-500">
        {label}
      </span>

      <div
        className="glow-field flex items-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-3.5 py-2.5"
        data-open={open}
      >
        <input
          type="text"
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value ? value : placeholder}
          className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />

        {value && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
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

        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`size-4 shrink-0 text-stone-400 transition-transform duration-300 ${
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
      </div>

      {open && (
        <ul className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-stone-200 bg-white/95 p-1 shadow-xl shadow-orange-900/5 backdrop-blur">
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-stone-400">
              No matching options
            </li>
          )}
          {filtered.map((option, i) => (
            <li key={option.value}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => select(option.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  i === active
                    ? "bg-orange-50 text-stone-900"
                    : "text-stone-600"
                } ${option.value === value ? "font-medium text-orange-700" : ""}`}
              >
                <span className="truncate">{option.value}</span>
                {typeof option.count === "number" && (
                  <span className="shrink-0 font-mono text-[10px] text-stone-400">
                    {option.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
