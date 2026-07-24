import { useEffect } from "react";
import { Comment, Post, User } from "../types";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";
import { CloseIcon, HeartIcon } from "./Icons";

interface Props {
  post: Post | null;
  currentUser: User;
  onClose: () => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, comment: Comment) => void;
}

export default function PostDetail({ post, currentUser, onClose, onLike, onAddComment }: Props) {
  useEffect(() => {
    if (!post) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [post, onClose]);

  if (!post) return null;

  const addComment = (text: string, anonymous: boolean) =>
    onAddComment(post.id, {
      id: `c-${Date.now().toString(36)}`,
      anonymous,
      username: anonymous ? undefined : currentUser.username,
      avatarColor: anonymous ? undefined : currentUser.avatarColor,
      text,
      timestamp: "Just now",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glass animate-fade-in-up relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white/95 shadow-2xl dark:bg-[#14141e] md:flex-row">
        <div className="flex max-h-[45vh] items-center justify-center bg-black md:max-h-none md:flex-1">
          {post.mediaType === "image" ? (
            <img
              src={post.mediaUrl}
              alt={post.caption ?? "Post media"}
              className="max-h-[45vh] w-full object-contain md:max-h-[90vh]"
            />
          ) : (
            <video
              src={post.videoUrl}
              poster={post.mediaUrl}
              controls
              autoPlay
              muted
              className="max-h-[45vh] w-full md:max-h-[90vh]"
            />
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col p-5 md:w-96 md:shrink-0">
          <div className="flex items-start gap-3">
            <Avatar
              anonymous={post.anonymous}
              username={post.username}
              color={post.avatarColor}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span
                  className={
                    post.anonymous
                      ? "font-semibold text-zinc-500 dark:text-zinc-400"
                      : "font-semibold text-violet-600 dark:text-violet-400"
                  }
                >
                  {post.anonymous ? "Anonymous" : `@${post.username}`}
                </span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  posted this {post.mediaType}
                </span>
              </p>
              <p className="text-xs text-zinc-500">{post.timestamp}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {post.caption && (
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{post.caption}</p>
          )}

          <button
            onClick={() => onLike(post.id)}
            className={`mt-3 flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 ${
              post.liked ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <HeartIcon filled={post.liked} width={18} height={18} />
            {post.likes} likes
          </button>

          <div className="my-3 border-t border-zinc-200 dark:border-white/10" />

          <CommentSection comments={post.comments} currentUser={currentUser} onAdd={addComment} />
        </div>
      </div>
    </div>
  );
}
