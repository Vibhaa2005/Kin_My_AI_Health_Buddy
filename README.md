# Kin — Your AI Health Buddy

A longitudinal, context-aware AI health companion for patients and caregivers.

Upload prescriptions and discharge summaries — Kin reads them, builds a unified plain-language care plan, runs safety checks, and answers questions grounded in *this* patient's history.

> **"Can Dad take ibuprofen?"** → Kin knows he's on Warfarin from a discharge summary uploaded weeks ago. Answer: No — and here's why.

---

## Features

| Feature | Description |
|---|---|
| Document upload | Photo or PDF → AI extracts medications, diagnoses, follow-up dates |
| Unified med summary | What / When / How / Why / Avoid for every medication |
| 4-type safety checks | Drug–drug (NIH RxNav) · Drug–food · Drug–condition · Drug–allergy |
| Daily schedule | Every reminder includes what to take, how, and what to avoid |
| Grounded Q&A | 3-tier safety responses: answer / defer / escalate to 911 |
| Adherence tracking | Tap to confirm each dose; caregiver sees missed doses |
| Cross-doc reconciliation | Detects contradictions across uploads over time |

## Stack

- **Framework:** Next.js 15 (App Router)
- **LLM:** Groq — `meta-llama/llama-4-scout-17b-16e-instruct` (Llama 4 Scout, multimodal)
- **Drug interactions:** NIH RxNav/RxNorm API (free, no key)
- **UI:** Tailwind CSS — warm, high-contrast, elderly-friendly

> Running on open-source Llama via Groq means a hospital can self-host this for full PHI data control.

## Getting started

```bash
# 1. Clone and install
npm install

# 2. Add your Groq API key (free at https://console.groq.com)
cp .env.example .env.local
# edit .env.local → GROQ_API_KEY=gsk_...

# 3. Run dev server
npm run dev
# open http://localhost:3000
```

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Upload / landing (preloaded sample patient)
│   ├── dashboard/page.tsx    # Medication cards + safety alerts
│   ├── schedule/page.tsx     # Daily med schedule with adherence tracking
│   ├── chat/page.tsx         # Grounded Q&A bot with 3-tier safety
│   └── api/
│       ├── extract/          # Groq vision → structured JSON
│       ├── interactions/     # RxNav drug-drug + LLM food/condition/allergy
│       ├── chat/             # Grounded Q&A with safety tiers
│       └── reconcile/        # Cross-document contradiction detection
├── components/               # MedCard, InteractionAlert, ScheduleCard, ChatBot…
└── lib/
    ├── types.ts              # Shared TypeScript types
    ├── extraction.ts         # Swappable extractor (swap provider here only)
    ├── rxnav.ts              # NIH RxNav API client
    ├── sampleData.ts         # Preloaded demo patient (Robert Chen)
    └── store.ts              # Zustand store (persisted locally)
```

## Swapping the extraction model

All document extraction goes through `src/lib/extraction.ts`. Change `EXTRACTION_MODEL` or swap the provider function there — the rest of the app is untouched.

## Privacy

- API key lives server-side only (Next.js API routes). Never exposed to the browser.
- Patient data is stored in `localStorage` on the user's device only.
- Nothing is logged or stored server-side.

---

*Not a substitute for professional medical advice. For emergencies call 911.*
