import { useMemo, useState } from "react";
import Feed from "./components/Feed";
import FilterTabs from "./components/FilterTabs";
import MobileNav from "./components/MobileNav";
import Navbar from "./components/Navbar";
import PostDetail from "./components/PostDetail";
import UploadModal from "./components/UploadModal";
import { CURRENT_USER } from "./data/mockData";
import { FeedFilter, usePosts } from "./hooks/usePosts";
import { useTheme } from "./hooks/useTheme";
import Profile from "./pages/Profile";
import { Post } from "./types";

type Page = "home" | "profile";

export default function App() {
  const { posts, loading, hasMore, loadMore, addPost, toggleLike, addComment } = usePosts();
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<Page>("home");
  const [filter, setFilter] = useState<FeedFilter>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const activePost = posts.find((p) => p.id === activePostId) ?? null;

  const visiblePosts = useMemo(() => {
    let list = posts;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.caption?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case "trending":
        return [...list].sort((a, b) => b.likes - a.likes);
      case "images":
        return list.filter((p) => p.mediaType === "image");
      case "videos":
        return list.filter((p) => p.mediaType === "video");
      default:
        return list;
    }
  }, [posts, filter, searchQuery]);

  const openPost = (post: Post) => setActivePostId(post.id);

  return (
    <div className="min-h-screen">
      <Navbar
        currentUser={CURRENT_USER}
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
              hasMore={hasMore}
              loadMore={loadMore}
              onOpen={openPost}
              onLike={toggleLike}
            />
          </>
        ) : (
          <Profile user={CURRENT_USER} posts={posts} onOpen={openPost} />
        )}
      </main>

      <MobileNav page={page} onNavigate={setPage} onOpenUpload={() => setUploadOpen(true)} />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={(p) => {
          addPost(p);
          setPage("home");
          setFilter("latest");
        }}
        currentUser={CURRENT_USER}
      />

      <PostDetail
        post={activePost}
        currentUser={CURRENT_USER}
        onClose={() => setActivePostId(null)}
        onLike={toggleLike}
        onAddComment={addComment}
      />
    </div>
  );
}
