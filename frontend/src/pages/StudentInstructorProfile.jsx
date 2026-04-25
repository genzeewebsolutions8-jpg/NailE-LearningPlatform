import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, LayoutGrid, PlayCircle, MessageSquare } from "lucide-react";
import api from "../api";

export default function StudentInstructorProfile() {
    const { name } = useParams();
    const instructorName = decodeURIComponent(name);

    const [activeTab, setActiveTab] = useState("Posts");
    const [courses, setCourses] = useState([]);
    const [instructorData, setInstructorData] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    // Derived data for missing profile details
    const initials = instructorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const handle = `@${instructorName.split(" ")[0].toLowerCase()}nailart`;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all instructors to find the ID by name
                const instRes = await api.get("/student/instructors");
                const instructor = instRes.data.instructors.find(i => i.name === instructorName);

                if (instructor) {
                    // 2. Fetch feedback and average rating for this instructor
                    const feedbackRes = await api.get(`/feedback/instructor/${instructor._id}`);
                    setInstructorData({
                        _id: instructor._id,
                        averageRating: feedbackRes.data.averageRating,
                        ratingCount: feedbackRes.data.ratingCount
                    });
                    setFeedback(feedbackRes.data.feedback || []);
                }

                // 3. Fetch courses for this instructor
                const { data } = await api.get("/student/videos");
                const videoData = data.videos || [];
                setCourses(videoData.filter(v => (v.instructor || "Academy Instructor") === instructorName));
            } catch (e) {
                console.error("Error fetching instructor profile data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [instructorName]);

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>

            {/* Header Profile Card */}
            <div className="card" style={{ padding: "3rem", marginBottom: "2rem", display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {/* Avatar */}
                <div style={{
                    width: "160px", height: "160px", backgroundColor: "var(--primary)",
                    borderRadius: "50%", display: "flex", flexShrink: 0,
                    alignItems: "center", justifyContent: "center", color: "white",
                    fontSize: "3rem", fontWeight: "600"
                }}>
                    {initials}
                </div>

                {/* Profile Info */}
                <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-4 mb-2">
                        <h2 style={{ fontSize: "2rem", margin: 0 }}>{instructorName}</h2>
                        {instructorData?.averageRating > 0 && (
                            <div className="flex items-center gap-1" style={{ backgroundColor: "#FEF3C7", color: "#B45309", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.875rem", fontWeight: "700" }}>
                                <Star size={14} fill="currentColor" /> {instructorData.averageRating.toFixed(1)} ({instructorData.ratingCount})
                            </div>
                        )}
                    </div>
                    <p className="text-muted" style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>{handle}</p>

                    <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.5rem", color: "var(--text-dark)", fontStyle: "italic" }}>
                        Professional Instructor at Nail Academy
                    </p>

                    <div className="flex gap-6 mt-4">
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>{courses.length}</p>
                            <p className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Courses</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>{instructorData?.ratingCount || 0}</p>
                            <p className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Reviews</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8" style={{ backgroundColor: "#F9FAFB", padding: "0.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                {[
                    { name: "Posts", icon: LayoutGrid },
                    { name: "Courses", icon: PlayCircle },
                    { name: "Reviews", icon: MessageSquare }
                ].map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className="flex items-center justify-center gap-2"
                        style={{
                            flex: 1, padding: "0.875rem", borderRadius: "8px", border: "none", cursor: "pointer",
                            fontSize: "0.95rem", fontWeight: "600", transition: "all 0.2s ease",
                            backgroundColor: activeTab === tab.name ? "var(--primary)" : "transparent",
                            color: activeTab === tab.name ? "white" : "var(--text-dark)",
                        }}
                    >
                        <tab.icon size={18} /> {tab.name}
                    </button>
                ))}
            </div>

            {/* Posts Grid Panel */}
            {activeTab === "Posts" && (
                <div>
                    <button className="btn mb-8 flex justify-center items-center gap-2" style={{ width: "100%", backgroundColor: "var(--primary)", opacity: 0.9, color: "white", padding: "1rem", borderRadius: "12px" }}>
                        <span>+</span> Create New Post
                    </button>

                    <div className="card text-center text-muted py-12">
                        <LayoutGrid size={48} style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
                        <p>No posts available.</p>
                    </div>
                </div>
            )}

            {/* Courses Panel */}
            {activeTab === "Courses" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
                    {courses.length === 0 ? (
                        <p className="text-muted col-span-full">No courses uploaded by this instructor yet.</p>
                    ) : (
                        courses.map((video, idx) => (
                            <div key={video._id} className="card" style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
                                <div style={{
                                    width: "100%", aspectRatio: "16/9", backgroundColor: "var(--primary)",
                                    borderRadius: "12px", marginBottom: "1.5rem", position: "relative",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <PlayCircle size={48} color="white" style={{ opacity: 0.9 }} />
                                </div>
                                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{video.title}</h3>
                                <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>{video.description}</p>
                                <Link to={`/student/video/${video._id}`} className="btn btn-outline" style={{ marginTop: "auto", textAlign: "center" }}>View Course</Link>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Reviews Panel */}
            {activeTab === "Reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {feedback.length === 0 ? (
                        <div className="card text-center text-muted py-12">
                            <MessageSquare size={48} style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
                            <p>No reviews yet for this instructor.</p>
                        </div>
                    ) : (
                        feedback.map((f) => (
                            <div key={f._id} className="card" style={{ padding: "1.5rem" }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>
                                            {(f.studentId?.firstName?.[0] || "S").toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "700", margin: 0 }}>{f.studentId?.firstName} {f.studentId?.lastName}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{new Date(f.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={16} fill={s <= f.rating ? "#F59E0B" : "none"} color={s <= f.rating ? "#F59E0B" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                {f.comment && (
                                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#374151", margin: 0 }}>
                                        "{f.comment}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    );
}

// Simple Award Icon since it might not be exported from lucide-react directly
function AwardIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
    )
}
