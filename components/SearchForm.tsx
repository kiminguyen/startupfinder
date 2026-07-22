"use client";

import { BACKERS, BACKER_IDS } from "@/lib/backers";
import type { Backer, Facets, SearchFilters, Startup } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";
import { ResumeUpload } from "./ResumeUpload";
import { StartupCard } from "./StartupCard";

const EMPTY_FACETS: Facets = { roles: [], skills: [], industries: [] };

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  loading: boolean;
}

function buildParams(
  role: string,
  skill: string,
  industry: string,
  backers: Backer[],
  hiringOnly: boolean
): URLSearchParams {
  const params = new URLSearchParams();
  if (role) params.set("roles", role.toLowerCase());
  if (skill) params.set("skills", skill.toLowerCase());
  if (industry) params.set("industries", industry.toLowerCase());
  if (hiringOnly) params.set("hiring", "true");
  params.set("backers", (backers.length ? backers : BACKER_IDS).join(","));
  return params;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [role, setRole] = useState("");
  const [skill, setSkill] = useState("");
  const [industry, setIndustry] = useState("");
  const [backers, setBackers] = useState<Backer[]>(BACKER_IDS);
  const [hiringOnly, setHiringOnly] = useState(false);
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS);

  const backersKey = backers.join(",");

  function toggleBacker(id: Backer, checked: boolean) {
    setBackers((prev) =>
      checked ? [...prev, id] : prev.filter((b) => b !== id)
    );
  }

  // Refresh the available options whenever any filter changes, so each
  // dropdown only ever offers choices that would return results.
  useEffect(() => {
    let cancelled = false;
    const params = buildParams(role, skill, industry, backers, hiringOnly);
    fetch(`/api/facets?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : EMPTY_FACETS))
      .then((data: Facets) => {
        if (!cancelled) setFacets(data);
      })
      .catch(() => {
        if (!cancelled) setFacets(EMPTY_FACETS);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, skill, industry, backersKey, hiringOnly]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch({
        roles: role ? [role.toLowerCase()] : [],
        skills: skill ? [skill.toLowerCase()] : [],
        industries: industry ? [industry.toLowerCase()] : [],
        backers: backers.length > 0 ? backers : BACKER_IDS,
        hiringOnly,
      });
    },
    [role, skill, industry, backers, hiringOnly, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ResumeUpload
        onMatch={(m) => {
          if (m.role) setRole(m.role);
          if (m.skill) setSkill(m.skill);
          if (m.industry) setIndustry(m.industry);
        }}
      />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="font-mono">or set filters</span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Dropdown
          label="Roles"
          placeholder="Any role — type or pick"
          options={facets.roles}
          value={role}
          onChange={setRole}
        />
        <Dropdown
          label="Skills"
          placeholder="Any skill — type or pick"
          options={facets.skills}
          value={skill}
          onChange={setSkill}
        />
        <Dropdown
          label="Industries or fields"
          placeholder="Any field — type or pick"
          options={facets.industries}
          value={industry}
          onChange={setIndustry}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {BACKERS.map((b) => (
          <Checkbox
            key={b.id}
            label={b.label}
            checked={backers.includes(b.id)}
            onChange={(checked) => toggleBacker(b.id, checked)}
          />
        ))}
        <span className="mx-1 hidden h-4 w-px bg-stone-300 sm:block" />
        <Checkbox
          label="Hiring only"
          checked={hiringOnly}
          onChange={setHiringOnly}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="glow-btn w-full rounded-full bg-gradient-to-r from-[#f6a256] to-[#f5c15a] px-7 py-3 text-sm font-medium text-stone-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Searching…" : "Find startups"}
      </button>
    </form>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-stone-300 bg-white text-orange-500 accent-orange-500 focus:ring-orange-400/30"
      />
      {label}
    </label>
  );
}

interface ResultsProps {
  startups: Startup[];
  total: number;
  loading: boolean;
  searched: boolean;
  hiringActive: boolean;
  roleQuery: string;
}

export function Results({
  startups,
  total,
  loading,
  searched,
  hiringActive,
  roleQuery,
}: ResultsProps) {
  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-stone-500">
        Loading startups from YC, a16z, USV, and Bessemer…
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/40 px-6 py-14 text-center">
        <p className="text-stone-500">
          Enter your interests above and hit{" "}
          <span className="font-medium text-stone-700">Find startups</span> to
          discover companies from YC, a16z, USV, and Bessemer to reach out to.
        </p>
      </div>
    );
  }

  if (startups.length === 0) {
    return (
      <div className="rounded-[28px] border border-stone-200 bg-white/60 px-6 py-14 text-center">
        <p className="font-medium text-stone-700">No matches found</p>
        <p className="mt-2 text-sm text-stone-500">
          Try broader terms — e.g. &quot;AI&quot; instead of a specific role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-stone-500">
        Showing {startups.length}
        {total > startups.length ? ` of ${total}` : ""} startups
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {startups.map((startup) => (
          <li key={startup.id}>
            <StartupCard
              startup={startup}
              showJobsLink={hiringActive}
              roleQuery={roleQuery}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
