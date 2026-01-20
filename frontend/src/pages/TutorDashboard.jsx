import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './TutorDashboard.css'

const TutorDashboard = () => {
  const navigate = useNavigate()
  const { user, loading, logout, isAuthenticated, isTutor } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isTutor)) {
      navigate('/login')
    }
  }, [loading, isAuthenticated, isTutor, navigate])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || !isTutor) {
    return null
  }

  return (
    <div className="tutor-dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="Shills E-LEARNING" className="header-logo" />
            <span className="dashboard-title">Tutor</span>
          </div>
          <nav className="header-nav">
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="tutor-dashboard-main">
        <div className="dashboard-content">
          <h1>Tutor Dashboard</h1>
        </div>
      </main>
    </div>
  )
}

export default TutorDashboard

