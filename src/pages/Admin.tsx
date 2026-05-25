import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import {
  getAdminPosts,
  getAdminReports,
  getAdminUsers,
  getMe,
  updatePostModeration,
  updateReportStatus,
  updateUserAdmin,
  type ApiPost,
  type ApiReport,
  type ApiUser,
} from "../lib/api";

const adminStyles = `
  .admin-shell {
    display: grid;
    gap: 18px;
  }

  .admin-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
    gap: 18px;
    align-items: start;
  }

  .admin-panel,
  .admin-card {
    border: 1px solid rgba(255, 205, 232, 0.28);
    border-radius: 26px;
    color: #111;
    background:
      radial-gradient(circle at 90% 12%, rgba(255, 255, 255, 0.3), transparent 26%),
      linear-gradient(145deg, rgba(255, 225, 239, 0.76), rgba(219, 214, 255, 0.66));
    box-shadow: 0 18px 42px rgba(31, 12, 54, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .admin-panel {
    display: grid;
    gap: 14px;
    padding: clamp(18px, 3vw, 26px);
  }

  .admin-card {
    display: grid;
    gap: 10px;
    padding: 14px;
    animation: cardEntrance 0.22s ease both;
  }

  .admin-card header,
  .admin-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .admin-card h3,
  .admin-card p,
  .admin-card small,
  .admin-card strong,
  .admin-panel h2,
  .admin-panel p {
    color: #111;
  }

  .admin-list {
    display: grid;
    gap: 12px;
  }

  .admin-pill {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 6px 10px;
    color: #111;
    background: rgba(255, 255, 255, 0.48);
    font-size: 0.78rem;
    font-weight: 900;
  }

  .admin-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .admin-actions button,
  .admin-actions select {
    border: 1px solid rgba(255, 143, 199, 0.28);
    border-radius: 999px;
    padding: 8px 11px;
    color: #111;
    background: rgba(255, 255, 255, 0.52);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .admin-actions button:hover,
  .admin-actions select:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(255, 143, 199, 0.16);
  }

  .admin-denied {
    margin-top: 18px;
  }

  @media (max-width: 980px) {
    .admin-grid {
      grid-template-columns: 1fr;
    }

    .admin-card header,
    .admin-row {
      flex-direction: column;
    }
  }
`;

export default function Admin() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const openReports = useMemo(() => reports.filter((report) => report.status === "open"), [reports]);

  const loadAdmin = async () => {
    setMessage("");
    try {
      const me = await getMe();
      setUser(me.user);
      if (me.user?.role !== "admin") {
        setLoading(false);
        return;
      }

      const [reportData, postData, userData] = await Promise.all([
        getAdminReports(),
        getAdminPosts(),
        getAdminUsers(),
      ]);
      setReports(reportData.reports);
      setPosts(postData.posts);
      setUsers(userData.users);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load admin tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const moderatePost = async (postId: string, hidden: boolean) => {
    await updatePostModeration(postId, hidden);
    await loadAdmin();
  };

  const setReportStatus = async (reportId: string, status: ApiReport["status"]) => {
    await updateReportStatus(reportId, status);
    await loadAdmin();
  };

  const updateUser = async (targetUserId: string, input: Partial<Pick<ApiUser, "role" | "membership" | "blocked">>) => {
    await updateUserAdmin(targetUserId, input);
    await loadAdmin();
  };

  if (loading) {
    return (
      <div className="brand-page">
        <style>{adminStyles}</style>
        <section className="page-hero compact">
          <p className="section-kicker">Admin</p>
          <h1>Loading moderation tools</h1>
          <BrainMascot className="page-hero-mascot" size="sm" mood="calm" />
        </section>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="brand-page">
        <style>{adminStyles}</style>
        <section className="page-hero compact">
          <p className="section-kicker">Admin</p>
          <h1>Admin access</h1>
          <p className="hero-copy">Login as the first registered user to access moderation controls.</p>
          <BrainMascot className="page-hero-mascot" size="sm" mood="calm" />
        </section>
        <section className="admin-panel admin-denied">
          <p>{message || "This page is only available to admin accounts."}</p>
          <Link className="primary-button" to="/account">Go to account</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="brand-page admin-shell">
      <style>{adminStyles}</style>
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital admin</p>
        <h1>Moderation</h1>
        <p className="hero-copy">Review reports, hide posts, block users, and manage membership access.</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="happy" />
      </section>

      {message && <section className="admin-panel"><p>{message}</p></section>}

      <section className="admin-grid">
        <div className="admin-panel">
          <div className="admin-row">
            <div>
              <p className="section-kicker">Reports</p>
              <h2>{openReports.length} open reports</h2>
            </div>
            <button className="secondary-button" onClick={loadAdmin} type="button">Refresh</button>
          </div>

          <div className="admin-list">
            {reports.length === 0 ? (
              <p>No reports yet.</p>
            ) : reports.map((report) => (
              <article className="admin-card" key={report.id}>
                <header>
                  <div>
                    <span className="admin-pill">{report.status}</span>
                    <h3>{report.targetType} report</h3>
                  </div>
                  <small>{new Date(report.createdAt).toLocaleString()}</small>
                </header>
                <p>{report.reason}</p>
                <small>Reporter: {report.reporter?.name || "Unknown"}</small>
                {report.targetPost && <p>Post: {report.targetPost.body}</p>}
                {report.targetComment && <p>Comment: {report.targetComment.body}</p>}
                <div className="admin-actions">
                  {report.targetPost && (
                    <button onClick={() => moderatePost(report.targetPost!.id, true)} type="button">Hide post</button>
                  )}
                  <button onClick={() => setReportStatus(report.id, "reviewing")} type="button">Reviewing</button>
                  <button onClick={() => setReportStatus(report.id, "resolved")} type="button">Resolved</button>
                  <button onClick={() => setReportStatus(report.id, "dismissed")} type="button">Dismiss</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <p className="section-kicker">Users</p>
          <h2>{users.length} accounts</h2>
          <div className="admin-list">
            {users.map((account) => (
              <article className="admin-card" key={account.id}>
                <header>
                  <div>
                    <h3>{account.name}</h3>
                    <small>{account.email}</small>
                  </div>
                  <span className="admin-pill">{account.blocked ? "blocked" : account.membership}</span>
                </header>
                <div className="admin-actions">
                  <select value={account.role} onChange={(event) => updateUser(account.id, { role: event.target.value as ApiUser["role"] })}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                  <select value={account.membership} onChange={(event) => updateUser(account.id, { membership: event.target.value as ApiUser["membership"] })}>
                    <option value="free">free</option>
                    <option value="paid">paid</option>
                  </select>
                  <button onClick={() => updateUser(account.id, { blocked: !account.blocked })} type="button">
                    {account.blocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <p className="section-kicker">Posts</p>
        <h2>Community content</h2>
        <div className="admin-list">
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : posts.map((post) => (
            <article className="admin-card" key={post.id}>
              <header>
                <div>
                  <span className="admin-pill">{post.hidden ? "hidden" : post.spaceId}</span>
                  <h3>{post.title}</h3>
                </div>
                <small>{post.author?.name || "Unknown"}</small>
              </header>
              <p>{post.body}</p>
              <div className="admin-actions">
                <button onClick={() => moderatePost(post.id, !post.hidden)} type="button">
                  {post.hidden ? "Unhide" : "Hide"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
