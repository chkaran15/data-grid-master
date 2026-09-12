import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Columns3,
  Download,
  Filter,
  KanbanSquare,
  LayoutList,
  PanelsTopLeft,
  Plus,
  RefreshCw,
  Rows3,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/crm/BulkActionBar";
import { ColumnsDialog } from "@/components/crm/ColumnsDialog";
import { FilterPanel } from "@/components/crm/FilterPanel";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { LeadDetail } from "@/components/crm/LeadDetail";
import { LeadsGrid, type Density, type SortRule } from "@/components/crm/LeadsGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COLUMNS,
  DEFAULT_VISIBLE,
  SAVED_VIEWS,
  applySavedView,
  buildLeads,
  cellText,
  matchesCriterion,
  sortValue,
  type ColumnKey,
  type Criterion,
  type Lead,
  type LeadStatus,
  type Owner,
  type SavedViewId,
} from "@/lib/crm-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leads Console — Zoho-style CRM Data Table" },
      {
        name: "description",
        content:
          "A feature-complete CRM leads data table with list, kanban and split views, inline editing, saved views, column management and bulk actions.",
      },
      { property: "og:title", content: "Leads Console — Zoho-style CRM Data Table" },
      {
        property: "og:description",
        content:
          "Explore a CRM lead grid with saved views, criteria filters, frozen columns, inline editing and bulk actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadsConsole,
});

type ViewMode = "list" | "kanban" | "split";
const PAGE_SIZES = [10, 20, 50, 100];

