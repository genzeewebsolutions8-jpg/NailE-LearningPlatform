import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";
import { LogOut, Bell, User } from "lucide-react";
import NotificationDropdown from "./components/NotificationDropdown";
import logo from "./assets/logo.jpg";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import StudentInstructors from "./pages/StudentInstructors";
import StudentInstructorProfile from "./pages/StudentInstructorProfile";
import StudentCourses from "./pages/StudentCourses";
import StudentSessions from "./pages/StudentSessions";
import VideoPlayer from "./pages/VideoPlayer";
import LiveSession from "./pages/LiveSession";
import AdminDashboard from "./pages/AdminDashboard"; // Which acts as Instructor Dashboard
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user role doesn't match
  // We allow an array of roles or a single string
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/" replace />;
    } else {
      if (user.role !== role) return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default function App() {
  const { user, logout } = useAuth();
  const { unreadCount, markAsRead } = useSocket() || {};
  const [showNotifications, setShowNotifications] = React.useState(false);
  const location = useLocation();

  const isStudent = user && user.role === "student";
  const isAdmin = user && user.role === "admin";

  const getLinkStyle = (path) => {
    const isActive = location.pathname.startsWith(path);
    return {
      color: isActive ? "var(--primary)" : "white",
      fontWeight: isActive ? "600" : "500",
      textDecoration: "none",
      transition: "color 0.2s"
    };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-light)" }}>
      <nav className="navbar" style={{ backgroundColor: "#1C1C1E" }}>
        <div className="container navbar-content flex justify-between items-center" style={{ height: "4.5rem" }}>

          <div className="flex items-center gap-8">
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", textDecoration: "none" }}>
              <img src={logo} alt="Nail Academy Logo" style={{ height: "48px", objectFit: "contain", borderRadius: "8px" }} />
            </Link>

            {user && (
              <div className="flex items-center" style={{ marginLeft: "2rem", gap: "2rem" }}>
                <Link to={`/${['admin', 'instructor'].includes(user.role) ? 'admin' : 'student'}/dashboard`} style={getLinkStyle(`/${['admin', 'instructor'].includes(user.role) ? 'admin' : 'student'}/dashboard`)}>Dashboard</Link>
                {user.role !== 'instructor' && (
                  <Link to="/student/instructors" style={getLinkStyle("/student/instructors")}>Instructors</Link>
                )}
                <Link to="/student/courses" style={getLinkStyle("/student/courses")}>Courses</Link>
                <Link to="/student/sessions" style={getLinkStyle("/student/sessions")}>Live Sessions</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: "500" }}>
                    {user?.email?.split('@')[0] || user?.name || "Student"}
                  </span>
                  <span style={{
                    backgroundColor: "rgba(197, 139, 134, 0.2)",
                    color: "var(--primary)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "99px",
                    fontSize: "0.75rem",
                    fontWeight: "600"
                  }}>
                    {user.role}
                  </span>
                </div>

                {/* Notification Bell */}
                <div style={{ position: "relative" }}>
                  <button 
                    onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (!showNotifications) markAsRead?.();
                    }}
                    style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.5rem" }}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span style={{ 
                        position: "absolute", top: "4px", right: "4px", 
                        backgroundColor: "#EF4444", color: "white", 
                        borderRadius: "50%", width: "16px", height: "16px", 
                        fontSize: "10px", fontWeight: "700", 
                        display: "flex", alignItems: "center", justifyContent: "center" 
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                <Link to="/profile" style={getLinkStyle("/profile")}>
                  <div style={{ 
                    width: "36px", height: "36px", borderRadius: "50%", 
                    backgroundColor: "rgba(255, 255, 255, 0.05)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    overflow: "hidden", position: "relative",
                    transition: "transform 0.2s"
                  }} 
                  className="hover:scale-105"
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={20} color="var(--primary)" />
                    )}
                  </div>
                </Link>

                <button onClick={logout} style={{
                  background: "none", border: "none", color: "white",
                  cursor: "pointer", fontSize: "0.875rem", fontWeight: "500",
                  display: "flex", alignItems: "center", gap: "0.25rem",
                  marginLeft: "1rem"
                }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: "white", fontSize: "0.875rem", fontWeight: "500" }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          user ? (
            ['admin', 'instructor'].includes(user.role) ? <Navigate to="/admin/dashboard" /> : <Navigate to="/student/dashboard" />
          ) : (
            <Landing />
          )
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/instructors" element={
          <ProtectedRoute role={["student", "admin"]}>
            <StudentInstructors />
          </ProtectedRoute>
        } />
        <Route path="/student/instructor/:name" element={
          <ProtectedRoute role={["student", "admin"]}>
            <StudentInstructorProfile />
          </ProtectedRoute>
        } />
        <Route path="/student/courses" element={
          <ProtectedRoute role={["student", "admin", "instructor"]}>
            <StudentCourses />
          </ProtectedRoute>
        } />
        <Route path="/student/sessions" element={
          <ProtectedRoute role={["student", "admin", "instructor"]}>
            <StudentSessions />
          </ProtectedRoute>
        } />

        <Route path="/student/video/:id" element={
          <ProtectedRoute role={["student", "admin", "instructor"]}>
            <VideoPlayer />
          </ProtectedRoute>
        } />
        <Route path="/student/session/:id" element={
          <ProtectedRoute role={["student", "admin", "instructor"]}>
            <LiveSession />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin/Instructor Dashboard Router */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role={["admin", "instructor"]}>
            {user?.role === 'admin' ? <SuperAdminDashboard /> : <AdminDashboard />}
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}
