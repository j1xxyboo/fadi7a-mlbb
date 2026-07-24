import { useEffect, useRef } from "react";
import { Post } from "../types";
import EmptyState from "./EmptyState";
import FeedCard from "./FeedCard";
import SkeletonCard from "./SkeletonCard";

interface Props {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onOpen: (post: Post) => void;
  onLike: (id: string) => void;
}

export default function Feed({ posts, loading, hasMore, loadMore, onOpen, onLike }: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  if (!loading && posts.length === 0) return <EmptyState />;

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
        {posts.map((post) => (
          <FeedCard key={post.id} post={post} onOpen={onOpen} onLike={onLike} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`s${i}`} tall={i % 2 === 0} />
          ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {!hasMore && posts.length > 0 && (
        <p className="py-10 text-center text-sm text-zinc-500">
          You've reached the end. For now.
        </p>
      )}
    </>
  );
}
