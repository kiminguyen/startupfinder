// Curated job roles mapped to the skill/topic keywords that tend to appear in
// startup text (tags, industry, descriptions). The YC/a16z data has no role
// field, so selecting a role OR-matches any of its mapped keywords — this keeps
// results reliable instead of substring-matching the bare role word.
export const ROLE_TAG_MAP: Record<string, string[]> = {
  Engineering: [
    "engineering",
    "developer tools",
    "infrastructure",
    "devops",
    "backend",
    "api",
    "sdk",
    "cloud",
    "database",
    "open source",
  ],
  Product: ["product", "product management", "no-code", "productivity", "roadmap"],
  Design: ["design", "ux", "ui", "graphic design", "design tools", "creative"],
  "Data Science": [
    "data science",
    "machine learning",
    "artificial intelligence",
    "analytics",
    "data engineering",
    "data",
  ],
  Sales: ["sales", "crm", "revenue", "go-to-market", "sales automation"],
  Marketing: [
    "marketing",
    "advertising",
    "adtech",
    "seo",
    "social media",
    "content",
  ],
  Operations: [
    "operations",
    "logistics",
    "supply chain",
    "workflow",
    "procurement",
  ],
  Finance: ["finance", "fintech", "accounting", "payments", "banking", "treasury"],
  Growth: ["growth", "user acquisition", "retention", "marketing", "funnel"],
  Recruiting: [
    "recruiting",
    "talent",
    "hiring",
    "human resources",
    "hr",
    "recruitment",
  ],
  "Customer Success": [
    "customer success",
    "customer support",
    "customer service",
    "help desk",
    "support",
  ],
  Research: ["research", "biotech", "deep tech", "life sciences", "science"],
  Founder: ["founder", "co-founder", "entrepreneur", "founding"],
};

export const CURATED_ROLES: string[] = Object.keys(ROLE_TAG_MAP);

// Lowercased lookup: role label -> keyword list, for matching against text.
export const ROLE_KEYWORDS: Record<string, string[]> = Object.fromEntries(
  Object.entries(ROLE_TAG_MAP).map(([role, keywords]) => [
    role.toLowerCase(),
    keywords.map((k) => k.toLowerCase()),
  ])
);
