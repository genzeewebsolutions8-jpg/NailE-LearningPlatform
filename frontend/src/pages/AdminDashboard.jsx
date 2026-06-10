import { useState, useEffect } from "react";
import { Plus, Video, Users, BookOpen, Trash2, Clock, CheckCircle, Search, Filter, TrendingUp, MoreVertical } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [videos, setVideos] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newVideo, setNewVideo] = useState({
        title: "",
        description: "",
        fees: "",
    });
    const [videoFiles, setVideoFiles] = useState([]);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    useEffect(() => {
        fetchInstructorVideos();
    }, []);

    const fetchInstructorVideos = async () => {
        try {
            const { data } = await api.get("/videos");
            const instructorVideos = (data.videos || data).filter(v => v.instructorId?._id === user?._id || v.instructorId === user?._id);
            setVideos(instructorVideos);
        } catch (error) {
            console.error("Failed to load creative assets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", newVideo.title);
            formData.append("description", newVideo.description);
            formData.append("fees", newVideo.fees);
            
            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            }
            
            for (let i = 0; i < videoFiles.length; i++) {
                formData.append("videos", videoFiles[i]);
            }

            await api.post("/videos/add", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            setShowUpload(false);
            setNewVideo({ title: "", description: "", fees: "" });
            setVideoFiles([]);
            setThumbnailFile(null);
            fetchInstructorVideos();
            showToast("Course production initiated and pending review", "success");
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to upload creative asset", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent deletion of this asset?")) return;
        try {
            await api.delete(`/videos/${id}`);
            fetchInstructorVideos();
            showToast("Creative asset decommissioned", "success");
        } catch (error) {
            showToast("Deactivation failed", "error");
        }
    };

    if (loading) return (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
            <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
            <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Syncing Creative Studio...</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#FDFBF9", paddingBottom: "5rem" }}>
            <div className="container" style={{ paddingTop: "3rem" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem" }}>
                    <div>
                        <div style={{ color: "var(--primary)", fontWeight: "800", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>Instructor Console</div>
                        <h1 style={{ fontSize: "2.75rem", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.03em" }}>Creative Studio</h1>
                    </div>
                    <button onClick={() => setShowUpload(true)} className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1rem" }}>
                        <Plus size={20} /> Produce New Course
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginBottom: "4rem" }}>
                    <CreativeStat 
                        title="Total Students" 
                        value={videos.reduce((acc, v) => acc + (v.enrolledStudents?.length || 0), 0)} 
                        icon={Users} 
                    />
                    <CreativeStat 
                        title="Studio Revenue" 
                        value={`₹${videos.reduce((acc, v) => acc + ((v.enrolledStudents?.length || 0) * (v.fees || 0)), 0).toLocaleString()}`} 
                        icon={TrendingUp} 
                    />
                    <CreativeStat 
                        title="Content Hours" 
                        value="0h" 
                        icon={Clock} 
                    />
                </div>

                <div className="card-premium" style={{ padding: "2.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "900" }}>Curated Collections</h3>
                        <div className="flex gap-2">
                            <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}><Filter size={16} /> Filters</button>
                            <div style={{ position: "relative" }}>
                                <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                                <input type="text" placeholder="Search Studio..." className="form-input" style={{ width: "200px", paddingLeft: "2.5rem", fontSize: "0.85rem", height: "40px" }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2.5rem" }}>
                        {videos.map(video => (
                            <CreativeCard key={video._id} video={video} onDelete={() => handleDelete(video._id)} />
                        ))}
                        {videos.length === 0 && (
                            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
                                <BookOpen size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
                                <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>Your studio is currently empty. Start producing your first mastery course.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showUpload && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div className="card-premium" style={{ width: "100%", maxWidth: "600px", padding: "3rem", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
                        <button onClick={() => setShowUpload(false)} style={{ position: "absolute", top: "2rem", right: "2rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            <Trash2 size={24} />
                        </button>
                        <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>New Content Production</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>Configure your mastery course details.</p>
                        
                        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div className="form-group">
                                <label style={{ fontWeight: "750", display: "block", marginBottom: "0.5rem" }}>Course Title</label>
                                <input type="text" className="form-input" placeholder="Course Title" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: "750", display: "block", marginBottom: "0.5rem" }}>Production Description</label>
                                <textarea className="form-input" placeholder="Course Description" style={{ height: "100px", resize: "none" }} value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} required />
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: "750", display: "block", marginBottom: "0.5rem" }}>Video Content (Multiple)</label>
                                    <input type="file" className="form-input" multiple accept="video/*" onChange={e => setVideoFiles(e.target.files)} required style={{ paddingTop: "0.6rem" }} />
                                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{videoFiles.length} files selected</p>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: "750", display: "block", marginBottom: "0.5rem" }}>Master Asset (Thumbnail)</label>
                                    <input type="file" className="form-input" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} required style={{ paddingTop: "0.6rem" }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: "750", display: "block", marginBottom: "0.5rem" }}>Enrollment Fee (INR)</label>
                                <input type="number" className="form-input" placeholder="Enrollment Fee" value={newVideo.fees} onChange={e => setNewVideo({...newVideo, fees: e.target.value})} required />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ padding: "1.125rem", marginTop: "1rem", fontWeight: "800" }}>
                                {loading ? "Uploading Production..." : "Initiate Production"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const CreativeStat = ({ title, value, icon: Icon, trend }) => (
    <div className="card-premium" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "0.75rem", borderRadius: "14px" }}>
                <Icon size={24} />
            </div>
            {trend && <span style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: "700" }}>{trend}</span>}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>{title}</p>
        <h3 style={{ fontSize: "1.75rem", fontWeight: "900" }}>{value}</h3>
    </div>
);

const CreativeCard = ({ video, onDelete }) => (
    <div className="card-premium" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
            <img src={video.thumbnail || "https://images.unsplash.com/photo-1604176354204-926873ff3da9?w=800&q=80"} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                <span className={`badge ${video.status === 'approved' ? 'badge-success' : video.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                    {video.status}
                </span>
            </div>
        </div>
        <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)" }}>{video.title}</h4>
                <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><MoreVertical size={18} /></button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineBreak: "anywhere", height: "2.5rem", overflow: "hidden" }}>{video.description}</p>
            <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: "900", color: "var(--primary)", fontSize: "1.1rem" }}>₹{video.fees}</div>
                <button onClick={onDelete} style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: "700" }}>
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </div>
    </div>
);
