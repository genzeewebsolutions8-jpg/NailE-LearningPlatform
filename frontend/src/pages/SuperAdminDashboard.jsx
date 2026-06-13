import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Users, BookOpen, Clock, Award, Video, PlayCircle, Plus } from "lucide-react";

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [stats, setStats] = useState({
        pendingApprovals: 0,
        totalInstructors: 0,
        activeCourses: 0,
        totalRevenue: "₹0",
    });

    const [pendingCourses, setPendingCourses] = useState([]);
    const [editingCourse, setEditingCourse] = useState(null);
    const [pendingInstructors, setPendingInstructors] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [landingVideo, setLandingVideo] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [videoUploading, setVideoUploading] = useState(false);
    const [newSession, setNewSession] = useState({
        title: "", topic: "", seats: "", fees: "", instructorId: "", sessionDate: ""
    });
    const [galleryItems, setGalleryItems] = useState([]);
    const [newGalleryInstructor, setNewGalleryInstructor] = useState("");
    const [newGalleryFile, setNewGalleryFile] = useState(null);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [approvedInstructors, setApprovedInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, pendingCoursesRes, allVideosRes, pendingInstructorsRes, sessionsRes, approvedInstructorsRes, landingVideoRes, galleryRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/courses/pending"),
                api.get("/videos"),
                api.get("/admin/instructors/pending"),
                api.get("/live-sessions"),
                api.get("/admin/instructors/approved"),
                api.get("/landing-video"),
                api.get("/gallery")
            ]);

            const allVideos = allVideosRes.data.videos || allVideosRes.data || [];
            setStats({
                pendingApprovals: pendingCoursesRes.data.courses.length + pendingInstructorsRes.data.instructors.length,
                totalInstructors: statsRes.data.stats.totalInstructors,
                activeCourses: allVideos.filter(v => v.status === 'approved').length,
                totalRevenue: statsRes.data.stats.totalRevenue !== undefined ? `₹${statsRes.data.stats.totalRevenue.toLocaleString()}` : "₹0",
            });

            setPendingCourses(pendingCoursesRes.data.courses);
            setPendingInstructors(pendingInstructorsRes.data.instructors);
            setLiveSessions(sessionsRes.data.sessions || sessionsRes.data || []);
            setApprovedInstructors(approvedInstructorsRes.data.instructors || []);
            setLandingVideo(landingVideoRes.data);
            setGalleryItems(galleryRes.data || []);
        } catch (error) {
            console.error("Failed to load super admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseAction = async (courseId, status, updatedFields = {}) => {
        try {
            await api.put(`/admin/courses/${courseId}/status`, { status, ...updatedFields });
            fetchAdminData();
            setEditingCourse(null);
            showToast(`Course ${status} successfully`, "success");
        } catch (error) {
            showToast("Failed to update course status", "error");
        }
    };

    const handleInstructorAction = async (id, action) => {
        try {
            await api.put(`/admin/instructors/${id}/status`, { status: action });
            fetchAdminData();
            showToast(`Instructor ${action} successfully`, "success");
        } catch (err) {
            showToast(`Failed to ${action} instructor`, "error");
        }
    };

    const handleAddSession = async (e) => {
        e.preventDefault();
        try {
            await api.post("/live-sessions", newSession);
            setNewSession({ title: "", topic: "", seats: "", fees: "", instructorId: "", sessionDate: "" });
            showToast("Live session scheduled!", "success");
            fetchAdminData();
        } catch (err) {
            showToast("Failed to create live session", "error");
        }
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) return;
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("title", "Landing Page Video");
        setVideoUploading(true);
        try {
            const { data } = await api.post("/landing-video/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setLandingVideo(data.video);
            setVideoFile(null);
            showToast("Landing video updated!", "success");
        } catch (error) {
            showToast("Video upload failed", "error");
        } finally {
            setVideoUploading(false);
        }
    };

    const handleVideoDelete = async () => {
        if (!window.confirm("Delete landing video?")) return;
        try {
            await api.delete("/landing-video");
            setLandingVideo(null);
            showToast("Video deleted", "success");
        } catch (error) {
            showToast("Video deletion failed", "error");
        }
    };

    const handleGalleryUpload = async (e) => {
        e.preventDefault();
        if (!newGalleryFile || !newGalleryInstructor) return;
        const formData = new FormData();
        formData.append("image", newGalleryFile);
        formData.append("instructorId", newGalleryInstructor);
        setGalleryUploading(true);
        try {
            await api.post("/gallery", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setNewGalleryFile(null);
            setNewGalleryInstructor("");
            showToast("Gallery item added!", "success");
            fetchAdminData();
        } catch (error) {
            showToast("Gallery upload failed", "error");
        } finally {
            setGalleryUploading(false);
        }
    };

    const handleGalleryDelete = async (id) => {
        if (!window.confirm("Delete this gallery image?")) return;
        try {
            await api.delete(`/gallery/${id}`);
            showToast("Image deleted", "success");
            fetchAdminData();
        } catch (error) {
            showToast("Deletion failed", "error");
        }
    };

    const handleDeleteInstructor = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently remove instructor ${name}?`)) return;
        try {
            await api.delete(`/admin/instructors/${id}`);
            fetchAdminData();
            showToast("Instructor removed successfully", "success");
        } catch (error) {
            console.error("Failed to delete instructor", error);
            showToast(error.response?.data?.message || "Failed to remove instructor", "error");
        }
    };

    if (loading) return <div className="container mt-8">Loading...</div>;

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>
            <h1 className="mb-4">Super Admin Dashboard</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="card">
                    <p className="text-muted mb-2">Total Revenue</p>
                    <h3>{stats.totalRevenue}</h3>
                </div>
                <div className="card">
                    <p className="text-muted mb-2">Total Instructors</p>
                    <h3>{stats.totalInstructors}</h3>
                </div>
                <div className="card">
                    <p className="text-muted mb-2">Active Courses</p>
                    <h3>{stats.activeCourses}</h3>
                </div>
                <div className="card" style={{ border: stats.pendingApprovals > 0 ? "1px solid var(--primary)" : "" }}>
                    <p className="text-muted mb-2">Pending Approvals</p>
                    <h3>{stats.pendingApprovals}</h3>
                </div>
            </div>

            <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                
                {/* Pending Actions */}
                <div>
                    <h3 className="mb-4">Approvals Required</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {pendingInstructors.map(inst => (
                            <div key={inst._id} className="card flex justify-between items-center">
                                <div>
                                    <strong>{inst.firstName} {inst.lastName}</strong>
                                    <p className="text-muted">{inst.email} (Instructor)</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleInstructorAction(inst._id, 'approved')} className="btn btn-primary">Approve</button>
                                    <button onClick={() => handleInstructorAction(inst._id, 'rejected')} className="btn">Reject</button>
                                </div>
                            </div>
                        ))}
                        {pendingCourses.map(course => (
                            <div key={course._id} className="card flex justify-between items-center">
                                <div>
                                    <strong>{course.title}</strong>
                                    <p className="text-muted">By {course.instructorId?.firstName} (Course) - ₹{course.fees}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingCourse(course)} className="btn btn-outline">Review & Edit</button>
                                    <button onClick={() => handleCourseAction(course._id, 'approved')} className="btn btn-primary">Quick Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Review Modal */}
                {editingCourse && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "2rem" }}>
                        <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
                            <h3 className="mb-4">Review Course: {editingCourse.title}</h3>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-input" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" style={{ height: "100px" }} value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fees (INR)</label>
                                <input type="number" className="form-input" value={editingCourse.fees} onChange={e => setEditingCourse({...editingCourse, fees: e.target.value})} />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button onClick={() => handleCourseAction(editingCourse._id, 'approved', { 
                                    title: editingCourse.title, 
                                    description: editingCourse.description, 
                                    fees: editingCourse.fees 
                                })} className="btn btn-primary flex-1">Approve with Changes</button>
                                <button onClick={() => setEditingCourse(null)} className="btn flex-1">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Scheduling */}
                <div>
                    <h3 className="mb-4">Schedule Live Session</h3>
                    <div className="card">
                        <form onSubmit={handleAddSession}>
                            <div className="form-group">
                                <label className="form-label">Session Title</label>
                                <input type="text" className="form-input" placeholder="Session Title" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Instructor</label>
                                <select className="form-input" value={newSession.instructorId} onChange={e => setNewSession({...newSession, instructorId: e.target.value})} required>
                                    <option value="" disabled>Select Instructor...</option>
                                    {approvedInstructors.map(inst => (
                                        <option key={inst._id} value={inst._id}>{inst.firstName} {inst.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Capacity</label>
                                    <input type="number" className="form-input" placeholder="Capacity" value={newSession.seats} onChange={e => setNewSession({...newSession, seats: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fees</label>
                                    <input type="number" className="form-input" placeholder="Fees" value={newSession.fees} onChange={e => setNewSession({...newSession, fees: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date & Time</label>
                                <input type="datetime-local" className="form-input" value={newSession.sessionDate} onChange={e => setNewSession({...newSession, sessionDate: e.target.value})} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Schedule Now</button>
                        </form>
                    </div>
                </div>

            </div>

            {/* Landing Video Management */}
            <div className="mt-8">
                <h3 className="mb-4">Landing Page Branding</h3>
                <div className="card">
                    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <p className="mb-4 text-muted">Current Landing Video Preview:</p>
                            <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#eee", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {landingVideo ? (
                                    <video src={landingVideo.videoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls autoPlay loop muted />
                                ) : (
                                    <PlayCircle size={48} color="#ccc" />
                                )}
                            </div>
                            {landingVideo && <button onClick={handleVideoDelete} className="btn mt-4" style={{ color: "red", borderColor: "red" }}>Delete Video</button>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p className="mb-4 text-muted">Upload New Video:</p>
                            <form onSubmit={handleVideoUpload}>
                                <input type="file" className="form-input mb-4" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} />
                                <button type="submit" className="btn btn-primary w-full" disabled={!videoFile || videoUploading}>
                                    {videoUploading ? "Uploading..." : "Update Landing Video"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Management */}
            <div className="mt-8">
                <h3 className="mb-4">Landing Page Gallery Management</h3>
                <div className="card">
                    <form onSubmit={handleGalleryUpload} className="mb-8" style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Instructor</label>
                            <select className="form-input" value={newGalleryInstructor} onChange={e => setNewGalleryInstructor(e.target.value)} required>
                                <option value="" disabled>Select Instructor...</option>
                                {approvedInstructors.map(inst => (
                                    <option key={inst._id} value={inst._id}>{inst.firstName} {inst.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Upload Artwork</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setNewGalleryFile(e.target.files[0])} required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={!newGalleryFile || !newGalleryInstructor || galleryUploading} style={{ padding: "0.75rem 2rem" }}>
                            {galleryUploading ? "Uploading..." : "Add to Gallery"}
                        </button>
                    </form>

                    <h4 className="mb-4">Current Gallery</h4>
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "1.5rem"
                    }}>
                        {galleryItems.map(item => (
                            <div key={item._id} className="card-premium" style={{ overflow: "hidden", padding: "1rem", position: "relative" }}>
                                <img 
                                    src={`http://localhost:5001${item.imageUrl}`} 
                                    alt={item.instructorId ? `Art by ${item.instructorId.firstName}` : `Art by ${item.artistName || 'Artist'}`}
                                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.5rem" }}
                                />
                                <h4 style={{ fontSize: "1rem", textAlign: "center", marginBottom: "0.5rem" }}>
                                    {item.instructorId ? `${item.instructorId.firstName} ${item.instructorId.lastName}` : (item.artistName || 'Unknown Artist')}
                                </h4>
                                <button onClick={() => handleGalleryDelete(item._id)} className="btn w-full" style={{ color: "red", borderColor: "red", padding: "0.5rem" }}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    {galleryItems.length === 0 && <p className="text-muted text-center py-8">No items in gallery yet.</p>}
                </div>
            </div>

            {/* Approved Instructors Management */}
            <div className="mt-8">
                <h3 className="mb-4">Approved Instructors Management</h3>
                <div className="card">
                    {approvedInstructors.length === 0 ? (
                        <p className="text-muted text-center py-8">No approved instructors found.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {approvedInstructors.map(inst => (
                                <div key={inst._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid var(--border-light)" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>{inst.firstName} {inst.lastName}</h4>
                                        <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>{inst.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteInstructor(inst._id, `${inst.firstName} ${inst.lastName}`)} 
                                        className="btn" 
                                        style={{ color: "#EF4444", borderColor: "#EF4444", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                    >
                                        Remove Instructor
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
