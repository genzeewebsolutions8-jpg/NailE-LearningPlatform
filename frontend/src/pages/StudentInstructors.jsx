import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Search, Star } from "lucide-react";

export default function StudentInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const { data } = await api.get("/student/instructors");
                setInstructors(data.instructors || []);
            } catch (err) {
                console.error("Error fetching instructors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    const filteredInstructors = instructors.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="container mt-8 text-center text-muted">Loading instructors...</div>;
    }

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Our Instructors</h2>
                <p className="text-muted" style={{ fontSize: "1.125rem", marginBottom: "2rem" }}>
                    Learn from the best nail artists and educators
                </p>

                <div style={{ position: "relative", maxWidth: "600px" }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={20} />
                    <input
                        type="text"
                        placeholder="Search instructors..."
                        style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "#F9FAFB", fontSize: "1rem" }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredInstructors.length === 0 ? (
                <div className="card text-center text-muted py-8">No instructors found matching your query.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                    {filteredInstructors.map((instructor, index) => {
                        // Use initials for missing avatar
                        const initials = instructor.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

                        return (
                            <div key={instructor._id || instructor.name + index} className="card" style={{ display: "flex", flexDirection: "column", padding: "2rem", textAlign: "center" }}>
                                {/* Avatar */}
                                <div style={{
                                    width: "96px", height: "96px", backgroundColor: "var(--primary)",
                                    borderRadius: "50%", margin: "0 auto 1.5rem auto", display: "flex",
                                    alignItems: "center", justifyContent: "center", color: "white",
                                    fontSize: "2rem", fontWeight: "600"
                                }}>
                                    {initials}
                                </div>

                                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{instructor.name}</h3>
                                <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>{instructor.email}</p>

                                {/* Stats Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem", marginBottom: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--primary)" }}>{instructor.coursesCount || 0}</div>
                                        <div className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Active Courses</div>
                                    </div>
                                </div>

                                <Link to={`/student/instructor/${encodeURIComponent(instructor.name)}`} className="btn" style={{
                                    width: "100%", backgroundColor: "var(--bg-pink-light)", color: "var(--primary)",
                                    padding: "0.75rem", fontWeight: "600", transition: "all 0.2s", display: "inline-block", textAlign: "center", textDecoration: "none"
                                }}>
                                    View Profile
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
