"use client";

import Nav from "@/components/Nav";
import ScheduleCard from "@/components/ScheduleCard";
import { useKinStore, buildScheduleForToday } from "@/lib/store";
import { CalendarDays, CheckCircle2, AlertCircle, Bell } from "lucide-react";

export default function SchedulePage() {
  const { patient, takenEntries, markTaken, markUntaken } = useKinStore();

  const today = new Date().toISOString().split("T")[0];
  const schedule = buildScheduleForToday(patient);

  // Inject taken state
  const enriched = schedule.map((entry) => {
    const key = `${today}-${entry.medication.id}-${entry.time}`;
    return { ...entry, taken: takenEntries[key] ?? false };
  });

  const takenCount = enriched.filter((e) => e.taken).length;
  const total = enriched.length;
  const allDone = takenCount === total && total > 0;

  const handleToggle = (key: string) => {
    if (takenEntries[key]) markUntaken(key);
    else markTaken(key);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-sage-500" />
                <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
              </div>
              <p className="text-base text-gray-500">{formattedDate}</p>
            </div>

            {/* Progress */}
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${allDone ? "text-sage-500" : "text-gray-900"}`}>
                {takenCount}/{total}
              </div>
              <p className="text-xs text-gray-500">doses confirmed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full transition-all duration-500"
              style={{ width: total > 0 ? `${(takenCount / total) * 100}%` : "0%" }}
            />
          </div>

          {allDone && (
            <div className="mt-3 flex items-center gap-2 text-sage-600 bg-sage-50 border border-sage-200 rounded-xl px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">All doses confirmed for today! Great job.</span>
            </div>
          )}
        </div>

        {/* Caregiver note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 mb-6">
          <Bell className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Caregiver tip:</span> Tap the circle next to each dose to confirm it was taken. Missing doses will be flagged for the caregiver.
          </p>
        </div>

        {/* Schedule entries */}
        {schedule.length === 0 ? (
          <div className="text-center py-14">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No active medications scheduled.</p>
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

        {/* Upcoming follow-ups */}
        {patient.followUps.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sage-500" />
              Upcoming Appointments
            </h2>
            <div className="space-y-2">
              {patient.followUps
                .filter((fu) => new Date(fu.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map((fu, i) => {
                  const daysUntil = Math.ceil(
                    (new Date(fu.date).getTime() - Date.now()) / 86400000
                  );
                  return (
                    <div key={i} className="kin-card p-4 flex items-start gap-3">
                      <div className="text-center bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 shrink-0 min-w-[52px]">
                        <p className="text-xs text-sage-500 font-semibold uppercase">
                          {new Date(fu.date).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="text-xl font-bold text-gray-900 leading-none">
                          {new Date(fu.date).getDate()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{fu.reason}</p>
                        {fu.provider && <p className="text-sm text-gray-600">{fu.provider}</p>}
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

        {/* Privacy footer */}
        <p className="mt-10 text-xs text-center text-gray-400">
          Schedule data is stored locally on this device only · Not medical advice
        </p>
      </main>
    </div>
  );
}
