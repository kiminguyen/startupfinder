# Startup Finder

A simple web app to discover startups backed by **Y Combinator** or **a16z** that you could pitch yourself to. Filter by role, industry, location, and keywords.

## Features

- Search YC companies (5,000+ active startups) and a16z portfolio (Seed & Venture stage)
- Filter by roles/skills, industries, locations, and free-text keywords
- Toggle YC-only, a16z-only, or both
- Optional "hiring only" filter
- Companies backed by both YC and a16z are highlighted

## Data sources

- [yc-oss/api](https://github.com/yc-oss/api) — community-maintained YC company directory
- [a16z.com/portfolio](https://a16z.com/portfolio/) — a16z portfolio page (embedded JSON)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example searches

| Goal | Try |
|------|-----|
| AI engineer roles in SF | Roles: `engineer`, Industries: `AI`, Locations: `San Francisco` |
| Remote fintech startups | Industries: `fintech`, Locations: `remote` |
| Companies actively hiring | Enable "Hiring only" |
| Product roles at YC companies | Roles: `product`, uncheck a16z |

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
