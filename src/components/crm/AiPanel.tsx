import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askCrmAi } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "ai"; text: string };

export function AiPanel({
  scope,
  context,
  suggestions,
  className,
  intro,
}: {
  scope: "global" | "lead";
  context: string;
  suggestions: string[];
  className?: string;
  intro: string;
}) {
  const ask = useServerFn(askCrmAi);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await ask({ data: { question: q, context, scope } });
      setMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong reaching the assistant. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
        {messages.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-card p-3 text-[13px] text-muted-foreground">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="size-4 text-primary" /> CRM Assistant
            </p>
            <p className="mt-1">{intro}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground",
            )}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Thinking…
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => send(s)}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Ask the assistant…"
          className="min-h-[52px] resize-none text-[13px]"
        />
        <Button size="icon" className="size-9" disabled={busy} onClick={() => void send(input)} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function leadContext(lead: {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  leadStatus: string;
  leadSource: string;
  rating: string;
  industry: string;
  owner: string;
  annualRevenue: number;
  employees: number;
  city: string;
  country: string;
  createdAt: string;
}) {
  return [
    `Lead ${lead.id}: ${lead.firstName} ${lead.lastName}, ${lead.title} at ${lead.company}`,
    `Status: ${lead.leadStatus} | Rating: ${lead.rating} | Source: ${lead.leadSource}`,
    `Industry: ${lead.industry} | Employees: ${lead.employees} | Annual revenue: $${lead.annualRevenue}`,
    `Contact: ${lead.email}, ${lead.phone} | Location: ${lead.city}, ${lead.country}`,
    `Owner: ${lead.owner} | Created: ${lead.createdAt}`,
  ].join("\n");
}
