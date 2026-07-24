import { useCallback, useEffect, useRef, useState } from "react";
import {
  addComment as apiAddComment,
  createPost as apiCreatePost,
  fetchPosts,
  fetchTrendingPosts,
  likePost,
  unlikePost,
} from "../api/supabaseApi";
import { getVisitorId } from "../lib/identity";
import { Comment, Post } from "../types";

export type FeedFilter = "latest" | "trending" | "images" | "videos";

export interface NewPostAuthor {
  anonymous: boolean;
  username?: string;
  avatarColor?: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const busyRef = useRef(false);
  const visitorId = getVisitorId();

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const { posts: next, hasMore: more } = await fetchPosts(pageRef.current, visitorId);
      setPosts((prev) => [...prev, ...next]);
      setHasMore(more);
      pageRef.current += 1;
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [hasMore, visitorId]);

  const refreshTrending = useCallback(async () => {
    const trending = await fetchTrendingPosts(visitorId);
    setTrendingPosts(trending);
  }, [visitorId]);

  useEffect(() => {
    loadMore();
    refreshTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPost = useCallback(
    async (post: {
      mediaType: Post["mediaType"];
      mediaUrl: string;
      videoUrl?: string;
      cloudinaryPublicId: string;
      duration?: string;
      caption?: string;
      author: NewPostAuthor;
    }) => {
      const created = await apiCreatePost({
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        videoUrl: post.videoUrl,
        cloudinaryPublicId: post.cloudinaryPublicId,
        duration: post.duration,
        caption: post.caption,
        anonymous: post.author.anonymous,
        username: post.author.username,
        avatarColor: post.author.avatarColor,
        visitorId,
      });
      setPosts((prev) => [created, ...prev]);
      return created;
    },
    [visitorId]
  );

  const toggleLike = useCallback(
    (id: string) => {
      const updateBoth = (updater: (p: Post) => Post) => {
        setPosts((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
        setTrendingPosts((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
      };

      const target = posts.find((p) => p.id === id) ?? trendingPosts.find((p) => p.id === id);
      if (!target) return;
      const nowLiked = !target.liked;

      updateBoth((p) => ({ ...p, liked: nowLiked, likes: p.likes + (nowLiked ? 1 : -1) }));

      const request = nowLiked ? likePost(id, visitorId) : unlikePost(id, visitorId);
      request
        .then(() => refreshTrending())
        .catch(() => {
          // roll back on failure
          updateBoth((p) => ({ ...p, liked: !nowLiked, likes: p.likes + (nowLiked ? -1 : 1) }));
        });
    },
    [posts, trendingPosts, visitorId, refreshTrending]
  );

  const addComment = useCallback(
    async (
      id: string,
      comment: { text: string; anonymous: boolean; username?: string; avatarColor?: string }
    ) => {
      const created: Comment = await apiAddComment({
        postId: id,
        text: comment.text,
        anonymous: comment.anonymous,
        username: comment.username,
        avatarColor: comment.avatarColor,
      });
      const attach = (p: Post) => (p.id === id ? { ...p, comments: [...p.comments, created] } : p);
      setPosts((prev) => prev.map(attach));
      setTrendingPosts((prev) => prev.map(attach));
      return created;
    },
    [visitorId]
  );

  return {
    posts,
    trendingPosts,
    loading,
    hasMore,
    loadMore,
    addPost,
    toggleLike,
    addComment,
  };
}
