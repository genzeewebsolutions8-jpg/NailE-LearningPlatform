import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, loading, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard')
    } else if (user?.role === 'tutor') {
      navigate('/tutor/dashboard')
    }
  }, [loading, isAuthenticated, user, navigate])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || user.role !== 'user') {
    return null
  }


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="Shills E-LEARNING" className="header-logo" />
            <span className="dashboard-title">User Dashboard</span>
          </div>
          <nav className="header-nav">
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h1>User Dashboard</h1>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

