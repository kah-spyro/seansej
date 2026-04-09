"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Account,
  getCurrentAccount,
  getAccounts,
  createAccount,
  signIn as authSignIn,
  signOut as authSignOut,
} from "@/lib/auth";

interface AuthContextValue {
  account: Account | null;
  accounts: Account[];
  signIn: (id: string) => void;
  signOut: () => void;
  createAndSignIn: (username: string) => Account;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAccount(getCurrentAccount());
    setAccounts(getAccounts());
    setHydrated(true);
  }, []);

  const signIn = useCallback((id: string) => {
    authSignIn(id);
    setAccount(getAccounts().find((a) => a.id === id) ?? null);
    setModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    authSignOut();
    setAccount(null);
  }, []);

  const createAndSignIn = useCallback((username: string): Account => {
    const newAccount = createAccount(username);
    authSignIn(newAccount.id);
    setAccounts(getAccounts());
    setAccount(newAccount);
    setModalOpen(false);
    return newAccount;
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  if (!hydrated) {
    // avoid hydration mismatch — render children with null account until mounted
    return (
      <AuthContext.Provider
        value={{
          account: null,
          accounts: [],
          signIn,
          signOut,
          createAndSignIn,
          modalOpen: false,
          openModal,
          closeModal,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        account,
        accounts,
        signIn,
        signOut,
        createAndSignIn,
        modalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
