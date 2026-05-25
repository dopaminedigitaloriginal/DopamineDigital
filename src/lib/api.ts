import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const AUTH_CHANGED_EVENT = "dopamine-auth-changed";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  membership: "free" | "paid";
  blocked: boolean;
  createdAt: string;
};

export type ApiComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  hidden: boolean;
  createdAt: string;
  author?: ApiUser | null;
};

export type ApiPost = {
  id: string;
  spaceId: string;
  authorId: string;
  type: string;
  title: string;
  body: string;
  hidden: boolean;
  createdAt: string;
  author?: ApiUser | null;
  comments?: ApiComment[];
};

export type ApiReport = {
  id: string;
  reporterId: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  reporter?: ApiUser | null;
  targetPost?: ApiPost | null;
  targetComment?: ApiComment | null;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: ApiUser["role"];
  membership: ApiUser["membership"];
  blocked: boolean;
  created_at: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  hidden: boolean;
  created_at: string;
  profiles?: ProfileRow | null;
};

type PostRow = {
  id: string;
  space_id: string;
  author_id: string;
  type: string;
  title: string;
  body: string;
  hidden: boolean;
  created_at: string;
  profiles?: ProfileRow | null;
  comments?: CommentRow[];
};

type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: ApiReport["targetType"];
  target_id: string;
  reason: string;
  status: ApiReport["status"];
  created_at: string;
  reporter?: ProfileRow | null;
};

function assertSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
}

function mapUser(profile: ProfileRow | null | undefined): ApiUser | null {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    membership: profile.membership,
    blocked: profile.blocked,
    createdAt: profile.created_at,
  };
}

function mapComment(comment: CommentRow): ApiComment {
  return {
    id: comment.id,
    postId: comment.post_id,
    authorId: comment.author_id,
    body: comment.body,
    hidden: comment.hidden,
    createdAt: comment.created_at,
    author: mapUser(comment.profiles),
  };
}

function mapPost(post: PostRow): ApiPost {
  return {
    id: post.id,
    spaceId: post.space_id,
    authorId: post.author_id,
    type: post.type,
    title: post.title,
    body: post.body,
    hidden: post.hidden,
    createdAt: post.created_at,
    author: mapUser(post.profiles),
    comments: (post.comments || []).map(mapComment),
  };
}

function mapReport(report: ReportRow): ApiReport {
  return {
    id: report.id,
    reporterId: report.reporter_id,
    targetType: report.target_type,
    targetId: report.target_id,
    reason: report.reason,
    status: report.status,
    createdAt: report.created_at,
    reporter: mapUser(report.reporter),
  };
}

export function getToken() {
  return supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
}

export function setToken() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export async function clearToken() {
  await supabase.auth.signOut();
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) {
    throw new Error("Supabase did not return a user. Check Auth > Providers > Email: enable signups and turn email confirmation off while testing.");
  }

  const user = await waitForProfile(data.user.id, data.user.email || input.email, input.name);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  return { token: data.session?.access_token || "", user };
}

export async function loginUser(input: { email: string; password: string }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Could not sign in");

  const user = await getProfile(data.user.id);
  if (user?.blocked) {
    await clearToken();
    throw new Error("Account blocked");
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  return { token: data.session?.access_token || "", user };
}

export async function getMe() {
  assertSupabaseConfigured();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null };
  return { user: await getProfile(data.user.id) };
}

async function waitForProfile(userId: string, email: string, name: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const profile = await getProfile(userId);
    if (profile) return profile;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, email, name, role: "member", membership: "free", blocked: false })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Account created, but profile was not created: ${error.message}`);
  }

  return mapUser(data as ProfileRow);
}

async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return mapUser(data as ProfileRow);
}

export async function getPosts(spaceId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), comments(*, profiles(*))")
    .eq("space_id", spaceId)
    .eq("hidden", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { posts: (data as PostRow[]).map(mapPost) };
}

export async function createPost(input: { spaceId: string; title: string; body: string; type: string }) {
  assertSupabaseConfigured();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Login required");
  const { data, error } = await supabase
    .from("posts")
    .insert({
      space_id: input.spaceId,
      title: input.title,
      body: input.body,
      type: input.type,
      author_id: auth.user.id,
    })
    .select("*, profiles(*), comments(*, profiles(*))")
    .single();
  if (error) throw new Error(error.message);
  return { post: mapPost(data as PostRow) };
}

export async function createComment(postId: string, body: string) {
  assertSupabaseConfigured();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Login required");
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, body, author_id: auth.user.id })
    .select("*, profiles(*)")
    .single();
  if (error) throw new Error(error.message);
  return { comment: mapComment(data as CommentRow) };
}

export async function reportContent(input: { targetType: "post" | "comment"; targetId: string; reason: string }) {
  assertSupabaseConfigured();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Login required");
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: auth.user.id,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { report: data };
}

export async function blockUser(blockedId: string) {
  assertSupabaseConfigured();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Login required");
  const { error } = await supabase.from("blocks").insert({ blocker_id: auth.user.id, blocked_id: blockedId });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  return { ok: true };
}

export async function getAdminReports() {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("reports")
    .select("*, reporter:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { reports: (data as ReportRow[]).map(mapReport) };
}

export async function getAdminUsers() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { users: (data as ProfileRow[]).map((profile) => mapUser(profile)!) };
}

export async function getAdminPosts() {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), comments(*, profiles(*))")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { posts: (data as PostRow[]).map(mapPost) };
}

export async function updateReportStatus(reportId: string, status: ApiReport["status"]) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("reports").update({ status }).eq("id", reportId).select("*, reporter:profiles(*)").single();
  if (error) throw new Error(error.message);
  return { report: mapReport(data as ReportRow) };
}

export async function updatePostModeration(postId: string, hidden: boolean) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("posts")
    .update({ hidden })
    .eq("id", postId)
    .select("*, profiles(*), comments(*, profiles(*))")
    .single();
  if (error) throw new Error(error.message);
  return { post: mapPost(data as PostRow) };
}

export async function updateUserAdmin(userId: string, input: Partial<Pick<ApiUser, "role" | "membership" | "blocked">>) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { user: mapUser(data as ProfileRow)! };
}
