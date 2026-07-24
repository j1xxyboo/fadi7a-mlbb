import { useMemo, useState } from "react";
import Feed from "./components/Feed";
import FilterTabs from "./components/FilterTabs";
import MobileNav from "./components/MobileNav";
import Navbar from "./components/Navbar";
import PostDetail from "./components/PostDetail";
import UploadModal from "./components/UploadModal";
import { FeedFilter, usePosts } from "./hooks/usePosts";
import { useTheme } from "./hooks/useTheme";
import { useCurrentUser } from "./hooks/useCurrentUser";
import Profile from "./pages/Profile";
import { Post } from "./types";

type Page = "home" | "profile";

export default function App() {
  const {
    posts,
    trendingPosts,
    loading,
    hasMore,
    loadMore,
    addPost,
    toggleLike,
    addComment,
  } = usePosts();
  const { theme, toggleTheme } = useTheme();
  const currentUser = useCurrentUser();
  const [page, setPage] = useState<Page>("home");
  const [filter, setFilter] = useState<FeedFilter>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const allKnownPosts = useMemo(() => {
    const byId = new Map<string, Post>();
    for (const p of posts) byId.set(p.id, p);
    for (const p of trendingPosts) if (!byId.has(p.id)) byId.set(p.id, p);
    return byId;
  }, [posts, trendingPosts]);

  const activePost = activePostId ? allKnownPosts.get(activePostId) ?? null : null;

  const visiblePosts = useMemo(() => {
    let list = filter === "trending" ? trendingPosts : posts;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.caption?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case "images":
        return list.filter((p) => p.mediaType === "image");
      case "videos":
        return list.filter((p) => p.mediaType === "video");
      default:
        return list;
    }
  }, [posts, trendingPosts, filter, searchQuery]);

  const openPost = (post: Post) => setActivePostId(post.id);

  return (
    <div className="min-h-screen">
      <Navbar
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenUpload={() => setUploadOpen(true)}
        onNavigate={setPage}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        {page === "home" ? (
          <>
            <FilterTabs active={filter} onChange={setFilter} />
            <Feed
              posts={visiblePosts}
              loading={loading}
              hasMore={filter === "latest" || filter === "images" || filter === "videos" ? hasMore : false}
              loadMore={loadMore}
              onOpen={openPost}
              onLike={toggleLike}
            />
          </>
        ) : (
          <Profile posts={posts} onOpen={openPost} />
        )}
      </main>

      <MobileNav page={page} onNavigate={setPage} onOpenUpload={() => setUploadOpen(true)} />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={async (p) => {
          await addPost(p);
          setPage("home");
          setFilter("latest");
        }}
      />

      <PostDetail
        post={activePost}
        onClose={() => setActivePostId(null)}
        onLike={toggleLike}
        onAddComment={addComment}
      />
    </div>
  );
}
