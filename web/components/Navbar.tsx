"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { account, openModal } = useAuth();

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
        /* Home: nav links + avatar */
        <div className="flex items-center gap-8">
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
            {account && (
              <Link
                href="/history"
                className="text-on-surface-variant font-headline font-bold text-base tracking-tight hover:text-indigo-300 transition-colors"
              >
                My Picks
              </Link>
            )}
          </nav>
          <UserAvatar account={account} onClick={openModal} />
        </div>
      ) : (
        /* Quiz / Results: icon actions */
        <div className="flex items-center gap-6">
          {account && (
            <Link
              href="/history"
              className="material-symbols-outlined text-on-surface-variant hover:text-indigo-300 transition-colors"
              title="My Picks"
            >
              history
            </Link>
          )}
          <Link
            href="/"
            className="material-symbols-outlined text-on-surface-variant hover:text-indigo-300 transition-colors"
            title="Start Over"
          >
            refresh
          </Link>
          <UserAvatar account={account} onClick={openModal} />
        </div>
      )}
    </header>
  );
}

function UserAvatar({
  account,
  onClick,
}: {
  account: { username: string; color: string } | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={account ? `Signed in as ${account.username}` : "Sign in"}
      className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/15 flex items-center justify-center hover:scale-105 transition-all active:scale-95"
      style={account ? { backgroundColor: account.color } : undefined}
    >
      {account ? (
        <span className="font-headline font-bold text-sm text-white select-none">
          {initials(account.username)}
        </span>
      ) : (
        <span className="material-symbols-outlined text-on-surface-variant text-xl bg-surface-container-highest w-full h-full flex items-center justify-center">
          person
        </span>
      )}
    </button>
  );
}
