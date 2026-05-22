import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { checkDrugDrugInteractions } from "@/lib/rxnav";
import type { SafetyAlert, Medication, Diagnosis } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45;

const LLM_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

async function llmChecks(
  medications: Medication[],
  conditions: Diagnosis[],
  allergies: string[]
): Promise<SafetyAlert[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const client = new Groq({ apiKey });

  const medList = medications.map((m) => `${m.name} ${m.dosage}`).join(", ");
  const condList = conditions.map((c) => c.name).join(", ");
  const allergyList = allergies.join(", ");

  const prompt = `You are a clinical pharmacist. Check these medications for FOOD interactions,
CONDITION interactions, and ALLERGY risks. Return ONLY a JSON array of alert objects.

Medications: ${medList}
Conditions: ${condList || "none"}
Allergies: ${allergyList || "none"}

Return a JSON array (may be empty) of objects with this schema:
[{
  "id": string (unique short id),
  "type": "drug-food" | "drug-condition" | "drug-allergy",
  "severity": "mild" | "moderate" | "severe",
  "title": string (short title),
  "message": string (plain-English explanation, 2-3 sentences),
  "affectedMedications": string[] (medication names),
  "recommendation": string (what patient/caregiver should do),
  "source": "llm"
}]

Rules:
- Only include REAL, clinically significant interactions.
- Drug-drug interactions are handled separately — skip them here.
- If there are no significant interactions, return an empty array [].
- Return ONLY the JSON array, no other text.`;

  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are a clinical pharmacist safety checker. Return JSON only, wrapped as { "alerts": [...] }.',
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : (parsed?.alerts ?? []);
}

export async function POST(req: NextRequest) {
  try {
    const { medications, conditions, allergies } = (await req.json()) as {
      medications: Medication[];
      conditions: Diagnosis[];
      allergies: string[];
    };

    const drugNames = medications.filter((m) => m.active).map((m) => m.name);

    // Run RxNav drug-drug + LLM food/condition/allergy checks in parallel
    const [rxNavInteractions, llmAlerts] = await Promise.all([
      checkDrugDrugInteractions(drugNames),
      llmChecks(medications, conditions, allergies),
    ]);

    // Convert RxNav results to SafetyAlert format
    const rxAlerts: SafetyAlert[] = rxNavInteractions.map((ix, i) => ({
      id: `rxnav-${i}`,
      type: "drug-drug",
      severity:
        ix.severity?.toLowerCase().includes("high")
          ? "severe"
          : ix.severity?.toLowerCase().includes("moderate")
          ? "moderate"
          : "mild",
      title: `${ix.drug1} + ${ix.drug2}`,
      message: ix.description,
      affectedMedications: [ix.drug1, ix.drug2],
      recommendation: "Consult your prescribing doctor before making any changes.",
      source: "rxnav",
    }));

    const allAlerts: SafetyAlert[] = [...rxAlerts, ...llmAlerts];

    return NextResponse.json({ success: true, alerts: allAlerts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Interaction check failed";
    console.error("[interactions]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
