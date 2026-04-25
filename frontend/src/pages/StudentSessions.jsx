import { useState, useEffect } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useRazorpay from "../useRazorpay";

export default function StudentSessions() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [enrolledSessions, setEnrolledSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingMap, setEnrollingMap] = useState({});
    const [activeTab, setActiveTab] = useState("Upcoming"); // Upcoming, Live Now, Past Sessions

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const [allRes, enrolledRes] = await Promise.all([
                    api.get("/live-sessions"),
                    api.get("/live-sessions/enrolled").catch(() => ({ data: { sessions: [] } }))
                ]);

                setSessions(allRes.data.sessions || []);
                setEnrolledSessions(enrolledRes.data.sessions || []);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const { openCheckout } = useRazorpay();

    const handleEnroll = async (sessionId) => {
        try {
            setEnrollingMap(prev => ({ ...prev, [sessionId]: true }));

            // 1. Create Order / Check if free
            const orderRes = await api.post("/payment/create-order", { type: "session", itemId: sessionId });

            if (orderRes.data.free) {
                // Free session — proceed with normal enrollment
                const res = await api.post(`/live-sessions/${sessionId}/enroll`);
                if (res.status === 200) {
                    const enrolledObj = sessions.find(s => s._id === sessionId);
                    if (enrolledObj) {
                        setEnrolledSessions(prev => [...prev, enrolledObj]);
                    }
                }
                return;
            }

            // 2. Paid session — Open Razorpay Checkout
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
                            type: "session",
                            itemId: sessionId
                        });

                        if (verifyRes.status === 200) {
                            alert("Payment successful! You are now enrolled.");
                            const enrolledObj = sessions.find(s => s._id === sessionId);
                            if (enrolledObj) {
                                setEnrolledSessions(prev => [...prev, enrolledObj]);
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
            alert(err.response?.data?.message || "Failed to enroll in the live session.");
        } finally {
            setEnrollingMap(prev => ({ ...prev, [sessionId]: false }));
        }
    };

    // Filter logic loosely based on status if it exists, otherwise bucket arbitrarily for UI demo 
    // without repeating dummy data explicitly. We use the real backend data.
    const filteredSessions = sessions.filter(s => {
        if (activeTab === "Upcoming") return s.status !== "completed" && s.status !== "live";
        if (activeTab === "Live Now") return s.status === "live";
        if (activeTab === "Past Sessions") return s.status === "completed";
        return true;
    });

    if (loading) {
        return <div className="container mt-8 text-center text-muted">Loading live sessions...</div>;
    }

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Live Sessions</h2>
                <p className="text-muted" style={{ fontSize: "1.125rem", marginBottom: "2rem" }}>
                    Join live classes and interact with expert instructors
                </p>

                <div className="flex gap-2" style={{ backgroundColor: "#F9FAFB", padding: "0.5rem", borderRadius: "99px", display: "inline-flex" }}>
                    {["Upcoming", "Live Now", "Past Sessions"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "0.5rem 1.25rem", borderRadius: "99px", border: "none", cursor: "pointer",
                                fontSize: "0.95rem", fontWeight: "500", transition: "all 0.2s ease",
                                backgroundColor: activeTab === tab ? "var(--primary)" : "transparent",
                                color: activeTab === tab ? "white" : "var(--text-dark)",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="card text-center text-muted py-8">No live sessions are currently scheduled.</div>
            ) : filteredSessions.length === 0 ? (
                <div className="text-muted">No sessions in this category.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
                    {filteredSessions.map((session, index) => {
                        // Generate dynamic realistic schedule UI metrics based on map index
                        const isLive = session.status === "live";
                        const tag = isLive ? "Live" : "Scheduled";
                        const tagColor = isLive ? "#ef4444" : "#3b82f6";
                        const tagBg = isLive ? "#fee2e2" : "#dbeafe";

                        // Real progress capacity
                        const maxStudents = session.seats || 100;
                        const registered = session.enrolledCount || 0;
                        const capacityPct = (registered / maxStudents) * 100;
                        const duration = session.duration || 60;

                        const isEnrolled = enrolledSessions.some(es => es._id === session._id);
                        const isEnrolling = enrollingMap[session._id];

                        return (
                            <div key={session._id} className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column" }}>
                                <div className="flex justify-between items-center mb-6">
                                    <span style={{ backgroundColor: tagBg, color: tagColor, padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: "600" }}>
                                        {tag}
                                    </span>
                                    <Calendar size={20} style={{ color: "var(--primary)" }} />
                                </div>

                                <div style={{ flex: 1, marginBottom: "1.5rem" }}>
                                    <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", lineHeight: "1.4" }}>{session.title}</h3>
                                    <p className="text-muted" style={{ fontSize: "0.875rem" }}>by {session.instructorId ? `${session.instructorId.firstName} ${session.instructorId.lastName || ''}` : "Academy Instructor"}</p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} /> 
                                        {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : "Date TBD"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} /> 
                                        {session.sessionDate ? new Date(session.sessionDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "Time TBD"} • {duration} min
                                    </div>
                                    <div className="flex items-center gap-2"><Users size={16} /> {registered} / {maxStudents} registered</div>
                                </div>

                                <div style={{ width: "100%", height: "8px", backgroundColor: "#E5E7EB", borderRadius: "99px", marginBottom: "1.5rem", overflow: "hidden" }}>
                                    <div style={{ width: `${capacityPct}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "99px" }}></div>
                                </div>

                                {user?.role === 'admin' ? (
                                    <Link to="/admin/dashboard" className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        display: "flex", justifyContent: "center"
                                    }}>
                                        Preview and Manage
                                    </Link>
                                ) : user?.role === 'instructor' ? (
                                    <Link to={`/student/session/${session._id}`} className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        display: "flex", justifyContent: "center"
                                    }}>
                                        Start Live Session
                                    </Link>
                                ) : isEnrolled ? (
                                    <Link to={`/student/session/${session._id}`} className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        display: "flex", justifyContent: "center"
                                    }}>
                                        {isLive ? "Join Stream" : "View Details"}
                                    </Link>
                                ) : (
                                    <button onClick={() => handleEnroll(session._id)} disabled={isEnrolling || capacityPct >= 100} className="btn" style={{
                                        width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.875rem",
                                        opacity: isEnrolling || capacityPct >= 100 ? 0.7 : 1,
                                        cursor: isEnrolling || capacityPct >= 100 ? "not-allowed" : "pointer", border: "none"
                                    }}>
                                        {isEnrolling ? "Enrolling..." : capacityPct >= 100 ? "Session Full" : session.fees > 0 ? `Enroll Now (₹${session.fees})` : "Enroll for Free"}
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
