import {
  IUser,
  IHobby,
  IConnection,
  IMessage,
  IConversation,
  IPost,
  IDbStatus,
} from '../types/index.ts';

const TOKEN_KEY = 'hobbyconnect_jwt_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! Status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  // DB Health & Inspection
  getDbStatus: () => request<IDbStatus>('/api/db/status'),
  reconnectDb: (uri: string) =>
    request<{ success: boolean; message?: string; error?: string; source: string }>('/api/db/reconnect', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    }),

  // Auth
  register: (payload: any) =>
    request<{ message: string; token: string; user: IUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { login: string; password: string }) =>
    request<{ message: string; token: string; user: IUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoLogin: (username: string) =>
    request<{ message: string; token: string; user: IUser }>(`/api/auth/demo-login/${username}`, {
      method: 'POST',
    }),

  getMe: () => request<{ user: IUser }>('/api/auth/me'),

  updateProfile: (payload: Partial<IUser>) =>
    request<{ message: string; user: IUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Users & Discovery
  getUsers: (params?: { hobby?: string; query?: string; skillLevel?: string; location?: string }) => {
    const q = new URLSearchParams();
    if (params?.hobby) q.append('hobby', params.hobby);
    if (params?.query) q.append('query', params.query);
    if (params?.skillLevel) q.append('skillLevel', params.skillLevel);
    if (params?.location) q.append('location', params.location);
    return request<{ users: IUser[] }>(`/api/users?${q.toString()}`);
  },

  getUserById: (id: string) => request<{ user: IUser }>(`/api/users/${id}`),

  // Hobbies
  getHobbies: (params?: { category?: string; search?: string; tag?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.tag) q.append('tag', params.tag);
    return request<{ hobbies: IHobby[] }>(`/api/hobbies?${q.toString()}`);
  },

  getHobbyById: (id: string) =>
    request<{ hobby: IHobby; members: IUser[] }>(`/api/hobbies/${id}`),

  createHobby: (payload: Partial<IHobby>) =>
    request<{ message: string; hobby: IHobby }>('/api/hobbies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinHobby: (hobbyId: string, skillLevel: string = 'Intermediate') =>
    request<{ message: string; userHobbies: any[]; memberCount: number }>(
      `/api/hobbies/${hobbyId}/join`,
      {
        method: 'POST',
        body: JSON.stringify({ skillLevel }),
      }
    ),

  leaveHobby: (hobbyId: string) =>
    request<{ message: string; userHobbies: any[]; memberCount: number }>(
      `/api/hobbies/${hobbyId}/leave`,
      {
        method: 'POST',
      }
    ),

  // Connections
  getConnections: () =>
    request<{
      accepted: IConnection[];
      incoming: IConnection[];
      outgoing: IConnection[];
      totalConnected: number;
      totalPendingIncoming: number;
    }>('/api/connections'),

  sendConnectionRequest: (targetUserId: string, introMessage?: string, hobbyContext?: string) =>
    request<{ message: string; connection: any }>('/api/connections/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, introMessage, hobbyContext }),
    }),

  respondConnection: (connectionId: string, action: 'accept' | 'decline') =>
    request<{ message: string; connection: any }>(`/api/connections/${connectionId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    }),

  deleteConnection: (connectionId: string) =>
    request<{ message: string }>(`/api/connections/${connectionId}`, {
      method: 'DELETE',
    }),

  // Messages
  getConversations: () => request<{ conversations: IConversation[] }>('/api/messages'),

  getMessages: (userId: string) =>
    request<{ targetUser: IUser; messages: IMessage[] }>(`/api/messages/${userId}`),

  sendMessage: (userId: string, content: string, hobbyContext?: string) =>
    request<{ message: string; data: IMessage }>(`/api/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content, hobbyContext }),
    }),

  markMessagesRead: (userId: string) =>
    request<{ message: string }>(`/api/messages/${userId}/read`, {
      method: 'PUT',
    }),

  // Community Feed / Posts
  getPosts: (params?: { hobby?: string; tag?: string }) => {
    const q = new URLSearchParams();
    if (params?.hobby) q.append('hobby', params.hobby);
    if (params?.tag) q.append('tag', params.tag);
    return request<{ posts: IPost[] }>(`/api/posts?${q.toString()}`);
  },

  createPost: (payload: { title: string; content: string; hobbyName: string; imageUrl?: string; tags?: string[] }) =>
    request<{ message: string; post: IPost }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  likePost: (postId: string) =>
    request<{ hasLiked: boolean; likesCount: number; message: string }>(`/api/posts/${postId}/like`, {
      method: 'POST',
    }),

  commentPost: (postId: string, content: string) =>
    request<{ message: string; comments: any[] }>(`/api/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
