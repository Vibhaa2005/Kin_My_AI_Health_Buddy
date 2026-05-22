"use client";

import Nav from "@/components/Nav";
import ChatBot from "@/components/ChatBot";
import { useKinStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { Shield, AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ChatPage() {
  const { patient, chatHistory, addChatMessage, clearChat } = useKinStore();

  const handleNewMessage = (msg: ChatMessage) => {
    addChatMessage(msg);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-0 sm:px-4 py-0 sm:py-6">
        {/* Header */}
        <div className="px-4 sm:px-0 pt-5 pb-4 border-b border-sand-200 sm:border-none">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Ask Kin</h1>
          <p className="text-sm text-gray-500">
            Answers grounded in {patient.patientName}'s actual medical records — not generic advice.
          </p>

          {/* Safety tiers legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-sage-50 text-sage-600 border border-sage-200 px-2.5 py-1 rounded-lg font-medium">
              <CheckCircle2 className="w-3 h-3" /> Tier 1 · Can answer
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
              <AlertTriangle className="w-3 h-3" /> Tier 2 · Consult doctor
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2.5 py-1 rounded-lg font-medium">
              <AlertOctagon className="w-3 h-3" /> Tier 3 · Seek care NOW
            </span>
          </div>
        </div>

        {/* Chat area — takes remaining height */}
        <div className="flex-1 flex flex-col kin-card sm:rounded-2xl overflow-hidden">
          <ChatBot
            patient={patient}
            history={chatHistory}
            onNewMessage={handleNewMessage}
            onClear={clearChat}
          />
        </div>

        {/* Footer note */}
        <div className="flex items-center gap-2 px-4 sm:px-0 py-3 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5 text-sage-400 shrink-0" />
          Kin uses {patient.patientName}'s uploaded records only. Never a substitute for your doctor.
        </div>
      </div>
    </div>
  );
}
