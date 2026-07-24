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
  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
          <span className="accent-gradient flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg shadow-violet-600/30">
            F7
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">
            FADI7A{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              MLBB
            </span>
          </span>
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
            placeholder="Search posts, captions, users\u2026"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-100/80 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={onOpenUpload}
            className="accent-gradient hidden items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-105 active:scale-95 sm:flex"
          >
            <PlusIcon width={16} height={16} /> Post
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
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
