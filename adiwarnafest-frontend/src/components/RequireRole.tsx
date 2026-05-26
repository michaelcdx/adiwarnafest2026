import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

type RequireRoleProps = {
  allowedRoles: Array<'Admin' | 'Maintainer' | 'Player'>
  children: ReactNode
}

const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const { isAuthenticated, isLoading, role: currentRole } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RequireRole
