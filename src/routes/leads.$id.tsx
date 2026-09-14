import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CalendarPlus, Mail, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AiPanel, leadContext } from "@/components/crm/AiPanel";
import { LeadDetail } from "@/components/crm/LeadDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { updateLeadField, useLeads } from "@/lib/leads-store";

export const Route = createFileRoute("/leads/$id")({
  head: () => ({
    meta: [
      { title: "Lead Detail — CRM Leads Console" },
      {
        name: "description",
        content:
          "Full lead record with contact details, status controls, activity notes and an AI assistant for this lead.",
      },
      { property: "og:title", content: "Lead Detail — CRM Leads Console" },
      {
        property: "og:description",
        content: "Review a single CRM lead, edit its status and rating, and get AI-guided next steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { id } = Route.useParams();
  const leads = useLeads();
  const lead = leads.find((l) => l.id === id) ?? null;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" /> Back to Leads
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">
            {lead ? `${lead.firstName} ${lead.lastName}` : "Lead not found"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {lead && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="size-4" /> Email
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${lead.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4" /> Call
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Follow-up task created for tomorrow")}
                >
                  <CalendarPlus className="size-4" /> Follow up
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        {lead ? (
          <>
            <div className="flex min-w-0">
              <LeadDetail lead={lead} onEdit={updateLeadField} />
            </div>
            <section className="flex h-[70vh] flex-col rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" /> AI for this lead
              </h2>
              <AiPanel
                scope="lead"
                context={leadContext(lead)}
                intro={`Ask anything about ${lead.firstName} at ${lead.company}.`}
                suggestions={[
                  "Summarise this lead",
                  "Draft a follow-up email",
                  "What objections should I expect?",
                  "Suggest a 3-step outreach plan",
                ]}
                className="min-h-0 flex-1"
              />
            </section>
          </>
        ) : (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            We couldn't find lead {id}. It may have been deleted.
          </p>
        )}
      </div>
    </main>
  );
}
