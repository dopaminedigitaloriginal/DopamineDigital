import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import { createComment, createPost, getMe, getPosts, type ApiPost, type ApiUser } from "../lib/api";

type CommunityPost = {
  id: string;
  type: "win" | "support" | "body-double";
  title: string;
  body: string;
  createdAt: string;
};

type SupportMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type CommunityApp = {
  id: "support" | "wins" | "body-double";
  title: string;
  body: string;
  action: string;
};

const COMMUNITY_POSTS_KEY = "dopamine_community_posts";
const SUPPORT_THREAD_KEY = "dopamine_support_thread";

const communityApps: CommunityApp[] = [
  {
    id: "support",
    title: "Support thread",
    body: "Talk to others, ask for a gentle reframe, or leave a supportive reply.",
    action: "Open thread",
  },
  {
    id: "wins",
    title: "Streak shares",
    body: "Share tiny wins, reset days, comeback moments, and dopamine progress.",
    action: "Share wins",
  },
  {
    id: "body-double",
    title: "Body doubling",
    body: "Start a quiet co-working room for one small task at a time.",
    action: "Start room",
  },
];

const starterMessages: SupportMessage[] = [
  {
    id: "support-starter-1",
    name: "DopamineDigital",
    message: "Welcome to the support thread. Share what feels loud, ask for a gentle reframe, or leave encouragement for someone else.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "support-starter-2",
    name: "Brain buddy",
    message: "Tiny reminder: you are allowed to need support before things become urgent.",
    createdAt: new Date().toISOString(),
  },
];

const starterPosts: CommunityPost[] = [
  {
    id: "starter-1",
    type: "win",
    title: "Tiny win",
    body: "Opened the app instead of keeping everything in my head.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-2",
    type: "support",
    title: "Gentle reminder",
    body: "You do not have to fix the whole day. Just soften the next five minutes.",
    createdAt: new Date().toISOString(),
  },
];

