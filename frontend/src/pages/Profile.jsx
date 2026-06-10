import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, Camera, Save, ArrowLeft } from "lucide-react";
import api from "../api";

export default function Profile() {
    const { user, setUser } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setPhoneNumber(user.phoneNumber || "");
            setBio(user.bio || "");
            setPreviewUrl(user.profilePicture || "");
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("phoneNumber", phoneNumber);
        formData.append("bio", bio);
        if (imageFile) {
            formData.append("profilePicture", imageFile);
        }

        try {
            const { data } = await api.put("/auth/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            const updatedUser = { ...user, ...data.user };
            if (setUser) setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            showToast("Profile updated successfully!", "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: "calc(100vh - 4.5rem)", 
            background: "linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)",
            padding: "3rem 1rem"
        }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
                <Link to="/" className="flex items-center gap-2 mb-8" style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: "500", width: "fit-content" }}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>

                <div className="card-premium" style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "0", overflow: "hidden", minHeight: "600px" }}>
                    {/* Left Panel: Profile Quick Info */}
                    <div style={{ 
                        backgroundColor: "#FBFBFC", 
                        padding: "4rem 2.5rem", 
                        borderRight: "1px solid #F3F4F6",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center"
                    }}>
                        <div style={{ position: "relative", marginBottom: "2rem" }}>
                            <div style={{ 
                                width: "180px", 
                                height: "180px", 
                                borderRadius: "48px", 
                                overflow: "hidden", 
                                backgroundColor: "white",
                                boxShadow: "0 20px 40px rgba(197, 139, 134, 0.2)",
                                border: "6px solid white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "transform 0.3s ease"
                            }}
                            className="profile-avatar-container"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <User size={80} style={{ opacity: 0.1, color: "var(--primary)" }} />
                                )}
                            </div>
                            <label htmlFor="avatar-upload" style={{ 
                                position: "absolute", 
                                bottom: "-8px", 
                                right: "-8px", 
                                backgroundColor: "var(--primary)", 
                                color: "white", 
                                width: "48px", 
                                height: "48px", 
                                borderRadius: "16px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                cursor: "pointer",
                                boxShadow: "0 8px 16px rgba(197, 139, 134, 0.4)",
                                border: "4px solid white",
                                transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
                            >
                                <Camera size={22} />
                                <input id="avatar-upload" type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                            {firstName || user?.name} {lastName}
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>{user?.email}</p>
                        
                        <div style={{ 
                            backgroundColor: "rgba(197, 139, 134, 0.12)", 
                            color: "var(--primary)", 
                            padding: "0.6rem 1.25rem", 
                            borderRadius: "100px", 
                            fontSize: "0.8rem", 
                            fontWeight: "750",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></span>
                            {user?.role} Account
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div style={{ padding: "4rem" }}>
                        <div style={{ marginBottom: "3rem" }}>
                            <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-main)", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>Profile Settings</h1>
                            <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6" }}>Refine your presence on the platform. Update your personal details and professional bio here.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>First Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="First Name"
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Last Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Last Name"
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Phone Number</label>
                                <input 
                                    type="tel" 
                                    className="form-input" 
                                    placeholder="Phone Number"
                                    value={phoneNumber} 
                                    onChange={(e) => setPhoneNumber(e.target.value)} 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>About Your Professional Journey</label>
                                <textarea 
                                    className="form-input" 
                                    placeholder="Professional Bio" 
                                    rows="5" 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)}
                                    style={{ resize: "none", lineHeight: "1.6" }}
                                ></textarea>
                            </div>

                            <div style={{ marginTop: "1rem" }}>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ width: "100%", padding: "1.25rem", fontSize: "1.05rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }} 
                                    disabled={loading}
                                >
                                    <Save size={20} />
                                    {loading ? "Optimizing Profile..." : "Save Professional Details"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .profile-avatar-container:hover {
                    transform: translateY(-5px);
                }
            ` }} />
        </div>
    );
}
