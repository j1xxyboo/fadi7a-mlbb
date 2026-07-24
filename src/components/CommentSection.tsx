import { useState } from "react";
import { Comment, User } from "../types";
import Avatar from "./Avatar";
import { GhostIcon } from "./Icons";

interface Props {
  comments: Comment[];
  currentUser: User;
  onAdd: (text: string, anonymous: boolean) => void;
}

export default function CommentSection({ comments, currentUser, onAdd }: Props) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t, anonymous);
    setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">
            No comments yet. Say something (or don't say who you are).
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar anonymous={c.anonymous} username={c.username} color={c.avatarColor} size={28} />
            <div className="min-w-0">
              <p className="text-xs">
                <span
                  className={
                    c.anonymous
                      ? "font-semibold text-zinc-500 dark:text-zinc-400"
                      : "font-semibold text-red-600 dark:text-red-500"
                  }
                >
                  {c.anonymous ? "Anonymous" : `@${c.username}`}
                </span>{" "}
                <span className="text-zinc-400 dark:text-zinc-500">{c.timestamp}</span>
              </p>
              <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Avatar
            anonymous={anonymous}
            username={currentUser.username}
            color={currentUser.avatarColor}
            size={30}
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={
              anonymous ? "Comment as Anonymous…" : `Comment as @${currentUser.username}…`
            }
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm outline-none transition-all focus:border-red-600 dark:border-white/10 dark:bg-white/5"
          />
          <button
            onClick={() => setAnonymous((a) => !a)}
            title="Comment anonymously"
            aria-pressed={anonymous}
            className={`shrink-0 rounded-lg p-2 transition-colors ${
              anonymous
                ? "accent-gradient text-white"
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
            }`}
          >
            <GhostIcon width={18} height={18} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
        {anonymous && (
          <p className="mt-1.5 pl-10 text-xs text-zinc-500">You'll appear as Anonymous</p>
        )}
      </div>
    </div>
  );
}
