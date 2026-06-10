import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            navigate(user.role === "admin" ? "/admin/dashboard" : user.role === "superadmin" ? "/admin/dashboard" : "/student/dashboard");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data.user, data.token);
            showToast(`Authentication Successful. Welcome, ${data.user.name || data.user.email?.split('@')[0] || "User"}`, "success");
            navigate(data.user.role === "admin" ? "/admin/dashboard" : data.user.role === "superadmin" ? "/admin/dashboard" : "/student/dashboard");
        } catch (error) {
            showToast(error.response?.data?.message || "Invalid credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAF9", padding: "2rem" }}>
            <div className="card-premium" style={{ width: "100%", maxWidth: "440px", padding: "3.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary-light)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--primary)" }}>
                        <Lock size={28} />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>Welcome Back</h2>
                    <p style={{ color: "var(--text-muted)" }}>Access your professional academy portal</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>Email Address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>Password</label>
                            <Link to="#" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "700" }}>Forgot Access?</Link>
                        </div>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: "1rem", marginTop: "1rem" }} disabled={loading}>
                        {loading ? "Authenticating..." : "Sign Into Portal"} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    New to the academy? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>Create an Account</Link>
                </p>
            </div>
        </div>
    );
}
