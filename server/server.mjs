import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const DB_PATH = join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 8787);
const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-dopamine-digital-secret-change-me";

const defaultDb = {
  users: [],
  spaces: [
    { id: "public-support", name: "Support thread", visibility: "public", paidOnly: false, createdAt: new Date().toISOString() },
    { id: "wins", name: "Streak shares", visibility: "public", paidOnly: false, createdAt: new Date().toISOString() },
    { id: "body-double", name: "Body doubling", visibility: "public", paidOnly: false, createdAt: new Date().toISOString() },
    { id: "members", name: "Member support room", visibility: "private", paidOnly: true, createdAt: new Date().toISOString() },
  ],
  posts: [],
  comments: [],
  reports: [],
  blocks: [],
  notifications: [],
};

async function readDb() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    return JSON.parse(await readFile(DB_PATH, "utf8"));
  } catch {
    await writeDb(defaultDb);
    return structuredClone(defaultDb);
  }
}

async function writeDb(db) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function send(res, status, body) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { hash, salt };
}

function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.passwordSalt);
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
  return payload;
}

async function getAuthUser(req, db) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  return payload ? db.users.find((user) => user.id === payload.userId) || null : null;
}

function canAccessSpace(user, space) {
  if (!space) return false;
  if (space.visibility === "public") return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  if (space.paidOnly) return user.membership === "paid";
  return true;
}

