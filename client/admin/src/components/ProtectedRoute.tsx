import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const token = localStorage.getItem('pc_admin_token')
  if (loading) return null
  if (!token || !user) return <Navigate to="/login" replace />
  return <Outlet />
}
