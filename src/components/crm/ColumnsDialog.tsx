import { GripVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { COLUMNS, DEFAULT_VISIBLE, type ColumnKey } from "@/lib/crm-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ColumnKey[];
  visible: ColumnKey[];
  onApply: (order: ColumnKey[], visible: ColumnKey[]) => void;
};

export function ColumnsDialog({ open, onOpenChange, order, visible, onApply }: Props) {
  const [draftOrder, setDraftOrder] = useState(order);
  const [draftVisible, setDraftVisible] = useState(visible);
  const [drag, setDrag] = useState<ColumnKey | null>(null);

  // Re-sync the draft each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraftOrder(order);
      setDraftVisible(visible);
    }
  }

  const move = (from: ColumnKey, to: ColumnKey) => {
    const next = [...draftOrder];
    const f = next.indexOf(from);
    const t = next.indexOf(to);
    if (f < 0 || t < 0) return;
    next.splice(t, 0, next.splice(f, 1)[0]!);
    setDraftOrder(next);
  };

  const toggle = (key: ColumnKey) =>
    setDraftVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage columns</DialogTitle>
          <DialogDescription>
            Toggle fields on or off, and drag rows to change the column order in the list view.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">
          {draftOrder.map((key) => {
            const col = COLUMNS.find((c) => c.key === key)!;
            const on = draftVisible.includes(key);
            return (
              <li
                key={key}
                draggable
                onDragStart={() => setDrag(key)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (drag && drag !== key) move(drag, key);
                }}
                onDragEnd={() => setDrag(null)}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2",
                  drag === key && "opacity-50",
                )}
              >
                <GripVertical className="size-4 cursor-grab text-muted-foreground/60" />
                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(key)}
                    className="size-3.5 accent-[var(--color-primary)]"
                  />
                  <span className={cn(!on && "text-muted-foreground")}>{col.label}</span>
                </label>
                {key === "name" && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    primary
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setDraftOrder(COLUMNS.map((c) => c.key));
              setDraftVisible(DEFAULT_VISIBLE);
            }}
          >
            Reset to default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const withName = draftVisible.includes("name")
                  ? draftVisible
                  : (["name", ...draftVisible] as ColumnKey[]);
                onApply(draftOrder, withName);
                onOpenChange(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
