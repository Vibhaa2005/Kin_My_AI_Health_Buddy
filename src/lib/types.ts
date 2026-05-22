export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  times: string[];           // e.g. ["8:00 AM", "8:00 PM"]
  purpose: string;           // why it was prescribed
  instructions: string;      // how to take it
  avoid: string[];           // foods/activities to avoid
  sideEffects: string[];
  prescribedDate?: string;
  prescribedBy?: string;
  active: boolean;
  sourceDocId?: string;
}

export interface Diagnosis {
  name: string;
  icdCode?: string;
  date?: string;
}

export interface FollowUp {
  date: string;             // ISO date string
  reason: string;
  provider?: string;
  location?: string;
}

export interface Document {
  id: string;
  type: "prescription" | "discharge" | "lab" | "followup" | "other";
  uploadedAt: string;
  fileName: string;
  summary?: string;
}

export interface PatientRecord {
  id: string;
  patientName: string;
  dateOfBirth?: string;
  allergies: string[];
  conditions: Diagnosis[];
  medications: Medication[];
  followUps: FollowUp[];
  documents: Document[];
  lastUpdated: string;
}

export type InteractionSeverity = "mild" | "moderate" | "severe";
export type InteractionType = "drug-drug" | "drug-food" | "drug-condition" | "drug-allergy";

export interface SafetyAlert {
  id: string;
  type: InteractionType;
  severity: InteractionSeverity;
  title: string;
  message: string;
  affectedMedications: string[];
  recommendation: string;
  source: "rxnav" | "llm";
}

export type ChatTier = 1 | 2 | 3;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tier?: ChatTier;       // only set on assistant messages
  timestamp: string;
}

export interface ScheduleEntry {
  time: string;          // e.g. "8:00 AM"
  medication: Medication;
  taken?: boolean;
  takenAt?: string;
}

export interface DailySchedule {
  date: string;
  entries: ScheduleEntry[];
}

// What the AI extraction returns for a single document
export interface ExtractedData {
  patientName?: string;
  dateOfBirth?: string;
  allergies?: string[];
  conditions?: Diagnosis[];
  medications?: Medication[];
  followUps?: FollowUp[];
  documentType?: Document["type"];
  rawSummary?: string;
}
