export type FamilyRole = "me" | "mother" | "father" | "sister" | "brother";

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  times: string[];
  purpose: string;
  instructions: string;
  avoid: string[];
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
  sourceDocId?: string;
}

export interface FollowUp {
  date: string;
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
  tier?: ChatTier;
  timestamp: string;
}

export interface ScheduleEntry {
  time: string;
  medication: Medication;
  taken?: boolean;
  takenAt?: string;
}

export interface ExtractedData {
  patientName?: string | null;
  dateOfBirth?: string | null;
  documentType?: Document["type"];
  allergies?: string[];
  conditions?: Diagnosis[];
  medications?: Medication[];
  followUps?: FollowUp[];
  rawSummary?: string;
}

export interface FamilyMemberState {
  id: FamilyRole;
  displayName: string;
  patient: PatientRecord;
  alerts: SafetyAlert[];
  chatHistory: ChatMessage[];
  takenEntries: Record<string, boolean>;
}
