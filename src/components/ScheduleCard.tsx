"use client";

import clsx from "clsx";
import { Clock, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import type { ScheduleEntry } from "@/lib/types";

interface Props {
  entry: ScheduleEntry;
  dateKey: string;
  onToggle: (key: string) => void;
}

export default function ScheduleCard({ entry, dateKey, onToggle }: Props) {
  const key = `${dateKey}-${entry.medication.id}-${entry.time}`;
  const taken = entry.taken ?? false;

  return (
    <div
      className={clsx(
        "kin-card p-4 flex items-start gap-4 transition-all",
        taken && "opacity-60"
      )}
    >
      {/* Taken toggle */}
      <button
        onClick={() => onToggle(key)}
        className="mt-0.5 shrink-0 focus:outline-none"
        aria-label={taken ? "Mark as not taken" : "Mark as taken"}
      >
        {taken ? (
          <CheckCircle2 className="w-7 h-7 text-sage-500" />
        ) : (
          <Circle className="w-7 h-7 text-gray-300 hover:text-sage-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Time + med name */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sand-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              {entry.time}
            </span>
            <h3
              className={clsx(
                "text-lg font-semibold leading-snug",
                taken ? "line-through text-gray-400" : "text-gray-900"
              )}
            >
              {entry.medication.name}{" "}
              <span className="font-normal text-gray-500">{entry.medication.dosage}</span>
            </h3>
          </div>
          <span className="text-xs bg-sand-100 text-gray-500 px-2 py-0.5 rounded-lg shrink-0 mt-1">
            {entry.medication.route}
          </span>
        </div>

        {/* How to take */}
        <p className="text-sm text-gray-600 mt-1">{entry.medication.instructions}</p>

        {/* Top avoid item */}
        {entry.medication.avoid.length > 0 && (
          <div className="mt-2 flex items-start gap-1.5 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
            <span>{entry.medication.avoid[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
