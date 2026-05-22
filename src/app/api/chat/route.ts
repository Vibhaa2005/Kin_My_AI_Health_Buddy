import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { PatientRecord, ChatMessage, ChatTier } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45;

const CHAT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_TEMPLATE = (patient: PatientRecord) => `You are Kin, a caring AI health buddy for ${patient.patientName}'s family.
You have access to ${patient.patientName}'s COMPLETE medical history. Answer questions using ONLY this known history.

PATIENT PROFILE:
- Name: ${patient.patientName}, DOB: ${patient.dateOfBirth ?? "unknown"}
- Allergies: ${patient.allergies.join(", ") || "none on file"}
- Conditions: ${patient.conditions.map((c) => c.name).join(", ") || "none on file"}
- Active Medications:
${patient.medications
  .filter((m) => m.active)
  .map(
    (m) =>
      `  • ${m.name} ${m.dosage} – ${m.frequency}. Purpose: ${m.purpose}. Avoid: ${m.avoid.join("; ")}`
  )
  .join("\n")}

SAFETY TIERS — classify every response with one of:
[TIER-1] You can answer safely from known patient data.
[TIER-2] Uncertain or beyond safe scope → defer to doctor.
[TIER-3] DANGER signal detected → immediate escalation needed.

RULES:
1. Start every response with exactly [TIER-1], [TIER-2], or [TIER-3] on its own line, then your answer.
2. For TIER-3 (chest pain, difficulty breathing, severe bleeding, stroke symptoms, severe allergic reaction, suicidal thoughts): Lead with "STOP AND SEEK EMERGENCY CARE NOW" then give the 911/emergency guidance.
3. For TIER-2: Answer what you can, then say "Please consult ${patient.patientName}'s doctor to confirm this."
4. Answers must be grounded in THIS patient's history — never give generic advice contradicting their known meds/conditions.
5. Always end with a brief privacy note: "I'm using only the health records you've shared with Kin."
6. Tone: warm, calm, clear. Large-text friendly — avoid dense paragraphs.
7. NOT a substitute for medical advice. For emergencies call 911.`;

function parseTier(content: string): ChatTier {
  if (content.includes("[TIER-3]")) return 3;
  if (content.includes("[TIER-2]")) return 2;
  return 1;
}

function cleanContent(content: string): string {
  return content
    .replace(/^\[TIER-[123]\]\s*/m, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { message, patient, history } = (await req.json()) as {
      message: string;
      patient: PatientRecord;
      history: ChatMessage[];
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const client = new Groq({ apiKey });

    // Build message history (last 10 turns to keep context manageable)
    const recentHistory = history.slice(-10);
    const messages = [
      { role: "system" as const, content: SYSTEM_TEMPLATE(patient) },
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.3, // low temperature for medical accuracy
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const tier = parseTier(raw);
    const clean = cleanContent(raw);

    return NextResponse.json({
      success: true,
      message: clean,
      tier,
      fullRaw: raw,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat error";
    console.error("[chat]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
