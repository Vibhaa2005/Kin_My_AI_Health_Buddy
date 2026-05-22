"use client";

import { useState } from "react";
import clsx from "clsx";
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp } from "lucide-react";
import type { SafetyAlert, InteractionSeverity } from "@/lib/types";

interface Props {
  alert: SafetyAlert;
}

const SEVERITY_CONFIG: Record<
  InteractionSeverity,
  { bg: string; border: string; text: string; icon: React.ElementType; label: string }
> = {
  severe: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-600",
    icon: AlertOctagon,
    label: "Severe",
  },
  moderate: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-600",
    icon: AlertTriangle,
    label: "Moderate",
  },
  mild: {
    bg: "bg-sage-50",
    border: "border-sage-200",
    text: "text-sage-600",
    icon: Info,
    label: "Mild",
  },
};

const TYPE_LABEL: Record<SafetyAlert["type"], string> = {
  "drug-drug":      "Drug–Drug",
  "drug-food":      "Drug–Food",
  "drug-condition": "Drug–Condition",
  "drug-allergy":   "Allergy",
};

export default function InteractionAlert({ alert }: Props) {
  const [expanded, setExpanded] = useState(alert.severity === "severe");
  const cfg = SEVERITY_CONFIG[alert.severity];
  const Icon = cfg.icon;

  return (
    <div
      className={clsx(
        "rounded-2xl border p-4 transition-shadow",
        cfg.bg,
        cfg.border,
        alert.severity === "severe" && "urgent-pulse"
      )}
    >
      {/* Header row */}
      <button
        className="w-full flex items-start gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <Icon className={clsx("w-5 h-5 mt-0.5 shrink-0", cfg.text)} />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={clsx(
                  "inline-block text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mb-1",
                  `severity-${alert.severity}`
                )}
              >
                {cfg.label} · {TYPE_LABEL[alert.type]}
              </span>
              <h4 className={clsx("font-semibold text-base leading-snug", cfg.text)}>
                {alert.title}
              </h4>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="mt-3 ml-8 space-y-2 slide-in">
          <p className="text-sm text-gray-800 leading-relaxed">{alert.message}</p>

          <div className="bg-white/70 rounded-xl p-3 border border-white/80">
            <p className="text-xs font-semibold text-gray-600 mb-1">What to do</p>
            <p className="text-sm text-gray-800">{alert.recommendation}</p>
          </div>

          {alert.affectedMedications.length > 0 && (
            <p className="text-xs text-gray-500">
              Affects: {alert.affectedMedications.join(", ")}
              {" · "}
              <span className="italic">Source: {alert.source === "rxnav" ? "NIH RxNav" : "AI analysis"}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
