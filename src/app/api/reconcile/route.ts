import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { Medication, Document } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export interface ReconciliationFlag {
  id: string;
  severity: "info" | "warning" | "conflict";
  title: string;
  message: string;
  affectedMedications: string[];
  recommendation: string;
  sourceDocuments: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { medications, documents } = (await req.json()) as {
      medications: Medication[];
      documents: Document[];
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });

    const client = new Groq({ apiKey });

    const medList = medications
      .map((m) => `${m.name} ${m.dosage} (${m.active ? "active" : "stopped"}, from doc ${m.sourceDocId ?? "unknown"})`)
      .join("\n");

    const docList = documents
      .map((d) => `${d.id}: ${d.type} uploaded ${d.uploadedAt} — ${d.summary ?? d.fileName}`)
      .join("\n");

    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a clinical pharmacist cross-checking medications across multiple documents. Return JSON only as { "flags": [...] }.',
        },
        {
          role: "user",
          content: `Cross-check these medications across the patient's documents for contradictions, stopped medications that are still active, duplicates, or dosage changes.

DOCUMENTS:
${docList}

MEDICATIONS:
${medList}

Return a JSON object { "flags": [...] } where each flag has:
{
  "id": string,
  "severity": "info" | "warning" | "conflict",
  "title": string,
  "message": string (plain-English explanation),
  "affectedMedications": string[],
  "recommendation": string,
  "sourceDocuments": string[] (doc ids)
}

Only flag real issues. Return empty flags array if records are consistent.`,
        },
      ],
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ flags: [] });

    const parsed = JSON.parse(raw);
    return NextResponse.json({ success: true, flags: parsed.flags ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reconciliation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
