import { apiFetch } from './http'

export type DropdownOption = {
  id: string
  code: string
  description: string
}

export type DropdownResponse = {
  type: string
  options: DropdownOption[]
}

export const publicService = {
  getDropdownOptions: (type: string) =>
    apiFetch<DropdownResponse[]>(`/api/public/dropdown-options?type=${encodeURIComponent(type)}`),
}
