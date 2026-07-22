import { fetchStartups } from "@/lib/data";
import { computeFacets, parseSearchParams } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const filters = parseSearchParams(request.nextUrl.searchParams);
    const all = await fetchStartups();
    const facets = computeFacets(all, filters);

    return NextResponse.json(facets);
  } catch (error) {
    console.error("Facet computation failed:", error);
    return NextResponse.json(
      { error: "Failed to load search options. Please try again." },
      { status: 500 }
    );
  }
}
