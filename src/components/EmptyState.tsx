import { GhostIcon } from "./Icons";

export default function EmptyState({
  message = "Nothing here yet \u2014 be the first to post.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="glass mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <GhostIcon width={44} height={44} className="text-violet-400" />
      </div>
      <p className="text-lg font-medium">{message}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">It's quiet... too quiet.</p>
    </div>
  );
}
