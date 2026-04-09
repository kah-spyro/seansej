"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 w-full z-50 bg-neutral-950/70 backdrop-blur-xl shadow-[0_0_40px_rgba(93,63,211,0.08)] flex justify-between items-center px-6 py-4">
      {/* Brand */}
      <Link
        href="/"
        className="text-2xl font-headline font-black italic text-indigo-400 tracking-tight"
      >
        Seansej
      </Link>

      {isHome ? (
        /* Home: nav links */
        <nav className="hidden md:flex items-center gap-10">
          <span className="text-indigo-400 border-b-2 border-indigo-500 pb-1 font-headline font-bold text-base tracking-tight">
            Home
          </span>
          <Link
            href="/quiz"
            className="text-on-surface-variant font-headline font-bold text-base tracking-tight hover:text-indigo-300 transition-colors"
          >
            Start Quiz
          </Link>
        </nav>
      ) : (
        /* Quiz / Results: icon actions */
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="material-symbols-outlined text-on-surface-variant hover:text-indigo-300 transition-colors"
            title="Start Over"
          >
            refresh
          </Link>
          <button
            className="material-symbols-outlined text-on-surface-variant hover:text-indigo-300 transition-colors"
            title="Settings"
          >
            settings
          </button>
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              person
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