function visiblePosts(db, user, spaceId) {
  const blockedIds = new Set(db.blocks.filter((block) => block.blockerId === user?.id).map((block) => block.blockedId));
  return db.posts
    .filter((post) => !post.hidden)
    .filter((post) => !spaceId || post.spaceId === spaceId)
    .filter((post) => canAccessSpace(user, db.spaces.find((space) => space.id === post.spaceId)))
    .filter((post) => !blockedIds.has(post.authorId))
    .map((post) => ({
      ...post,
      author: publicUser(db.users.find((candidate) => candidate.id === post.authorId)),
      comments: db.comments
        .filter((comment) => comment.postId === post.id && !comment.hidden && !blockedIds.has(comment.authorId))
        .map((comment) => ({ ...comment, author: publicUser(db.users.find((candidate) => candidate.id === comment.authorId)) })),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function requireUser(user, res) {
  if (user) return true;
  send(res, 401, { error: "Login required" });
  return false;
}

async function route(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  const db = await readDb();
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const user = await getAuthUser(req, db);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, app: "Dopamine Digital API" });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const { name, email, password } = await parseBody(req);
      if (!name || !email || !password) return send(res, 400, { error: "Name, email and password are required" });
      if (db.users.some((candidate) => candidate.email.toLowerCase() === email.toLowerCase())) return send(res, 409, { error: "Email already registered" });
      const { hash, salt } = hashPassword(password);
      const newUser = {
        id: randomUUID(),
        name,
        email: email.toLowerCase(),
        role: db.users.length === 0 ? "admin" : "member",
        membership: "free",
        blocked: false,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      await writeDb(db);
      const token = signToken({ userId: newUser.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14 });
      return send(res, 201, { token, user: publicUser(newUser) });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, password } = await parseBody(req);
      const foundUser = db.users.find((candidate) => candidate.email.toLowerCase() === String(email).toLowerCase());
      if (!foundUser || !verifyPassword(password, foundUser)) return send(res, 401, { error: "Invalid login" });
      if (foundUser.blocked) return send(res, 403, { error: "Account blocked" });
      const token = signToken({ userId: foundUser.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14 });
      return send(res, 200, { token, user: publicUser(foundUser) });
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      return send(res, 200, { user: publicUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/api/spaces") {
      return send(res, 200, { spaces: db.spaces.filter((space) => canAccessSpace(user, space)) });
    }

    if (req.method === "GET" && url.pathname === "/api/posts") {
      return send(res, 200, { posts: visiblePosts(db, user, url.searchParams.get("spaceId")) });
    }

    if (req.method === "POST" && url.pathname === "/api/posts") {
      if (!requireUser(user, res)) return;
      const { spaceId = "public-support", title = "Support post", body, type = "support" } = await parseBody(req);
      const space = db.spaces.find((candidate) => candidate.id === spaceId);
      if (!canAccessSpace(user, space)) return send(res, 403, { error: "You cannot post in this space" });
      if (!body) return send(res, 400, { error: "Post body is required" });
      const post = { id: randomUUID(), spaceId, authorId: user.id, type, title, body, hidden: false, createdAt: new Date().toISOString() };
      db.posts.push(post);
      await writeDb(db);
      return send(res, 201, { post });
    }

    const commentMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (req.method === "POST" && commentMatch) {
      if (!requireUser(user, res)) return;
      const post = db.posts.find((candidate) => candidate.id === commentMatch[1]);
      if (!post) return send(res, 404, { error: "Post not found" });
      const space = db.spaces.find((candidate) => candidate.id === post.spaceId);
      if (!canAccessSpace(user, space)) return send(res, 403, { error: "You cannot comment here" });
      const { body } = await parseBody(req);
      if (!body) return send(res, 400, { error: "Comment body is required" });
      const comment = { id: randomUUID(), postId: post.id, authorId: user.id, body, hidden: false, createdAt: new Date().toISOString() };
      db.comments.push(comment);
      if (post.authorId !== user.id) {
        db.notifications.push({ id: randomUUID(), userId: post.authorId, type: "comment", read: false, message: `${user.name} replied to your post`, createdAt: new Date().toISOString() });
      }
      await writeDb(db);
      return send(res, 201, { comment });
    }

    if (req.method === "POST" && url.pathname === "/api/reports") {
      if (!requireUser(user, res)) return;
      const { targetType, targetId, reason } = await parseBody(req);
      if (!targetType || !targetId || !reason) return send(res, 400, { error: "targetType, targetId and reason are required" });
      const report = { id: randomUUID(), reporterId: user.id, targetType, targetId, reason, status: "open", createdAt: new Date().toISOString() };
      db.reports.push(report);
      await writeDb(db);
      return send(res, 201, { report });
    }

    if (req.method === "POST" && url.pathname === "/api/blocks") {
      if (!requireUser(user, res)) return;
      const { blockedId } = await parseBody(req);
      if (!blockedId) return send(res, 400, { error: "blockedId is required" });
      if (!db.blocks.some((block) => block.blockerId === user.id && block.blockedId === blockedId)) {
        db.blocks.push({ id: randomUUID(), blockerId: user.id, blockedId, createdAt: new Date().toISOString() });
      }
      await writeDb(db);
      return send(res, 201, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/notifications") {
      if (!requireUser(user, res)) return;
      return send(res, 200, { notifications: db.notifications.filter((notification) => notification.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/reports") {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      return send(res, 200, {
        reports: db.reports.map((report) => ({
          ...report,
          reporter: publicUser(db.users.find((candidate) => candidate.id === report.reporterId)),
          targetPost: report.targetType === "post" ? db.posts.find((post) => post.id === report.targetId) || null : null,
          targetComment: report.targetType === "comment" ? db.comments.find((comment) => comment.id === report.targetId) || null : null,
        })),
      });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/users") {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      return send(res, 200, { users: db.users.map(publicUser).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/posts") {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      return send(res, 200, {
        posts: db.posts
          .map((post) => ({
            ...post,
            author: publicUser(db.users.find((candidate) => candidate.id === post.authorId)),
            comments: db.comments
              .filter((comment) => comment.postId === post.id)
              .map((comment) => ({ ...comment, author: publicUser(db.users.find((candidate) => candidate.id === comment.authorId)) })),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      });
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/admin/reports/")) {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      const reportId = url.pathname.split("/").at(-1);
      const { status } = await parseBody(req);
      const report = db.reports.find((candidate) => candidate.id === reportId);
      if (!report) return send(res, 404, { error: "Report not found" });
      report.status = status || report.status;
      await writeDb(db);
      return send(res, 200, { report });
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/admin/posts/")) {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      const postId = url.pathname.split("/").at(-1);
      const { hidden } = await parseBody(req);
      const post = db.posts.find((candidate) => candidate.id === postId);
      if (!post) return send(res, 404, { error: "Post not found" });
      post.hidden = Boolean(hidden);
      await writeDb(db);
      return send(res, 200, { post });
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/admin/users/")) {
      if (!requireUser(user, res)) return;
      if (user.role !== "admin") return send(res, 403, { error: "Admin only" });
      const userId = url.pathname.split("/").at(-1);
      const target = db.users.find((candidate) => candidate.id === userId);
      if (!target) return send(res, 404, { error: "User not found" });
      const { role, membership, blocked } = await parseBody(req);
      if (role) target.role = role;
      if (membership) target.membership = membership;
      if (typeof blocked === "boolean") target.blocked = blocked;
      await writeDb(db);
      return send(res, 200, { user: publicUser(target) });
    }

    return send(res, 404, { error: "Not found" });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : "Server error" });
  }
}

createServer(route).listen(PORT, () => {
  console.log(`Dopamine Digital API running on http://127.0.0.1:${PORT}`);
});