function LeadsConsole() {
  const [leads, setLeads] = useState<Lead[]>(() => buildLeads());
  const [savedView, setSavedView] = useState<SavedViewId>("all");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [match, setMatch] = useState<"AND" | "OR">("AND");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortRule[]>([{ key: "createdAt", dir: "desc" }]);
  const [order, setOrder] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));
  const [visible, setVisible] = useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const [frozenCount, setFrozenCount] = useState(1);
  const [density, setDensity] = useState<Density>("standard");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(true);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const viewCounts = useMemo(() => {
    const out = {} as Record<SavedViewId, number>;
    for (const v of SAVED_VIEWS) out[v.id] = applySavedView(leads, v.id).length;
    return out;
  }, [leads]);

  const filtered = useMemo(() => {
    let rows = applySavedView(leads, savedView);
    const active = criteria.filter((c) => c.value.trim());
    if (active.length) {
      rows = rows.filter((l) =>
        match === "AND"
          ? active.every((c) => matchesCriterion(l, c))
          : active.some((c) => matchesCriterion(l, c)),
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((l) =>
        [
          `${l.firstName} ${l.lastName}`,
          l.company,
          l.email,
          l.phone,
          l.city,
          l.owner,
          l.leadStatus,
          l.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort.length) {
      rows = [...rows].sort((a, b) => {
        for (const rule of sort) {
          const av = sortValue(a, rule.key);
          const bv = sortValue(b, rule.key);
          if (av < bv) return rule.dir === "asc" ? -1 : 1;
          if (av > bv) return rule.dir === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return rows;
  }, [leads, savedView, criteria, match, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  const orderedColumns = useMemo(
    () =>
      order
        .filter((k) => visible.includes(k))
        .map((k) => COLUMNS.find((c) => c.key === k)!)
        .filter(Boolean),
    [order, visible],
  );

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  const updateLead = (id: string, key: ColumnKey, value: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (key === "name") {
          const [firstName, ...rest] = value.trim().split(/\s+/);
          return { ...l, firstName: firstName || l.firstName, lastName: rest.join(" ") || l.lastName };
        }
        if (key === "annualRevenue" || key === "employees") {
          const n = Number(value.replace(/[^0-9.]/g, ""));
          return { ...l, [key]: Number.isFinite(n) ? n : l[key] };
        }
        return { ...l, [key]: value } as Lead;
      }),
    );
  };

  const toggleSort = (key: ColumnKey, additive: boolean) => {
    setSort((prev) => {
      const existing = prev.find((s) => s.key === key);
      const flipped: SortRule = { key, dir: existing?.dir === "asc" ? "desc" : "asc" };
      if (!additive) return [flipped];
      return existing ? prev.map((s) => (s.key === key ? flipped : s)) : [...prev, flipped];
    });
  };

  const reorderColumns = (from: ColumnKey, to: ColumnKey) => {
    setOrder((prev) => {
      const next = [...prev];
      const f = next.indexOf(from);
      const t = next.indexOf(to);
      if (f < 0 || t < 0) return prev;
      next.splice(t, 0, next.splice(f, 1)[0]!);
      return next;
    });
  };

  const selectedLeads = leads.filter((l) => selected.has(l.id));

  const exportCsv = () => {
    const rows = selectedLeads.length ? selectedLeads : filtered;
    const keys = orderedColumns.map((c) => c.key);
    const csv = [
      ["Lead Id", ...orderedColumns.map((c) => c.label)].join(","),
      ...rows.map((l) =>
        [l.id, ...keys.map((k) => `"${cellText(l, k).replace(/"/g, '""')}"`)].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} leads to CSV`);
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">Leads</h1>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {SAVED_VIEWS.find((v) => v.id === savedView)?.name}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              {filtered.length} records · {selected.size} selected · double-click any cell to edit
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search leads…"
              className="h-9 w-56 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setColumnsOpen(true)}>
            <Columns3 className="size-4" /> Columns
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLeads(buildLeads());
              setSelected(new Set());
              toast.success("Sample data refreshed");
            }}
          >
            <RefreshCw className="size-4" /> Reset data
          </Button>
          <Button size="sm" onClick={() => toast.info("Create Lead form would open here")}>
            <Plus className="size-4" /> Create Lead
          </Button>
        </div>

        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 border-t border-border px-4 py-2">
          <SegmentGroup>
            <Segment active={view === "list"} onClick={() => setView("list")} icon={<LayoutList className="size-4" />}>
              List View
            </Segment>
            <Segment active={view === "kanban"} onClick={() => setView("kanban")} icon={<KanbanSquare className="size-4" />}>
              Kanban
            </Segment>
            <Segment active={view === "split"} onClick={() => setView("split")} icon={<PanelsTopLeft className="size-4" />}>
              Split View
            </Segment>
          </SegmentGroup>

          {!showFilters && (
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="size-4" /> Filters
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Rows3 className="size-3.5" /> Density
            </span>
            <SegmentGroup>
              {(["compact", "standard", "comfortable"] as Density[]).map((d) => (
                <Segment key={d} active={density === d} onClick={() => setDensity(d)}>
                  {d[0]!.toUpperCase() + d.slice(1)}
                </Segment>
              ))}
            </SegmentGroup>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] gap-4 px-4 py-4">
        {showFilters && (
          <FilterPanel
            savedView={savedView}
            onSavedView={(id) => {
              setSavedView(id);
              setPage(1);
            }}
            viewCounts={viewCounts}
            criteria={criteria}
            match={match}
            onMatchChange={setMatch}
            onCriteriaChange={(next) => {
              setCriteria(next);
              setPage(1);
            }}
            onClose={() => setShowFilters(false)}
          />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          {view === "kanban" ? (
            <KanbanBoard
              leads={filtered}
              onMove={(id, status) => {
                updateLead(id, "leadStatus", status);
                toast.success(`Moved to ${status}`);
              }}
              onOpen={(lead) => {
                setActiveId(lead.id);
                setView("split");
              }}
            />
          ) : view === "split" ? (
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="w-full lg:w-[46%]">
                <SplitList
                  leads={pageRows}
                  activeId={activeId}
                  onSelect={(l) => setActiveId(l.id)}
                />
              </div>
              <LeadDetail lead={activeLead ?? pageRows[0] ?? null} onEdit={updateLead} />
            </div>
          ) : (
            <LeadsGrid
              leads={pageRows}
              columns={orderedColumns}
              frozenCount={Math.min(frozenCount, orderedColumns.length)}
              density={density}
              sort={sort}
              selected={selected}
              activeId={activeId}
              onToggleSort={toggleSort}
              onToggleRow={(id) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  next.has(id) ? next.delete(id) : next.add(id);
                  return next;
                })
              }
              onToggleAll={(checked) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  pageRows.forEach((l) => (checked ? next.add(l.id) : next.delete(l.id)));
                  return next;
                })
              }
              onEdit={updateLead}
              onReorder={reorderColumns}
              onFreezeChange={setFrozenCount}
              onOpen={(lead) => {
                setActiveId(lead.id);
                setView("split");
              }}
            />
          )}

          {view !== "kanban" && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-[12px]">
              <label className="flex items-center gap-2 text-muted-foreground">
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-1.5 py-1"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-muted-foreground">
                {filtered.length === 0
                  ? "0 records"
                  : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="px-2 tabular-nums text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ColumnsDialog
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        order={order}
        visible={visible}
        onApply={(nextOrder, nextVisible) => {
          setOrder(nextOrder);
          setVisible(nextVisible);
          toast.success("Column layout updated");
        }}
      />

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={() => {
          setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
          toast.success(`Deleted ${selected.size} leads`);
          setSelected(new Set());
        }}
        onExport={exportCsv}
        onMassUpdate={(field, value) => {
          selected.forEach((id) => updateLead(id, field, value));
          toast.success(`Updated ${selected.size} leads`);
        }}
        onAssign={(owner: Owner) => {
          selected.forEach((id) => updateLead(id, "owner", owner));
          toast.success(`Assigned ${selected.size} leads to ${owner}`);
        }}
      />
    </main>
  );
}

function SplitList({
  leads,
  activeId,
  onSelect,
}: {
  leads: Lead[];
  activeId: string | null;
  onSelect: (lead: Lead) => void;
}) {
  return (
    <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-card">
      {leads.map((lead) => (
        <li key={lead.id}>
          <button
            type="button"
            onClick={() => onSelect(lead)}
            className={cn(
              "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition hover:bg-accent/60",
              activeId === lead.id && "bg-primary/10",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium">
                {lead.firstName} {lead.lastName}
              </span>
              <StatusDot status={lead.leadStatus} />
            </span>
            <span className="truncate text-[12px] text-muted-foreground">
              {lead.company} · {lead.city}
            </span>
          </button>
        </li>
      ))}
      {leads.length === 0 && (
        <li className="px-3 py-10 text-center text-[13px] text-muted-foreground">No leads here.</li>
      )}
    </ul>
  );
}

function StatusDot({ status }: { status: LeadStatus }) {
  return (
    <span className="shrink-0 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {status}
    </span>
  );
}

function SegmentGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-background">{children}</div>
  );
}

function Segment({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
