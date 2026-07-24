import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { CommentIcon, GhostIcon, HeartIcon, PlayIcon } from "../components/Icons";
import { Post, User } from "../types";

interface Props {
  user: User;
  posts: Post[];
  onOpen: (post: Post) => void;
}

export default function Profile({ user, posts, onOpen }: Props) {
  const own = posts.filter((p) => !p.anonymous && p.username === user.username);
  const likesReceived = own.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className="animate-fade-in-up mx-auto max-w-4xl">
      <div className="glass rounded-xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Avatar username={user.username} color={user.avatarColor} size={88} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">@{user.username}</h1>
            {user.bio && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{user.bio}</p>
            )}
            <div className="mt-4 flex justify-center gap-8 sm:justify-start">
              <div>
                <p className="text-xl font-bold">{own.length}</p>
                <p className="text-xs text-zinc-500">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold">{likesReceived}</p>
                <p className="text-xs text-zinc-500">Likes received</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
          <GhostIcon width={18} height={18} className="shrink-0" />
          <span>
            Anonymous posts never appear on profiles. What's posted in the shadows stays in the
            shadows.
          </span>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-bold">Public posts</h2>
      {own.length === 0 ? (
        <EmptyState message="No public posts yet." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {own.map((post) => (
            <button
              key={post.id}
              onClick={() => onOpen(post)}
              className="group relative aspect-square overflow-hidden rounded-xl"
              aria-label="Open post"
            >
              <img
                src={post.mediaUrl}
                alt={post.caption ?? "Post"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {post.mediaType === "video" && (
                <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                  <PlayIcon width={12} height={12} />
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-1.5">
                  <HeartIcon filled width={16} height={16} /> {post.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <CommentIcon width={16} height={16} /> {post.comments.length}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
