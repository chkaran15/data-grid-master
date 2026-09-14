import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Mail,
  Phone,
  Pin,
  PinOff,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  cellText,
  initials,
  avatarTone,
  RATING_TONE,
  STATUS_TONE,
  type ColumnDef,
  type ColumnKey,
  type Lead,
  type LeadStatus,
  type Rating,
} from "@/lib/crm-data";

export type Density = "compact" | "standard" | "comfortable";
export type SortRule = { key: ColumnKey; dir: "asc" | "desc" };

const ROW_H: Record<Density, string> = {
  compact: "h-9",
  standard: "h-12",
  comfortable: "h-16",
};
const TEXT_SIZE: Record<Density, string> = {
  compact: "text-[12px]",
  standard: "text-[13px]",
  comfortable: "text-sm",
};

type Props = {
  leads: Lead[];
  columns: ColumnDef[];
  frozenCount: number;
  density: Density;
  sort: SortRule[];
  selected: Set<string>;
  activeId?: string | null;
  onToggleSort: (key: ColumnKey, additive: boolean) => void;
  onToggleRow: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (id: string, key: ColumnKey, value: string) => void;
  onReorder: (from: ColumnKey, to: ColumnKey) => void;
  onFreezeChange: (count: number) => void;
  onOpen?: (lead: Lead) => void;
  onOpenPage?: (lead: Lead) => void;
};

