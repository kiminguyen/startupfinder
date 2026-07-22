import type { Backer } from "./types";

export interface BackerMeta {
  id: Backer;
  /** Full name for the filter checkbox. */
  label: string;
  /** Short label for the result-card badge. */
  short: string;
  /** Tailwind classes for the badge pill. */
  badgeClass: string;
}

// Central registry of the venture firms we source startups from. Add a new
// firm here (plus a source adapter in lib/data.ts) and it flows through the
// filters, badges, and search automatically.
export const BACKERS: BackerMeta[] = [
  {
    id: "yc",
    label: "Y Combinator",
    short: "YC",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  {
    id: "a16z",
    label: "a16z",
    short: "a16z",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  {
    id: "usv",
    label: "Union Square",
    short: "USV",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "bessemer",
    label: "Bessemer",
    short: "BVP",
    badgeClass: "bg-teal-100 text-teal-700",
  },
];

export const BACKER_IDS: Backer[] = BACKERS.map((b) => b.id);

export function isBacker(value: string): value is Backer {
  return (BACKER_IDS as string[]).includes(value);
}
