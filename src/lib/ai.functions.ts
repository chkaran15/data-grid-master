import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1).max(4000),
  context: z.string().max(12000).optional(),
  scope: z.enum(["global", "lead"]).default("global"),
});

export const askCrmAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { answer: "AI is not configured yet." };

    const system =
      data.scope === "lead"
        ? "You are a CRM sales assistant embedded in a lead record. Give sharp, specific guidance about this one lead: qualification, next best action, outreach drafts. Use short paragraphs or tight bullet lists. Never invent facts that contradict the record."
        : "You are a CRM analyst assistant for a leads pipeline. Answer questions about the lead list with concrete numbers, patterns and recommended actions. Use tight bullet lists. Only use the provided data.";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: data.context
              ? `Data:\n${data.context}\n\nQuestion: ${data.question}`
              : data.question,
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 429) return { answer: "AI rate limit reached. Please try again shortly." };
      if (res.status === 402) return { answer: "AI credits are exhausted for this workspace." };
      return { answer: `AI request failed (${res.status}). ${detail.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { answer: json.choices?.[0]?.message?.content?.trim() || "No answer returned." };
  });
