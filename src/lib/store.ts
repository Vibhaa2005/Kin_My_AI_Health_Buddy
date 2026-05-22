"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PatientRecord, SafetyAlert, ChatMessage, ScheduleEntry } from "./types";
import { SAMPLE_PATIENT, SAMPLE_ALERTS } from "./sampleData";

interface KinStore {
  patient: PatientRecord;
  alerts: SafetyAlert[];
  chatHistory: ChatMessage[];
  takenEntries: Record<string, boolean>; // key: `${date}-${medId}-${time}`

  setPatient: (p: PatientRecord) => void;
  mergeExtracted: (extracted: Partial<PatientRecord>) => void;
  setAlerts: (a: SafetyAlert[]) => void;
  addAlert: (a: SafetyAlert) => void;
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  markTaken: (key: string) => void;
  markUntaken: (key: string) => void;
  resetToSample: () => void;
}

export const useKinStore = create<KinStore>()(
  persist(
    (set) => ({
      patient: SAMPLE_PATIENT,
      alerts: SAMPLE_ALERTS,
      chatHistory: [],
      takenEntries: {},

      setPatient: (p) => set({ patient: p }),

      mergeExtracted: (extracted) =>
        set((state) => {
          const existing = state.patient;
          return {
            patient: {
              ...existing,
              patientName: extracted.patientName ?? existing.patientName,
              dateOfBirth: extracted.dateOfBirth ?? existing.dateOfBirth,
              allergies: Array.from(
                new Set([...(existing.allergies ?? []), ...(extracted.allergies ?? [])])
              ),
              conditions: [
                ...existing.conditions,
                ...(extracted.conditions ?? []).filter(
                  (c) => !existing.conditions.some((e) => e.name === c.name)
                ),
              ],
              medications: [
                ...existing.medications,
                ...(extracted.medications ?? []).filter(
                  (m) => !existing.medications.some((e) => e.name === m.name)
                ),
              ],
              followUps: [
                ...existing.followUps,
                ...(extracted.followUps ?? []).filter(
                  (f) => !existing.followUps.some((e) => e.date === f.date && e.reason === f.reason)
                ),
              ],
              lastUpdated: new Date().toISOString(),
            },
          };
        }),

      setAlerts: (a) => set({ alerts: a }),
      addAlert: (a) => set((s) => ({ alerts: [...s.alerts, a] })),

      addChatMessage: (m) =>
        set((s) => ({ chatHistory: [...s.chatHistory, m] })),
      clearChat: () => set({ chatHistory: [] }),

      markTaken: (key) =>
        set((s) => ({ takenEntries: { ...s.takenEntries, [key]: true } })),
      markUntaken: (key) =>
        set((s) => {
          const { [key]: _, ...rest } = s.takenEntries;
          return { takenEntries: rest };
        }),

      resetToSample: () =>
        set({ patient: SAMPLE_PATIENT, alerts: SAMPLE_ALERTS, chatHistory: [], takenEntries: {} }),
    }),
    {
      name: "kin-patient-store",
      // Don't persist chat history to avoid stale conversations
      partialize: (s) => ({
        patient: s.patient,
        alerts: s.alerts,
        takenEntries: s.takenEntries,
      }),
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
  // Sort by time
  return entries.sort((a, b) => {
    const toMinutes = (t: string) => {
      const [hm, period] = t.split(" ");
      const [h, m] = hm.split(":").map(Number);
      const hours = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
      return hours * 60 + m;
    };
    return toMinutes(a.time) - toMinutes(b.time);
  });
}
