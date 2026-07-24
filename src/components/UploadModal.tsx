import { DragEvent, useState } from "react";
import { MediaType, Post, User } from "../types";
import Avatar from "./Avatar";
import { CloseIcon, UploadIcon } from "./Icons";

const MAX_CAPTION = 280;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: Post) => void;
  currentUser: User;
}

export default function UploadModal({ open, onClose, onSubmit, currentUser }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [caption, setCaption] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [dragging, setDragging] = useState(false);

  if (!open) return null;

  const close = () => {
    setPreviewUrl(null);
    setCaption("");
    setAnonymous(false);
    setDragging(false);
    onClose();
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const type: MediaType | null = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
        ? "image"
        : null;
    if (!type) return;
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const submit = () => {
    if (!previewUrl) return;
    onSubmit({
      id: `local-${Date.now().toString(36)}`,
      mediaType,
      mediaUrl: previewUrl,
      videoUrl: mediaType === "video" ? previewUrl : undefined,
      caption: caption.trim() || undefined,
      anonymous,
      username: anonymous ? undefined : currentUser.username,
      avatarColor: anonymous ? undefined : currentUser.avatarColor,
      timestamp: "Just now",
      likes: 0,
      comments: [],
    });
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="glass animate-fade-in-up relative w-full max-w-lg rounded-xl p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display-title text-xl">Create post</h2>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {!previewUrl ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging
                ? "border-red-600 bg-red-600/10"
                : "border-zinc-300 hover:border-red-500 dark:border-zinc-700"
            }`}
          >
            <UploadIcon width={32} height={32} className="text-red-600" />
            <span className="text-sm font-medium">Drag & drop an image or video</span>
            <span className="text-xs text-zinc-500">or click to browse</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-xl">
            {mediaType === "image" ? (
              <img src={previewUrl} alt="Preview" className="max-h-72 w-full object-cover" />
            ) : (
              <video src={previewUrl} controls muted className="max-h-72 w-full" />
            )}
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
              aria-label="Remove media"
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>
        )}

        <div className="mt-4">
          <textarea
            value={caption}
            maxLength={MAX_CAPTION}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Add a caption (optional)"
            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-100/80 p-3 text-sm outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/25 dark:border-white/10 dark:bg-white/5"
          />
          <p className="mt-1 text-right text-xs text-zinc-500">
            {caption.length}/{MAX_CAPTION}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-white/10">
          <div className="flex items-center gap-3">
            {anonymous ? (
              <Avatar anonymous size={40} />
            ) : (
              <Avatar username={currentUser.username} color={currentUser.avatarColor} size={40} />
            )}
            <div>
              <p className="text-sm font-semibold">Post anonymously</p>
              <p className="text-xs text-zinc-500">
                {anonymous ? "You'll appear as Anonymous" : `Posting as @${currentUser.username}`}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={anonymous}
            onClick={() => setAnonymous((a) => !a)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              anonymous ? "accent-gradient" : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                anonymous ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!previewUrl}
            className="accent-gradient rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition-all enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
