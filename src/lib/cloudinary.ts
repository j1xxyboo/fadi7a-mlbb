/**
 * Cloudinary upload — unsigned, browser-safe.
 *
 * Why unsigned: the Cloudinary API secret must never ship to the browser.
 * An unsigned upload preset (created in the Cloudinary dashboard) lets the
 * browser upload directly to Cloudinary without touching the secret at all.
 *
 * Setup (one-time, in the Cloudinary dashboard):
 *   Settings -> Upload -> Upload presets -> Add upload preset
 *     - Signing mode: Unsigned
 *     - Folder: fadi7a-mlbb (optional, keeps uploads organized)
 *     - Name it, e.g. "fadi7a_unsigned", and put that name in .env as
 *       VITE_CLOUDINARY_UPLOAD_PRESET
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video";
  /** Video duration in seconds, only present for video uploads */
  durationSeconds?: number;
  /** For videos, a thumbnail frame Cloudinary derives automatically */
  thumbnailUrl?: string;
}

export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET. Add them to your .env file."
    );
  }

  const resourceType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const result = await new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body);
        } else {
          reject(new Error(body?.error?.message || "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Unexpected response from Cloudinary"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary"));
    xhr.send(formData);
  });

  return {
    secureUrl: result.secure_url as string,
    publicId: result.public_id as string,
    resourceType,
    durationSeconds: typeof result.duration === "number" ? result.duration : undefined,
    thumbnailUrl:
      resourceType === "video"
        ? (result.secure_url as string).replace(/\.\w+$/, ".jpg")
        : undefined,
  };
}
