/**
 * Anonymous visitor identity — no login, so "who liked/posted this" is
 * tracked per-browser via a random id persisted in localStorage.
 * Also stores an optional display name the user can set once and reuse.
 */

const VISITOR_ID_KEY = "fadi7a_visitor_id";
const DISPLAY_NAME_KEY = "fadi7a_display_name";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function getSavedDisplayName(): string | null {
  return localStorage.getItem(DISPLAY_NAME_KEY);
}

export function setSavedDisplayName(name: string | null) {
  if (name && name.trim()) {
    localStorage.setItem(DISPLAY_NAME_KEY, name.trim());
  } else {
    localStorage.removeItem(DISPLAY_NAME_KEY);
  }
}

const PALETTE = ["#8b5cf6", "#ec4899", "#22d3ee", "#f59e0b", "#10b981", "#ef4444"];

/** Deterministic color per username/visitor so the same identity looks consistent */
export function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
