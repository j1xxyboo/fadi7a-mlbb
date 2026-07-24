import { MOCK_POSTS } from "../data/mockData";
import { Post } from "../types";

/**
 * Mock API layer. Every function simulates a network round-trip.
 * Swap these implementations for real HTTP calls when a backend exists —
 * no UI component talks to data directly.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PAGE_SIZE = 8;

export async function fetchPosts(
  page: number
): Promise<{ posts: Post[]; hasMore: boolean }> {
  await delay(900);
  const start = page * PAGE_SIZE;
  return {
    posts: MOCK_POSTS.slice(start, start + PAGE_SIZE),
    hasMore: start + PAGE_SIZE < MOCK_POSTS.length,
  };
}

export async function createPost(post: Post): Promise<Post> {
  await delay(300);
  return post;
}
