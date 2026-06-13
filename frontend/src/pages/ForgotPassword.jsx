import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, KeyRound, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // 1 = request reset OTP, 2 = reset password
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    // Step 1: Request Password Reset Code
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { data } = await api.post("/auth/forgot-password", { email });
            showToast(data.message || "Reset code sent to your email.", "success");
            setStep(2); // Go to next step
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to send reset code", "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password with OTP Code
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword) {
            showToast("Please fill all fields.", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        if (newPassword.length < 4) {
            showToast("Password should be at least 4 characters long.", "error");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
            });
            showToast(data.message || "Password reset successful!", "success");
            navigate("/login");
        } catch (error) {
            showToast(error.response?.data?.message || "Password reset failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAF9", padding: "2rem" }}>
            <div className="card-premium" style={{ width: "100%", maxWidth: "440px", padding: "3.5rem" }}>
                
                {/* Back button to Login */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "none", fontWeight: "600" }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>

                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary-light)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--primary)" }}>
                        {step === 1 ? <KeyRound size={28} /> : <ShieldCheck size={28} />}
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>
                        {step === 1 ? "Forgot Password" : "Reset Password"}
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        {step === 1 
                            ? "Enter your email address to receive a 6-digit reset code"
                            : "Enter the code sent to your email and set your new password"
                        }
                    </p>
                </div>

                {step === 1 ? (
                    /* Step 1 Form */
                    <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: "3rem" }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" style={{ padding: "1rem", marginTop: "0.5rem" }} disabled={loading}>
                            {loading ? "Sending Code..." : "Send Verification Code"} <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    /* Step 2 Form */
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>Verification Code</label>
                            <div style={{ position: "relative" }}>
                                <KeyRound size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    style={{ paddingLeft: "3rem", letterSpacing: "2px", fontWeight: "700" }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>New Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Minimum 4 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={{ paddingLeft: "3rem" }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: "750", color: "var(--text-main)" }}>Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={18} style={{ position: "absolute", left: "1.125rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{ paddingLeft: "3rem" }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" style={{ padding: "1rem", marginTop: "0.5rem" }} disabled={loading}>
                            {loading ? "Resetting Password..." : "Reset Password"} <ArrowRight size={18} />
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setStep(1)} 
                            className="btn btn-outline w-full" 
                            style={{ padding: "1rem" }}
                            disabled={loading}
                        >
                            Request New Code
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
