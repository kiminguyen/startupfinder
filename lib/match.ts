import { CURATED_ROLES, ROLE_KEYWORDS } from "./roles";
import type { FacetOption } from "./types";

export interface ProfileMatch {
  role: string;
  skill: string;
  industry: string;
}

// Count whole-word (boundary-aware) occurrences of `needle` in already-
// lowercased `text`. Boundaries stop short tokens like "ai" matching inside
// "email" or "chair". Needles under 2 chars are ignored.
function occurrences(text: string, needle: string): number {
  const n = needle.trim();
  if (n.length < 2) return 0;
  const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "g");
  return (text.match(re) || []).length;
}

function bestRole(text: string): string {
  let best = "";
  let bestScore = 0;
  for (const role of CURATED_ROLES) {
    const keywords = ROLE_KEYWORDS[role.toLowerCase()] ?? [role.toLowerCase()];
    const score = keywords.reduce((sum, k) => sum + occurrences(text, k), 0);
    if (score > bestScore) {
      bestScore = score;
      best = role;
    }
  }
  return best;
}

// Pick the option that shows up most in the resume; for multi-part industry
// values like "Fintech -> Payments" also try the last segment ("payments").
// Ties break toward the more popular (higher-count) option. `exclude` skips
// options whose lowercased value is already covered by another field, so the
// three picks stay distinct instead of restating the same theme.
function bestOption(
  text: string,
  options: FacetOption[],
  exclude: Set<string>
): string {
  let best = "";
  let bestScore = 0;
  let bestCount = -1;
  for (const option of options) {
    const value = option.value.toLowerCase();
    if (exclude.has(value)) continue;
    const segment = value.includes("->")
      ? value.split("->").pop()!.trim()
      : value;
    const score = occurrences(text, value) || occurrences(text, segment);
    if (score === 0) continue;
    const count = option.count ?? 0;
    if (score > bestScore || (score === bestScore && count > bestCount)) {
      bestScore = score;
      bestCount = count;
      best = option.value;
    }
  }
  return best;
}

export function matchProfile(
  text: string,
  options: { skills: FacetOption[]; industries: FacetOption[] }
): ProfileMatch {
  const lower = text.toLowerCase();

  const role = bestRole(lower);
  // Keep skill/industry distinct from the role's own vocabulary so the three
  // fields capture different dimensions (e.g. Marketing role + Fintech skill).
  const roleTerms = new Set(
    role ? [role.toLowerCase(), ...(ROLE_KEYWORDS[role.toLowerCase()] ?? [])] : []
  );

  const skill = bestOption(lower, options.skills, roleTerms);
  const industry = bestOption(
    lower,
    options.industries,
    new Set([...roleTerms, skill.toLowerCase()])
  );

  return { role, skill, industry };
}
