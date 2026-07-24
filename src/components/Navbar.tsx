import { useState } from "react";
import { Theme } from "../hooks/useTheme";
import { User } from "../types";
import Avatar from "./Avatar";
import { MoonIcon, PlusIcon, SearchIcon, SunIcon } from "./Icons";

interface Props {
  currentUser: User;
  theme: Theme;
  toggleTheme: () => void;
  onOpenUpload: () => void;
  onNavigate: (page: "home" | "profile") => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

export default function Navbar({
  currentUser,
  theme,
  toggleTheme,
  onOpenUpload,
  onNavigate,
  searchQuery,
  onSearch,
}: Props) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-white/[0.07] dark:bg-[#0a0a0c]/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          onClick={() => onNavigate("home")}
          className="flex shrink-0 items-center"
          aria-label="Home"
        >
          {logoFailed ? (
            <span className="font-display inline-block -skew-x-6 text-xl uppercase tracking-wide">
              EXPOSED <span className="text-red-600">MLBB DZ</span>
            </span>
          ) : (
            <span className="rounded-lg bg-zinc-900 px-2 py-1 dark:bg-transparent dark:p-0">
              <img
                src="/logo.png"
                alt="EXPOSED MLBB DZ"
                className="h-9 w-auto sm:h-10"
                onError={() => setLogoFailed(true)}
              />
            </span>
          )}
        </button>

        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <SearchIcon
            width={16}
            height={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search posts, captions, users…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-100/80 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/25 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            className="rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={onOpenUpload}
            className="accent-gradient hidden items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition-transform hover:scale-105 active:scale-95 sm:flex"
          >
            <PlusIcon width={16} height={16} /> Post
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => onNavigate("profile")} aria-label="Profile">
            <Avatar username={currentUser.username} color={currentUser.avatarColor} size={36} />
          </button>
        </div>
      </div>
    </header>
  );
}
