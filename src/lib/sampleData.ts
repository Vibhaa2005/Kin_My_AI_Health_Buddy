import type { FamilyRole, FamilyMemberState, PatientRecord } from "./types";

export const FAMILY_ROLE_CONFIG: Record<
  FamilyRole,
  { label: string; initial: string; bgClass: string; textClass: string; borderClass: string }
> = {
  me:      { label: "Me",      initial: "M",  bgClass: "bg-sage-100",  textClass: "text-sage-700",  borderClass: "border-sage-300" },
  mother:  { label: "Mother",  initial: "Mo", bgClass: "bg-rose-50",   textClass: "text-rose-600",  borderClass: "border-rose-200" },
  father:  { label: "Father",  initial: "Fa", bgClass: "bg-sand-100",  textClass: "text-sand-500",  borderClass: "border-sand-300" },
  sister:  { label: "Sister",  initial: "Si", bgClass: "bg-amber-50",  textClass: "text-amber-600", borderClass: "border-amber-200" },
  brother: { label: "Brother", initial: "Br", bgClass: "bg-gray-100",  textClass: "text-gray-600",  borderClass: "border-gray-300" },
};

export const FAMILY_ROLES: FamilyRole[] = ["me", "mother", "father", "sister", "brother"];

export function createEmptyPatient(role: string, name: string): PatientRecord {
  return {
    id: `patient-${role}`,   // deterministic — avoids server/client hydration mismatch
    patientName: name,
    allergies: [],
    conditions: [],
    medications: [],
    followUps: [],
    documents: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function createDefaultMembers(): Record<FamilyRole, FamilyMemberState> {
  const result = {} as Record<FamilyRole, FamilyMemberState>;
  for (const role of FAMILY_ROLES) {
    const cfg = FAMILY_ROLE_CONFIG[role];
    result[role] = {
      id: role,
      displayName: cfg.label,
      patient: createEmptyPatient(role, cfg.label),
      alerts: [],
      chatHistory: [],
      takenEntries: {},
    };
  }
  return result;
}
