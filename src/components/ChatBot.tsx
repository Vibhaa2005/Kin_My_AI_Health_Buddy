"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  Send,
  Loader2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Trash2,
} from "lucide-react";
import type { ChatMessage, ChatTier, PatientRecord } from "@/lib/types";

interface Props {
  patient: PatientRecord;
  history: ChatMessage[];
  onNewMessage: (msg: ChatMessage) => void;
  onClear: () => void;
}

const TIER_CONFIG = {
  1: { icon: CheckCircle2, color: "text-sage-500", bg: "bg-sage-50 border-sage-200", label: "Answered" },
  2: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", label: "Consult Doctor" },
  3: { icon: AlertOctagon, color: "text-rose-500", bg: "bg-rose-50 border-rose-300", label: "URGENT" },
};

const SUGGESTED = [
  "Can I take ibuprofen for my headache?",
  "What should I avoid before Dad's Warfarin dose?",
  "When is the next follow-up appointment?",
  "What does Metformin do exactly?",
  "Is grapefruit okay with any of his medications?",
];

export default function ChatBot({ patient, history, onNewMessage, onClear }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    onNewMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), patient, history }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: json.message,
        tier: json.tier as ChatTier,
        timestamp: new Date().toISOString(),
      };
      onNewMessage(assistantMsg);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm sorry, I ran into an error. Please try again. If this persists, check that your GROQ_API_KEY is configured.",
        tier: 2,
        timestamp: new Date().toISOString(),
      };
      onNewMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-sand-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-1">
              Ask Kin anything about {patient.patientName}'s health
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Every answer is grounded in the uploaded medical records.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm bg-white border border-sand-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-sand-50 hover:border-sage-300 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} patientName={patient.patientName} />
        ))}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-sage-500 animate-spin" />
            </div>
            <div className="bg-white border border-sand-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-500">
              Kin is thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sand-200 bg-white px-4 py-3">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${patient.patientName}'s medications, schedule, or safety…`}
            className="flex-1 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent placeholder-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            Not medical advice · consult your provider for diagnosis or treatment decisions
          </p>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg, patientName }: { msg: ChatMessage; patientName: string }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-sage-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-base">
          {msg.content}
        </div>
      </div>
    );
  }

  const tier = msg.tier ?? 1;
  const cfg = TIER_CONFIG[tier];
  const TierIcon = cfg.icon;

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
          cfg.bg
        )}
      >
        <TierIcon className={clsx("w-4 h-4", cfg.color)} />
      </div>

      <div className="flex-1 max-w-[85%] space-y-1">
        {/* Tier badge */}
        <span
          className={clsx(
            "inline-block text-xs font-bold px-2 py-0.5 rounded-md border",
            cfg.bg,
            cfg.color
          )}
        >
          {cfg.label}
        </span>

        {/* Content */}
        <div
          className={clsx(
            "rounded-2xl rounded-tl-sm px-4 py-3 text-base border",
            tier === 3
              ? "bg-rose-50 border-rose-200 urgent-pulse"
              : "bg-white border-sand-200"
          )}
        >
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{msg.content}</p>
        </div>

        <p className="text-xs text-gray-400 pl-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
