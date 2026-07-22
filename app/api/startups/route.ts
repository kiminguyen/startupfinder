import { fetchStartups } from "@/lib/data";
import { filterStartups, parseSearchParams } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const filters = parseSearchParams(request.nextUrl.searchParams);
    const all = await fetchStartups();
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
