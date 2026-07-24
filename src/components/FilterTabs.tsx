import { FeedFilter } from "../hooks/usePosts";
import { ClockIcon, IconProps, ImageIcon, TrendingIcon, VideoIcon } from "./Icons";

const TABS: { id: FeedFilter; label: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { id: "latest", label: "Latest", Icon: ClockIcon },
  { id: "trending", label: "Trending", Icon: TrendingIcon },
  { id: "images", label: "Images", Icon: ImageIcon },
  { id: "videos", label: "Videos", Icon: VideoIcon },
];

interface Props {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
}

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            active === id
              ? "accent-gradient text-white shadow-lg shadow-violet-600/25"
              : "glass text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <Icon width={16} height={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
