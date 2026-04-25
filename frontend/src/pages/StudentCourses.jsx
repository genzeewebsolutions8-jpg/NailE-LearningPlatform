import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Search, PlayCircle, Clock, Users, Star, BookOpen, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useRazorpay from "../useRazorpay";

export default function StudentCourses() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [enrolledVideos, setEnrolledVideos] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [enrollingMap, setEnrollingMap] = useState({});

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch all available courses and the student's personal enrolled courses parallelly
                const [allRes, enrolledRes] = await Promise.all([
                    api.get("/student/videos"),
                    api.get("/student/enrolled-videos").catch(() => ({ data: { videos: [] } })) // Fallback if 403 (like for instructors viewing the page loosely)
                ]);

                setVideos(allRes.data.videos || []);
                setEnrolledVideos(enrolledRes.data.videos || []);
            } catch (err) {
                console.error("Error fetching videos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const { openCheckout } = useRazorpay();

    const handleEnroll = async (videoId) => {
        try {
            setEnrollingMap(prev => ({ ...prev, [videoId]: true }));

            // 1. Create Order / Check if free
            const orderRes = await api.post("/payment/create-order", { type: "course", itemId: videoId });

            if (orderRes.data.free) {
                // Free course — proceed with normal enrollment
                const res = await api.post(`/student/videos/${videoId}/enroll`);
                if (res.status === 200) {
                    const enrolledObj = videos.find(v => v._id === videoId);
                    if (enrolledObj) {
                        setEnrolledVideos(prev => [...prev, enrolledObj]);
                    }
                }
                return;
            }

            // 2. Paid course — Open Razorpay Checkout
            const { orderId, amount, currency, keyId, itemName } = orderRes.data;

            await openCheckout({
                keyId,
                amount,
                currency,
                orderId,
                name: itemName,
                description: `Enrollment for ${itemName}`,
                userEmail: user?.email || "",
                userContact: user?.phone || "",
                onSuccess: async (response) => {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await api.post("/payment/verify", {
                            ...response,
                            type: "course",
                            itemId: videoId
                        });

                        if (verifyRes.status === 200) {
                            alert("Payment successful! You are now enrolled.");
                            const enrolledObj = videos.find(v => v._id === videoId);
                            if (enrolledObj) {
                                setEnrolledVideos(prev => [...prev, enrolledObj]);
                            }
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                onFailure: (err) => {
                    console.error("Payment failed:", err);
                    alert("Payment failed or cancelled.");
                }
            });

        } catch (err) {
            console.error("Error enrolling:", err);
            alert(err.response?.data?.message || "Failed to enroll in the course.");
        } finally {
            setEnrollingMap(prev => ({ ...prev, [videoId]: false }));
        }
    };

    // If the user is an instructor, strictly filter to ONLY show their own courses
    const baseVideos = user?.role === "instructor"
        ? videos.filter(v => v.instructorId?._id === user?.id || v.instructorId === user?.id)
        : videos;

    const filteredVideos = baseVideos.filter(v =>
        (v.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="container mt-8 text-center text-muted">Loading courses...</div>;
    }

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    {user?.role === "instructor" ? "My Published Courses" : "Pre-recorded Sessions"}
                </h2>
                <p className="text-muted" style={{ fontSize: "1.125rem", marginBottom: "2rem" }}>
                    {user?.role === "instructor" ? "Manage and review the courses you've created" : "Browse and enroll in professional nail art courses"}
                </p>

                <div style={{ position: "relative", maxWidth: "600px" }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={20} />
                    <input
                        type="text"
                        placeholder="Search courses or instructors..."
                        style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "#F9FAFB", fontSize: "1rem" }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="card text-center text-muted py-8">No courses found matching your query.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
                    {filteredVideos.map((video, index) => {
                        // Derive level and hours from index if not stored in DB
                        const level = ["Beginner", "Intermediate", "Advanced"][index % 3];
                        const hours = (video.duration || (index + 2) * 2);
                        const enrolledCount = video.enrolledCount ?? 0;
                        const rating = 4.5 + ((index % 5) * 0.1);

                        const isEnrolled = enrolledVideos.some(ev => ev._id === video._id);
                        const isEnrolling = enrollingMap[video._id];

                        return (
                            <div key={video._id} className="card" style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
                                {/* Video Thumbnail Placeholder */}
                                <div style={{
                                    width: "100%", aspectRatio: "16/9", backgroundColor: "var(--primary-light)",
                                    borderRadius: "12px", marginBottom: "1.5rem", position: "relative",
                                    overflow: "hidden"
                                }}>
                                    <img 
                                        src={video.thumbnail || "https://images.unsplash.com/photo-1604176354204-926873ff3da9?w=800&q=80"} 
                                        alt={video.title} 
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                    />
                                    <span style={{
                                        position: "absolute", top: "1rem", left: "1rem",
                                        backgroundColor: "white", color: "var(--primary)", padding: "0.25rem 0.75rem",
                                        borderRadius: "99px", fontSize: "0.75rem", fontWeight: "600",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}>
                                        {level}
                                    </span>
                                    <div style={{
                                        position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center", opacity: 0,
                                        transition: "opacity 0.2s"
                                    }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                        <PlayCircle size={48} color="white" />
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{video.title}</h3>
                                            <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0" }}>
                                                by {video.instructor || "Academy Instructor"}
                                            </p>
                                        </div>
                                        <div style={{ backgroundColor: "#FDF2F8", color: "#BE185D", padding: "0.4rem 0.8rem", borderRadius: "8px", fontWeight: "700", fontSize: "1rem" }}>
                                            {video.fees > 0 ? `₹${video.fees}` : "FREE"}
                                        </div>
                                    </div>
                                    <p className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {video.description}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mb-4" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                    <div className="flex items-center gap-1"><Clock size={16} /> {hours} hours</div>
                                    <div className="flex items-center gap-1"><Users size={16} /> {enrolledCount.toLocaleString()} enrolled</div>
                                    <div className="flex items-center gap-1" style={{ color: "#EAB308", fontWeight: "600" }}><Star size={16} fill="currentColor" /> {rating.toFixed(1)}</div>
                                </div>

                                {user?.role === "instructor" ? (
                                    <div className="flex gap-2">
                                        <Link to={`/student/video/${video._id}`} className="btn" style={{
                                            flex: 1, backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                        }}>
                                            <PlayCircle size={18} /> Preview
                                        </Link>
                                        <Link to="/admin/dashboard" className="btn btn-outline" style={{
                                            flex: 1, padding: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                        }}>
                                            <Settings size={18} /> Manage
                                        </Link>
                                    </div>
                                ) : isEnrolled ? (
                                    <Link to={`/student/video/${video._id}`} className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                    }}>
                                        <PlayCircle size={18} /> View Course
                                    </Link>
                                ) : (
                                    <button onClick={() => handleEnroll(video._id)} disabled={isEnrolling} className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                        opacity: isEnrolling ? 0.7 : 1, cursor: isEnrolling ? "not-allowed" : "pointer", border: "none"
                                    }}>
                                        <BookOpen size={18} /> {isEnrolling ? "Enrolling..." : video.fees > 0 ? `Enroll Now (₹${video.fees})` : "Enroll for Free"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
