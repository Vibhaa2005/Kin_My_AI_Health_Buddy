"use client";

import Link from "next/link";
import { Heart, Lock } from "lucide-react";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sand-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sage-600">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
          <span>Kin</span>
          <span className="hidden sm:inline text-sm font-normal text-gray-400 ml-1">
            · Family Health Buddy
          </span>
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Lock className="w-3 h-3" /> Private · stays on your device
        </span>
      </div>
    </header>
  );
}
