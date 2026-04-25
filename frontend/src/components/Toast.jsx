import React from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const toastStyles = {
    success: {
        bg: "#D1FAE5",
        color: "#065F46",
        border: "#10B981",
        icon: CheckCircle
    },
    error: {
        bg: "#FEE2E2",
        color: "#991B1B",
        border: "#EF4444",
        icon: XCircle
    },
    warning: {
        bg: "#FEF3C7",
        color: "#92400E",
        border: "#F59E0B",
        icon: AlertCircle
    },
    info: {
        bg: "#DBEAFE",
        color: "#1E40AF",
        border: "#3B82F6",
        icon: Info
    }
};

export default function Toast({ message, type, onClose }) {
    const style = toastStyles[type] || toastStyles.info;
    const Icon = style.icon;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            backgroundColor: style.bg,
            color: style.color,
            borderLeft: `5px solid ${style.border}`,
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            minWidth: "300px",
            maxWidth: "450px",
            pointerEvents: "auto",
            animation: "slideIn 0.3s ease-out forwards",
            position: "relative"
        }}>
            <Icon size={20} />
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", flex: 1 }}>{message}</p>
            <button 
                onClick={onClose}
                style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.7
                }}
            >
                <X size={16} />
            </button>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
