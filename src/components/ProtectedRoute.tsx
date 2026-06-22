import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { operator, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-lg">Restaurando sesión...</div>
      </div>
    )
  }

  if (!operator) return <Navigate to="/login" replace />

  return <Outlet />
}
