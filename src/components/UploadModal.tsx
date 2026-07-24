import { DragEvent, useState } from "react";
import { MediaType } from "../types";
import { formatDuration, uploadToCloudinary } from "../lib/cloudinary";
import { colorForKey, getSavedDisplayName, setSavedDisplayName } from "../lib/identity";
import Avatar from "./Avatar";
import { CloseIcon, UploadIcon } from "./Icons";

const MAX_CAPTION = 280;

interface SubmittedPost {
  mediaType: MediaType;
  mediaUrl: string;
  videoUrl?: string;
  cloudinaryPublicId: string;
  duration?: string;
  caption?: string;
  author: { anonymous: boolean; username?: string; avatarColor?: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: SubmittedPost) => Promise<unknown>;
}

export default function UploadModal({ open, onClose, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [caption, setCaption] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState(getSavedDisplayName() ?? "");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const trimmedName = displayName.trim();
  const canPostNamed = !anonymous ? trimmedName.length > 0 : true;

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setAnonymous(true);
    setDragging(false);
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = (picked?: File) => {
    if (!picked) return;
    const type: MediaType | null = picked.type.startsWith("video/")
      ? "video"
      : picked.type.startsWith("image/")
        ? "image"
        : null;
    if (!type) return;
    setMediaType(type);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setError(null);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const submit = async () => {
    if (!file || !canPostNamed || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToCloudinary(file, setProgress);

      if (!anonymous) {
        setSavedDisplayName(trimmedName);
      }

      await onSubmit({
        mediaType,
        mediaUrl: result.resourceType === "video" ? result.thumbnailUrl! : result.secureUrl,
        videoUrl: result.resourceType === "video" ? result.secureUrl : undefined,
        cloudinaryPublicId: result.publicId,
        duration:
          result.resourceType === "video" && result.durationSeconds
            ? formatDuration(result.durationSeconds)
            : undefined,
        caption: caption.trim() || undefined,
        author: {
          anonymous,
          username: anonymous ? undefined : trimmedName,
          avatarColor: anonymous ? undefined : colorForKey(trimmedName),
        },
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
      setUploading(false);
    }
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
            {!uploading && (
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                aria-label="Remove media"
              >
                <CloseIcon width={16} height={16} />
              </button>
            )}
            {uploading && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-white">Uploading… {progress}%</p>
              </div>
            )}
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

        <div className="mt-2 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {anonymous ? (
                <Avatar anonymous size={40} />
              ) : (
                <Avatar username={trimmedName || undefined} color={colorForKey(trimmedName || "you")} size={40} />
              )}
              <div>
                <p className="text-sm font-semibold">Post anonymously</p>
                <p className="text-xs text-zinc-500">
                  {anonymous ? "You'll appear as Anonymous" : "Posting with a username"}
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

          {!anonymous && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder="Choose a username…"
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm outline-none transition-all focus:border-red-600 dark:border-white/10 dark:bg-white/5"
            />
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            disabled={uploading}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!previewUrl || !canPostNamed || uploading}
            className="accent-gradient rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition-all enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
