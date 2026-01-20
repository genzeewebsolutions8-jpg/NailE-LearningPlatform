import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import logo from '../assets/logo.png'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, loading, logout, isAuthenticated, isAdmin } = useAuth()
  const [tutors, setTutors] = useState([])
  const [tutorsLoading, setTutorsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/login')
    } else if (isAuthenticated && isAdmin) {
      fetchTutors()
    }
  }, [loading, isAuthenticated, isAdmin, navigate])

  const fetchTutors = async () => {
    try {
      const response = await axios.get('/api/tutors')
      setTutors(response.data)
    } catch (error) {
      console.error('Error fetching tutors:', error)
    } finally {
      setTutorsLoading(false)
    }
  }

  if (loading || tutorsLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="Shills E-LEARNING" className="header-logo" />
            <span className="dashboard-title">Admin</span>
          </div>
          <nav className="header-nav">
            <button 
              onClick={() => navigate('/admin/register-tutor')} 
              className="register-tutor-btn"
            >
              Register Tutor
            </button>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="admin-dashboard-main">
        <div className="welcome-section">
          <h2>Admin Dashboard 👑</h2>
          <p>Welcome back, {user.firstName}! Manage your platform from here.</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{tutors.length}</div>
              <div className="stat-label">Total Tutors</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
        </div>

        <div className="tutors-section">
          <div className="section-header">
            <h3>Registered Tutors</h3>
            <button 
              onClick={() => navigate('/admin/register-tutor')} 
              className="add-tutor-btn"
            >
              + Add New Tutor
            </button>
          </div>

          {tutors.length === 0 ? (
            <div className="empty-tutors">
              <p>No tutors registered yet.</p>
              <button 
                onClick={() => navigate('/admin/register-tutor')} 
                className="register-first-btn"
              >
                Register First Tutor
              </button>
            </div>
          ) : (
            <div className="tutors-grid">
              {tutors.map((tutor) => (
                <div key={tutor._id} className="tutor-card">
                  <div className="tutor-header">
                    <div className="tutor-avatar">
                      {tutor.firstName.charAt(0)}{tutor.lastName.charAt(0)}
                    </div>
                    <div className="tutor-name">
                      <h4>{tutor.firstName} {tutor.lastName}</h4>
                      <span className="tutor-role">Tutor</span>
                    </div>
                  </div>
                  <div className="tutor-info">
                    <div className="info-row">
                      <span className="info-label">📧 Email:</span>
                      <span className="info-value">{tutor.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📱 Phone:</span>
                      <span className="info-value">{tutor.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📅 Registered:</span>
                      <span className="info-value">{formatDate(tutor.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

