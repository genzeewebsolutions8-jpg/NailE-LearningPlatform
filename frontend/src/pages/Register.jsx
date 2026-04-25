import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Register() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("student");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            navigate(user.role === "admin" ? "/admin/dashboard" : user.role === "superadmin" ? "/admin/dashboard" : "/student/dashboard");
        }
    }, [user, navigate]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/send-otp", { email });
            setStep(3); // Moving to OTP step
            showToast("Validation code transmitted to your email", "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to initiate verification", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/register", { email, password, fullName, phone, role, otp });
            showToast("Credentials certified! You may now login.", "success");
            navigate("/login");
        } catch (error) {
            showToast(error.response?.data?.message || "Registration authority failed", "error");
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAF9", padding: "2rem" }}>
                <div className="card-premium" style={{ width: "100%", maxWidth: "440px", padding: "3.5rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                        <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary-light)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--primary)" }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>Verify Identity</h2>
                        <p style={{ color: "var(--text-muted)" }}>A 6-digit code was sent to {email}</p>
                    </div>
                    <form onSubmit={handleRegister}>
                        <div className="form-group mb-8">
                            <input
                                type="text"
                                className="form-input text-center"
                                placeholder="Verification Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={{ letterSpacing: "0.5em", fontSize: "1.5rem", fontWeight: "900", height: "64px" }}
                                maxLength={6}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" style={{ padding: "1rem" }} disabled={loading}>
                            {loading ? "Verifying..." : "Finalize Registration"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAF9", padding: "2rem" }}>
            <div className="card-premium" style={{ width: "100%", maxWidth: "600px", padding: "3.5rem" }}>
                
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary-light)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--primary)" }}>
                        <Zap size={28} />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>Join the Elite</h2>
                    <p style={{ color: "var(--text-muted)" }}>Begin your creative evolution at Nail Academy</p>
                </div>

                <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="flex gap-4" style={{ marginBottom: "0.5rem" }}>
                        <RoleCard role="student" active={role === 'student'} onClick={() => setRole('student')} />
                        <RoleCard role="instructor" active={role === 'instructor'} onClick={() => setRole('instructor')} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: "750" }}>Full Name</label>
                        <div style={{ position: "relative" }}>
                            <User size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                            <input type="text" className="form-input" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ paddingLeft: "3rem" }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: "750" }}>Email Address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                            <input type="email" className="form-input" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: "3rem" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750" }}>Phone Number</label>
                            <div style={{ position: "relative" }}>
                                <Phone size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input type="tel" className="form-input" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required style={{ paddingLeft: "3rem" }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750" }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input type="password" className="form-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: "3rem" }} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: "1.125rem", marginTop: "1rem" }} disabled={loading}>
                        {loading ? "Processing..." : "Continue to Verification"} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    Already a member? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "700" }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

function RoleCard({ role, active, onClick }) {
    return (
        <div 
            onClick={onClick}
            style={{ 
                flex: 1, padding: "1rem", borderRadius: "16px", cursor: "pointer", textAlign: "center",
                backgroundColor: active ? "var(--primary-light)" : "white",
                border: `2px solid ${active ? "var(--primary)" : "var(--border-light)"}`,
                transition: "all 0.2s"
            }}
        >
            <p style={{ fontWeight: "800", color: active ? "var(--primary)" : "var(--text-muted)", textTransform: "capitalize" }}>{role}</p>
        </div>
    );
}
