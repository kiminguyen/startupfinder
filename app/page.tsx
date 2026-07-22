"use client";

import { Results, SearchForm } from "@/components/SearchForm";
import type { SearchFilters, Startup } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function filtersToParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.roles.length) params.set("roles", filters.roles.join(","));
  if (filters.skills.length) params.set("skills", filters.skills.join(","));
  if (filters.industries.length)
    params.set("industries", filters.industries.join(","));
  if (filters.hiringOnly) params.set("hiring", "true");
  params.set("backers", filters.backers.join(","));
  return params;
}

export default function Home() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const [hiringActive, setHiringActive] = useState(false);
  const [roleQuery, setRoleQuery] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US"));
  }, []);

  const handleSearch = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setHiringActive(filters.hiringOnly);
    setRoleQuery(filters.roles[0] ?? filters.skills[0] ?? "");

    try {
      const params = filtersToParams(filters);
      const res = await fetch(`/api/startups?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setStartups(data.results);
      setTotal(data.total);
    } catch {
      setError("Something went wrong. Please try again.");
      setStartups([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#ece8e0] text-stone-900">
      {/* Ambient background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-a absolute -top-24 left-8 size-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="animate-float-b absolute top-1/2 -right-24 size-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 size-64 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 size-40 rounded-full border border-orange-300/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="overflow-hidden rounded-[28px] shadow-sm ring-1 ring-black/5">
          <div className="sunset-sky relative overflow-hidden px-7 py-14 sm:px-10 sm:py-20">
            {/* Hero decorative shapes */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-8 -top-10 size-52 rounded-full bg-amber-100/40 blur-2xl" />
              <div className="animate-float-a absolute right-24 top-12 size-20 rounded-full bg-white/30 blur-xl" />
              <Sunburst className="animate-spin-slow absolute right-8 top-8 size-16 text-white/60 sm:size-20" />
              <div className="absolute -bottom-12 -left-10 size-44 rounded-full border border-white/25" />
              <div className="absolute bottom-8 left-1/2 size-3 rounded-full bg-white/50" />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-800">
                  Startup Finder
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-orange-500" />
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  <span className="size-1.5 rounded-full bg-violet-400" />
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-stone-700/80">
                {today}
              </span>
            </div>

            <div className="relative z-10">
              <h1 className="mt-7 text-4xl font-light leading-[1.1] tracking-tight text-stone-900 sm:whitespace-nowrap sm:text-5xl">
                Find the startup that's right for you.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-800/80">
                Search by role, skill, and industry across startups backed by Y
                Combinator and more, then reach out directly.

              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[28px] border border-stone-200/80 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </section>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8">
          <Results
            startups={startups}
            total={total}
            loading={loading}
            searched={searched}
            hiringActive={hiringActive}
            roleQuery={roleQuery}
          />
        </div>
      </div>
    </div>
  );
}

function Sunburst({ className }: { className?: string }) {
  const rays = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="14" fill="currentColor" opacity="0.5" />
      {rays.map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
    </svg>
  );
}
