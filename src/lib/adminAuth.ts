/**
 * Admin session handling + calls to the admin_* RPC functions defined in
 * the Supabase migration. There is no Supabase Auth involved — admins are
 * a separate lightweight table, and every privileged action is enforced
 * server-side inside a SECURITY DEFINER function that checks the caller's
 * role before doing anything. The client only ever holds the admin's id.
 */
import { supabase } from "./supabaseClient";

export type AdminRole = "super_admin" | "admin";

export interface AdminSession {
  id: string;
  username: string;
  role: AdminRole;
}

const SESSION_KEY = "fadi7a_admin_session";

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

function setAdminSession(session: AdminSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function adminLogin(username: string, password: string): Promise<AdminSession> {
  const { data, error } = await supabase.rpc("admin_login", {
    p_username: username,
    p_password: password,
  });
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid username or password");
  const row = data[0] as AdminSession;
  const session: AdminSession = { id: row.id, username: row.username, role: row.role };
  setAdminSession(session);
  return session;
}

export interface AdminPostRow {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  video_url: string | null;
  duration: string | null;
  caption: string | null;
  is_anonymous: boolean;
  username: string | null;
  avatar_color: string | null;
  likes_count: number;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export async function adminListPosts(
  actorId: string,
  status: "pending" | "approved" | "rejected"
): Promise<AdminPostRow[]> {
  const { data, error } = await supabase.rpc("admin_list_posts", {
    p_actor_id: actorId,
    p_status: status,
  });
  if (error) throw error;
  return (data ?? []) as AdminPostRow[];
}

export async function adminReviewPost(
  actorId: string,
  postId: string,
  newStatus: "approved" | "rejected"
): Promise<void> {
  const { error } = await supabase.rpc("admin_review_post", {
    p_actor_id: actorId,
    p_post_id: postId,
    p_new_status: newStatus,
  });
  if (error) throw error;
}

export async function adminDeletePost(actorId: string, postId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_post", {
    p_actor_id: actorId,
    p_post_id: postId,
  });
  if (error) throw error;
}

export interface AdminAccountRow {
  id: string;
  username: string;
  role: AdminRole;
  created_at: string;
}

export async function adminListAdmins(actorId: string): Promise<AdminAccountRow[]> {
  const { data, error } = await supabase.rpc("admin_list_admins", { p_actor_id: actorId });
  if (error) throw error;
  return (data ?? []) as AdminAccountRow[];
}

export async function adminCreateAdmin(
  actorId: string,
  username: string,
  password: string,
  role: AdminRole
): Promise<AdminAccountRow> {
  const { data, error } = await supabase.rpc("admin_create_admin", {
    p_actor_id: actorId,
    p_username: username,
    p_password: password,
    p_role: role,
  });
  if (error) throw error;
  return (data as AdminAccountRow[])[0];
}

export async function adminDeleteAdmin(actorId: string, targetId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_admin", {
    p_actor_id: actorId,
    p_target_id: targetId,
  });
  if (error) throw error;
}
