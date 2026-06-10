import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Video, Award, Star, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../api";

export default function Landing() {
    const [video, setVideo] = useState(null);
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const { data } = await api.get("/landing-video");
                setVideo(data);
            } catch (error) {
                console.error("Failed to load branding assets", error);
            }
        };
        const fetchGallery = async () => {
            try {
                const { data } = await api.get("/gallery");
                setGallery(data);
            } catch (error) {
                console.error("Failed to fetch gallery", error);
            }
        };
        fetchVideo();
        fetchGallery();
    }, []);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
            {/* Hero Section with Glassmorphism */}
            <section style={{ 
                position: "relative", 
                height: "90vh", 
                display: "flex", 
                alignItems: "center", 
                overflow: "hidden",
                background: "#000"
            }}>
                {video?.videoUrl && (
                    <video 
                        src={video.videoUrl}
                        autoPlay loop muted playsInline
                        style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                            objectFit: "cover", opacity: 0.6, zIndex: 0
                        }}
                    />
                )}
                
                <div className="container" style={{ position: "relative", zIndex: 10 }}>
                    <div style={{ maxWidth: "700px" }}>
                        <div className="glass" style={{ 
                            display: "inline-flex", alignItems: "center", gap: "0.5rem", 
                            padding: "0.5rem 1rem", borderRadius: "99px", marginBottom: "2rem",
                            color: "white", fontSize: "0.9rem", fontWeight: "600"
                        }}>
                            <Zap size={16} color="var(--primary)" /> The Future of Nail Artistry
                        </div>
                        <h1 style={{ 
                            fontSize: "5rem", fontWeight: "900", color: "white", 
                            lineHeight: "1", marginBottom: "2rem", letterSpacing: "-0.04em" 
                        }}>
                            Design Your <span style={{ color: "var(--primary)" }}>Success</span> Story.
                        </h1>
                        <p style={{ 
                            fontSize: "1.25rem", color: "rgba(255,255,255,0.8)", 
                            marginBottom: "3rem", lineHeight: "1.6" 
                        }}>
                            Join an elite community of artists. Master professional techniques through cinematic learning experiences and interactive live mastery sessions.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/register" className="btn btn-primary" style={{ padding: "1.25rem 2.5rem", fontSize: "1.1rem" }}>
                                Start Your Journey <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="btn glass" style={{ color: "white", padding: "1.25rem 2.5rem", fontSize: "1.1rem" }}>
                                Member Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Elite Features Section */}
            <section style={{ padding: "8rem 0", backgroundColor: "#FDFBF9" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                        <h2 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "1.5rem" }}>The Academy Standard</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
                            Unrivaled educational quality delivered through state-of-the-art digital infrastructure.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" }}>
                        <FeatureCard 
                            icon={Video} 
                            title="Cinematic Learning" 
                            desc="High-definition, pre-recorded modules focusing on every intricate detail of modern nail design."
                        />
                        <FeatureCard 
                            icon={Star} 
                            title="Mastery Sessions" 
                            desc="Interactive live workshops with industry icons. Get real-time feedback on your artistry."
                        />
                        <FeatureCard 
                            icon={ShieldCheck} 
                            title="Elite Certification" 
                            desc="Earn recognized credentials that accelerate your career in the luxury beauty industry."
                        />
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            {gallery && gallery.length > 0 && (
                <section style={{ padding: "8rem 0", backgroundColor: "#fff" }}>
                    <div className="container">
                        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                            <h2 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "1.5rem" }}>Student Gallery</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
                                Explore world-class artistry from our professional nail artists.
                            </p>
                        </div>
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "2rem"
                        }}>
                            {gallery.map(item => (
                                <div key={item._id} className="card-premium" style={{ overflow: "hidden", padding: "1rem" }}>
                                    <img 
                                        src={`http://localhost:5001${item.imageUrl}`} 
                                        alt={item.instructorId ? `Art by ${item.instructorId.firstName}` : `Art by ${item.artistName || 'Artist'}`}
                                        style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "12px", marginBottom: "1rem" }}
                                    />
                                    <h3 style={{ fontSize: "1.2rem", textAlign: "center" }}>
                                        {item.instructorId ? `${item.instructorId.firstName} ${item.instructorId.lastName}` : (item.artistName || 'Unknown Artist')}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Premium CTA */}
            <section className="container" style={{ marginBottom: "8rem" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)", 
                    borderRadius: "40px", padding: "5rem", textAlign: "center", color: "white",
                    position: "relative", overflow: "hidden"
                }}>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <h2 style={{ fontSize: "3.5rem", fontWeight: "900", color: "white", marginBottom: "1.5rem" }}>Ready to Define Your Craft?</h2>
                        <p style={{ fontSize: "1.25rem", opacity: 0.8, marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
                            Join 5,000+ artists worldwide. Your creative evolution begins today.
                        </p>
                        <Link to="/register" className="btn btn-primary" style={{ padding: "1.25rem 3rem", fontSize: "1.2rem" }}>
                            Enroll in the Academy
                        </Link>
                    </div>
                    <div style={{ 
                        position: "absolute", bottom: "-50px", right: "-50px", 
                        width: "300px", height: "300px", borderRadius: "50%", 
                        background: "var(--primary)", opacity: 0.1, filter: "blur(60px)" 
                    }} />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="card-premium" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ 
                backgroundColor: "var(--primary-light)", color: "var(--primary)", 
                width: "64px", height: "64px", borderRadius: "20px", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                margin: "0 auto 2rem" 
            }}>
                <Icon size={32} />
            </div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{title}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>{desc}</p>
        </div>
    );
}
