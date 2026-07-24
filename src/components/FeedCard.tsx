import { useState } from "react";
import { useInView } from "../hooks/useInView";
import { Post } from "../types";
import Avatar from "./Avatar";
import {
  BookmarkIcon,
  CommentIcon,
  FlagIcon,
  HeartIcon,
  MoreIcon,
  PlayIcon,
  ShareIcon,
} from "./Icons";

interface Props {
  post: Post;
  onOpen: (post: Post) => void;
  onLike: (id: string) => void;
}

export default function FeedCard({ post, onOpen, onLike }: Props) {
  const { ref, inView } = useInView<HTMLElement>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const identity = post.anonymous ? "Anonymous" : `@${post.username}`;

  const share = () => {
    navigator.clipboard
      ?.writeText(`${window.location.origin}/post/${post.id}`)
      .catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

  return (
    <article
      ref={ref}
      className={`glass card-lift group mb-5 break-inside-avoid overflow-hidden rounded-xl transition-all duration-700 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <button
        className="relative block w-full cursor-pointer text-left"
        onClick={() => onOpen(post)}
        aria-label="Open post"
      >
        {post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt={post.caption ?? "Post media"}
            loading="lazy"
            className="w-full object-cover"
          />
        ) : (
          <>
            <video
              src={post.videoUrl}
              poster={post.mediaUrl}
              muted
              loop
              playsInline
              preload="none"
              className="w-full object-cover"
              onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                <PlayIcon width={24} height={24} className="ml-1" />
              </span>
            </span>
            {post.duration && (
              <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                {post.duration}
              </span>
            )}
          </>
        )}
      </button>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar
            anonymous={post.anonymous}
            username={post.username}
            color={post.avatarColor}
          />
          <div className="min-w-0">
            <p className="truncate text-sm">
              <span
                className={
                  post.anonymous
                    ? "font-semibold text-zinc-500 dark:text-zinc-400"
                    : "font-semibold text-violet-600 dark:text-violet-400"
                }
              >
                {identity}
              </span>{" "}
              <span className="text-zinc-600 dark:text-zinc-400">
                posted this {post.mediaType}
              </span>
            </p>
            <p className="text-xs text-zinc-500">{post.timestamp}</p>
          </div>
        </div>

        {post.caption && (
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{post.caption}</p>
        )}

        <div className="mt-3 flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 ${
              post.liked ? "text-rose-500" : ""
            }`}
            aria-label="Like"
          >
            <HeartIcon filled={post.liked} width={18} height={18} />
            {post.likes}
          </button>
          <button
            onClick={() => onOpen(post)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
            aria-label="Comments"
          >
            <CommentIcon width={18} height={18} />
            {post.comments.length}
          </button>
          <button
            onClick={share}
            className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
            aria-label="Share"
          >
            <ShareIcon width={18} height={18} />
            {shared && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-0.5 text-xs text-white dark:bg-white dark:text-zinc-900">
                Copied!
              </span>
            )}
          </button>
          <div className="relative ml-auto">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
              aria-label="More options"
            >
              <MoreIcon width={18} height={18} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="glass absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl py-1 shadow-xl">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-white/5"
                  >
                    <BookmarkIcon width={15} height={15} /> Save
                  </button>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                  >
                    <FlagIcon width={15} height={15} /> Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
