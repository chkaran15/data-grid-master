import { Link } from "@tanstack/react-router";
import { CalendarPlus, ExternalLink, Mail, Phone, Sparkles, StickyNote, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiPanel, leadContext } from "@/components/crm/AiPanel";
import { LeadDetail } from "@/components/crm/LeadDetail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ColumnKey, Lead } from "@/lib/crm-data";

export function LeadSheet({
  lead,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string, key: ColumnKey, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {lead && (
          <>
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="text-base">
                {lead.firstName} {lead.lastName}
              </SheetTitle>
              <SheetDescription>
                {lead.title} · {lead.company} · {lead.id}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="size-3.5" /> Email
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${lead.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-3.5" /> Call
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Follow-up task created for tomorrow")}
                >
                  <CalendarPlus className="size-3.5" /> Follow up
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/leads/$id" params={{ id: lead.id }}>
                    <ExternalLink className="size-3.5" /> Full page
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    onDelete(lead.id);
                    onOpenChange(false);
                    toast.success("Lead deleted");
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </SheetHeader>

            <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
              <TabsList className="mx-4 mt-3 w-fit">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">
                  <StickyNote className="size-3.5" /> Notes
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="size-3.5" /> AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto p-4">
                <LeadDetail lead={lead} onEdit={onEdit} />
              </TabsContent>

              <TabsContent value="notes" className="min-h-0 flex-1 overflow-y-auto p-4">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Log a call, meeting or next step…"
                  rows={3}
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    if (!note.trim()) return;
                    setNotes((prev) => [note.trim(), ...prev]);
                    setNote("");
                    toast.success("Note added");
                  }}
                >
                  Add note
                </Button>
                <ul className="mt-4 space-y-2">
                  {notes.map((n, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border bg-card px-3 py-2 text-[13px] whitespace-pre-wrap"
                    >
                      {n}
                    </li>
                  ))}
                  {notes.length === 0 && (
                    <li className="text-[13px] text-muted-foreground">No notes yet.</li>
                  )}
                </ul>
              </TabsContent>

              <TabsContent value="ai" className="min-h-0 flex-1 p-4">
                <AiPanel
                  scope="lead"
                  context={leadContext(lead)}
                  intro={`Ask anything about ${lead.firstName} at ${lead.company} — qualification, next steps or outreach drafts.`}
                  suggestions={[
                    "Summarise this lead",
                    "Draft a first outreach email",
                    "What is the next best action?",
                    "Score this lead and explain why",
                  ]}
                  className="h-full"
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
