import { apiFetch } from './http'

export type GameTypeDescriptor = {
  name?: string
  value?: string
}

export type Player = {
  id: string
  name: string
  playerNumber: number
  goals: number
  foul1: number
  foul2: number
  isDeleted: boolean
  deletedAt: string | null
  teamId: string
}

export type Team = {
  id: string
  name: string
  gameType: string | GameTypeDescriptor
  wins: number
  losses: number
  logoPath: string | null
  isDeleted: boolean
  deletedAt: string | null
  isLocked: boolean
  players: Player[]
}

export type CreateTeamPayload = {
  name: string
  gameType: string
  isLocked?: boolean
  players?: Array<{ name: string; playerNumber: number }>
}

export type UpdateTeamPayload = {
  name?: string | null
  gameType?: string | null
  players?: Array<{ id?: string | null; name: string; playerNumber: number }>
}

export type UploadLogoResponse = {
  logoPath: string
}

export const teamsService = {
  listTeams: (includeDeleted = false) =>
    apiFetch<Team[]>(`/api/teams?includeDeleted=${includeDeleted}`),

  getTeam: (id: string) => apiFetch<Team>(`/api/teams/${id}`),

  createTeam: (payload: CreateTeamPayload) =>
    apiFetch<Team>('/api/teams', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateTeam: (id: string, payload: UpdateTeamPayload) =>
    apiFetch<Team>(`/api/teams/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  toggleLock: (id: string) =>
    apiFetch<Team>(`/api/teams/${id}/lock`, {
      method: 'POST',
      auth: true,
    }),

  deleteTeam: (id: string) =>
    apiFetch<void>(`/api/teams/${id}`, {
      method: 'DELETE',
      auth: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: '',
    }),

  uploadLogo: (teamId: string, file: File) => {
    const formData = new FormData()
    formData.append('teamId', teamId)
    formData.append('file', file)

    return apiFetch<UploadLogoResponse>('/api/uploads/team-logo', {
      method: 'POST',
      auth: true,
      body: formData,
    })
  },
}
