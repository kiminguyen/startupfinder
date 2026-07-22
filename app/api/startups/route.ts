import { fetchStartups } from "@/lib/data";
import { filterStartups, parseSearchParams } from "@/lib/search";
import type { Startup } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Don't cache the response — `?sample` returns fresh random picks per request.
export const dynamic = "force-dynamic";

const GENERIC_DESCRIPTIONS = new Set([
  "No description available",
  "a16z portfolio company",
  "USV portfolio company",
  "Bessemer portfolio company",
]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseSearchParams(request.nextUrl.searchParams);
    const all = await fetchStartups();

    // Random sample for the landing page (before any search).
    const sample = Number(request.nextUrl.searchParams.get("sample"));
    if (Number.isFinite(sample) && sample > 0) {
      const pool = all.filter(
        (s: Startup) => s.description && !GENERIC_DESCRIPTIONS.has(s.description)
      );
      return NextResponse.json({
        total: pool.length,
        filters,
        results: shuffle(pool).slice(0, Math.min(sample, 24)),
      });
    }

    const results = filterStartups(all, filters);

    return NextResponse.json({
      total: results.length,
      filters,
      results: results.slice(0, 100),
    });
  } catch (error) {
    console.error("Startup search failed:", error);
    return NextResponse.json(
      { error: "Failed to load startup data. Please try again." },
      { status: 500 }
    );
  }
}
