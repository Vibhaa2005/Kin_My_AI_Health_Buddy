"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Pill,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Utensils,
} from "lucide-react";
import type { Medication } from "@/lib/types";

interface Props {
  med: Medication;
}

export default function MedCard({ med }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        "kin-card overflow-hidden transition-shadow",
        "hover:shadow-md"
      )}
    >
      {/* Header */}
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="mt-0.5 p-2.5 rounded-xl bg-sage-50 border border-sage-200">
          <Pill className="w-5 h-5 text-sage-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {med.name}
                {med.genericName && med.genericName !== med.name && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({med.genericName})
                  </span>
                )}
              </h3>
              <p className="text-base text-gray-600 mt-0.5">
                <span className="font-medium">{med.dosage}</span>
                {" · "}
                {med.frequency}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
            )}
          </div>

          {/* Times row */}
          <div className="flex flex-wrap gap-2 mt-2">
            {med.times.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-sm bg-sand-100 text-sand-500 px-2.5 py-1 rounded-lg font-medium"
              >
                <Clock className="w-3.5 h-3.5" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-sand-100 px-5 pb-5 pt-4 space-y-4 slide-in">
          {/* Why */}
          <Row icon={<Info className="w-4 h-4 text-sage-500" />} label="Why prescribed">
            {med.purpose}
          </Row>

          {/* How */}
          <Row icon={<Pill className="w-4 h-4 text-sage-500" />} label="How to take">
            {med.instructions}
          </Row>

          {/* Avoid */}
          {med.avoid.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-gray-700">Avoid while taking</span>
              </div>
              <ul className="space-y-1.5">
                {med.avoid.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Side effects */}
          {med.sideEffects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Watch for</span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {med.sideEffects.map((se, i) => (
                  <li
                    key={i}
                    className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg"
                  >
                    {se}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prescribed by */}
          {med.prescribedBy && (
            <p className="text-xs text-gray-400 border-t border-sand-100 pt-3">
              Prescribed by {med.prescribedBy}
              {med.prescribedDate ? ` on ${new Date(med.prescribedDate).toLocaleDateString()}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed pl-6">{children}</p>
    </div>
  );
}
