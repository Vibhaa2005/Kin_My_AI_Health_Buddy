"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";
import MedCard from "@/components/MedCard";
import InteractionAlert from "@/components/InteractionAlert";
import { useKinStore } from "@/lib/store";
import { FAMILY_ROLES } from "@/lib/sampleData";
import type { FamilyRole } from "@/lib/types";
import { Pill, ShieldAlert, Activity, Trash2 } from "lucide-react";

type Tab = "medications" | "interactions" | "conditions";

export default function MemberDashboardPage() {
  const params = useParams();
  const id = params?.id as FamilyRole;
  const [tab, setTab] = useState<Tab>("medications");
  const { members, deleteMedication, toggleMedicationActive } = useKinStore();

  if (!FAMILY_ROLES.includes(id)) return null;

  const { patient, alerts } = members[id];
  const activeMeds = patient.medications.filter((m) => m.active);
  const inactiveMeds = patient.medications.filter((m) => !m.active);

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "medications",  label: "Medications",   icon: Pill,        count: patient.medications.length },
    { id: "interactions", label: "Safety Alerts", icon: ShieldAlert, count: alerts.length },
    { id: "conditions",   label: "Conditions",    icon: Activity,    count: patient.conditions.length },
  ];

  if (patient.documents.length === 0) {
    return (
      <div className="text-center py-16">
        <Pill className="w-10 h-10 text-sand-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No health records yet.</p>
        <p className="text-sm text-gray-400 mt-1">Upload documents in the Overview tab first.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Allergy banner */}
      {patient.allergies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-600">Allergies on file</p>
            <p className="text-sm text-rose-800">{patient.allergies.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-sand-200 pb-1">
        {TABS.map(({ id: tid, label, icon: Icon, count }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              tab === tid ? "bg-sage-100 text-sage-700" : "text-gray-500 hover:bg-sand-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={clsx("text-xs font-bold rounded-full px-1.5 py-0.5", tab === tid ? "bg-sage-200 text-sage-700" : "bg-gray-100 text-gray-500")}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Medications tab */}
      {tab === "medications" && (
        <div className="space-y-3">
          {patient.medications.length === 0 && (
            <p className="text-center text-gray-400 py-10">No medications extracted yet.</p>
          )}
          {activeMeds.map((med) => (
            <div key={med.id} className="group relative">
              <MedCard med={med} />
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleMedicationActive(id, med.id)}
                  className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100"
                >
                  Mark stopped
                </button>
                <button
                  onClick={() => deleteMedication(id, med.id)}
                  className="text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {inactiveMeds.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Stopped / Inactive</p>
              {inactiveMeds.map((med) => (
                <div key={med.id} className="group relative opacity-50">
                  <MedCard med={med} />
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleMedicationActive(id, med.id)}
                      className="text-xs bg-sage-50 text-sage-600 border border-sage-200 px-2 py-1 rounded-lg hover:bg-sage-100"
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => deleteMedication(id, med.id)}
                      className="text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactions tab */}
      {tab === "interactions" && (
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-center py-10">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No safety alerts. Run a check from the Overview tab.</p>
            </div>
          )}
          {[...alerts]
            .sort((a, b) => ({ severe: 0, moderate: 1, mild: 2 }[a.severity] - { severe: 0, moderate: 1, mild: 2 }[b.severity]))
            .map((alert) => <InteractionAlert key={alert.id} alert={alert} />)}
        </div>
      )}

      {/* Conditions tab */}
      {tab === "conditions" && (
        <div className="space-y-3">
          {patient.conditions.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No conditions extracted yet.</p>
          )}
          {patient.conditions.map((c, i) => (
            <div key={i} className="kin-card p-4 flex items-start gap-3">
              <Activity className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.icdCode && <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{c.icdCode}</span>}
                  {c.date && new Date(c.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
