"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Heart, LayoutDashboard, CalendarDays, MessageCircle, Upload } from "lucide-react";

const LINKS = [
  { href: "/",          label: "Upload",    icon: Upload },
  { href: "/dashboard", label: "Summary",   icon: LayoutDashboard },
  { href: "/schedule",  label: "Schedule",  icon: CalendarDays },
  { href: "/chat",      label: "Ask Kin",   icon: MessageCircle },
];

export default function Nav() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sand-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sage-600">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
          <span>Kin</span>
          <span className="hidden sm:inline text-sm font-normal text-gray-500 ml-1">
            · Your Health Buddy
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-sage-100 text-sage-600"
                    : "text-gray-600 hover:bg-sand-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
