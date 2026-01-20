import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// Import your logo image - replace logo.png with your actual image file (png, jpg, etc.)
import logo from '../assets/logo.png'
import './Home.css'

const Home = () => {
  const { isAuthenticated, user, loading } = useAuth()

  // If authenticated, redirect based on role
  if (!loading && isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'tutor') {
      return <Navigate to="/tutor/dashboard" replace />
    } else if (user.role === 'user') {
      return <Navigate to="/dashboard" replace />
    }
  }

  if (loading) {
    return (
      <div className="home-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div className="spinner-large"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <div className="nav-content">
          <div className="logo-section">
            <img src={logo} alt="Shills E-LEARNING" className="main-logo" />
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn login-btn">
              Login
            </Link>
            <Link to="/register" className="nav-btn signup-btn">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Welcome to Shills E-LEARNING</h2>
            <p className="hero-subtitle">Your Ultimate Nail Art Learning Platform</p>
            <p className="hero-description">
              Learn beautiful nail art techniques from expert tutors. 
              Join our community and master the art of nail design!
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="cta-btn primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-btn secondary">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Expert Tutors</h3>
              <p>Learn from professional nail art instructors</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Comprehensive Courses</h3>
              <p>Access a wide range of nail art courses</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔴</div>
              <h3>Live Sessions</h3>
              <p>Join interactive live nail art classes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Beautiful Design</h3>
              <p>Learn the latest nail art trends and techniques</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2024 Shills E-LEARNING Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home

