import { useSyncExternalStore } from "react";

import { buildLeads, type ColumnKey, type Lead } from "./crm-data";

let leads: Lead[] = buildLeads();
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((fn) => fn());
}

export function getLeads() {
  return leads;
}

export function setLeads(next: Lead[] | ((prev: Lead[]) => Lead[])) {
  leads = typeof next === "function" ? next(leads) : next;
  emit();
}

export function useLeads() {
  return useSyncExternalStore(
    (onChange) => {
      subscribers.add(onChange);
      return () => subscribers.delete(onChange);
    },
    getLeads,
    getLeads,
  );
}

export function updateLeadField(id: string, key: ColumnKey, value: string) {
  setLeads((prev) =>
    prev.map((l) => {
      if (l.id !== id) return l;
      if (key === "name") {
        const [firstName, ...rest] = value.trim().split(/\s+/);
        return {
          ...l,
          firstName: firstName || l.firstName,
          lastName: rest.join(" ") || l.lastName,
        };
      }
      if (key === "annualRevenue" || key === "employees") {
        const n = Number(value.replace(/[^0-9.]/g, ""));
        return { ...l, [key]: Number.isFinite(n) ? n : l[key] };
      }
      return { ...l, [key]: value } as Lead;
    }),
  );
}
