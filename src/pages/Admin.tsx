import { useEffect, useState } from "react";
import {
  AdminAccountRow,
  AdminPostRow,
  AdminRole,
  AdminSession,
  adminCreateAdmin,
  adminDeleteAdmin,
  adminDeletePost,
  adminListAdmins,
  adminListPosts,
  adminLogin,
  adminReviewPost,
  clearAdminSession,
  getAdminSession,
} from "../lib/adminAuth";

type Tab = "pending" | "approved" | "rejected" | "admins";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function LoginForm({ onLoggedIn }: { onLoggedIn: (s: AdminSession) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      const session = await adminLogin(username.trim(), password);
      onLoggedIn(session);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-2xl font-bold">Admin Login</h1>
      <p className="mb-6 text-sm text-zinc-500">Sign in to review and manage posts.</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-4 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/25 dark:border-white/10 dark:bg-white/5"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-4 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/25 dark:border-white/10 dark:bg-white/5"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="accent-gradient rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function PostRowCard({
  post,
  onApprove,
  onReject,
  onDelete,
}: {
  post: AdminPostRow;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
}) {
  const identity = post.is_anonymous ? "Anonymous" : `@${post.username}`;
  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
      <img
        src={post.media_url}
        alt=""
        className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-semibold">{identity}</p>
          {post.caption && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {post.caption}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            {post.media_type} · {timeAgo(post.created_at)}
          </p>
        </div>
        <div className="mt-2 flex gap-2">
          {onApprove && (
            <button
              onClick={onApprove}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
            >
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="rounded-md bg-zinc-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-600"
            >
              Reject
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageAdmins({ session }: { session: AdminSession }) {
  const [admins, setAdmins] = useState<AdminAccountRow[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => setAdmins(await adminListAdmins(session.id));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 6) {
      setError("Username required and password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminCreateAdmin(session.id, username.trim(), password, role);
      setUsername("");
      setPassword("");
      setRole("admin");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this admin account?")) return;
    await adminDeleteAdmin(session.id, id);
    await refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={submit}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 p-4 dark:border-white/10"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm outline-none focus:border-red-600 dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm outline-none focus:border-red-600 dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm outline-none focus:border-red-600 dark:border-white/10 dark:bg-white/5"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="accent-gradient rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 disabled:opacity-60"
        >
          {busy ? "Adding…" : "Add admin"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="flex flex-col gap-2">
        {admins.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2.5 dark:border-white/10"
          >
            <div>
              <p className="text-sm font-semibold">{a.username}</p>
              <p className="text-xs text-zinc-500">
                {a.role === "super_admin" ? "Super Admin" : "Admin"} · added{" "}
                {timeAgo(a.created_at)}
              </p>
            </div>
            {a.id !== session.id && (
              <button
                onClick={() => remove(a.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<AdminSession | null>(getAdminSession());
  const [tab, setTab] = useState<Tab>("pending");
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async (status: "pending" | "approved" | "rejected") => {
    if (!session) return;
    setLoading(true);
    try {
      setPosts(await adminListPosts(session.id, status));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && tab !== "admins") loadPosts(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tab]);

  if (!session) return <LoginForm onLoggedIn={setSession} />;

  const logout = () => {
    clearAdminSession();
    setSession(null);
  };

  const approve = async (id: string) => {
    await adminReviewPost(session.id, id, "approved");
    await loadPosts(tab as "pending" | "approved" | "rejected");
  };
  const reject = async (id: string) => {
    await adminReviewPost(session.id, id, "rejected");
    await loadPosts(tab as "pending" | "approved" | "rejected");
  };
  const remove = async (id: string) => {
    if (!confirm("Permanently delete this post?")) return;
    await adminDeletePost(session.id, id);
    await loadPosts(tab as "pending" | "approved" | "rejected");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    ...(session.role === "super_admin" ? [{ key: "admins" as Tab, label: "Manage Admins" }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-zinc-500">
            Signed in as <span className="font-semibold">{session.username}</span> (
            {session.role === "super_admin" ? "Super Admin" : "Admin"})
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
        >
          Log out
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-zinc-200 dark:border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-semibold ${
              tab === t.key
                ? "border-b-2 border-red-600 text-red-600"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "admins" ? (
        <ManageAdmins session={session} />
      ) : loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-zinc-500">No {tab} posts.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostRowCard
              key={p.id}
              post={p}
              onApprove={tab === "pending" ? () => approve(p.id) : undefined}
              onReject={tab === "pending" ? () => reject(p.id) : undefined}
              onDelete={() => remove(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
