import { apiFetch } from './http'

export type LiveYoutube = {
  id: string
  title: string
  filePath: string
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  isDeleted: boolean
  deletedAt: string | null
}

export type CreateLiveYoutubePayload = {
  title: string
  filePath: string
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
}

export type UpdateLiveYoutubePayload = {
  title?: string
  filePath?: string
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
}

export const liveYoutubeService = {
  listLiveYoutubes: () =>
    apiFetch<LiveYoutube[]>('/api/live-youtubes'),

  getLiveYoutube: (id: string) =>
    apiFetch<LiveYoutube>(`/api/live-youtubes/${id}`, { auth: true }),

  createLiveYoutube: (payload: CreateLiveYoutubePayload) =>
    apiFetch<LiveYoutube>('/api/live-youtubes', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateLiveYoutube: (id: string, payload: UpdateLiveYoutubePayload) =>
    apiFetch<LiveYoutube>(`/api/live-youtubes/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteLiveYoutube: (id: string) =>
    apiFetch<void>(`/api/live-youtubes/${id}`, {
      method: 'DELETE',
      auth: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: '',
    }),
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/live\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^&\n?#]+)/)
  return match?.[1] ?? null
}
