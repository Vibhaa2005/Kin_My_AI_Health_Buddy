"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import MedCard from "@/components/MedCard";
import InteractionAlert from "@/components/InteractionAlert";
import { useKinStore } from "@/lib/store";
import {
  Pill,
  ShieldAlert,
  CalendarCheck,
  Loader2,
  RefreshCw,
  Heart,
  Activity,
} from "lucide-react";
import clsx from "clsx";

type Tab = "medications" | "interactions" | "conditions";

export default function DashboardPage() {
  const { patient, alerts, setAlerts } = useKinStore();
  const [activeTab, setActiveTab] = useState<Tab>("medications");
  const [refreshing, setRefreshing] = useState(false);

  const activeMeds = patient.medications.filter((m) => m.active);

  const severeCt = alerts.filter((a) => a.severity === "severe").length;
  const moderateCt = alerts.filter((a) => a.severity === "moderate").length;

  const refreshInteractions = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications: patient.medications,
          conditions: patient.conditions,
          allergies: patient.allergies,
        }),
      });
      const json = await res.json();
      if (json.success) setAlerts(json.alerts);
    } catch {
      // keep existing alerts
    } finally {
      setRefreshing(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "medications",  label: "Medications",   icon: Pill,        count: activeMeds.length },
    { id: "interactions", label: "Safety Alerts", icon: ShieldAlert, count: alerts.length },
    { id: "conditions",   label: "Conditions",    icon: Activity,    count: patient.conditions.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Patient header */}
        <div className="kin-card p-5 mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-200" />
              <h1 className="text-2xl font-bold text-gray-900">{patient.patientName}</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {patient.conditions.map((c) => c.name).join(" · ") || "No conditions on file"}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {patient.allergies.map((a) => (
                <span key={a} className="text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-0.5 rounded-lg font-medium">
                  ⚠ {a} allergy
                </span>
              ))}
            </div>
          </div>

          <div className="text-right shrink-0">
            {severeCt > 0 && (
              <div className="text-sm font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl mb-1">
                {severeCt} severe alert{severeCt > 1 ? "s" : ""}
              </div>
            )}
            {moderateCt > 0 && (
              <div className="text-sm font-bold text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                {moderateCt} moderate alert{moderateCt > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-sand-200 pb-1">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activeTab === id
                  ? "bg-sage-100 text-sage-700"
                  : "text-gray-600 hover:bg-sand-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && (
                <span className={clsx(
                  "text-xs rounded-full px-1.5 py-0.5 font-bold",
                  activeTab === id ? "bg-sage-200 text-sage-700" : "bg-gray-100 text-gray-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "medications" && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Tap any medication card to see full instructions, what to avoid, and why it was prescribed.
            </p>
            <div className="space-y-3">
              {activeMeds.length === 0 && (
                <p className="text-gray-400 text-center py-10">No medications on file yet.</p>
              )}
              {activeMeds.map((med) => (
                <MedCard key={med.id} med={med} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Drug–drug interactions from NIH RxNav · food/condition/allergy from AI analysis.
              </p>
              <button
                onClick={refreshInteractions}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-sm text-sage-600 hover:text-sage-700 bg-sage-50 border border-sage-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Refresh
              </button>
            </div>

            {alerts.length === 0 && !refreshing && (
              <div className="text-center py-10">
                <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No alerts yet. Click Refresh to run the check.</p>
              </div>
            )}

            {/* Sort: severe first */}
            <div className="space-y-3">
              {[...alerts]
                .sort((a, b) => {
                  const order = { severe: 0, moderate: 1, mild: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((alert) => (
                  <InteractionAlert key={alert.id} alert={alert} />
                ))}
            </div>
          </div>
        )}

        {activeTab === "conditions" && (
          <div className="space-y-3">
            {patient.conditions.length === 0 && (
              <p className="text-gray-400 text-center py-10">No conditions on file yet.</p>
            )}
            {patient.conditions.map((c, i) => (
              <div key={i} className="kin-card p-4 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-sage-50 border border-sage-200">
                  <Activity className="w-4 h-4 text-sage-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-500">
                    {c.icdCode && <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{c.icdCode}</span>}
                    {c.date && `Diagnosed ${new Date(c.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow-ups */}
        {patient.followUps.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sage-500" />
              Upcoming Follow-ups
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {patient.followUps
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((fu, i) => (
                  <div key={i} className="kin-card p-4">
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(fu.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{fu.reason}</p>
                    {fu.provider && <p className="text-sm text-gray-500 mt-0.5">{fu.provider}</p>}
                    {fu.location && <p className="text-xs text-gray-400 mt-0.5">{fu.location}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
