import { useCallback, useEffect, useRef, useState } from "react";
import { createPost, fetchPosts } from "../api/mockApi";
import { Comment, Post } from "../types";

export type FeedFilter = "latest" | "trending" | "images" | "videos";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const busyRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    const { posts: next, hasMore: more } = await fetchPosts(pageRef.current);
    setPosts((prev) => [...prev, ...next]);
    setHasMore(more);
    pageRef.current += 1;
    setLoading(false);
    busyRef.current = false;
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    void createPost(post);
  }, []);

  const toggleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p
      )
    );
  }, []);

  const addComment = useCallback((id: string, comment: Comment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
  }, []);

  return { posts, loading, hasMore, loadMore, addPost, toggleLike, addComment };
}
