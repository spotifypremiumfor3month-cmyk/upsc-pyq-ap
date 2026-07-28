// Centralised API client — all calls go through /api (proxied to api-server)
const API_BASE = '/api';

function getToken(): string | null {
  try { return localStorage.getItem('admin_token'); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as any).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────

export type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  pdfUrl: string | null;
  publishedAt: string;
};

export type Mcq = {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  year: string;
  subject: string;
  topic: string;
};

// ── Posts ─────────────────────────────────────────────────────────────────

export const api = {
  posts: {
    list: (params?: { category?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.search)   qs.set('search',   params.search);
      const q = qs.toString();
      return request<Post[]>(`/posts${q ? '?' + q : ''}`);
    },
    get: (slug: string) => request<Post>(`/posts/${slug}`),
    create: (data: Omit<Post, 'id' | 'publishedAt'>) =>
      request<Post>('/posts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Omit<Post, 'id'>>) =>
      request<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/posts/${id}`, { method: 'DELETE' }),
  },

  mcqs: {
    list: (params?: { year?: string; subject?: string; topic?: string }) => {
      const qs = new URLSearchParams();
      if (params?.year)    qs.set('year',    params.year);
      if (params?.subject) qs.set('subject', params.subject);
      if (params?.topic)   qs.set('topic',   params.topic);
      const q = qs.toString();
      return request<Mcq[]>(`/mcqs${q ? '?' + q : ''}`);
    },
    topics: (subject?: string) => {
      const qs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
      return request<string[]>(`/mcqs/topics${qs}`);
    },
    create: (data: Omit<Mcq, 'id'>) =>
      request<Mcq>('/mcqs', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (items: Omit<Mcq, 'id'>[]) =>
      request<{ inserted: number }>('/mcqs/bulk', { method: 'POST', body: JSON.stringify(items) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/mcqs/${id}`, { method: 'DELETE' }),
  },

  admin: {
    login: (password: string) =>
      request<{ token: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    verify: () => request<{ valid: boolean }>('/admin/verify'),
  },

  seed: () => request<{ message: string }>('/seed', { method: 'POST' }),
};
