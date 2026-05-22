"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import DocumentUpload from "@/components/DocumentUpload";
import { useKinStore } from "@/lib/store";
import type { ExtractedData } from "@/lib/types";
import {
  Heart,
  FileText,
  Shield,
  Bell,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { patient, mergeExtracted, resetToSample } = useKinStore();
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const handleExtracted = (data: ExtractedData, fileName: string) => {
    mergeExtracted({
      patientName: data.patientName ?? undefined,
      dateOfBirth: data.dateOfBirth ?? undefined,
      allergies: data.allergies ?? [],
      conditions: data.conditions ?? [],
      medications: data.medications ?? [],
      followUps: data.followUps ?? [],
    });
    setUploadedDocs((prev) => [...prev, fileName]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-sage-50 text-sage-600 text-sm font-semibold px-4 py-2 rounded-full border border-sage-200 mb-6">
            <Heart className="w-4 h-4 fill-rose-200 text-rose-400" />
            AI Health Companion · Demo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Meet <span className="text-sage-600">Kin</span>
            <br className="sm:hidden" />
            <span className="text-gray-600 font-normal"> — </span>
            your family's health buddy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Upload Dad's prescriptions and discharge summaries. Kin reads them, builds a plain-language care plan, and alerts you to real risks — like "can he take ibuprofen? (No — he's on Warfarin.)"
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 mb-10">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sage-500" /> Data stays private</span>
            <span className="text-sand-300">·</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Powered by Llama 4 via Groq</span>
            <span className="text-sand-300">·</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-sage-500" /> Not medical advice</span>
          </div>

          {/* Feature pills */}
          <div className="grid sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: FileText, label: "Upload any document" },
              { icon: Shield, label: "4-type safety checks" },
              { icon: Bell, label: "Daily med schedule" },
              { icon: MessageCircle, label: "Grounded Q&A bot" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-sand-50 rounded-xl px-3 py-2.5 border border-sand-200">
                <Icon className="w-4 h-4 text-sage-500 shrink-0" />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a document</h2>
            <p className="text-base text-gray-600 mb-5">
              Photo a prescription or discharge letter — Kin extracts medications, conditions, and follow-up dates automatically.
            </p>

            <DocumentUpload onExtracted={handleExtracted} />

            {/* Uploaded list */}
            {uploadedDocs.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-sage-600 bg-sage-50 rounded-xl px-3 py-2 border border-sage-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient snapshot + actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient snapshot</h2>
            <p className="text-base text-gray-600 mb-5">
              Pre-loaded with a sample patient record so the demo works instantly.
            </p>

            <div className="kin-card p-5 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{patient.patientName}</h3>
                  <p className="text-sm text-gray-500">
                    DOB: {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>
                </div>
                <span className="text-xs bg-sage-100 text-sage-600 px-2 py-1 rounded-lg font-medium">
                  {patient.documents.length} documents
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <Stat label="Medications" value={patient.medications.filter(m => m.active).length.toString()} />
                <Stat label="Conditions" value={patient.conditions.length.toString()} />
                <Stat label="Allergies" value={patient.allergies.length.toString()} />
                <Stat label="Follow-ups" value={patient.followUps.length.toString()} />
              </div>

              {patient.allergies.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-rose-500 mb-1">⚠ Allergies on file</p>
                  <p className="text-sm text-rose-700">{patient.allergies.join(", ")}</p>
                </div>
              )}
            </div>

            {/* Uploaded docs list */}
            <div className="space-y-2 mb-5">
              {patient.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 text-sm bg-white border border-sand-200 rounded-xl px-3 py-2.5">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{doc.fileName}</p>
                    {doc.summary && (
                      <p className="text-gray-500 text-xs truncate">{doc.summary}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 capitalize">{doc.type}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-base px-5 py-3.5 rounded-xl transition-colors"
              >
                View Full Care Summary
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={resetToSample}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
              >
                Reset to sample data
              </button>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mt-12 border-t border-sand-200 pt-6 text-center">
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            <Lock className="inline w-3.5 h-3.5 mr-1 text-sage-500" />
            Your data is processed in-transit only and never stored on our servers.
            Running on open-source Llama — hospitals can self-host for full data control.
            <span className="block mt-1 text-xs">Not a substitute for professional medical advice.</span>
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sand-50 rounded-xl p-3 border border-sand-200">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
