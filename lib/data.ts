import type { A16zCompany, Backer, Startup, YCCompany } from "./types";

const YC_API = "https://yc-oss.github.io/api/companies/all.json";
const A16Z_PORTFOLIO = "https://a16z.com/portfolio/";
const USV_COMPANIES = "https://www.usv.com/companies/";
const BVP_PORTFOLIO = "https://www.bvp.com/portfolio";

let cache: { startups: Startup[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function normalizeDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`)
      .hostname;
    return hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const SOCIAL_HOSTS =
  /twitter\.com|x\.com|linkedin\.com|facebook\.com|instagram\.com|youtube\.com|mastodon|github\.com|medium\.com/i;

// Pull the most recent 4-digit year (1900–2099) out of a string, e.g.
// "Winter 2017" -> 2017, "Series A, 2026" -> 2026.
function parseYear(value?: string | null): number | undefined {
  if (!value) return undefined;
  const years = [...value.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) =>
    Number(m[0])
  );
  return years.length ? Math.max(...years) : undefined;
}

/* ----------------------------- Y Combinator ----------------------------- */

function ycToStartup(company: YCCompany): Startup {
  return {
    id: `yc-${company.id}`,
    name: company.name,
    description:
      company.one_liner ||
      company.long_description?.slice(0, 200) ||
      "No description available",
    website: company.website ?? undefined,
    logo: company.small_logo_thumb_url,
    location: company.all_locations ?? undefined,
    industry: company.subindustry || company.industry,
    tags: company.tags ?? [],
    backers: ["yc"],
    isHiring: company.isHiring ?? false,
    teamSize: company.team_size ?? undefined,
    batch: company.batch,
    status: company.status,
    ycUrl: company.url,
    roundYear: parseYear(company.batch),
  };
}

async function fetchYCSource(): Promise<Startup[]> {
  const res = await fetch(YC_API, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch YC company data");
  const companies = (await res.json()) as YCCompany[];
  return companies
    .filter((c) => c.status === "Active")
    .map((c) => ycToStartup(c));
}

/* --------------------------------- a16z --------------------------------- */

function parseA16zCompanies(html: string): A16zCompany[] {
  const match = html.match(
    /window\.a16z_portfolio_companies\s*=\s*(\[[\s\S]*?\]);/
  );
  if (!match) return [];
  try {
    return JSON.parse(match[1]) as A16zCompany[];
  } catch {
    return [];
  }
}

function a16zToStartup(company: A16zCompany): Startup | null {
  const description =
    company.overview || company.announcement?.excerpt || "a16z portfolio company";

  // Focus on early-stage a16z bets where cold outreach is most realistic.
  const stages = company.stages ?? [];
  const isEarlyStage = stages.some((s) =>
    ["Seed", "Venture", "seed", "venture"].includes(s)
  );
  if (stages.length > 0 && !isEarlyStage) return null;

  return {
    id: `a16z-${company.id}`,
    name: company.title,
    description,
    website: company.web,
    logo: company.logo,
    tags: stages,
    backers: ["a16z"],
    isHiring: false,
    stages,
  };
}

async function fetchA16zSource(): Promise<Startup[]> {
  const res = await fetch(A16Z_PORTFOLIO, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch a16z portfolio data");
  const html = await res.text();
  return parseA16zCompanies(html)
    .map((c) => a16zToStartup(c))
    .filter((s): s is Startup => s !== null);
}

/* -------------------------- Union Square Ventures ------------------------ */
// USV renders a server-side company list; each desktop row links out to the
// company site via <a target="_blank"> with the stage and an excerpt nearby.

function parseUSV(html: string): Startup[] {
  const anchor = /<a href="(https?:\/\/[^"]+)" target="_blank">([^<]+)<\/a>/g;
  const out: Startup[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = anchor.exec(html))) {
    const website = m[1];
    const name = decodeEntities(m[2]);
    if (/usv\.com/i.test(website) || SOCIAL_HOSTS.test(website)) continue;
    if (!name || name.length > 60) continue;

    const key = normalizeDomain(website) ?? normalizeName(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const tail = html.slice(m.index, m.index + 1400);
    const stage = tail.match(/>\s*([A-Za-z][\w\s.+-]*,\s*\d{4})\s*</)?.[1];
    const excerpt = tail.match(
      /m__list-row__excerpt">\s*([^<]+?)\s*<\/div>/
    )?.[1];

    out.push({
      id: `usv-${key}`,
      name,
      description: excerpt ? decodeEntities(excerpt) : "USV portfolio company",
      website,
      tags: [],
      backers: ["usv"],
      isHiring: false,
      stages: stage ? [decodeEntities(stage)] : undefined,
      roundYear: parseYear(stage),
    });
  }
  return out;
}

async function fetchUSVSource(): Promise<Startup[]> {
  const res = await fetch(USV_COMPANIES, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch USV portfolio data");
  return parseUSV(await res.text());
}

/* ------------------------------- Bessemer ------------------------------- */
// Bessemer renders each company as an <article class="box investment ...">
// block containing the name, an outbound "Visit Website" link, an intro
// paragraph, and roadmap (category) tags.

function parseBessemer(html: string): Startup[] {
  const blocks = html.split(/<article class="box investment/).slice(1);
  const out: Startup[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const nameMatch = block.match(/class="name click-to-open">([^<]+)<\/a>/);
    if (!nameMatch) continue;
    const name = decodeEntities(nameMatch[1]);
    if (!name) continue;

    const website = block.match(
      /href="(https?:\/\/[^"]+)"[^>]*>\s*Visit Website/i
    )?.[1];
    const intro = block.match(/<div class="intro">\s*<p>([\s\S]*?)<\/p>/)?.[1];
    const tags = [...block.matchAll(/class="roadmap"[^>]*>([^<]+)<\/a>/g)].map(
      (t) => decodeEntities(t[1])
    );

    // Year Bessemer partnered with the company (fallback: founded year).
    const partnered = block.match(/Partnered[\s\S]{0,60}?\b((?:19|20)\d{2})\b/i);
    const founded = block.match(/Founded[\s\S]{0,60}?\b((?:19|20)\d{2})\b/i);
    const roundYear = partnered
      ? Number(partnered[1])
      : founded
        ? Number(founded[1])
        : undefined;

    const key = normalizeDomain(website) ?? normalizeName(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    out.push({
      id: `bessemer-${key}`,
      name,
      description: intro ? decodeEntities(intro) : "Bessemer portfolio company",
      website,
      tags: Array.from(new Set(tags)),
      backers: ["bessemer"],
      isHiring: false,
      roundYear,
    });
  }
  return out;
}

async function fetchBessemerSource(): Promise<Startup[]> {
  const res = await fetch(BVP_PORTFOLIO, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch Bessemer portfolio data");
  return parseBessemer(await res.text());
}

/* -------------------------------- Merge --------------------------------- */

// Combine records from every source, de-duplicating by domain (falling back to
// a normalized name). A company backed by several firms keeps all its badges,
// and richer fields from the first source (YC) win.
function mergeStartups(lists: Startup[][]): Startup[] {
  const byKey = new Map<string, Startup>();

  for (const list of lists) {
    for (const s of list) {
      const key = normalizeDomain(s.website) ?? normalizeName(s.name);
      if (!key) continue;

      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...s, backers: [...s.backers], tags: [...s.tags] });
        continue;
      }

      for (const b of s.backers) {
        if (!existing.backers.includes(b)) existing.backers.push(b);
      }
      existing.isHiring = existing.isHiring || s.isHiring;
      existing.website ??= s.website;
      existing.logo ??= s.logo;
      existing.location ??= s.location;
      existing.industry ??= s.industry;
      existing.teamSize ??= s.teamSize;
      existing.batch ??= s.batch;
      existing.ycUrl ??= s.ycUrl;
      if (!existing.description || existing.description === "No description available") {
        existing.description = s.description;
      }
      existing.tags = Array.from(new Set([...existing.tags, ...s.tags]));
      if (s.stages?.length) {
        existing.stages = Array.from(
          new Set([...(existing.stages ?? []), ...s.stages])
        );
      }
      if (s.roundYear && (!existing.roundYear || s.roundYear > existing.roundYear)) {
        existing.roundYear = s.roundYear;
      }
    }
  }

  return [...byKey.values()];
}

/* ------------------------------ Public API ------------------------------ */

export async function fetchStartups(): Promise<Startup[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.startups;
  }

  // YC first so its richer fields win on merge conflicts. Each source is
  // best-effort: a firm whose site changes/breaks is skipped, not fatal.
  const sources = [
    fetchYCSource,
    fetchA16zSource,
    fetchUSVSource,
    fetchBessemerSource,
  ];
  const settled = await Promise.allSettled(sources.map((fn) => fn()));

  const lists: Startup[][] = [];
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") lists.push(result.value);
    else console.error(`Startup source #${i} failed:`, result.reason);
  });

  if (lists.length === 0) {
    throw new Error("All startup sources failed");
  }

  const startups = interleaveByFirm(mergeStartups(lists));

  cache = { startups, fetchedAt: Date.now() };
  return startups;
}

