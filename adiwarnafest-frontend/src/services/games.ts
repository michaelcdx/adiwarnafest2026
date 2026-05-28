import { apiFetch } from './http'

export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED'

export type PlayerGameStat = {
  playerId: string
  playerName: string
  playerNumber: number
  teamId: string
  teamName: string
  goals: number
  foul1: number
  foul2: number
}

export type Game = {
  id: string
  tournamentId: string
  team1Id: string | null
  team2Id: string | null
  team1Name: string
  team2Name: string
  gameStatus: TournamentStatus
  scheduledAt: string
  remark: string | null
  isDeleted: boolean
  deletedAt: string | null
  isLocked: boolean
  team1Score: number
  team2Score: number
  playerStats: PlayerGameStat[]
}

export type CreateGamePayload = {
  team1Id: string | null
  team2Id: string | null
  gameStatus: TournamentStatus
  scheduledAt: string
  remark?: string | null
}

export type UpdateGamePayload = {
  gameStatus?: TournamentStatus | null
  scheduledAt?: string | null
  remark?: string | null
  setTeams?: boolean
  team1Id?: string | null
  team2Id?: string | null
}

export type PlayerStatInput = {
  playerId: string
  goals: number
  foul1: number
  foul2: number
}

export type TeamPlayerStatsInput = {
  teamId: string
  players: PlayerStatInput[]
}

export type UpsertGamePayload = {
  gameStatus: TournamentStatus
  scheduledAt: string
  remark?: string | null
  team1Id: string
  team2Id: string
  teamStats: TeamPlayerStatsInput[]
}

export const gamesService = {
  listGames: (tournamentId: string) =>
    apiFetch<Game[]>(`/api/tournaments/${tournamentId}/games`, { auth: true }),

  getGame: (tournamentId: string, gameId: string) =>
    apiFetch<Game>(`/api/tournaments/${tournamentId}/games/${gameId}`, { auth: true }),

  createGame: (tournamentId: string, payload: CreateGamePayload) =>
    apiFetch<Game>(`/api/tournaments/${tournamentId}/games`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateGame: (tournamentId: string, gameId: string, payload: UpdateGamePayload) =>
    apiFetch<Game>(`/api/tournaments/${tournamentId}/games/${gameId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteGame: (tournamentId: string, gameId: string) =>
    apiFetch<void>(`/api/tournaments/${tournamentId}/games/${gameId}`, {
      method: 'DELETE',
      auth: true,
    }),

  toggleLock: (tournamentId: string, gameId: string) =>
    apiFetch<{ gameId: string; isLocked: boolean }>(
      `/api/tournaments/${tournamentId}/games/${gameId}/lock`,
      { method: 'POST', auth: true }
    ),

  upsertGame: (
    tournamentId: string,
    gameId: string,
    payload: UpsertGamePayload
  ) =>
    apiFetch<Game>(
      `/api/tournaments/${tournamentId}/games/${gameId}/upsert`,
      { method: 'PUT', auth: true, body: payload }
    ),

  setScore: (
    tournamentId: string,
    gameId: string,
    team1Score: number,
    team2Score: number,
    gameStatus: string = 'COMPLETED'
  ) =>
    apiFetch<Game>(
      `/api/tournaments/${tournamentId}/games/${gameId}/score`,
      { method: 'PATCH', auth: true, body: { team1Score, team2Score, gameStatus } }
    ),
}