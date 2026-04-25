import React from "react";
import { useSocket } from "../context/SocketContext";
import { Link } from "react-router-dom";
import { Bell, Clock, ExternalLink, Trash2 } from "lucide-react";

export default function NotificationDropdown({ onClose }) {
    const { notifications, markAsRead, clearNotifications } = useSocket();

    const handleClear = (e) => {
        e.stopPropagation();
        clearNotifications();
    };

    return (
        <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.75rem",
            width: "320px",
            backgroundColor: "#1C1C1E",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            overflow: "hidden"
        }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "between", alignItems: "center" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: "white", margin: 0 }}>Notifications</h3>
                <button 
                    onClick={handleClear}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                    <Trash2 size={12} /> Clear all
                </button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                        <Bell size={24} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                        <p style={{ fontSize: "0.85rem", margin: 0 }}>No new notifications</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div key={n.id} style={{ 
                            padding: "1rem", 
                            borderBottom: "1px solid var(--border-color)", 
                            backgroundColor: n.read ? "transparent" : "rgba(197, 139, 134, 0.05)",
                            transition: "background-color 0.2s"
                        }}>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <div style={{ 
                                    width: "32px", height: "32px", borderRadius: "50%", 
                                    backgroundColor: "rgba(239, 68, 68, 0.1)", 
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#EF4444", flexShrink: 0
                                }}>
                                    ●
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.85rem", color: "white", marginBottom: "0.25rem", lineHeight: "1.4" }}>
                                        <strong>{n.instructor}</strong> started a live session: "{n.title}"
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginTop: "0.5rem" }}>
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <Clock size={10} /> {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <Link 
                                            to={`/student/session/${n.sessionId}`} 
                                            onClick={onClose}
                                            style={{ 
                                                fontSize: "0.75rem", color: "var(--primary)", 
                                                textDecoration: "none", fontWeight: "600",
                                                display: "flex", alignItems: "center", gap: "0.2rem"
                                            }}
                                        >
                                            Join <ExternalLink size={10} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {notifications.length > 0 && (
                <div style={{ padding: "0.75rem", textAlign: "center", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <button 
                        onClick={() => { markAsRead(); onClose(); }}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
}
