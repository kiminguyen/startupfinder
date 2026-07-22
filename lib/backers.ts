import type { Backer } from "./types";

export interface BackerMeta {
  id: Backer;
  /** Full name for the filter checkbox. */
  label: string;
  /** Short label for the result-card badge. */
  short: string;
  /** Tailwind classes for the badge pill. */
  badgeClass: string;
  /** One-line description shown in the hover tooltip. */
  blurb: string;
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
    blurb:
      "Y Combinator — the seed-stage accelerator behind Airbnb, Stripe, and Dropbox. Funds startups in twice-yearly batches.",
  },
  {
    id: "a16z",
    label: "a16z",
    short: "a16z",
    badgeClass: "bg-violet-100 text-violet-700",
    blurb:
      "Andreessen Horowitz — a leading Silicon Valley VC (founded 2009) backing software, crypto, fintech, and bio startups.",
  },
  {
    id: "usv",
    label: "Union Square",
    short: "USV",
    badgeClass: "bg-sky-100 text-sky-700",
    blurb:
      "Union Square Ventures — a New York early-stage firm known for network-driven companies like Twitter, Etsy, and Coinbase.",
  },
  {
    id: "bessemer",
    label: "Bessemer",
    short: "BVP",
    badgeClass: "bg-teal-100 text-teal-700",
    blurb:
      "Bessemer Venture Partners — one of the oldest U.S. VC firms and an early backer of cloud/SaaS leaders like Shopify and Twilio.",
  },
];

export const BACKER_IDS: Backer[] = BACKERS.map((b) => b.id);

export function isBacker(value: string): value is Backer {
  return (BACKER_IDS as string[]).includes(value);
}
