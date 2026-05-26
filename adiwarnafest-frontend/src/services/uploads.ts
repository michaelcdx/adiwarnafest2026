import { apiFetch } from './http'

export type UploadTeamLogoResponse = {
  LogoPath: string
}

export const uploadsService = {
  uploadTeamLogo: (teamId: string, file: File) => {
    const formData = new FormData()
    formData.append('teamId', teamId)
    formData.append('file', file)

    return apiFetch<UploadTeamLogoResponse>('/api/uploads/team-logo', {
      method: 'POST',
      auth: true,
      body: formData,
    })
  },
}