// Newest round/batch year first; no known year sorts last. Ties break on
// multi-firm-backed, then hiring, then name.
function byNewest(a: Startup, b: Startup): number {
  const yearA = a.roundYear ?? -Infinity;
  const yearB = b.roundYear ?? -Infinity;
  if (yearA !== yearB) return yearB - yearA;

  const score = (s: Startup) => s.backers.length * 2 + (s.isHiring ? 1 : 0);
  const diff = score(b) - score(a);
  return diff !== 0 ? diff : a.name.localeCompare(b.name);
}

/**
 * YC publishes current batches while the other firms' date signals are older
 * (or missing), so a straight newest-first sort buries every non-YC company.
 * Instead, bucket companies by firm — favouring the smaller sources so
 * co-backed companies keep them visible — sort each bucket newest-first, then
 * round-robin across buckets. Any page of results shows a mix of all four.
 */
function interleaveByFirm(startups: Startup[]): Startup[] {
  const order: Backer[] = ["yc", "a16z", "usv", "bessemer"];
  // Smallest sources first, so a YC+USV company counts toward USV.
  const assignPriority: Backer[] = ["usv", "bessemer", "a16z", "yc"];

  const buckets = new Map<Backer, Startup[]>(order.map((b) => [b, []]));
  for (const s of startups) {
    const primary = assignPriority.find((b) => s.backers.includes(b)) ?? "yc";
    buckets.get(primary)!.push(s);
  }
  for (const list of buckets.values()) list.sort(byNewest);

  const out: Startup[] = [];
  for (let i = 0; ; i++) {
    let addedAny = false;
    for (const firm of order) {
      const list = buckets.get(firm)!;
      if (i < list.length) {
        out.push(list[i]);
        addedAny = true;
      }
    }
    if (!addedAny) break;
  }
  return out;
}
