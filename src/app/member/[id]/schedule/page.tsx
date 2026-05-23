"use client";

import { useParams } from "next/navigation";
import ScheduleCard from "@/components/ScheduleCard";
import { useKinStore, buildScheduleForToday } from "@/lib/store";
import { FAMILY_ROLES } from "@/lib/sampleData";
import type { FamilyRole } from "@/lib/types";
import { CalendarDays, CheckCircle2, Bell, Pill } from "lucide-react";

export default function MemberSchedulePage() {
  const params = useParams();
  const id = params?.id as FamilyRole;
  const { members, markTaken, markUntaken } = useKinStore();

  if (!FAMILY_ROLES.includes(id)) return null;

  const member = members[id];
  const today = new Date().toISOString().split("T")[0];
  const schedule = buildScheduleForToday(member.patient);

  const enriched = schedule.map((entry) => {
    const key = `${today}-${entry.medication.id}-${entry.time}`;
    return { ...entry, taken: member.takenEntries[key] ?? false };
  });

  const takenCount = enriched.filter((e) => e.taken).length;
  const total = enriched.length;
  const allDone = takenCount === total && total > 0;

  const handleToggle = (key: string) => {
    if (member.takenEntries[key]) markUntaken(id, key);
    else markTaken(id, key);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  if (member.patient.documents.length === 0) {
    return (
      <div className="text-center py-16">
        <Pill className="w-10 h-10 text-sand-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No schedule yet.</p>
        <p className="text-sm text-gray-400 mt-1">Upload documents in the Overview tab first.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-5 h-5 text-sage-500" />
              <h1 className="text-xl font-bold text-gray-900">Today's Schedule</h1>
            </div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          {total > 0 && (
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${allDone ? "text-sage-500" : "text-gray-900"}`}>
                {takenCount}/{total}
              </div>
              <p className="text-xs text-gray-500">confirmed</p>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="h-3 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full transition-all duration-500"
              style={{ width: `${(takenCount / total) * 100}%` }}
            />
          </div>
        )}

        {allDone && (
          <div className="mt-3 flex items-center gap-2 text-sage-600 bg-sage-50 border border-sage-200 rounded-xl px-4 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">All doses confirmed for today!</span>
          </div>
        )}
      </div>

      {/* Caregiver note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 mb-5">
        <Bell className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Caregiver tip:</span> Tap the circle next to each dose when it's been taken.
        </p>
      </div>

      {/* Schedule */}
      {total === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No active medications scheduled. Check the Summary tab to reactivate stopped medications.
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map((entry, i) => (
            <ScheduleCard
              key={`${entry.medication.id}-${entry.time}-${i}`}
              entry={entry}
              dateKey={today}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Follow-ups */}
      {member.patient.followUps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-sage-500" /> Upcoming Appointments
          </h2>
          <div className="space-y-2">
            {member.patient.followUps
              .filter((f) => new Date(f.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 4)
              .map((fu, i) => {
                const daysUntil = Math.ceil((new Date(fu.date).getTime() - Date.now()) / 86400000);
                return (
                  <div key={i} className="kin-card p-4 flex gap-3">
                    <div className="text-center bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 shrink-0 min-w-[52px]">
                      <p className="text-xs text-sage-500 font-semibold uppercase">{new Date(fu.date).toLocaleDateString("en-US", { month: "short" })}</p>
                      <p className="text-xl font-bold text-gray-900 leading-none">{new Date(fu.date).getDate()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{fu.reason}</p>
                      {fu.provider && <p className="text-sm text-gray-500">{fu.provider}</p>}
                      {fu.location && <p className="text-xs text-gray-400">{fu.location}</p>}
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
