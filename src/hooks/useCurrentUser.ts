import { useEffect, useState } from "react";
import { User } from "../types";

const STORAGE_KEY = "fadi7a_current_user";

const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function createDefaultUser(): User {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return {
    username: `guest${suffix}`,
    avatarColor: randomColor(),
  };
}

function loadUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore corrupt storage
  }
  const user = createDefaultUser();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore write failures (e.g. private browsing)
  }
  return user;
}

export function useCurrentUser(): User {
  const [user] = useState<User>(loadUser);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore write failures
    }
  }, [user]);

  return user;
}