const communityStyles = `
  .community-page .page-hero {
    overflow: hidden;
    border: 1px solid rgba(255, 176, 221, 0.24);
    background:
      radial-gradient(circle at 15% 18%, rgba(255, 143, 199, 0.24), transparent 34%),
      radial-gradient(circle at 80% 22%, rgba(144, 190, 255, 0.2), transparent 32%),
      linear-gradient(145deg, rgba(74, 34, 102, 0.62), rgba(39, 22, 65, 0.72));
    box-shadow: 0 22px 60px rgba(30, 12, 54, 0.28);
  }

  .community-app-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 18px;
  }

  .community-app-card,
  .community-panel,
  .support-message,
  .community-post {
    border: 1px solid rgba(255, 205, 232, 0.28);
    border-radius: 26px;
    color: #111;
    background:
      radial-gradient(circle at 90% 12%, rgba(255, 255, 255, 0.3), transparent 26%),
      linear-gradient(145deg, rgba(255, 225, 239, 0.76), rgba(219, 214, 255, 0.66));
    box-shadow: 0 18px 42px rgba(31, 12, 54, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .community-app-card {
    display: grid;
    min-height: 214px;
    padding: 18px;
    text-decoration: none;
    overflow: hidden;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .community-app-card:hover {
    transform: translateY(-4px) scale(1.012);
    border-color: rgba(255, 143, 199, 0.62);
    box-shadow: 0 18px 46px rgba(255, 143, 199, 0.2);
  }

  .community-app-art {
    width: 68px;
    height: 68px;
    margin-bottom: 14px;
    border-radius: 24px;
    filter: drop-shadow(0 0 14px rgba(255, 143, 199, 0.34));
    transition: transform 180ms ease;
  }

  .community-app-card:hover .community-app-art {
    transform: translateY(-4px) scale(1.08);
  }

  .community-app-art.support {
    border-radius: 999px;
    background: radial-gradient(circle, #ffc5dc 0 30%, #bfc7ff 31% 54%, transparent 55%);
    animation: communityComfort 3.2s ease-in-out infinite;
  }

  .community-app-art.wins {
    background: radial-gradient(circle, #ffe78a 0 22%, #ff9ccc 23% 45%, transparent 46%);
  }

  .community-app-art.body-double {
    background: radial-gradient(circle, #bde7ff 0 24%, #d2c1ff 25% 50%, transparent 51%);
    animation: communityBreathing 4.2s ease-in-out infinite;
  }

  .community-app-card h2,
  .community-panel h2 {
    margin: 0 0 8px;
    font-size: clamp(1.1rem, 2vw, 1.45rem);
  }

  .community-app-card p,
  .community-panel p,
  .support-message p,
  .community-post p {
    color: #111;
  }

  .community-app-card strong {
    align-self: end;
    margin-top: 14px;
    color: #111;
  }

  .community-panel {
    display: grid;
    gap: 16px;
    margin-top: 18px;
    padding: clamp(18px, 3vw, 28px);
  }

  .community-tool-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .community-back-link {
    display: inline-flex;
    width: fit-content;
    margin-bottom: 12px;
    color: #111;
    font-weight: 900;
    text-decoration: none;
  }

  .support-thread-list,
  .community-feed {
    display: grid;
    gap: 12px;
  }

  .support-thread-list {
    max-height: 440px;
    overflow: auto;
    padding-right: 4px;
  }

  .support-message {
    display: grid;
    gap: 7px;
    max-width: 86%;
    padding: 14px;
    border-radius: 20px 20px 20px 8px;
    background: rgba(255, 255, 255, 0.5);
    animation: communityCardIn 220ms ease both;
  }

  .support-message:nth-child(even) {
    justify-self: end;
    border-radius: 20px 20px 8px 20px;
    background: rgba(226, 222, 255, 0.62);
  }

  .support-message header,
  .community-post header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
  }

  .support-message strong,
  .support-message small,
  .community-post small {
    color: #111;
  }

  .support-thread-form,
  .community-form {
    display: grid;
    gap: 10px;
  }

  .support-thread-form {
    grid-template-columns: minmax(110px, 0.35fr) minmax(0, 1fr) auto;
    align-items: end;
  }

  .support-thread-form input,
  .support-thread-form textarea,
  .community-form input,
  .community-form textarea {
    width: 100%;
    border: 1px solid rgba(255, 143, 199, 0.3);
    border-radius: 18px;
    padding: 12px 14px;
    color: #111;
    background: rgba(255, 255, 255, 0.55);
    font: inherit;
  }

  .support-thread-form textarea {
    min-height: 46px;
    max-height: 120px;
    resize: vertical;
  }

  .community-form textarea {
    min-height: 112px;
    resize: vertical;
  }

  .community-type-row,
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .community-type-row button {
    border: 1px solid rgba(255, 143, 199, 0.24);
    border-radius: 999px;
    padding: 8px 12px;
    cursor: pointer;
    color: #111;
    background: rgba(255, 255, 255, 0.44);
    font-weight: 800;
  }

  .community-type-row button.active {
    background: linear-gradient(135deg, #ff9fcc, #b9c8ff);
    box-shadow: 0 10px 24px rgba(255, 143, 199, 0.2);
  }

  .community-post {
    padding: 16px;
    animation: communityCardIn 220ms ease both;
  }

  .community-pill {
    display: inline-flex;
    border-radius: 999px;
    padding: 6px 10px;
    color: #111;
    background: rgba(255, 255, 255, 0.48);
    font-size: 0.78rem;
    font-weight: 900;
    white-space: nowrap;
  }

  .body-double-timer {
    display: grid;
    place-items: center;
    width: min(240px, 100%);
    aspect-ratio: 1;
    margin: 6px auto;
    border-radius: 999px;
    color: #111;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 46%, transparent 47%),
      conic-gradient(from 180deg, #ff9fcc, #b9c8ff, #9ef7c8, #ff9fcc);
    box-shadow: 0 0 38px rgba(255, 143, 199, 0.24);
    animation: communityBreathing 4s ease-in-out infinite;
  }

  .body-double-timer strong {
    font-size: clamp(2rem, 7vw, 3.4rem);
    line-height: 1;
  }

  .body-double-timer span {
    display: block;
    margin-top: 6px;
    font-weight: 900;
  }

  .community-link-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .community-link-grid a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid rgba(255, 205, 232, 0.28);
    border-radius: 18px;
    padding: 13px 14px;
    color: #111;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.42);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .community-link-grid a:hover {
    transform: translateY(-3px);
    border-color: rgba(143, 184, 255, 0.58);
    box-shadow: 0 14px 30px rgba(143, 184, 255, 0.16);
  }

  @keyframes communityBreathing {
    0%, 100% { transform: scale(0.98); filter: drop-shadow(0 0 4px rgba(189, 231, 255, 0.24)); }
    50% { transform: scale(1.03); filter: drop-shadow(0 0 16px rgba(189, 231, 255, 0.52)); }
  }

  @keyframes communityComfort {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 159, 200, 0.28)); }
    50% { filter: drop-shadow(0 0 18px rgba(255, 159, 200, 0.56)); }
  }

  @keyframes communityCardIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 980px) {
    .community-app-grid,
    .community-link-grid,
    .support-thread-form {
      grid-template-columns: 1fr;
    }

    .support-message {
      max-width: 100%;
    }
  }
`;

