"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { useKinStore } from "@/lib/store";
import { FAMILY_ROLES, FAMILY_ROLE_CONFIG } from "@/lib/sampleData";
import type { FamilyRole, FamilyMemberState } from "@/lib/types";
import { Pill, CalendarDays, FileText, ChevronRight, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function HomePage() {
  const { members } = useKinStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Family's Health Hub
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Tap a family member to view their medications, safety alerts, schedule, and ask the AI health buddy questions about their care.
          </p>
        </div>

        {/* Family member grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FAMILY_ROLES.map((role) => (
            <MemberCard key={role} role={role} member={members[role]} />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-xs text-gray-400">
          Each person's health data is managed separately and stored only on this device.
          Not a substitute for professional medical advice.
        </p>
      </main>
    </div>
  );
}

function MemberCard({ role, member }: { role: FamilyRole; member: FamilyMemberState }) {
  const cfg = FAMILY_ROLE_CONFIG[role];
  const activeMeds = member.patient.medications.filter((m) => m.active);
  const hasData = member.patient.documents.length > 0;
  const severeAlerts = member.alerts.filter((a) => a.severity === "severe");
  const nextFollowUp = member.patient.followUps
    .filter((f) => new Date(f.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <Link
      href={`/member/${role}`}
      className={clsx(
        "group kin-card p-5 flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-0.5",
        severeAlerts.length > 0 && "ring-2 ring-rose-300"
      )}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold border-2",
            cfg.bgClass,
            cfg.textClass,
            cfg.borderClass
          )}
        >
          {member.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">{member.displayName}</h2>
          <p className={clsx("text-sm font-medium", cfg.textClass)}>{cfg.label}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
      </div>

      {/* Stats */}
      {hasData ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Pill className="w-3.5 h-3.5 text-sage-500 shrink-0" />
            <span>
              <span className="font-semibold">{activeMeds.length}</span> active medication{activeMeds.length !== 1 ? "s" : ""}
            </span>
          </div>

          {nextFollowUp && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays className="w-3.5 h-3.5 text-sand-500 shrink-0" />
              <span className="truncate">
                Next: {new Date(nextFollowUp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          )}

          {severeAlerts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-2.5 py-1.5 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{severeAlerts.length} severe alert{severeAlerts.length > 1 ? "s" : ""}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-sand-100">
            <FileText className="w-3 h-3 shrink-0" />
            {member.patient.documents.length} document{member.patient.documents.length !== 1 ? "s" : ""}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-sand-200 p-4 text-center">
          <p className="text-sm text-gray-400">No records yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Tap to add documents</p>
        </div>
      )}
    </Link>
  );
}
