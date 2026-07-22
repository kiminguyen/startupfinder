# Startup Finder

A web app to discover early-stage startups — backed by **Y Combinator**, **a16z**, **Union Square Ventures**, or **Bessemer** — that you could pitch yourself to. Match against your resume, or filter by role, skill, and industry.

## Features

- **Four VC sources, merged & de-duplicated** (~5,400 startups). A company backed by several firms shows all of its badges.
- **Match from your resume** — drop in a PDF and it's parsed entirely in your browser (never uploaded); the app extracts your background and auto-fills the Role / Skill / Industry filters.
- **Data-driven dropdowns** — Roles, Skills, and Industries are populated from the real dataset with live result counts. They're _dependent_: picking one narrows the others, so every option shown is guaranteed to return results (no more "typed too much, got nothing").
- **Curated roles mapped to skills** — selecting a role (e.g. _Growth_) matches related keywords, so results stay relevant.
- **Filter by backer** (YC / a16z / Union Square / Bessemer) and **"Hiring only."**
- **Newest-first ordering** — results are sorted by latest round / batch year, shown on each card.
- **Careers links** — with "Hiring only" on, each tile links to that company's own careers page (scoped to your searched role).
- A soft sunset UI with glow effects and a glowing sparkle cursor.

## Data sources

Sources are fetched in parallel and **best-effort** — if one firm's site changes and breaks its adapter, the others keep working and search stays up.

| Firm | Source | Method |
|------|--------|--------|
| Y Combinator | [yc-oss/api](https://github.com/yc-oss/api) | JSON API |
| a16z | [a16z.com/portfolio](https://a16z.com/portfolio/) | embedded JSON |
| Union Square Ventures | [usv.com/companies](https://www.usv.com/companies/) | HTML scrape |
| Bessemer | [bvp.com/portfolio](https://www.bvp.com/portfolio) | HTML scrape |

> The two scraped sources parse HTML and may need occasional maintenance if those sites are redesigned.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first search fetches and caches all sources (a few seconds); it's fast afterward.

## Example searches

| Goal | Try |
|------|-----|
| Match me to startups | Drop your resume PDF on **Match from your resume** |
| Growth roles at fintechs | Role: `Growth`, Industry: `Fintech` |
| Companies hiring engineers | Role: `Engineering`, enable **Hiring only** |
| Union Square & Bessemer only | Uncheck YC and a16z |

## Project structure

- `lib/data.ts` — pluggable multi-source pipeline (fetch, normalize, merge, de-dupe, sort)
- `lib/search.ts` — filtering and facet (dropdown option) computation
- `lib/backers.ts` — registry of VC firms (badges, labels)
- `lib/roles.ts` — curated roles and their skill-tag mappings
- `lib/match.ts` — resume-text → filter matching
- `app/api/startups` · `app/api/facets` — search and dropdown-option endpoints
- `components/` — search form, dropdowns, result cards, resume upload, sparkle cursor

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- pdfjs-dist (in-browser resume parsing)
