import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false, requireTutor = false }) => {
  const { isAuthenticated, loading, isAdmin, isTutor, user } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 50%, #ffe4e6 100%)'
      }}>
        <div className="spinner-large"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    // Redirect based on user role
    if (user?.role === 'tutor') {
      return <Navigate to="/tutor/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  if (requireTutor && !isTutor) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

