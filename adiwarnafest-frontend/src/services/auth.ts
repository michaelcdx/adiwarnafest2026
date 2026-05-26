import { apiFetch } from './http'

export type LoginResponse = {
  userId: string
  accessToken: string
  refreshToken: string
}

export type MeResponse = {
  userId: string
  username: string
  role: 'Admin' | 'Maintainer' | 'Player'
  email: string
}

export const authService = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (email: string, password: string) =>
    apiFetch<void>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    }),
  refreshToken: (userId: string, refreshToken: string) =>
    apiFetch<LoginResponse>('/api/auth/refresh-token', {
      method: 'POST',
      body: { userId, refreshToken },
    }),
  logout: (userId: string, refreshToken: string) =>
    apiFetch<void>('/api/auth/logout', {
      method: 'POST',
      body: { userId, refreshToken },
    }),
  logoutAll: () =>
    apiFetch<void>('/api/auth/logout-all', {
      method: 'POST',
      auth: true,
    }),
  me: () => apiFetch<MeResponse>('/api/auth/me', { auth: true }),
  deleteAccount: (email: string, password: string) =>
    apiFetch<void>('/api/auth/delete-account', {
      method: 'POST',
      body: { email, password },
    }),
}
