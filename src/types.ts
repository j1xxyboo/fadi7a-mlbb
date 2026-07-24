export type MediaType = "image" | "video";

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
}
