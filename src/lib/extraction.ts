/**
 * Swappable document extractor.
 * Swap the provider by changing this one module — everything else stays the same.
 * Current provider: Groq (Llama 4 Scout, multimodal)
 */

import Groq from "groq-sdk";
import type { ExtractedData } from "./types";

const EXTRACTION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are a medical document parser. Given an image or text of a medical document
(prescription, discharge summary, lab report, or follow-up note), extract ALL structured medical data
and return it as valid JSON matching this exact schema:

{
  "patientName": string | null,
  "dateOfBirth": "YYYY-MM-DD" | null,
  "documentType": "prescription" | "discharge" | "lab" | "followup" | "other",
  "allergies": string[],
  "conditions": [{ "name": string, "icdCode": string | null, "date": "YYYY-MM-DD" | null }],
  "medications": [{
    "id": string,
    "name": string,
    "genericName": string | null,
    "dosage": string,
    "frequency": string,
    "route": string,
    "times": string[],
    "purpose": string,
    "instructions": string,
    "avoid": string[],
    "sideEffects": string[],
    "prescribedDate": "YYYY-MM-DD" | null,
    "prescribedBy": string | null,
    "active": true
  }],
  "followUps": [{ "date": "YYYY-MM-DD", "reason": string, "provider": string | null, "location": string | null }],
  "rawSummary": string
}

Rules:
- For any field not found in the document, use null or empty array.
- Generate a unique short id for each medication (e.g. "med-abc123").
- Infer times from frequency: "once daily" → ["8:00 AM"], "twice daily" → ["8:00 AM", "8:00 PM"],
  "three times daily" → ["8:00 AM", "2:00 PM", "8:00 PM"], "at bedtime" → ["9:00 PM"].
- For avoid and sideEffects, be comprehensive — include food interactions, drug interactions mentioned.
- rawSummary: a 2-3 sentence plain-English summary of what this document says.
- Return ONLY valid JSON. No markdown, no explanation.`;

export async function extractDocument(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const client = new Groq({ apiKey });

  const response = await client.chat.completions.create({
    model: EXTRACTION_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Extract all medical information from this document and return structured JSON.",
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from extraction model");

  return JSON.parse(raw) as ExtractedData;
}

export async function extractDocumentText(text: string): Promise<ExtractedData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const client = new Groq({ apiKey });

  const response = await client.chat.completions.create({
    model: EXTRACTION_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract all medical information from this document text:\n\n${text}`,
      },
    ],
    max_tokens: 4096,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from extraction model");

  return JSON.parse(raw) as ExtractedData;
}
