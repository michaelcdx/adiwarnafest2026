const DEFAULT_API_BASE_URL = ''

export type AuthHandlers = {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getUserId: () => string | null
  refreshTokens: () => Promise<boolean>
  onLogout: () => void
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
  retryOnAuthFail?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let authHandlers: AuthHandlers = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  getUserId: () => null,
  refreshTokens: async () => false,
  onLogout: () => {},
}

export const configureAuth = (handlers: Partial<AuthHandlers>) => {
  authHandlers = { ...authHandlers, ...handlers }
}

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!baseUrl?.trim()) {
    if (import.meta.env.PROD) {
      console.warn('VITE_API_BASE_URL is not set. API calls may fail in production.')
    }
    return DEFAULT_API_BASE_URL
  }
  return baseUrl.trim()
}

const ALLOWED_API_BASE = getApiBaseUrl()

const buildUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const allowed = ALLOWED_API_BASE || window.location.origin
    if (!path.startsWith(allowed)) {
      throw new Error(`Blocked request to unexpected domain: ${path}`)
    }
    return path
  }
  return `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}

const isJsonBody = (body: unknown) => {
  if (!body) return false
  if (typeof body === 'string') return false
  if (body instanceof FormData) return false
  if (body instanceof Blob) return false
  if (body instanceof ArrayBuffer) return false
  return true
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return text || null
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = false, retryOnAuthFail = true, body, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  let requestBody = body
  if (isJsonBody(body)) {
    requestBody = JSON.stringify(body)
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json')
    }
  }

  if (auth) {
    const token = authHandlers.getAccessToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: requestBody as BodyInit | null | undefined,
  })

  if ((response.status === 401 || response.status === 403) && auth && retryOnAuthFail) {
    const refreshed = await authHandlers.refreshTokens()
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retryOnAuthFail: false })
    }
    authHandlers.onLogout()
  }

  const data = await parseResponse(response)
  if (!response.ok) {
    const message = typeof data === 'string' && data ? data : response.statusText
    throw new ApiError(message || 'Request failed', response.status, data)
  }

  return data as T
}