function readPosts() {
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
    return raw ? (JSON.parse(raw) as CommunityPost[]) : starterPosts;
  } catch {
    return starterPosts;
  }
}

function savePosts(posts: CommunityPost[]) {
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
}

function readMessages() {
  try {
    const raw = localStorage.getItem(SUPPORT_THREAD_KEY);
    return raw ? (JSON.parse(raw) as SupportMessage[]) : starterMessages;
  } catch {
    return starterMessages;
  }
}

function saveMessages(messages: SupportMessage[]) {
  localStorage.setItem(SUPPORT_THREAD_KEY, JSON.stringify(messages));
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function CommunityShell({ children, title, copy, mood = "happy" }: { children: React.ReactNode; title: string; copy: string; mood?: "happy" | "calm" | "sleepy" }) {
  return (
    <div className="brand-page community-page">
      <style>{communityStyles}</style>
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital community</p>
        <h1>{title}</h1>
        <p className="hero-copy">{copy}</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood={mood} />
      </section>
      {children}
    </div>
  );
}

function CommunityLauncher() {
  return (
    <CommunityShell title="Community" copy="Choose a gentle community space. Each card opens its own mini page.">
      <section className="community-app-grid" aria-label="Community apps">
        {communityApps.map((app) => (
          <Link className="community-app-card" key={app.id} to={`/community/${app.id}`}>
            <span className={`community-app-art ${app.id}`} />
            <div>
              <h2>{app.title}</h2>
              <p>{app.body}</p>
            </div>
            <strong>{app.action}</strong>
          </Link>
        ))}
      </section>
    </CommunityShell>
  );
}

function SupportThreadPage() {
  const [messages, setMessages] = useState<SupportMessage[]>(readMessages);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [apiPosts, setApiPosts] = useState<ApiPost[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [supportName, setSupportName] = useState("Me");
  const [supportMessage, setSupportMessage] = useState("");

  const loadBackendThread = async () => {
    try {
      const [me, postsData] = await Promise.all([getMe(), getPosts("public-support")]);
      setApiUser(me.user);
      setApiPosts(postsData.posts);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    loadBackendThread();
    const timer = window.setInterval(loadBackendThread, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const updateMessages = (nextMessages: SupportMessage[]) => {
    setMessages(nextMessages);
    saveMessages(nextMessages);
  };

  const submitSupportMessage = (event: FormEvent) => {
    event.preventDefault();
    const trimmedMessage = supportMessage.trim();
    if (!trimmedMessage) return;

    if (apiOnline && !apiUser) return;

    if (apiOnline && apiUser) {
      createPost({ spaceId: "public-support", title: "Support thread", body: trimmedMessage, type: "support" })
        .then(() => loadBackendThread())
        .catch(() => setApiOnline(false));
      setSupportMessage("");
      return;
    }

    updateMessages([
      ...messages,
      {
        id: crypto.randomUUID(),
        name: supportName.trim() || "Anonymous",
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSupportMessage("");
  };

  const submitReply = (postId: string) => {
    const body = replyText[postId]?.trim();
    if (!body) return;
    createComment(postId, body)
      .then(() => {
        setReplyText((current) => ({ ...current, [postId]: "" }));
        loadBackendThread();
      })
      .catch(() => setApiOnline(false));
  };

  return (
    <CommunityShell title="Support Thread" copy="A local thread for gentle replies, support, and same-here moments." mood="calm">
      <Link className="community-back-link" to="/community">Back to community</Link>
      <section className="community-panel">
        <div className="community-tool-header">
          <div>
            <p className="section-kicker">Talk it through</p>
            <h2>Support chat</h2>
            <p className="muted-copy">
              {apiOnline ? "Connected to the backend. Posts and replies can sync across devices." : "Backend is offline, so this is using local messages for now."}
            </p>
          </div>
          <BrainMascot className="panel-mascot" size="xs" mood="calm" />
        </div>

        {apiOnline ? (
          <div className="support-thread-list" aria-label="Support thread messages">
            {apiPosts.map((post) => (
              <article className="support-message" key={post.id}>
                <header>
                  <strong>{post.author?.name || "Member"}</strong>
                  <small>{new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
                </header>
                <p>{post.body}</p>
                {(post.comments || []).map((comment) => (
                  <p key={comment.id}><strong>{comment.author?.name || "Member"}:</strong> {comment.body}</p>
                ))}
                {apiUser && (
                  <div className="support-thread-form">
                    <input value={replyText[post.id] || ""} onChange={(event) => setReplyText((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Reply with support..." />
                    <button className="secondary-button" onClick={() => submitReply(post.id)} type="button">Reply</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="support-thread-list" aria-label="Support thread messages">
            {messages.map((message) => (
              <article className="support-message" key={message.id}>
                <header>
                  <strong>{message.name}</strong>
                  <small>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
                </header>
                <p>{message.message}</p>
              </article>
            ))}
          </div>
        )}

        <form className="support-thread-form" onSubmit={submitSupportMessage}>
          {!apiOnline && <input value={supportName} onChange={(event) => setSupportName(event.target.value)} placeholder="Your name" />}
          <textarea value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Write a supportive reply or ask for support..." />
          <button className="primary-button" type="submit">{apiOnline && !apiUser ? "Login first" : "Send"}</button>
        </form>
        {apiOnline && !apiUser && <Link className="secondary-button" to="/account">Login to post in the live thread</Link>}
      </section>
    </CommunityShell>
  );
}

function WinsPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(readPosts);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [apiPosts, setApiPosts] = useState<ApiPost[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [postType, setPostType] = useState<CommunityPost["type"]>("win");
  const [title, setTitle] = useState("Tiny win");
  const [body, setBody] = useState("");
  const newestPosts = useMemo(() => posts.slice(0, 8), [posts]);

  const loadBackendPosts = async () => {
    try {
      const [me, postsData] = await Promise.all([getMe(), getPosts("wins")]);
      setApiUser(me.user);
      setApiPosts(postsData.posts);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    loadBackendPosts();
  }, []);

  const updatePosts = (nextPosts: CommunityPost[]) => {
    setPosts(nextPosts);
    savePosts(nextPosts);
  };

  const submitPost = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    if (apiOnline && !apiUser) return;

    if (apiOnline && apiUser) {
      createPost({ spaceId: "wins", title: trimmedTitle, body: trimmedBody, type: postType })
        .then(() => loadBackendPosts())
        .catch(() => setApiOnline(false));
      setBody("");
      return;
    }

    updatePosts([
      {
        id: crypto.randomUUID(),
        type: postType,
        title: trimmedTitle,
        body: trimmedBody,
        createdAt: new Date().toISOString(),
      },
      ...posts,
    ]);
    setBody("");
  };

  return (
    <CommunityShell title="Streak Shares" copy="Share tiny wins, reset days, comeback moments, and progress you want to remember.">
      <Link className="community-back-link" to="/community">Back to community</Link>
      <section className="community-panel">
        <div className="community-tool-header">
          <div>
            <p className="section-kicker">Community board</p>
            <h2>Share a tiny update</h2>
            <p className="muted-copy">
              {apiOnline ? "Connected to the backend. Member wins can sync across accounts." : "Backend is offline, so this board is using local saves for now."}
            </p>
          </div>
          <BrainMascot className="panel-mascot" size="xs" mood="happy" />
        </div>

        <form className="community-form" onSubmit={submitPost}>
          <div className="community-type-row" aria-label="Post type">
            {(["win", "support", "body-double"] as CommunityPost["type"][]).map((type) => (
              <button className={postType === type ? "active" : ""} key={type} onClick={() => setPostType(type)} type="button">
                {type === "body-double" ? "body double" : type}
              </button>
            ))}
          </div>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Update title" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What do you want to share or remember?" />
          <button className="primary-button" type="submit">{apiOnline && !apiUser ? "Login first" : "Post update"}</button>
        </form>
        {apiOnline && !apiUser && <Link className="secondary-button" to="/account">Login to post live updates</Link>}

        <div className="community-feed" aria-label="Community updates">
          {(apiOnline ? apiPosts : newestPosts).map((post) => (
            <article className="community-post" key={post.id}>
              <header>
                <div>
                  <span className="community-pill">{post.type === "body-double" ? "body double" : post.type}</span>
                  <h3>{post.title}</h3>
                </div>
                <small>{new Date(post.createdAt).toLocaleDateString()}</small>
              </header>
              <p>{post.body}</p>
              {"author" in post && post.author?.name && <small>by {post.author.name}</small>}
            </article>
          ))}
        </div>
      </section>
    </CommunityShell>
  );
}

function BodyDoublePage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(25 * 60);

  useEffect(() => {
    if (!sessionActive) return undefined;
    const timer = window.setInterval(() => {
      setSessionSeconds((current) => {
        if (current <= 1) {
          setSessionActive(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionActive]);

  const resetSession = () => {
    setSessionActive(false);
    setSessionSeconds(25 * 60);
  };

  return (
    <CommunityShell title="Body Doubling" copy="A quiet co-working room for one small task at a time." mood="sleepy">
      <Link className="community-back-link" to="/community">Back to community</Link>
      <section className="community-panel">
        <div className="community-tool-header">
          <div>
            <p className="section-kicker">Focus together</p>
            <h2>Body double room</h2>
            <p>No pressure, no performance. Pick one task and let the timer hold the container.</p>
          </div>
          <BrainMascot className="panel-mascot" size="xs" mood="sleepy" />
        </div>

        <div className="body-double-timer" aria-label="Body double timer">
          <div>
            <strong>{formatTimer(sessionSeconds)}</strong>
            <span>{sessionActive ? "in session" : "ready"}</span>
          </div>
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={() => setSessionActive((value) => !value)} type="button">
            {sessionActive ? "Pause" : "Start"}
          </button>
          <button className="secondary-button" onClick={resetSession} type="button">Reset</button>
        </div>

        <div className="community-link-grid" aria-label="DopamineDigital social links">
          <a href="https://www.tiktok.com/@dopaminedigital_" rel="noreferrer" target="_blank">
            <span>TikTok</span>
            <strong>Open</strong>
          </a>
          <a href="https://www.instagram.com/dopaminedigital_" rel="noreferrer" target="_blank">
            <span>Instagram</span>
            <strong>Open</strong>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61589892487838" rel="noreferrer" target="_blank">
            <span>Facebook</span>
            <strong>Open</strong>
          </a>
        </div>
      </section>
    </CommunityShell>
  );
}

export default function Community() {
  const { communityId } = useParams();

  if (communityId === "support") return <SupportThreadPage />;
  if (communityId === "wins") return <WinsPage />;
  if (communityId === "body-double") return <BodyDoublePage />;

  return <CommunityLauncher />;
}
