import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  FamilyRole,
  FamilyMemberState,
  SafetyAlert,
  ChatMessage,
  ScheduleEntry,
  PatientRecord,
  Document,
  ExtractedData,
  Medication,
} from "./types";
import { createDefaultMembers, createEmptyPatient, FAMILY_ROLES } from "./sampleData";

interface KinStore {
  members: Record<FamilyRole, FamilyMemberState>;

  getMember: (id: FamilyRole) => FamilyMemberState;
  updateDisplayName: (id: FamilyRole, name: string) => void;

  mergeExtracted: (id: FamilyRole, extracted: ExtractedData, fileName: string, docId: string) => void;
  deleteDocument: (id: FamilyRole, docId: string) => void;
  deleteMedication: (id: FamilyRole, medId: string) => void;
  toggleMedicationActive: (id: FamilyRole, medId: string) => void;
  resetMember: (id: FamilyRole) => void;

  setAlerts: (id: FamilyRole, alerts: SafetyAlert[]) => void;
  addChatMessage: (id: FamilyRole, msg: ChatMessage) => void;
  clearChat: (id: FamilyRole) => void;
  markTaken: (id: FamilyRole, key: string) => void;
  markUntaken: (id: FamilyRole, key: string) => void;
}

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } as unknown as Storage;
  }
  return localStorage;
});

export const useKinStore = create<KinStore>()(
  persist(
    (set, get) => ({
      members: createDefaultMembers(),

      getMember: (id) => get().members[id],

      updateDisplayName: (id, name) =>
        set((s) => ({
          members: {
            ...s.members,
            [id]: { ...s.members[id], displayName: name },
          },
        })),

      mergeExtracted: (id, extracted, fileName, docId) =>
        set((s) => {
          const member = s.members[id];
          const p = member.patient;

          const newDoc: Document = {
            id: docId,
            type: extracted.documentType ?? "other",
            uploadedAt: new Date().toISOString().split("T")[0],
            fileName,
            summary: extracted.rawSummary ?? undefined,
          };

          const incomingMeds = (extracted.medications ?? []).map((m) => ({
            ...m,
            sourceDocId: docId,
            active: true,
            id: m.id || `med-${Math.random().toString(36).slice(2)}`,
          }));
          const newMeds = incomingMeds.filter(
            (m) => !p.medications.some((e) => e.name.toLowerCase() === m.name.toLowerCase())
          );

          const incomingConditions = (extracted.conditions ?? []).map((c) => ({
            ...c,
            sourceDocId: docId,
          }));
          const newConditions = incomingConditions.filter(
            (c) => !p.conditions.some((e) => e.name.toLowerCase() === c.name.toLowerCase())
          );

          const newFollowUps = (extracted.followUps ?? []).filter(
            (f) => !p.followUps.some((e) => e.date === f.date && e.reason === f.reason)
          );

          const newAllergies = Array.from(
            new Set([...p.allergies, ...(extracted.allergies ?? [])])
          );

          return {
            members: {
              ...s.members,
              [id]: {
                ...member,
                patient: {
                  ...p,
                  patientName: extracted.patientName ?? p.patientName,
                  dateOfBirth: extracted.dateOfBirth ?? p.dateOfBirth ?? undefined,
                  allergies: newAllergies,
                  conditions: [...p.conditions, ...newConditions],
                  medications: [...p.medications, ...newMeds],
                  followUps: [...p.followUps, ...newFollowUps],
                  documents: [...p.documents, newDoc],
                  lastUpdated: new Date().toISOString(),
                },
              },
            },
          };
        }),

      deleteDocument: (id, docId) =>
        set((s) => {
          const member = s.members[id];
          const p = member.patient;
          return {
            members: {
              ...s.members,
              [id]: {
                ...member,
                patient: {
                  ...p,
                  documents: p.documents.filter((d) => d.id !== docId),
                  medications: p.medications.filter((m) => m.sourceDocId !== docId),
                  conditions: p.conditions.filter((c) => c.sourceDocId !== docId),
                  lastUpdated: new Date().toISOString(),
                },
              },
            },
          };
        }),

      deleteMedication: (id, medId) =>
        set((s) => {
          const member = s.members[id];
          return {
            members: {
              ...s.members,
              [id]: {
                ...member,
                patient: {
                  ...member.patient,
                  medications: member.patient.medications.filter((m) => m.id !== medId),
                  lastUpdated: new Date().toISOString(),
                },
              },
            },
          };
        }),

      toggleMedicationActive: (id, medId) =>
        set((s) => {
          const member = s.members[id];
          return {
            members: {
              ...s.members,
              [id]: {
                ...member,
                patient: {
                  ...member.patient,
                  medications: member.patient.medications.map((m) =>
                    m.id === medId ? { ...m, active: !m.active } : m
                  ),
                },
              },
            },
          };
        }),

      resetMember: (id) =>
        set((s) => {
          const cfg = s.members[id];
          return {
            members: {
              ...s.members,
              [id]: {
                id,
                displayName: cfg.displayName,
                patient: createEmptyPatient(cfg.displayName),
                alerts: [],
                chatHistory: [],
                takenEntries: {},
              },
            },
          };
        }),

      setAlerts: (id, alerts) =>
        set((s) => ({
          members: { ...s.members, [id]: { ...s.members[id], alerts } },
        })),

      addChatMessage: (id, msg) =>
        set((s) => ({
          members: {
            ...s.members,
            [id]: {
              ...s.members[id],
              chatHistory: [...s.members[id].chatHistory, msg],
            },
          },
        })),

      clearChat: (id) =>
        set((s) => ({
          members: { ...s.members, [id]: { ...s.members[id], chatHistory: [] } },
        })),

      markTaken: (id, key) =>
        set((s) => ({
          members: {
            ...s.members,
            [id]: {
              ...s.members[id],
              takenEntries: { ...s.members[id].takenEntries, [key]: true },
            },
          },
        })),

      markUntaken: (id, key) =>
        set((s) => {
          const { [key]: _, ...rest } = s.members[id].takenEntries;
          return {
            members: {
              ...s.members,
              [id]: { ...s.members[id], takenEntries: rest },
            },
          };
        }),
    }),
    {
      name: "kin-family-v1",
      storage: safeStorage,
      skipHydration: true,
    }
  )
);

export function buildScheduleForToday(patient: PatientRecord): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  for (const med of patient.medications.filter((m) => m.active)) {
    for (const time of med.times) {
      entries.push({ time, medication: med });
    }
  }
  return entries.sort((a, b) => {
    const toMinutes = (t: string) => {
      const parts = t.split(" ");
      const [hm, period] = [parts[0], parts[1] ?? "AM"];
      const [h, m] = hm.split(":").map(Number);
      const hours = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
      return hours * 60 + (m || 0);
    };
    return toMinutes(a.time) - toMinutes(b.time);
  });
}
