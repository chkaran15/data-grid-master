import { useState } from "react";
import { Download, Pencil, Trash2, UserCog, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COLUMNS,
  OWNERS,
  type ColumnKey,
  type Owner,
} from "@/lib/crm-data";

type Props = {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onExport: () => void;
  onMassUpdate: (field: ColumnKey, value: string) => void;
  onAssign: (owner: Owner) => void;
};

export function BulkActionBar({ count, onClear, onDelete, onExport, onMassUpdate, onAssign }: Props) {
  const [massOpen, setMassOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [field, setField] = useState<ColumnKey>("leadStatus");
  const [value, setValue] = useState("Contacted");
  const [owner, setOwner] = useState<Owner>("You");

  if (count === 0) return null;
  const col = COLUMNS.find((c) => c.key === field)!;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-border bg-foreground/95 px-3 py-2 text-primary-foreground shadow-xl backdrop-blur">
          <span className="px-2 text-[13px] font-semibold text-background">
            {count} selected
          </span>
          <span className="h-5 w-px bg-background/25" />
          <BarButton icon={<Pencil className="size-3.5" />} onClick={() => setMassOpen(true)}>
            Mass Update
          </BarButton>
          <BarButton icon={<UserCog className="size-3.5" />} onClick={() => setAssignOpen(true)}>
            Assign Owner
          </BarButton>
          <BarButton icon={<Download className="size-3.5" />} onClick={onExport}>
            Export CSV
          </BarButton>
          <BarButton icon={<Trash2 className="size-3.5" />} onClick={onDelete} danger>
            Delete
          </BarButton>
          <button
            type="button"
            onClick={onClear}
            className="ml-1 grid size-7 place-items-center rounded-full text-background/70 hover:bg-background/15 hover:text-background"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={massOpen} onOpenChange={setMassOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mass update {count} leads</DialogTitle>
            <DialogDescription>Pick one field and the value to apply to every selected lead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Field
              <select
                value={field}
                onChange={(e) => {
                  const key = e.target.value as ColumnKey;
                  setField(key);
                  const next = COLUMNS.find((c) => c.key === key);
                  setValue(next?.options?.[0] ?? "");
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
              >
                {COLUMNS.filter((c) => c.editor !== "none" && c.key !== "name").map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              New value
              {col.options ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                >
                  {col.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                />
              )}
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMassOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onMassUpdate(field, value);
                setMassOpen(false);
              }}
            >
              Update {count} leads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign owner</DialogTitle>
            <DialogDescription>Transfer the {count} selected leads to a teammate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            {OWNERS.map((o) => (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <input
                  type="radio"
                  name="owner"
                  checked={owner === o}
                  onChange={() => setOwner(o)}
                  className="accent-[var(--color-primary)]"
                />
                {o}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onAssign(owner);
                setAssignOpen(false);
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BarButton({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition " +
        (danger
          ? "text-rose-300 hover:bg-rose-500/20"
          : "text-background/90 hover:bg-background/15 hover:text-background")
      }
    >
      {icon}
      {children}
    </button>
  );
}
