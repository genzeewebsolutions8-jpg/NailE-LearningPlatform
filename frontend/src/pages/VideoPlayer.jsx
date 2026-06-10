import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { ArrowLeft } from "lucide-react";

export default function VideoPlayer() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const { data } = await api.get(`/videos/${id}`);
                setVideo(data);
            } catch (err) {
                setError("Failed to load video. It may not exist.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const [activeVideoIndex, setActiveVideoIndex] = useState(0);

    if (loading) {
        return <div className="container mt-8 text-center text-muted">Loading video...</div>;
    }

    if (error || !video) {
        return (
            <div className="container mt-8 text-center">
                <p style={{ color: "var(--danger)" }}>{error}</p>
                <Link to="/student/dashboard" className="btn btn-outline mt-4">Back to Dashboard</Link>
            </div>
        );
    }

    const playlist = video.videos && video.videos.length > 0 ? video.videos : [{ videoUrl: video.videoUrl, title: "Main Course Video" }];
    const currentVideo = playlist[activeVideoIndex];

    return (
        <div className="container mt-8">
            <Link to="/student/dashboard" className="btn btn-outline flex items-center gap-2 mb-8" style={{ width: "fit-content" }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                <div className="card">
                    <h2 className="mb-4">{video.title} - {currentVideo.title}</h2>

                    {/* Actual HTML5 Video Player */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", marginBottom: "2rem" }}>
                        <video
                            key={currentVideo.videoUrl} // Force React to remount video when URL changes
                            controls
                            controlsList="nodownload"
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#000",
                                borderRadius: "12px",
                                objectFit: "contain"
                            }}
                        >
                            <source src={currentVideo.videoUrl} />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div style={{ padding: "1.5rem", backgroundColor: "rgba(15, 23, 42, 0.4)", borderRadius: "12px" }}>
                        <h3 className="mb-2" style={{ fontSize: "1.25rem" }}>Course Description</h3>
                        <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>{video.description}</p>
                    </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
                    <h3 className="mb-4" style={{ fontSize: "1.125rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>Course Contents</h3>
                    <div className="flex flex-col gap-2">
                        {playlist.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveVideoIndex(idx)}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    backgroundColor: activeVideoIndex === idx ? "var(--bg-pink-light)" : "transparent",
                                    color: activeVideoIndex === idx ? "var(--primary)" : "var(--text-dark)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                                {activeVideoIndex === idx && <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: "600", textTransform: "uppercase" }}>Now Playing</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
