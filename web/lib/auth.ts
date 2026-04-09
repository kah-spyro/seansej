import { QuizAnswers, Recommendation } from "@/types";

export interface Account {
  id: string;
  username: string;
  color: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  answers: QuizAnswers;
  recommendations: Recommendation[];
  closing: string;
}

const ACCOUNTS_KEY = "sj_accounts";
const CURRENT_KEY = "sj_current";
const historyKey = (userId: string) => `sj_history_${userId}`;

const COLORS = [
  "#5D36E5",
  "#E53636",
  "#36A2E5",
  "#E5A236",
  "#36E576",
  "#E536A2",
  "#36E5E5",
];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getCurrentAccountId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_KEY);
}

export function getCurrentAccount(): Account | null {
  const id = getCurrentAccountId();
  if (!id) return null;
  return getAccounts().find((a) => a.id === id) ?? null;
}

export function createAccount(username: string): Account {
  const account: Account = {
    id: crypto.randomUUID(),
    username: username.trim(),
    color: randomColor(),
    createdAt: new Date().toISOString(),
  };
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  return account;
}

export function signIn(accountId: string): void {
  localStorage.setItem(CURRENT_KEY, accountId);
}

export function signOut(): void {
  localStorage.removeItem(CURRENT_KEY);
}

export function getHistory(userId: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(historyKey(userId)) ?? "[]");
  } catch {
    return [];
  }
}

export function addHistoryEntry(
  userId: string,
  entry: Omit<HistoryEntry, "id" | "date">
): void {
  const history = getHistory(userId);
  history.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  // keep last 20 sessions
  localStorage.setItem(historyKey(userId), JSON.stringify(history.slice(0, 20)));
}
