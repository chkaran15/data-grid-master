import { useState } from "react";
import { Building2, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  KANBAN_STAGES,
  RATING_TONE,
  avatarTone,
  initials,
  money,
  type Lead,
  type LeadStatus,
} from "@/lib/crm-data";

type Props = {
  leads: Lead[];
  onMove: (id: string, status: LeadStatus) => void;
  onOpen: (lead: Lead) => void;
};

export function KanbanBoard({ leads, onMove, onOpen }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KANBAN_STAGES.map((stage) => {
        const items = leads.filter((l) => l.leadStatus === stage);
        const revenue = items.reduce((a, l) => a + l.annualRevenue, 0);
        return (
          <section
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => {
              if (dragId) onMove(dragId, stage);
              setDragId(null);
              setOverStage(null);
            }}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40 transition",
              overStage === stage && "border-primary bg-primary/5",
            )}
          >
            <header className="sticky top-0 rounded-t-lg border-b border-border bg-card/90 px-3 py-2.5 backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-[13px] font-semibold">{stage}</h3>
                <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{money(revenue)} pipeline</p>
            </header>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {items.map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onOpen(lead)}
                  className={cn(
                    "cursor-grab rounded-md border border-border bg-card p-2.5 shadow-sm transition hover:border-primary/40 hover:shadow",
                    dragId === lead.id && "opacity-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                        avatarTone(lead.company),
                      )}
                    >
                      {initials(lead)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Building2 className="size-3" /> {lead.company}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <Mail className="size-3" /> {lead.email}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                        RATING_TONE[lead.rating],
                      )}
                    >
                      {lead.rating}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums">
                      {money(lead.annualRevenue)}
                    </span>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-[11px] text-muted-foreground">
                  Drop leads here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
