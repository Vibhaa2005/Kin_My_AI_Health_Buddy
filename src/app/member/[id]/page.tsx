"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import DocumentUpload from "@/components/DocumentUpload";
import { useKinStore } from "@/lib/store";
import { FAMILY_ROLES, FAMILY_ROLE_CONFIG } from "@/lib/sampleData";
import type { FamilyRole, ExtractedData } from "@/lib/types";
import {
  FileText,
  Trash2,
  Pill,
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";

export default function MemberOverviewPage() {
  const params = useParams();
  const id = params?.id as FamilyRole;
  const { members, mergeExtracted, deleteDocument, setAlerts } = useKinStore();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!FAMILY_ROLES.includes(id)) return null;

  const member = members[id];
  const { patient, alerts } = member;
  const cfg = FAMILY_ROLE_CONFIG[id];

  const handleExtracted = (data: ExtractedData, fileName: string) => {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    mergeExtracted(id, data, fileName, docId);
  };

  const handleDeleteDoc = (docId: string) => {
    if (confirmDelete === docId) {
      deleteDocument(id, docId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(docId);
    }
  };

  const refreshInteractions = async () => {
    if (patient.medications.length === 0) return;
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
      if (json.success) setAlerts(id, json.alerts);
    } catch { /* keep existing */ }
    finally { setRefreshing(false); }
  };

  const activeMeds = patient.medications.filter((m) => m.active);
  const hasData = patient.documents.length > 0;

  return (
    <div className="space-y-8">
      {/* Upload section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Add Medical Document</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a photo or PDF of {member.displayName}'s prescription, discharge summary, or lab report. Kin will extract all medications and health information automatically.
        </p>
        <DocumentUpload onExtracted={handleExtracted} />
      </div>

      {/* Uploaded documents */}
      {hasData && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Uploaded Documents
            <span className="ml-2 text-sm font-normal text-gray-400">({patient.documents.length})</span>
          </h2>
          <div className="space-y-2">
            {patient.documents.map((doc) => (
              <div key={doc.id} className="kin-card p-4 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sand-50 border border-sand-200 shrink-0">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
                  {doc.summary && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{doc.summary}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded">{doc.type}</span>
                    <span className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className={clsx(
                    "shrink-0 p-2 rounded-xl transition-colors text-sm font-medium",
                    confirmDelete === doc.id
                      ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                      : "text-gray-400 hover:bg-rose-50 hover:text-rose-500"
                  )}
                  title={confirmDelete === doc.id ? "Tap again to confirm delete" : "Delete document"}
                >
                  {confirmDelete === doc.id ? (
                    <span className="flex items-center gap-1 px-1">
                      <Trash2 className="w-3.5 h-3.5" /> Confirm?
                    </span>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health snapshot */}
      {hasData && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Health Snapshot</h2>
            <button
              onClick={refreshInteractions}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-sage-600 bg-sage-50 border border-sage-200 px-3 py-1.5 rounded-xl hover:bg-sage-100 disabled:opacity-50 transition-colors"
            >
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Run safety check
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <StatCard
              icon={<Pill className="w-4 h-4 text-sage-500" />}
              label="Active medications"
              value={activeMeds.length.toString()}
              href={`/member/${id}/dashboard`}
            />
            <StatCard
              icon={<Activity className="w-4 h-4 text-sage-500" />}
              label="Conditions"
              value={patient.conditions.length.toString()}
              href={`/member/${id}/dashboard`}
            />
            <StatCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              label="Safety alerts"
              value={alerts.length.toString()}
              warn={alerts.some((a) => a.severity === "severe")}
              href={`/member/${id}/dashboard`}
            />
          </div>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-3">
              <p className="text-sm font-semibold text-rose-600 mb-1">Allergies on file</p>
              <p className="text-sm text-rose-800">{patient.allergies.join(", ")}</p>
            </div>
          )}

          {/* Next follow-up */}
          {patient.followUps.length > 0 && (
            <div className="kin-card p-4 flex items-start gap-3">
              <CalendarCheck className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-1">Upcoming appointments</p>
                {patient.followUps
                  .filter((f) => new Date(f.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 2)
                  .map((fu, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      <span className="font-medium">{new Date(fu.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {" — "}{fu.reason}
                    </p>
                  ))}
              </div>
              <Link href={`/member/${id}/schedule`} className="text-sage-600 hover:text-sage-700">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-12 border-2 border-dashed border-sand-200 rounded-2xl">
          <FileText className="w-10 h-10 text-sand-300 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-700 mb-1">No documents yet for {member.displayName}</p>
          <p className="text-sm text-gray-400">Upload a prescription or discharge summary above to get started.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  warn = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "kin-card p-4 flex items-start gap-3 hover:shadow-md transition-shadow",
        warn && "border-rose-200 bg-rose-50"
      )}
    >
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className={clsx("text-2xl font-bold", warn ? "text-rose-600" : "text-gray-900")}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Link>
  );
}
