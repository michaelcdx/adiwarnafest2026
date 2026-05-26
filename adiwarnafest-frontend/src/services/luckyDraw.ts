import { apiFetch } from './http'

export type QrScanDto = {
  id: string
  boothId: string
  scannedAt: string
}

export type LuckyDrawStatusDto = {
  scannedBooths: QrScanDto[]
  isEligible: boolean
  hasSubmitted: boolean
}

export type SubmitLuckyDrawEntryDto = {
  fullName: string
  phoneNumber: string
  instagramHandle: string
}

export type LuckyDrawEntryDto = {
  fullName: string
  phoneNumber: string
  instagramHandle: string
  submittedAt: string
}

export const luckyDrawService = {
  scanQr: (boothId: string) =>
    apiFetch<boolean>('/api/lucky-draw/scan-qr', {
      method: 'POST',
      auth: true,
      body: { boothId },
    }),

  getStatus: () =>
    apiFetch<LuckyDrawStatusDto>('/api/lucky-draw/status', {
      auth: true
    }),

  submitEntry: (payload: SubmitLuckyDrawEntryDto) =>
    apiFetch<boolean>('/api/lucky-draw/submit-entry', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  getEntries: () =>
    apiFetch<LuckyDrawEntryDto[]>('/api/lucky-draw/entries', {
      auth: true,
    }),
}
