import { apiFetch } from './http'

export type RoleDescriptor = {
  name?: string
  value?: string
}

export type UserSummary = {
  id: string
  email: string
  username: string
  role: 'Admin' | 'Maintainer' | 'Player' | RoleDescriptor
  isDisabled?: boolean
  disabledReason?: string | null
}

export type CreateUserPayload = {
  email: string
  username: string
  password: string
  role: 'Maintainer'
}

export type UpdateUserPayload = {
  username?: string
  role?: 'Maintainer'
  isDisabled?: boolean
  disabledReason?: string | null
}

export const usersService = {
  listUsers: (includeDisabled = true) =>
    apiFetch<UserSummary[]>(`/api/users?includeDisabled=${includeDisabled ? 'true' : 'false'}`, {
      auth: true,
    }),
  getUserById: (id: string) => apiFetch<UserSummary>(`/api/users/${id}`, { auth: true }),
  createUser: (payload: CreateUserPayload) =>
    apiFetch<UserSummary>('/api/users', {
      method: 'POST',
      auth: true,
      body: payload,
    }),
  updateUser: (id: string, payload: UpdateUserPayload) =>
    apiFetch<UserSummary>(`/api/users/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),
  deleteUser: (id: string) =>
    apiFetch<void>(`/api/users/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
  resetPassword: (id: string, newPassword: string) =>
    apiFetch<void>(`/api/users/${id}/reset-password`, {
      method: 'POST',
      auth: true,
      body: { newPassword },
    }),
}
