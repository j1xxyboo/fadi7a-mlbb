import { supabase } from "./supabaseClient";
import { Comment, MediaType, Post } from "../types";

const PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
// row <-> app-model mapping
// ---------------------------------------------------------------------------

interface PostRow {
  id: string;
  media_type: MediaType;
  media_url: string;
  video_url: string | null;
  cloudinary_public_id: string;
  duration: string | null;
  caption: string | null;
  is_anonymous: boolean;
  username: string | null;
  avatar_color: string | null;
  visitor_id: string;
  likes_count: number;
  created_at: string;
}

interface CommentRow {
  id: string;
  post_id: string;
  is_anonymous: boolean;
  username: string | null;
  avatar_color: string | null;
  text: string;
  visitor_id: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    anonymous: row.is_anonymous,
    username: row.username ?? undefined,
    avatarColor: row.avatar_color ?? undefined,
    text: row.text,
    timestamp: timeAgo(row.created_at),
  };
}

function mapPost(row: PostRow, comments: Comment[], likedByMe: boolean): Post {
  return {
    id: row.id,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    videoUrl: row.video_url ?? undefined,
    duration: row.duration ?? undefined,
    caption: row.caption ?? undefined,
    anonymous: row.is_anonymous,
    username: row.username ?? undefined,
    avatarColor: row.avatar_color ?? undefined,
    timestamp: timeAgo(row.created_at),
    likes: row.likes_count,
    liked: likedByMe,
    comments,
  };
}

// ---------------------------------------------------------------------------
// posts
// ---------------------------------------------------------------------------

export async function fetchPosts(
  page: number,
  visitorId: string
): Promise<{ posts: Post[]; hasMore: boolean }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: postRows, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  if (!postRows || postRows.length === 0) return { posts: [], hasMore: false };

  const postIds = postRows.map((p) => p.id);

  const [{ data: commentRows, error: commentsError }, { data: likeRows, error: likesError }] =
    await Promise.all([
      supabase
        .from("comments")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: true }),
      supabase.from("likes").select("post_id").in("post_id", postIds).eq("visitor_id", visitorId),
    ]);

  if (commentsError) throw commentsError;
  if (likesError) throw likesError;

  const likedPostIds = new Set((likeRows ?? []).map((l) => l.post_id));
  const commentsByPost = new Map<string, Comment[]>();
  for (const row of (commentRows ?? []) as CommentRow[]) {
    const list = commentsByPost.get(row.post_id) ?? [];
    list.push(mapComment(row));
    commentsByPost.set(row.post_id, list);
  }

  const posts = (postRows as PostRow[]).map((row) =>
    mapPost(row, commentsByPost.get(row.id) ?? [], likedPostIds.has(row.id))
  );

  return { posts, hasMore: postRows.length === PAGE_SIZE };
}

export async function fetchTrendingPosts(visitorId: string): Promise<Post[]> {
  const { data: postRows, error } = await supabase
    .from("trending_posts")
    .select("*")
    .limit(30);

  if (error) throw error;
  if (!postRows || postRows.length === 0) return [];

  const postIds = postRows.map((p) => p.id);
  const { data: likeRows, error: likesError } = await supabase
    .from("likes")
    .select("post_id")
    .in("post_id", postIds)
    .eq("visitor_id", visitorId);
  if (likesError) throw likesError;

  const likedPostIds = new Set((likeRows ?? []).map((l) => l.post_id));
  return (postRows as PostRow[]).map((row) => mapPost(row, [], likedPostIds.has(row.id)));
}

export interface NewPostInput {
  mediaType: MediaType;
  mediaUrl: string;
  videoUrl?: string;
  cloudinaryPublicId: string;
  duration?: string;
  caption?: string;
  anonymous: boolean;
  username?: string;
  avatarColor?: string;
  visitorId: string;
}

export async function createPost(input: NewPostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      media_type: input.mediaType,
      media_url: input.mediaUrl,
      video_url: input.videoUrl ?? null,
      cloudinary_public_id: input.cloudinaryPublicId,
      duration: input.duration ?? null,
      caption: input.caption ?? null,
      is_anonymous: input.anonymous,
      username: input.anonymous ? null : input.username,
      avatar_color: input.anonymous ? null : input.avatarColor,
      visitor_id: input.visitorId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPost(data as PostRow, [], false);
}

// ---------------------------------------------------------------------------
// likes
// ---------------------------------------------------------------------------

export async function likePost(postId: string, visitorId: string): Promise<void> {
  const { error } = await supabase.from("likes").insert({ post_id: postId, visitor_id: visitorId });
  // Ignore duplicate-like conflicts (primary key violation) — already liked.
  if (error && error.code !== "23505") throw error;
}

export async function unlikePost(postId: string, visitorId: string): Promise<void> {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId)
    .eq("visitor_id", visitorId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// comments
// ---------------------------------------------------------------------------

export interface NewCommentInput {
  postId: string;
  text: string;
  anonymous: boolean;
  username?: string;
  avatarColor?: string;
  visitorId: string;
}

export async function addComment(input: NewCommentInput): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      text: input.text,
      is_anonymous: input.anonymous,
      username: input.anonymous ? null : input.username,
      avatar_color: input.anonymous ? null : input.avatarColor,
      visitor_id: input.visitorId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapComment(data as CommentRow);
}
