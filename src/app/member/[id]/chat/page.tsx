"use client";

import { useParams } from "next/navigation";
import ChatBot from "@/components/ChatBot";
import { useKinStore } from "@/lib/store";
import { FAMILY_ROLES } from "@/lib/sampleData";
import type { FamilyRole, ChatMessage } from "@/lib/types";
import { Shield, AlertOctagon, AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function MemberChatPage() {
  const params = useParams();
  const id = params?.id as FamilyRole;
  const { members, addChatMessage, clearChat } = useKinStore();

  if (!FAMILY_ROLES.includes(id)) return null;

  const member = members[id];

  if (member.patient.documents.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="w-10 h-10 text-sand-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No records to chat about yet.</p>
        <p className="text-sm text-gray-400 mt-1 mb-4">
          Upload {member.displayName}'s medical documents first so Kin can answer questions grounded in their actual history.
        </p>
        <Link
          href={`/member/${id}`}
          className="inline-block bg-sage-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-sage-600 transition-colors"
        >
          Go to Overview to upload
        </Link>
      </div>
    );
  }

  const handleNewMessage = (msg: ChatMessage) => addChatMessage(id, msg);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Safety tiers legend */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        <p className="text-sm text-gray-500 mr-1 self-center">Response types:</p>
        <span className="inline-flex items-center gap-1.5 text-xs bg-sage-50 text-sage-600 border border-sage-200 px-2.5 py-1 rounded-lg font-medium">
          <CheckCircle2 className="w-3 h-3" /> Answered
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
          <AlertTriangle className="w-3 h-3" /> Consult doctor
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2.5 py-1 rounded-lg font-medium">
          <AlertOctagon className="w-3 h-3" /> URGENT
        </span>
      </div>

      {/* Chat */}
      <div className="flex-1 kin-card overflow-hidden flex flex-col">
        <ChatBot
          patient={member.patient}
          history={member.chatHistory}
          onNewMessage={handleNewMessage}
          onClear={() => clearChat(id)}
        />
      </div>

      <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
        <Shield className="w-3 h-3 text-sage-400 shrink-0" />
        Answers use only {member.displayName}'s uploaded records. Not a substitute for your doctor.
      </div>
    </div>
  );
}
