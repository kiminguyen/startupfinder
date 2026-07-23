import { BACKER_IDS, isBacker } from "./backers";
import { CURATED_ROLES, ROLE_KEYWORDS } from "./roles";
import type { Facets, FacetOption, SearchFilters, Startup } from "./types";

// Expand selected role labels into their mapped keyword lists (falling back to
// the raw term if a role isn't in the map). A startup then matches the role if
// it contains ANY of those keywords.
function expandRoleTerms(roles: string[]): string[] {
  const out: string[] = [];
  for (const role of roles) {
    const keywords = ROLE_KEYWORDS[role];
    if (keywords) out.push(...keywords);
    else out.push(role);
  }
  return out;
}

function parseList(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function parseSearchParams(params: URLSearchParams): SearchFilters {
  const backersParam = params.get("backers") ?? BACKER_IDS.join(",");
  const backers = backersParam
    .split(",")
    .map((b) => b.trim())
    .filter(isBacker);

  const years = (params.get("years") ?? "")
    .split(",")
    .map((y) => Number(y.trim()))
    .filter((y) => Number.isInteger(y) && y > 0);

  return {
    roles: parseList(params.get("roles")),
    skills: parseList(params.get("skills")),
    industries: parseList(params.get("industries")),
    years,
    backers: backers.length > 0 ? backers : BACKER_IDS,
    hiringOnly: params.get("hiring") === "true",
  };
}

function matchesTerms(text: string, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = text.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function searchableText(startup: Startup): string {
  return [
    startup.name,
    startup.description,
    startup.industry,
    startup.location,
    startup.batch,
    startup.tags.join(" "),
    startup.stages?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

export function filterStartups(
  startups: Startup[],
  filters: SearchFilters
): Startup[] {
  const roleTerms = expandRoleTerms(filters.roles);

  return startups.filter((startup) => {
    if (filters.hiringOnly && !startup.isHiring) return false;

    if (filters.backers.length > 0) {
      const hasBacker = filters.backers.some((b) => startup.backers.includes(b));
      if (!hasBacker) return false;
    }

    if (filters.years.length > 0) {
      if (startup.roundYear == null || !filters.years.includes(startup.roundYear))
        return false;
    }

    const text = searchableText(startup);

    if (!matchesTerms(text, roleTerms)) return false;
    if (!matchesTerms(text, filters.skills)) return false;
    if (!matchesTerms(text, filters.industries)) return false;

    return true;
  });
}

/**
 * Build the dropdown option lists from the real dataset. Each field's options
 * are counted against every *other* active filter, so an option is only shown
 * (and only carries a count) if selecting it would actually return results.
 */
export function computeFacets(
  startups: Startup[],
  filters: SearchFilters
): Facets {
  const forRoles = filterStartups(startups, { ...filters, roles: [] });
  const forSkills = filterStartups(startups, { ...filters, skills: [] });
  const forIndustries = filterStartups(startups, { ...filters, industries: [] });
  const forYears = filterStartups(startups, { ...filters, years: [] });

  return {
    roles: rankRoleOptions(forRoles),
    skills: rankOptions(forSkills, (s) => s.tags, 80),
    industries: rankOptions(
      forIndustries,
      (s) => (s.industry ? [s.industry] : []),
      60
    ),
    years: rankYears(forYears),
  };
}

// Distinct round/batch years with counts, most recent first.
function rankYears(startups: Startup[]): FacetOption[] {
  const counts = new Map<number, number>();
  for (const s of startups) {
    if (s.roundYear) counts.set(s.roundYear, (counts.get(s.roundYear) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .slice(0, 30)
    .map(([year, count]) => ({ value: String(year), count }));
}

// Count how many startups each curated role would match (via its keyword map),
// against everything except the role filter. Empty roles are dropped so the
// dropdown only offers roles that return results.
function rankRoleOptions(startups: Startup[]): FacetOption[] {
  const haystacks = startups.map((s) => searchableText(s).toLowerCase());

  return CURATED_ROLES.map((role) => {
    const keywords = ROLE_KEYWORDS[role.toLowerCase()] ?? [role.toLowerCase()];
    let count = 0;
    for (const text of haystacks) {
      if (keywords.some((k) => text.includes(k))) count++;
    }
    return { value: role, count };
  })
    .filter((option) => (option.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.value.localeCompare(b.value));
}

function rankOptions(
  startups: Startup[],
  getValues: (s: Startup) => string[],
  limit: number
): FacetOption[] {
  const counts = new Map<string, number>();
  for (const startup of startups) {
    for (const raw of getValues(startup)) {
      const value = raw.trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}
