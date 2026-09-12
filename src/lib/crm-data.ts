export const LEAD_STATUSES = [
  "Not Contacted",
  "Attempted to Contact",
  "Contacted",
  "Pre Qualified",
  "Qualified",
  "Junk Lead",
  "Lost Lead",
  "Converted",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "Advertisement",
  "Cold Call",
  "Employee Referral",
  "External Referral",
  "Online Store",
  "Partner",
  "Public Relations",
  "Seminar",
  "Trade Show",
  "Web Download",
  "Web Research",
  "Chat",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const RATINGS = ["Hot", "Warm", "Cold", "Not Rated"] as const;
export type Rating = (typeof RATINGS)[number];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Financial Services",
  "Retail",
  "Education",
  "Logistics",
  "Energy",
] as const;

export const OWNERS = [
  "Amara Osei",
  "Dev Patel",
  "Lena Fischer",
  "Marco Silva",
  "Priya Raman",
  "You",
] as const;
export type Owner = (typeof OWNERS)[number];

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  leadStatus: LeadStatus;
  leadSource: LeadSource;
  rating: Rating;
  industry: string;
  owner: Owner;
  annualRevenue: number;
  employees: number;
  city: string;
  country: string;
  createdAt: string;
  unread: boolean;
};

const FIRST = [
  "Anika","Tobias","Rosa","Ken","Ingrid","Mateo","Yuki","Farid","Clara","Nils",
  "Sofia","Jonas","Aisha","Diego","Mei","Otto","Nadia","Ravi","Elena","Hugo",
  "Talia","Pieter","Noor","Emeka","Sara","Liam","Zoe","Kwame","Iris","Sven",
  "Lucia","Andrei","Hana","Bilal","Greta","Paulo","Nina","Ahmed","Camila","Erik",
];
const LAST = [
  "Berg","Ferreira","Okonkwo","Nakamura","Lindqvist","Duarte","Haddad","Novak","Moreau","Vance",
  "Ibrahim","Kowalski","Rossi","Bauer","Chen","Delgado","Petrov","Ahmed","Larsen","Whitfield",
];
const COMPANIES = [
  "Northwind Optics","Larkspur Logistics","Vantage Biolabs","Kestrel Robotics","Solaria Energy",
  "Brightmark Retail","Helix Financial","Meridian Health","Ironvale Steel","Cobalt Learning",
  "Quantar Systems","Pelagic Freight","Auralis Media","Fernpath Foods","Novacore Cloud",
  "Steelbridge Bank","Tidewell Marine","Verdant Agro","Lumen Devices","Orchid Pharma",
];
const TITLES = [
  "VP Operations","Head of IT","Procurement Lead","CTO","Marketing Director",
  "Finance Manager","Founder","Plant Manager","Product Owner","COO",
];
const CITIES: Array<[string, string]> = [
  ["Berlin", "Germany"],["Lisbon", "Portugal"],["Lagos", "Nigeria"],["Osaka", "Japan"],
  ["Stockholm", "Sweden"],["São Paulo", "Brazil"],["Beirut", "Lebanon"],["Prague", "Czechia"],
  ["Lyon", "France"],["Austin", "United States"],["Dubai", "UAE"],["Kraków", "Poland"],
  ["Milan", "Italy"],["Vienna", "Austria"],["Singapore", "Singapore"],["Bogotá", "Colombia"],
];

// Deterministic pseudo-random so SSR and client render identically.
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

export function buildLeads(count = 96): Lead[] {
  const rand = mulberry(20260912);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;

  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST[i % FIRST.length]!;
    const lastName = pick(LAST);
    const company = pick(COMPANIES);
    const [city, country] = pick(CITIES);
    const day = 1 + Math.floor(rand() * 28);
    const month = 1 + Math.floor(rand() * 9);
    return {
      id: `LD-${(1042 + i).toString()}`,
      firstName,
      lastName,
      company,
      title: pick(TITLES),
      email: `${slug(firstName)}.${slug(lastName)}@${slug(company)}.com`,
      phone: `+${10 + Math.floor(rand() * 79)} ${100 + Math.floor(rand() * 899)} ${1000 + Math.floor(rand() * 8999)}`,
      leadStatus: pick(LEAD_STATUSES),
      leadSource: pick(LEAD_SOURCES),
      rating: pick(RATINGS),
      industry: pick(INDUSTRIES),
      owner: rand() < 0.28 ? "You" : pick(OWNERS.slice(0, 5)),
      annualRevenue: (25 + Math.floor(rand() * 240)) * 10000,
      employees: 8 + Math.floor(rand() * 4200),
      city,
      country,
      createdAt: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      unread: rand() < 0.34,
    };
  });
}

export const STATUS_TONE: Record<LeadStatus, string> = {
  "Not Contacted": "bg-muted text-muted-foreground border-border",
  "Attempted to Contact": "bg-amber-50 text-amber-700 border-amber-200",
  Contacted: "bg-sky-50 text-sky-700 border-sky-200",
  "Pre Qualified": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Qualified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Junk Lead": "bg-zinc-100 text-zinc-600 border-zinc-200",
  "Lost Lead": "bg-rose-50 text-rose-700 border-rose-200",
  Converted: "bg-teal-50 text-teal-700 border-teal-200",
};

export const RATING_TONE: Record<Rating, string> = {
  Hot: "bg-rose-50 text-rose-700 border-rose-200",
  Warm: "bg-amber-50 text-amber-700 border-amber-200",
  Cold: "bg-sky-50 text-sky-700 border-sky-200",
  "Not Rated": "bg-muted text-muted-foreground border-border",
};

