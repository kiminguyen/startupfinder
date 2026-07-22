import { BACKERS } from "@/lib/backers";
import type { Startup } from "@/lib/types";

function BackerBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-stone-400">
        {label}
      </dt>
      <dd className="truncate text-sm text-stone-700">{value}</dd>
    </div>
  );
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function jobsSearchUrl(name: string, roleQuery: string): string {
  const keywords = [name, roleQuery].filter(Boolean).join(" ");
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
    keywords
  )}`;
}

export function StartupCard({
  startup,
  showJobsLink = false,
  roleQuery = "",
}: {
  startup: Startup;
  showJobsLink?: boolean;
  roleQuery?: string;
}) {
  const website = startup.website
    ? startup.website.startsWith("http")
      ? startup.website
      : `https://${startup.website}`
    : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/70 shadow-sm backdrop-blur transition hover:border-stone-300 hover:bg-white/90">
      <div className="meter-fill h-1 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {startup.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={startup.logo}
              alt=""
              className="size-10 shrink-0 rounded-xl bg-white object-contain p-0.5 ring-1 ring-stone-200"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-sm font-semibold text-stone-500 ring-1 ring-stone-200">
              {startup.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-stone-900">{startup.name}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {BACKERS.filter((b) => startup.backers.includes(b.id)).map((b) => (
                <BackerBadge key={b.id} label={b.short} className={b.badgeClass} />
              ))}
              {startup.isHiring && (
                <BackerBadge
                  label="Hiring"
                  className="bg-emerald-100 text-emerald-700"
                />
              )}
            </div>
          </div>
          {startup.roundYear && (
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-stone-400">
              {startup.roundYear}
            </span>
          )}
        </div>

        <p className="mt-3.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">
          {startup.description}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          {startup.industry && <Detail label="Field" value={startup.industry} />}
          {startup.location && <Detail label="Location" value={startup.location} />}
          {startup.batch && <Detail label="Batch" value={startup.batch} />}
          {startup.teamSize != null && (
            <Detail label="Team" value={`${startup.teamSize} people`} />
          )}
        </dl>

        {startup.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {startup.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {showJobsLink && startup.isHiring && (
          <a
            href={jobsSearchUrl(startup.name, roleQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-3.5">
              <path
                d="M6 7V5.5A1.5 1.5 0 017.5 4h5A1.5 1.5 0 0114 5.5V7m2 0H4a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {roleQuery ? `Find ${titleCase(roleQuery)} roles` : "See open roles"}
            <span aria-hidden>→</span>
          </a>
        )}

        <div className="mt-4 flex flex-wrap gap-4 border-t border-stone-200 pt-4">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-orange-600 transition hover:text-orange-500"
            >
              Website →
            </a>
          )}
          {startup.ycUrl && (
            <a
              href={startup.ycUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
            >
              YC profile →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
