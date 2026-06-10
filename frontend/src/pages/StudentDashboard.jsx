import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Users, BookOpen, Clock, Award, Video, Calendar, ArrowRight, Play, Star } from "lucide-react";

export default function StudentDashboard() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get("/student/enrolled-videos");
                setVideos(data.videos || []);
            } catch (err) {
                console.error("Error fetching student data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
            <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
            <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Syncing Your Classroom...</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB", paddingBottom: "5rem" }}>
            <div className="container" style={{ paddingTop: "3rem" }}>
                
                {/* Modern Welcome Banner */}
                <div style={{ 
                    background: "linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)", 
                    borderRadius: "32px", padding: "4rem", marginBottom: "3rem", color: "white",
                    position: "relative", overflow: "hidden", boxShadow: "var(--shadow-lg)"
                }}>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ color: "var(--primary)", fontWeight: "800", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem" }}>Elite Student Portal</div>
                        <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "white", marginBottom: "1rem", letterSpacing: "-0.04em" }}>
                            Welcome back, {user?.email?.split('@')[0] || user?.name?.split(' ')[0] || "Artist"}!
                        </h1>
                        <p style={{ fontSize: "1.2rem", opacity: 0.8, maxWidth: "500px", lineHeight: "1.6" }}>
                            Your creative journey continues. Keep practicing to master your craft.
                        </p>
                    </div>
                    <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "var(--primary)", opacity: 0.1, filter: "blur(80px)", borderRadius: "50%" }} />
                </div>

                {/* Performance HUD */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "4rem" }}>
                    <StudentStat title="Active Courses" value={videos.length} icon={BookOpen} color="#3B82F6" bg="#DBEAFE" />
                    <StudentStat title="Learning Hours" value="0" icon={Clock} color="#F59E0B" bg="#FEF3C7" />
                    <StudentStat title="Skill Level" value="Beginner" icon={Star} color="var(--primary)" bg="var(--primary-light)" />
                    <StudentStat title="Achievements" value="0" icon={Award} color="#10B981" bg="#D1FAE5" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
                    {/* Mastery Modules */}
                    <div className="card-premium" style={{ padding: "2.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "900" }}>Continue Mastery</h3>
                            <Link to="/student/courses" style={{ color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                View All Collections <ArrowRight size={18} />
                            </Link>
                        </div>

                        {videos.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem 0" }}>
                                <Video size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
                                <p style={{ color: "var(--text-muted)" }}>No mastery modules initiated. Explore the academy to begin.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                                {videos.slice(0, 3).map(video => (
                                    <Link key={video._id} to={`/student/video/${video._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <div style={{ 
                                            display: "flex", gap: "1.5rem", padding: "1.25rem", borderRadius: "20px",
                                            backgroundColor: "#F9FAF9", border: "1px solid #F3F4F6", transition: "all 0.2s"
                                        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "white"}
                                           onMouseLeave={e => e.currentTarget.style.backgroundColor = "#F9FAF9"}>
                                            <div style={{ width: "160px", height: "90px", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                                                <img src={video.thumbnail || "https://images.unsplash.com/photo-1604176354204-926873ff3da9?w=400&q=80"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Play size={24} color="white" fill="white" />
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Masterclass</div>
                                                <h4 style={{ fontSize: "1.1rem", fontWeight: "900", marginBottom: "0.5rem" }}>{video.title}</h4>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Users size={14} /> {video.instructorId?.firstName || "Academy Elite"}</span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={14} /> 2h 45m</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Access */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                        <div className="card-premium" style={{ padding: "2rem", background: "var(--primary)", color: "white" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "900", marginBottom: "1rem" }}>Mastery Workshop</h3>
                            <p style={{ opacity: 0.9, marginBottom: "2rem", fontSize: "0.95rem" }}>Join the next live session with industry veterans.</p>
                            <Link to="/student/sessions" className="btn" style={{ width: "100%", backgroundColor: "white", color: "var(--primary)", padding: "1rem" }}>
                                Reserve Spot
                            </Link>
                        </div>

                        <div className="card-premium" style={{ padding: "2rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "900", marginBottom: "1.5rem" }}>Upcoming Events</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No upcoming events scheduled.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StudentStat = ({ title, value, icon: Icon, color, bg, trend }) => (
    <div className="card-premium" style={{ padding: "1.5rem", textAlign: "center" }}>
        <div style={{ backgroundColor: bg, color: color, width: "50px", height: "50px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <Icon size={24} />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.25rem" }}>{title}</p>
        <h3 style={{ fontSize: "1.75rem", fontWeight: "900", marginBottom: trend ? "0.25rem" : "0" }}>{value}</h3>
        {trend && <div style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: "700" }}>{trend}</div>}
    </div>
);

const EventRow = ({ title, date }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ padding: "0.5rem", backgroundColor: "#F9FAF9", borderRadius: "10px", width: "50px", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase" }}>{date.split(' ')[0]}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{date.split(' ')[1]}</div>
        </div>
        <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "750" }}>{title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Academy Studio</div>
        </div>
    </div>
);
