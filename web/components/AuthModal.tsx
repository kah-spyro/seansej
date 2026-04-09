"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthModal() {
  const { accounts, account, signIn, signOut, createAndSignIn, modalOpen, closeModal } =
    useAuth();
  const [view, setView] = useState<"list" | "create">("list");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // reset to list view when modal opens
  useEffect(() => {
    if (modalOpen) {
      setView("list");
      setUsername("");
      setError("");
    }
  }, [modalOpen]);

  if (!modalOpen) return null;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }
    if (trimmed.length > 24) {
      setError("Username must be 24 characters or less.");
      return;
    }
    createAndSignIn(trimmed);
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-surface-container rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-headline font-bold text-xl text-on-surface">
            {view === "list" ? "Who's watching?" : "Create account"}
          </h2>
          <button
            onClick={closeModal}
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors text-xl"
          >
            close
          </button>
        </div>

        {view === "list" ? (
          <div className="px-6 pb-6">
            {/* Signed-in account */}
            {account && (
              <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm text-white flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                  >
                    {initials(account.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-bold text-sm truncate">
                      {account.username}
                    </p>
                    <p className="text-on-surface-variant text-xs">Signed in</p>
                  </div>
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="mt-3 w-full text-xs text-on-surface-variant hover:text-error transition-colors text-left pl-1"
                >
                  Sign out
                </button>
              </div>
            )}

            {/* Other accounts */}
            {accounts.filter((a) => a.id !== account?.id).length > 0 && (
              <div className="space-y-2 mb-4">
                {accounts
                  .filter((a) => a.id !== account?.id)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => signIn(a.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm text-white flex-shrink-0"
                        style={{ backgroundColor: a.color }}
                      >
                        {initials(a.username)}
                      </div>
                      <span className="text-on-surface font-medium text-sm truncate">
                        {a.username}
                      </span>
                    </button>
                  ))}
              </div>
            )}

            {accounts.length === 0 && (
              <p className="text-on-surface-variant text-sm mb-4">
                No accounts yet. Create one to save your picks.
              </p>
            )}

            <button
              onClick={() => setView("create")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-outline-variant/40 hover:border-primary/60 hover:bg-primary/5 transition-all text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="text-sm font-medium">New account</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="px-6 pb-6">
            <p className="text-on-surface-variant text-sm mb-4">
              Choose a username for your account.
            </p>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="e.g. Alex"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 text-sm mb-2"
            />
            {error && <p className="text-error text-xs mb-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold hover:scale-105 active:scale-95 transition-all"
                style={{ boxShadow: "0 4px 20px rgba(93,54,229,0.3)" }}
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
