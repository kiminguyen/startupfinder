export type Backer = "yc" | "a16z" | "usv" | "bessemer";

export interface Startup {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  location?: string;
  industry?: string;
  tags: string[];
  backers: Backer[];
  isHiring: boolean;
  teamSize?: number;
  batch?: string;
  status?: string;
  ycUrl?: string;
  stages?: string[];
  /** Best-available year for the company's latest known round / batch. */
  roundYear?: number;
}

export interface SearchFilters {
  roles: string[];
  skills: string[];
  industries: string[];
  backers: Backer[];
  hiringOnly: boolean;
}

export interface FacetOption {
  value: string;
  count?: number;
}

export interface Facets {
  roles: FacetOption[];
  skills: FacetOption[];
  industries: FacetOption[];
}

export interface YCCompany {
  id: number;
  name: string;
  slug: string;
  small_logo_thumb_url?: string;
  website?: string | null;
  all_locations?: string | null;
  long_description?: string | null;
  one_liner?: string | null;
  team_size?: number | null;
  industry?: string;
  subindustry?: string;
  tags?: string[];
  isHiring?: boolean;
  batch?: string;
  status?: string;
  industries?: string[];
  regions?: string[];
  url?: string;
}

export interface A16zCompany {
  id: string;
  title: string;
  web?: string;
  logo?: string;
  overview?: string;
  stages?: string[];
  founders?: string;
  announcement?: {
    excerpt?: string;
  };
}
