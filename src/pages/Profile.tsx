import { Post } from "../types";
import FeedCard from "../components/FeedCard";

interface Props {
  posts: Post[];
  onOpen: (post: Post) => void;
}

export default function Profile({ posts, onOpen }: Props) {
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="accent-gradient flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white">
          You
        </div>
        <h1 className="display-title mt-3 text-xl">Your posts on this device</h1>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Posts and comments made from this browser, anonymous or named.
        </p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="font-semibold">{posts.length}</p>
            <p className="text-zinc-500">posts</p>
          </div>
          <div>
            <p className="font-semibold">{totalLikes}</p>
            <p className="text-zinc-500">likes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {posts.map((post) => (
          <button key={post.id} onClick={() => onOpen(post)} className="block">
            <FeedCard post={post} onOpen={onOpen} onLike={() => {}} compact />
          </button>
        ))}
      </div>
    </div>
  );
}
