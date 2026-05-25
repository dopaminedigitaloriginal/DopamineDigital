const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_TOKEN_KEY = "dopamine_auth_token";
export const AUTH_CHANGED_EVENT = "dopamine-auth-changed";

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

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "API request failed");
  return data as T;
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const data = await request<{ token: string; user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(data.token);
  return data;
}

export async function loginUser(input: { email: string; password: string }) {
  const data = await request<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(data.token);
  return data;
}

export function getMe() {
  return request<{ user: ApiUser | null }>("/me");
}

export function getPosts(spaceId: string) {
  return request<{ posts: ApiPost[] }>(`/posts?spaceId=${encodeURIComponent(spaceId)}`);
}

export function createPost(input: { spaceId: string; title: string; body: string; type: string }) {
  return request<{ post: ApiPost }>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createComment(postId: string, body: string) {
  return request<{ comment: ApiComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function reportContent(input: { targetType: "post" | "comment"; targetId: string; reason: string }) {
  return request<{ report: unknown }>("/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function blockUser(blockedId: string) {
  return request<{ ok: boolean }>("/blocks", {
    method: "POST",
    body: JSON.stringify({ blockedId }),
  });
}

export function getAdminReports() {
  return request<{ reports: ApiReport[] }>("/admin/reports");
}

export function getAdminUsers() {
  return request<{ users: ApiUser[] }>("/admin/users");
}

export function getAdminPosts() {
  return request<{ posts: ApiPost[] }>("/admin/posts");
}

export function updateReportStatus(reportId: string, status: ApiReport["status"]) {
  return request<{ report: ApiReport }>(`/admin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updatePostModeration(postId: string, hidden: boolean) {
  return request<{ post: ApiPost }>(`/admin/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ hidden }),
  });
}

export function updateUserAdmin(userId: string, input: Partial<Pick<ApiUser, "role" | "membership" | "blocked">>) {
  return request<{ user: ApiUser }>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
