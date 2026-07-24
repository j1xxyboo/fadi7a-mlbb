import { BellIcon, HomeIcon, PlusIcon, SearchIcon, UserIcon } from "./Icons";

interface Props {
  page: "home" | "profile";
  onNavigate: (page: "home" | "profile") => void;
  onOpenUpload: () => void;
}

export default function MobileNav({ page, onNavigate, onOpenUpload }: Props) {
  const item = "flex flex-col items-center gap-0.5 p-2 text-[11px] font-medium transition-colors";
  const idle = "text-zinc-500 dark:text-zinc-400";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 backdrop-blur-md dark:border-white/[0.07] dark:bg-[#0a0a0c]/90 md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-2 pt-1">
        <button
          onClick={() => onNavigate("home")}
          className={`${item} ${page === "home" ? "text-red-600 dark:text-red-500" : idle}`}
        >
          <HomeIcon /> Home
        </button>
        <button className={`${item} ${idle}`} aria-label="Search">
          <SearchIcon /> Search
        </button>
        <button
          onClick={onOpenUpload}
          className="accent-gradient -translate-y-4 rounded-full p-4 text-white shadow-xl shadow-red-600/40 transition-transform active:scale-90"
          aria-label="New post"
        >
          <PlusIcon width={22} height={22} />
        </button>
        <button className={`${item} ${idle}`} aria-label="Notifications">
          <BellIcon /> Alerts
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className={`${item} ${page === "profile" ? "text-red-600 dark:text-red-500" : idle}`}
        >
          <UserIcon /> Profile
        </button>
      </div>
    </nav>
  );
}
