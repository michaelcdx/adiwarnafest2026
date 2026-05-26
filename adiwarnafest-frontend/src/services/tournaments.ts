import { apiFetch } from './http'

export type TournamentTeam = {
  teamId: string
  teamName: string
  placement: number | null
}

export type TournamentTeamDto = {
  id: string
  name: string
  gameType: string
}

export type GameType = 'Basketball5v5' | 'Basketball3v3' | 'Futsal'

export type Tournament = {
  id: string
  name: string
  gameType: GameType
  tourneyStatus: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  remark: string | null
  isDeleted: boolean
  deletedAt: string | null
  isLocked: boolean
  teams: TournamentTeam[]
}

export type CreateTournamentPayload = {
  name: string
  gameType: GameType
  tourneyStatus: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  remark?: string | null
  isLocked?: boolean
  teamIds?: string[]
}

export type UpdateTournamentPayload = {
  name?: string | null
  gameType?: GameType | null
  tourneyStatus?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | null
  remark?: string | null
  teamIds?: string[]
}

export type UpdatePlacementPayload = {
  teamId: string
  placement: number | null
}

export const tournamentsService = {
  listTournaments: (includeDeleted = false) =>
    apiFetch<Tournament[]>(`/api/tournaments?includeDeleted=${includeDeleted}`),

  getTournament: (id: string) =>
    apiFetch<Tournament>(`/api/tournaments/${id}`),

  getTournamentTeams: (tournamentId: string) =>
    apiFetch<TournamentTeamDto[]>(`/api/tournaments/${tournamentId}/teams`),

  createTournament: (payload: CreateTournamentPayload) =>
    apiFetch<Tournament>('/api/tournaments', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateTournament: (id: string, payload: UpdateTournamentPayload) =>
    apiFetch<Tournament>(`/api/tournaments/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteTournament: (id: string) =>
    apiFetch<void>(`/api/tournaments/${id}`, {
      method: 'DELETE',
      auth: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: '',
    }),

  toggleLock: (id: string) =>
    apiFetch<Tournament>(`/api/tournaments/${id}/lock`, {
      method: 'POST',
      auth: true,
    }),

  updatePlacement: (id: string, payload: UpdatePlacementPayload) =>
    apiFetch<Tournament>(`/api/tournaments/${id}/placements`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),
}