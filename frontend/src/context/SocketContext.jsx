import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const SocketContext = createContext();

const SOCKET_URL = "http://localhost:5001"; // Match backend SOCKET_URL

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [notifications, setNotifications] = React.useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && user.token) {
            // Initialize global notification socket
            const socket = io(SOCKET_URL, {
                auth: { token: user.token }
            });

            socketRef.current = socket;

            socket.on("session-started", (data) => {
                const newNotification = {
                    id: Date.now(),
                    type: "session",
                    title: data.title,
                    instructor: data.instructor,
                    sessionId: data.id,
                    time: new Date(),
                    read: false
                };

                setNotifications(prev => [newNotification, ...prev].slice(0, 10));

                showToast(
                    `🔴 Live Now: "${data.title}" by ${data.instructor}. Join now!`,
                    "info",
                    10000 // Show for 10 seconds
                );
            });

            socket.on("connect_error", (err) => {
                console.error("Global Socket Connection Error:", err.message);
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
    }, [user, showToast]);

    const markAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <SocketContext.Provider value={{ 
            socket: socketRef.current, 
            notifications, 
            markAsRead, 
            clearNotifications,
            unreadCount: notifications.filter(n => !n.read).length
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
