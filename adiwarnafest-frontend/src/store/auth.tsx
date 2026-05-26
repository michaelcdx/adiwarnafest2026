import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/auth'
import type { MeResponse } from '../services/auth'
import { configureAuth } from '../services/http'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  username: string | null
  role: MeResponse['role'] | null
  email: string | null
  isLoading: boolean
}

type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'adiwarna.auth'

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Pick<AuthState, 'accessToken' | 'refreshToken' | 'userId'>
  } catch {
    return null
  }
}

const storeAuth = (payload: Pick<AuthState, 'accessToken' | 'refreshToken' | 'userId'> | null) => {
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    username: null,
    role: null,
    email: null,
    isLoading: true,
  })

  const setTokens = useCallback((payload: Pick<AuthState, 'accessToken' | 'refreshToken' | 'userId'> | null) => {
    setState(prev => ({
      ...prev,
      accessToken: payload?.accessToken ?? null,
      refreshToken: payload?.refreshToken ?? null,
      userId: payload?.userId ?? null,
    }))
    storeAuth(payload)
  }, [])

  const loadMe = useCallback(async () => {
    if (!state.accessToken) return
    const me = await authService.me()
    setState(prev => ({
      ...prev,
      userId: me.userId,
      username: me.username,
      role: me.role,
      email: me.email,
    }))
  }, [state.accessToken])

  const refreshTokens = useCallback(async () => {
    if (!state.userId || !state.refreshToken) return false
    try {
      const refreshed = await authService.refreshToken(state.userId, state.refreshToken)
      setTokens({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        userId: refreshed.userId,
      })
      return true
    } catch {
      setTokens(null)
      setState(prev => ({ ...prev, username: null, role: null, email: null }))
      return false
    }
  }, [setTokens, state.refreshToken, state.userId])

  const signIn = useCallback(async (email: string, password: string) => {
    const login = await authService.login(email, password)
    setTokens({
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      userId: login.userId,
    })
    // Note: loadMe() is called by the effect that watches state.accessToken
  }, [setTokens])

  const signOut = useCallback(async () => {
    const currentUserId = state.userId
    const currentRefresh = state.refreshToken
    setTokens(null)
    setState(prev => ({ ...prev, username: null, role: null, email: null }))
    if (currentUserId && currentRefresh) {
      try {
        await authService.logout(currentUserId, currentRefresh)
      } catch {
        // ignore logout errors
      }
    }
  }, [setTokens, state.refreshToken, state.userId])

  useEffect(() => {
    const stored = readStoredAuth()
    if (stored?.accessToken && stored.refreshToken && stored.userId) {
      setState(prev => ({
        ...prev,
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        userId: stored.userId,
      }))
    }
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  useEffect(() => {
    if (!state.accessToken || state.isLoading) return
    loadMe().catch(() => {
      setTokens(null)
      setState(prev => ({ ...prev, username: null, role: null, email: null }))
    })
  }, [loadMe, setTokens, state.accessToken, state.isLoading])

  useEffect(() => {
    configureAuth({
      getAccessToken: () => state.accessToken,
      getRefreshToken: () => state.refreshToken,
      getUserId: () => state.userId,
      refreshTokens,
      onLogout: () => {
        setTokens(null)
        setState(prev => ({ ...prev, username: null, role: null }))
      },
    })
  }, [refreshTokens, setTokens, state.accessToken, state.refreshToken, state.userId])

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    isAuthenticated: Boolean(state.accessToken),
    signIn,
    signOut,
    loadMe,
  }), [signIn, signOut, state, loadMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