export function LeadsGrid({
  leads,
  columns,
  frozenCount,
  density,
  sort,
  selected,
  activeId,
  onToggleSort,
  onToggleRow,
  onToggleAll,
  onEdit,
  onReorder,
  onFreezeChange,
  onOpen,
  onOpenPage,
}: Props) {
  const [editing, setEditing] = useState<{ id: string; key: ColumnKey } | null>(null);
  const [dragKey, setDragKey] = useState<ColumnKey | null>(null);
  const [dropKey, setDropKey] = useState<ColumnKey | null>(null);

  const allChecked = leads.length > 0 && leads.every((l) => selected.has(l.id));
  const someChecked = leads.some((l) => selected.has(l.id));

  const offsets: number[] = [];
  let run = 40;
  columns.forEach((c, i) => {
    offsets[i] = run;
    run += c.width;
  });

  const sortFor = (key: ColumnKey) => sort.findIndex((s) => s.key === key);

  return (
    <div className="relative overflow-auto rounded-lg border border-border bg-card">
      <table
        className="w-full table-fixed border-separate border-spacing-0"
        style={{ minWidth: 40 + columns.reduce((a, c) => a + c.width, 0) }}
      >
        <thead>
          <tr className={cn("bg-muted/60", TEXT_SIZE[density])}>
            <th className="sticky left-0 top-0 z-30 w-10 border-b border-r border-border bg-muted/95 px-0 backdrop-blur">
              <CheckBox
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={onToggleAll}
                label="Select all leads on this page"
              />
            </th>
            {columns.map((col, i) => {
              const frozen = i < frozenCount;
              const idx = sortFor(col.key);
              return (
                <th
                  key={col.key}
                  draggable
                  onDragStart={() => setDragKey(col.key)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropKey(col.key);
                  }}
                  onDragEnd={() => {
                    setDragKey(null);
                    setDropKey(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragKey && dragKey !== col.key) onReorder(dragKey, col.key);
                    setDragKey(null);
                    setDropKey(null);
                  }}
                  style={{ width: col.width, left: frozen ? offsets[i] : undefined }}
                  className={cn(
                    "group/th top-0 z-20 select-none border-b border-r border-border px-3 text-left font-semibold text-foreground/80",
                    "sticky bg-muted/95 backdrop-blur",
                    frozen ? "z-30 shadow-[1px_0_0_0_var(--color-border)]" : "",
                    dropKey === col.key && dragKey !== col.key && "bg-primary/10",
                    dragKey === col.key && "opacity-50",
                  )}
                >
                  <div className="flex items-center gap-1">
                    <GripVertical className="size-3.5 cursor-grab text-muted-foreground/40 opacity-0 transition group-hover/th:opacity-100" />
                    <button
                      type="button"
                      onClick={(e) => onToggleSort(col.key, e.shiftKey)}
                      className="flex flex-1 items-center gap-1 truncate py-2 text-left hover:text-primary"
                      title="Click to sort. Shift-click to add a second sort level."
                    >
                      <span className="truncate">{col.label}</span>
                      {idx > -1 && (
                        <span className="flex items-center text-primary">
                          {sort[idx]!.dir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )}
                          {sort.length > 1 && (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onFreezeChange(frozen ? i : i + 1)}
                      title={frozen ? "Unfreeze columns" : "Freeze up to this column"}
                      className="opacity-0 transition group-hover/th:opacity-100"
                    >
                      {frozen ? (
                        <PinOff className="size-3.5 text-primary" />
                      ) : (
                        <Pin className="size-3.5 text-muted-foreground/60" />
                      )}
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isSelected = selected.has(lead.id);
            return (
              <tr
                key={lead.id}
                className={cn(
                  "group/row",
                  ROW_H[density],
                  TEXT_SIZE[density],
                  isSelected ? "bg-primary/5" : "bg-card hover:bg-accent/60",
                  activeId === lead.id && "bg-primary/10",
                )}
              >
                <td
                  className={cn(
                    "sticky left-0 z-10 w-10 border-b border-r border-border px-0",
                    isSelected ? "bg-primary/5" : "bg-card group-hover/row:bg-accent/60",
                  )}
                >
                  <CheckBox
                    checked={isSelected}
                    onChange={() => onToggleRow(lead.id)}
                    label={`Select ${lead.firstName} ${lead.lastName}`}
                  />
                </td>
                {columns.map((col, i) => {
                  const frozen = i < frozenCount;
                  const isEditing = editing?.id === lead.id && editing.key === col.key;
                  return (
                    <td
                      key={col.key}
                      style={{ width: col.width, left: frozen ? offsets[i] : undefined }}
                      onDoubleClick={() => col.editor !== "none" && setEditing({ id: lead.id, key: col.key })}
                      className={cn(
                        "relative border-b border-r border-border px-3 align-middle",
                        col.align === "right" && "text-right tabular-nums",
                        frozen &&
                          cn(
                            "sticky z-10 shadow-[1px_0_0_0_var(--color-border)]",
                            isSelected ? "bg-primary/5" : "bg-card group-hover/row:bg-accent/60",
                          ),
                      )}
                    >
                      {isEditing ? (
                        <CellEditor
                          col={col}
                          initial={rawEditValue(lead, col.key)}
                          onCancel={() => setEditing(null)}
                          onCommit={(value) => {
                            onEdit(lead.id, col.key, value);
                            setEditing(null);
                          }}
                        />
                      ) : (
                        <CellView
                          lead={lead}
                          col={col}
                          onOpen={onOpen}
                          onEditStart={() => {
                            if (col.editor !== "none") setEditing({ id: lead.id, key: col.key });
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {leads.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="border-b border-border px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No leads match this view. Try clearing the filters or the quick search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function rawEditValue(lead: Lead, key: ColumnKey) {
  if (key === "name") return `${lead.firstName} ${lead.lastName}`;
  if (key === "annualRevenue" || key === "employees") return String(lead[key]);
  return cellText(lead, key);
}

function CellView({
  lead,
  col,
  onOpen,
  onEditStart,
}: {
  lead: Lead;
  col: ColumnDef;
  onOpen?: ((lead: Lead) => void) | undefined;
  onEditStart: () => void;
}) {
  const editable = col.editor !== "none";
  const wrap = (node: React.ReactNode) => (
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="min-w-0 flex-1 truncate">{node}</div>
      {editable && (
        <button
          type="button"
          onClick={onEditStart}
          className="shrink-0 rounded px-1 text-[10px] font-medium text-primary opacity-0 transition group-hover/row:opacity-100"
        >
          Edit
        </button>
      )}
    </div>
  );

  if (col.key === "name") {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
            avatarTone(lead.company),
          )}
        >
          {initials(lead)}
        </span>
        <button
          type="button"
          onClick={() => onOpen?.(lead)}
          className="min-w-0 flex-1 truncate text-left font-medium text-primary hover:underline"
        >
          {lead.firstName} {lead.lastName}
        </button>
        {lead.unread && (
          <span className="shrink-0 rounded-sm bg-primary/10 px-1 text-[9px] font-bold uppercase text-primary">
            New
          </span>
        )}
        <button
          type="button"
          onClick={onEditStart}
          className="shrink-0 rounded px-1 text-[10px] font-medium text-primary opacity-0 transition group-hover/row:opacity-100"
        >
          Edit
        </button>
      </div>
    );
  }

  if (col.key === "leadStatus") {
    return wrap(
      <Badge className={STATUS_TONE[lead.leadStatus as LeadStatus]}>{lead.leadStatus}</Badge>,
    );
  }
  if (col.key === "rating") {
    return wrap(<Badge className={RATING_TONE[lead.rating as Rating]}>{lead.rating}</Badge>);
  }
  if (col.key === "owner") {
    return wrap(
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-0.5 pl-0.5 pr-2">
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full text-[9px] font-semibold",
            avatarTone(lead.owner),
          )}
        >
          {lead.owner
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)}
        </span>
        <span className="truncate text-[12px]">{lead.owner}</span>
      </span>,
    );
  }
  if (col.key === "email") {
    return wrap(
      <a
        href={`mailto:${lead.email}`}
        className="inline-flex min-w-0 items-center gap-1.5 truncate text-primary hover:underline"
      >
        <Mail className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{lead.email}</span>
      </a>,
    );
  }
  if (col.key === "phone") {
    return wrap(
      <span className="inline-flex items-center gap-1.5">
        <Phone className="size-3.5 text-muted-foreground" />
        {lead.phone}
      </span>,
    );
  }
  return wrap(<span className="truncate">{cellText(lead, col.key)}</span>);
}

function CellEditor({
  col,
  initial,
  onCommit,
  onCancel,
}: {
  col: ColumnDef;
  initial: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (col.editor === "select") {
    return (
      <select
        ref={ref as React.Ref<HTMLSelectElement>}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onCommit(e.target.value);
        }}
        onBlur={onCancel}
        className="w-full rounded-md border border-primary bg-background px-1.5 py-1 text-[12px] outline-none ring-2 ring-primary/20"
      >
        {col.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(value);
          if (e.key === "Escape") onCancel();
        }}
        className="min-w-0 flex-1 rounded-md border border-primary bg-background px-1.5 py-1 text-[12px] outline-none ring-2 ring-primary/20"
      />
      <button
        type="button"
        onClick={() => onCommit(value)}
        className="grid size-6 shrink-0 place-items-center rounded bg-primary text-primary-foreground"
        aria-label="Save"
      >
        <Check className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="grid size-6 shrink-0 place-items-center rounded border border-border"
        aria-label="Cancel"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CheckBox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex h-full w-full cursor-pointer items-center justify-center">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate);
        }}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 cursor-pointer accent-[var(--color-primary)]"
      />
    </label>
  );
}
