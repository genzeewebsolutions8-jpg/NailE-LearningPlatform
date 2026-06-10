import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../api";

/**
 * FeedbackModal — shown to students after a live session ends.
 * It is mandatory: cannot be dismissed until submitted.
 *
 * Props:
 *  sessionId  — the live session ID
 *  instructorName — display name of the instructor
 *  onSubmitted — callback when feedback is successfully submitted
 */
export default function FeedbackModal({ sessionId, instructorName, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (rating < 1) {
            setError("Please select a rating before submitting.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await api.post(`/feedback/${sessionId}`, { rating, comment });
            onSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    const activeRating = hovered || rating;

    return (
        /* Full-screen overlay — non-dismissible */
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
        }}>
            <div style={{
                backgroundColor: "white", borderRadius: "20px",
                padding: "2.5rem", maxWidth: "480px", width: "100%",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                animation: "fadeSlideUp 0.3s ease",
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎓</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1C1C1E" }}>
                        Session Complete!
                    </h2>
                    <p style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: "1.5" }}>
                        Please rate your experience with <strong>{instructorName}</strong>.<br />
                        This helps them improve their teaching.
                    </p>
                    <p style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: "600", marginTop: "0.5rem" }}>
                        ⚠️ Required — please fill this before leaving.
                    </p>
                </div>

                {/* Star Rating */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: "0.25rem", transition: "transform 0.15s ease",
                                    transform: activeRating >= star ? "scale(1.15)" : "scale(1)",
                                }}
                            >
                                <Star
                                    size={40}
                                    fill={activeRating >= star ? "#F59E0B" : "none"}
                                    color={activeRating >= star ? "#F59E0B" : "#D1D5DB"}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>
                    {activeRating > 0 && (
                        <p style={{ color: "#F59E0B", fontWeight: "700", fontSize: "1rem" }}>
                            {labels[activeRating]}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontWeight: "600", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
                        Comment <span style={{ color: "#9CA3AF", fontWeight: "400" }}>(optional)</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the session..."
                        rows={3}
                        style={{
                            width: "100%", padding: "0.875rem", borderRadius: "12px",
                            border: "1.5px solid #E5E7EB", fontSize: "0.9rem",
                            resize: "vertical", outline: "none", fontFamily: "inherit",
                            transition: "border-color 0.2s",
                            boxSizing: "border-box",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                        onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                    />
                </div>

                {error && (
                    <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    style={{
                        width: "100%", padding: "1rem", borderRadius: "12px",
                        border: "none", cursor: rating === 0 || submitting ? "not-allowed" : "pointer",
                        backgroundColor: rating === 0 ? "#E5E7EB" : "var(--primary)",
                        color: rating === 0 ? "#9CA3AF" : "white",
                        fontWeight: "700", fontSize: "1rem",
                        transition: "all 0.2s ease",
                        opacity: submitting ? 0.8 : 1,
                    }}
                >
                    {submitting ? "Submitting..." : "Submit Feedback ✓"}
                </button>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
