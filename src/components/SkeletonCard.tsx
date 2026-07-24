interface Props {
  tall?: boolean;
}

export default function SkeletonCard({ tall }: Props) {
  return (
    <div className="glass mb-5 animate-pulse break-inside-avoid overflow-hidden rounded-xl">
      <div className={`${tall ? "h-72" : "h-48"} bg-zinc-200 dark:bg-zinc-800`} />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-3 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex gap-4">
          <div className="h-3 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
