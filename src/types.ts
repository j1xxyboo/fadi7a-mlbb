export type MediaType = "image" | "video";

export type PostStatus = "pending" | "approved" | "rejected";

export interface User {
  username: string;
  avatarColor: string;
  bio?: string;
}

export interface Comment {
  id: string;
  anonymous: boolean;
  username?: string;
  avatarColor?: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  mediaType: MediaType;
  /** Image URL, or poster/thumbnail URL for videos */
  mediaUrl: string;
  /** Only for videos */
  videoUrl?: string;
  /** Only for videos, e.g. "0:42" */
  duration?: string;
  caption?: string;
  anonymous: boolean;
  username?: string;
  avatarColor?: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
  comments: Comment[];
  /**
   * Moderation status. Posts submitted by users start as "pending" and only
   * appear in the public feed once an admin sets them to "approved". This
   * field is optional on the client Post model because the public feed API
   * only ever returns already-approved posts (status is implied there) —
   * it's populated explicitly in the admin dashboard views.
   */
  status?: PostStatus;
}
