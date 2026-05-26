import { apiFetch } from './http'

export interface SportStats {
  teams: number
  players: number
}

export interface RegistrationStats {
  totalTeams: number
  sportParticipants: number
  simfoniParticipants: number
  totalParticipants: number
  basketball: SportStats
  futsal: SportStats
  mobileLegendsStats: SportStats
  lastUpdated: string
}

export const registrationService = {
  async getStats(): Promise<RegistrationStats> {
    return apiFetch<RegistrationStats>('/api/stats/live', {
      auth: false,
    })
  },
}
