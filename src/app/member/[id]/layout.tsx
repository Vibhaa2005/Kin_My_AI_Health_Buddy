"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import clsx from "clsx";
import { Heart, ArrowLeft, Upload, LayoutDashboard, CalendarDays, MessageCircle } from "lucide-react";
import { useKinStore } from "@/lib/store";
import { FAMILY_ROLE_CONFIG, FAMILY_ROLES } from "@/lib/sampleData";
import type { FamilyRole } from "@/lib/types";

const TABS = [
  { label: "Overview",  href: "",          icon: Upload },
  { label: "Summary",   href: "/dashboard", icon: LayoutDashboard },
  { label: "Schedule",  href: "/schedule",  icon: CalendarDays },
  { label: "Ask Kin",   href: "/chat",      icon: MessageCircle },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const rawId = params?.id as string;
  const id = FAMILY_ROLES.includes(rawId as FamilyRole) ? (rawId as FamilyRole) : null;

  const { members } = useKinStore();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Member not found. <Link href="/" className="text-sage-600 underline">Go home</Link></p>
      </div>
    );
  }

  const member = members[id];
  const cfg = FAMILY_ROLE_CONFIG[id];
  const base = `/member/${id}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-sand-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3 h-16">
          <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Family</span>
          </Link>

          <span className="text-gray-300">/</span>

          {/* Member avatar + name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border", cfg.bgClass, cfg.textClass, cfg.borderClass)}>
              {member.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 leading-none truncate">{member.displayName}</p>
              <p className={clsx("text-xs font-medium", cfg.textClass)}>{cfg.label}</p>
            </div>
          </div>

          {/* Kin logo right */}
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-sage-600 shrink-0">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-200" />
            <span className="hidden sm:inline">Kin</span>
          </Link>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-2">
          {TABS.map(({ label, href, icon: Icon }) => {
            const fullHref = `${base}${href}`;
            const active = pathname === fullHref;
            return (
              <Link
                key={label}
                href={fullHref}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-sage-100 text-sage-700" : "text-gray-500 hover:bg-sand-100 hover:text-gray-800"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {children}
      </div>
    </div>
  );
}
