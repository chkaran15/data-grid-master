import { Filter, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COLUMNS,
  OPERATOR_LABELS,
  SAVED_VIEWS,
  type ColumnKey,
  type Criterion,
  type Operator,
  type SavedViewId,
} from "@/lib/crm-data";

type Props = {
  savedView: SavedViewId;
  onSavedView: (id: SavedViewId) => void;
  viewCounts: Record<SavedViewId, number>;
  criteria: Criterion[];
  match: "AND" | "OR";
  onMatchChange: (m: "AND" | "OR") => void;
  onCriteriaChange: (next: Criterion[]) => void;
  onClose: () => void;
};

export function FilterPanel({
  savedView,
  onSavedView,
  viewCounts,
  criteria,
  match,
  onMatchChange,
  onCriteriaChange,
  onClose,
}: Props) {
  const update = (id: string, patch: Partial<Criterion>) =>
    onCriteriaChange(criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const add = () =>
    onCriteriaChange([
      ...criteria,
      { id: `c${Date.now()}`, field: "company", operator: "contains", value: "" },
    ]);

  return (
    <div className="flex max-h-[70vh] w-full flex-col gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4 text-primary" /> Filters
        </h2>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="Close filters">
          <X className="size-4" />
        </Button>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          System views
        </p>
        <ul className="space-y-0.5">
          {SAVED_VIEWS.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onSavedView(v.id)}
                title={v.hint}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition",
                  savedView === v.id
                    ? "bg-primary/10 font-semibold text-primary"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <span className="truncate">{v.name}</span>
                <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">
                  {viewCounts[v.id]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Filter by criteria
          </p>
          <div className="flex overflow-hidden rounded-md border border-border">
            {(["AND", "OR"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMatchChange(m)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-semibold",
                  match === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {criteria.map((c) => {
            const col = COLUMNS.find((x) => x.key === c.field);
            return (
              <div key={c.id} className="rounded-md border border-border bg-background p-2">
                <div className="flex items-center gap-1">
                  <select
                    value={c.field}
                    onChange={(e) =>
                      update(c.id, { field: e.target.value as ColumnKey, value: "" })
                    }
                    className="min-w-0 flex-1 rounded border border-border bg-card px-1.5 py-1 text-[12px]"
                  >
                    {COLUMNS.map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onCriteriaChange(criteria.filter((x) => x.id !== c.id))}
                    aria-label="Remove criterion"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <select
                  value={c.operator}
                  onChange={(e) => update(c.id, { operator: e.target.value as Operator })}
                  className="mt-1.5 w-full rounded border border-border bg-card px-1.5 py-1 text-[12px]"
                >
                  {(Object.keys(OPERATOR_LABELS) as Operator[]).map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>
                {col?.options ? (
                  <select
                    value={c.value}
                    onChange={(e) => update(c.id, { value: e.target.value })}
                    className="mt-1.5 w-full rounded border border-border bg-card px-1.5 py-1 text-[12px]"
                  >
                    <option value="">Any value</option>
                    {col.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={c.value}
                    onChange={(e) => update(c.id, { value: e.target.value })}
                    placeholder="Value"
                    className="mt-1.5 h-8 text-[12px]"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={add}>
            <Plus className="size-3.5" /> Add criteria
          </Button>
          {criteria.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onCriteriaChange([])}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
