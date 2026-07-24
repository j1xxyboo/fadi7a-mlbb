import { GhostIcon } from "./Icons";

interface AvatarProps {
  anonymous?: boolean;
  username?: string;
  color?: string;
  size?: number;
}

export default function Avatar({
  anonymous,
  username,
  color = "#dc2626",
  size = 36,
}: AvatarProps) {
  if (anonymous || !username) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10"
        title="Anonymous"
      >
        <GhostIcon width={size * 0.55} height={size * 0.55} />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size, background: color }}
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      title={`@${username}`}
    >
      <span style={{ fontSize: size * 0.38 }}>{username.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}
