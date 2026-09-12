import { Building2, Calendar, Globe2, Mail, Phone, User } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  LEAD_STATUSES,
  RATINGS,
  RATING_TONE,
  STATUS_TONE,
  avatarTone,
  initials,
  money,
  type ColumnKey,
  type Lead,
} from "@/lib/crm-data";

export function LeadDetail({
  lead,
  onEdit,
}: {
  lead: Lead | null;
  onEdit: (id: string, key: ColumnKey, value: string) => void;
}) {
  if (!lead) {
    return (
      <div className="grid flex-1 place-items-center rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Select a lead on the left to see its details here.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card">
      <header className="flex items-start gap-3 border-b border-border p-4">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold",
            avatarTone(lead.company),
          )}
        >
          {initials(lead)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            {lead.firstName} {lead.lastName}
          </h2>
          <p className="truncate text-[13px] text-muted-foreground">
            {lead.title} · {lead.company}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_TONE[lead.leadStatus])}>
              {lead.leadStatus}
            </span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", RATING_TONE[lead.rating])}>
              {lead.rating}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {lead.id}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <Field icon={<Mail className="size-3.5" />} label="Email" value={lead.email} />
        <Field icon={<Phone className="size-3.5" />} label="Phone" value={lead.phone} />
        <Field icon={<Building2 className="size-3.5" />} label="Industry" value={lead.industry} />
        <Field icon={<User className="size-3.5" />} label="Lead Owner" value={lead.owner} />
        <Field icon={<Globe2 className="size-3.5" />} label="Location" value={`${lead.city}, ${lead.country}`} />
        <Field icon={<Calendar className="size-3.5" />} label="Created" value={lead.createdAt} />
        <Field label="Annual Revenue" value={money(lead.annualRevenue)} />
        <Field label="Employees" value={lead.employees.toLocaleString("en-US")} />
        <Field label="Lead Source" value={lead.leadSource} />
      </div>

      <div className="border-t border-border p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium">
            Lead status
            <select
              value={lead.leadStatus}
              onChange={(e) => onEdit(lead.id, "leadStatus", e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[12px] font-medium">
            Rating
            <select
              value={lead.rating}
              onChange={(e) => onEdit(lead.id, "rating", e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-medium">{value}</p>
    </div>
  );
}
