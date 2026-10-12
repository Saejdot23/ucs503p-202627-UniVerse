/**
 * Centralized API client — all requests go through here.
 * Uses axios with credentials (cookies) enabled.
 *
 * Interceptor behaviour:
 * - Requests to /auth/* are NEVER retried through the refresh flow.
 *   Retrying /auth/me on 401 would cause: redirect → reload → /auth/me → 401 → loop,
 *   which exhausts the auth rate limit (429) before the user even logs in.
 * - For other 401s, we attempt one token refresh then retry the original request.
 * - The session_expired redirect only fires when the user was on a protected page,
 *   not on the landing page, to prevent reload loops for anonymous visitors.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,      // send HTTP-only cookies on every request
  timeout: 15000,
})

// ── Response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

// Auth endpoints that must never be retried through the refresh flow.
// A 401 on any of these means: unauthenticated — stop, don't retry.
const isAuthEndpoint = (url = '') =>
  ['/auth/me', '/auth/refresh-token', '/auth/logout', '/auth/google'].some(p =>
    url.includes(p)
  )

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Pass through: not a 401, already retried once, or it's an auth endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest?.url)
    ) {
      return Promise.reject(error)
    }

    // If another refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => api(originalRequest))
        .catch(err => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await api.post('/auth/refresh-token')
      processQueue(null)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      // Only redirect to session_expired when the user is on a protected page.
      // Skip the redirect on '/' (landing) to avoid: reload → /auth/me 401 → redirect → reload loop.
      if (window.location.pathname !== '/') {
        window.location.href = '/?authError=session_expired'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  // Navigates the browser to the backend Google OAuth start URL.
  // Using window.location.href (not axios) because this is a full redirect flow,
  // not an API call — it goes to Google's consent screen.
  googleLogin: () => { window.location.href = `${BASE_URL}/auth/google` },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  updateAvatar: (formData) => api.patch('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (username) => api.get(`/users/${username}`),
  searchUsers: (params) => api.get('/users', { params }),
  savePost: (postId) => api.post(`/users/saved/${postId}`),
  unsavePost: (postId) => api.delete(`/users/saved/${postId}`),
  getSavedPosts: (params) => api.get('/users/saved', { params }),
}

// ── Skills ────────────────────────────────────────────────────────────────────
export const skillsApi = {
  list: (params) => api.get('/skills', { params }),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  getMySkills: () => api.get('/skills/my'),
  addTeachSkill: (skillId) => api.post('/skills/my/teach', { skillId }),
  removeTeachSkill: (skillId) => api.delete(`/skills/my/teach/${skillId}`),
  addLearnSkill: (skillId) => api.post('/skills/my/learn', { skillId }),
  removeLearnSkill: (skillId) => api.delete(`/skills/my/learn/${skillId}`),
  teachDiscovery: (params) => api.get('/skills/teach-discovery', { params }),
  learnDiscovery: (params) => api.get('/skills/learn-discovery', { params }),
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export const postsApi = {
  list: (params) => api.get('/posts', { params }),
  get: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  close: (id) => api.patch(`/posts/${id}/close`),
  delete: (id) => api.delete(`/posts/${id}`),
  vote: (id, vote) => api.post(`/posts/${id}/vote`, { vote }),
}

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
  create: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  delete: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  create: (data) => api.post('/reports', data),
  list: (params) => api.get('/reports', { params }),
  resolve: (id, data) => api.patch(`/reports/${id}`, data),
}


// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionsApi = {
  request: (data) => api.post('/sessions', data),
  getMy: (params) => api.get('/sessions', { params }),
  get: (id) => api.get(`/sessions/${id}`),
  respond: (id, action) => api.patch(`/sessions/${id}/respond`, { action }),
  cancel: (id, reason) => api.patch(`/sessions/${id}/cancel`, { reason }),
  markComplete: (id) => api.patch(`/sessions/${id}/complete`),
  confirmComplete: (id) => api.patch(`/sessions/${id}/confirm-complete`),
  reportNoShow: (id) => api.post(`/sessions/${id}/no-show`),
  rate: (id, stars) => api.post(`/sessions/${id}/rate`, { stars }),
  getListings: (params) => api.get('/sessions/listings', { params }),
  createListing: (data) => api.post('/sessions/listings', data),
  updateListing: (id, data) => api.patch(`/sessions/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/sessions/listings/${id}`),
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  getOrCreateConversation: (participantId) => api.post('/chat/conversations', { participantId }),
  listConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, data) => api.patch(`/admin/users/${id}/suspend`, data),
  banUser: (id) => api.patch(`/admin/users/${id}/ban`),
  liftRestriction: (id) => api.patch(`/admin/users/${id}/lift`),
  deductCredits: (id, data) => api.post(`/admin/users/${id}/deduct-credits`, data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
}

// ── Credit history (user) ─────────────────────────────────────────────────────
export const creditsApi = {
  getHistory: (params) => api.get('/users/credits/history', { params }),
}

export default api