export const AVATAR_TONES = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

export function avatarTone(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_TONES[h % AVATAR_TONES.length]!;
}

export function initials(lead: Lead) {
  return `${lead.firstName[0] ?? ""}${lead.lastName[0] ?? ""}`.toUpperCase();
}

export function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

/* ---------------- columns ---------------- */

export type ColumnKey =
  | "name"
  | "company"
  | "title"
  | "leadStatus"
  | "leadSource"
  | "email"
  | "phone"
  | "rating"
  | "industry"
  | "owner"
  | "annualRevenue"
  | "employees"
  | "city"
  | "country"
  | "createdAt";

export type ColumnDef = {
  key: ColumnKey;
  label: string;
  width: number;
  editor: "text" | "select" | "none";
  options?: readonly string[];
  align?: "right";
};

export const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Lead Name", width: 232, editor: "text" },
  { key: "company", label: "Company", width: 190, editor: "text" },
  { key: "leadStatus", label: "Lead Status", width: 178, editor: "select", options: LEAD_STATUSES },
  { key: "leadSource", label: "Lead Source", width: 170, editor: "select", options: LEAD_SOURCES },
  { key: "email", label: "Email", width: 250, editor: "text" },
  { key: "phone", label: "Phone", width: 160, editor: "text" },
  { key: "rating", label: "Rating", width: 130, editor: "select", options: RATINGS },
  { key: "title", label: "Title", width: 170, editor: "text" },
  { key: "industry", label: "Industry", width: 160, editor: "select", options: INDUSTRIES },
  { key: "owner", label: "Lead Owner", width: 180, editor: "select", options: OWNERS },
  { key: "annualRevenue", label: "Annual Revenue", width: 150, editor: "text", align: "right" },
  { key: "employees", label: "Employees", width: 120, editor: "text", align: "right" },
  { key: "city", label: "City", width: 140, editor: "text" },
  { key: "country", label: "Country", width: 150, editor: "text" },
  { key: "createdAt", label: "Created", width: 130, editor: "none" },
];

export const DEFAULT_VISIBLE: ColumnKey[] = [
  "name",
  "company",
  "leadStatus",
  "leadSource",
  "email",
  "phone",
  "rating",
  "owner",
  "annualRevenue",
  "city",
  "createdAt",
];

export function cellText(lead: Lead, key: ColumnKey): string {
  switch (key) {
    case "name":
      return `${lead.firstName} ${lead.lastName}`;
    case "annualRevenue":
      return money(lead.annualRevenue);
    case "employees":
      return lead.employees.toLocaleString("en-US");
    default:
      return String(lead[key as keyof Lead] ?? "");
  }
}

export function sortValue(lead: Lead, key: ColumnKey): string | number {
  if (key === "name") return `${lead.lastName} ${lead.firstName}`.toLowerCase();
  const v = key === "annualRevenue" || key === "employees" ? lead[key] : cellText(lead, key);
  return typeof v === "number" ? v : String(v).toLowerCase();
}

/* ---------------- saved views + filters ---------------- */

export type SavedViewId = "all" | "my-open" | "unread" | "converted" | "hot";

export const SAVED_VIEWS: Array<{ id: SavedViewId; name: string; hint: string }> = [
  { id: "all", name: "All Leads", hint: "Every lead in the org" },
  { id: "my-open", name: "My Open Leads", hint: "Assigned to you, not closed" },
  { id: "unread", name: "Unread Leads", hint: "Never opened" },
  { id: "converted", name: "Converted", hint: "Won and converted" },
  { id: "hot", name: "Hot Prospects", hint: "Rating is Hot" },
];

export function applySavedView(leads: Lead[], view: SavedViewId): Lead[] {
  switch (view) {
    case "my-open":
      return leads.filter(
        (l) => l.owner === "You" && !["Converted", "Lost Lead", "Junk Lead"].includes(l.leadStatus),
      );
    case "unread":
      return leads.filter((l) => l.unread);
    case "converted":
      return leads.filter((l) => l.leadStatus === "Converted");
    case "hot":
      return leads.filter((l) => l.rating === "Hot");
    default:
      return leads;
  }
}

export type Operator = "is" | "isnt" | "contains" | "starts" | "gt" | "lt";

export const OPERATOR_LABELS: Record<Operator, string> = {
  is: "is",
  isnt: "is not",
  contains: "contains",
  starts: "starts with",
  gt: "greater than",
  lt: "less than",
};

export type Criterion = {
  id: string;
  field: ColumnKey;
  operator: Operator;
  value: string;
};

export function matchesCriterion(lead: Lead, c: Criterion): boolean {
  if (!c.value.trim()) return true;
  const raw = c.field === "annualRevenue" || c.field === "employees" ? lead[c.field] : cellText(lead, c.field);
  const text = String(raw).toLowerCase();
  const needle = c.value.trim().toLowerCase();
  switch (c.operator) {
    case "is":
      return text === needle;
    case "isnt":
      return text !== needle;
    case "contains":
      return text.includes(needle);
    case "starts":
      return text.startsWith(needle);
    case "gt":
      return Number(raw) > Number(c.value);
    case "lt":
      return Number(raw) < Number(c.value);
  }
}

export const KANBAN_STAGES: LeadStatus[] = [
  "Not Contacted",
  "Attempted to Contact",
  "Contacted",
  "Pre Qualified",
  "Qualified",
  "Converted",
];
