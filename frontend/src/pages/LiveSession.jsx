import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FeedbackModal from "./FeedbackModal";
import {
    ArrowLeft, Mic, MicOff, Video, VideoOff,
    PhoneOff, Send, Users, Maximize2
} from "lucide-react";

const SOCKET_URL = "http://localhost:5001";

export default function LiveSession() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Session info
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Feedback modal
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Room state
    const [inRoom, setInRoom] = useState(false);
    const [peers, setPeers] = useState([]); // [{ socketId, stream, name, role }]
    const [startingSession, setStartingSession] = useState(false);

    // Media controls
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    // Chat
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]); // socket-based in-room chat

    // Refs
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const socketRef = useRef(null);
    const peersRef = useRef({}); // { socketId: SimplePeer }
    const chatEndRef = useRef(null);

    // ── Fetch session info ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get("/live-sessions");
                const sessions = res.data.sessions || res.data;
                const found = sessions.find(s => s._id === id);
                if (!found) throw new Error("Session not found");
                setSession(found);

                // Load REST chat history
                const chatRes = await api.get(`/chat/${id}`);
                setMessages(chatRes.data || []);

                // If session is completed and user is a student, check if feedback is needed
                if (found.status === "completed") {
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    if (currentUser.role === "student") {
                        const checkRes = await api.get(`/feedback/${id}/check`);
                        if (!checkRes.data.submitted) {
                            setShowFeedbackModal(true);
                        }
                    }
                }
            } catch (err) {
                setError("Failed to load session.");
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, messages]);

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            leaveRoom();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Role helpers ─────────────────────────────────────────────────────
    const isAdmin = user?.role === "admin" || user?.role === "superadmin";
    const isAssignedInstructor = session && user?.role === "instructor" &&
        (session.instructorId?._id === user?.id || session.instructorId === user?.id);
    const canStart = isAssignedInstructor && session?.status === "scheduled";
    const canJoin = (isAdmin || isAssignedInstructor || user?.role === "student") &&
        session?.status === "live" && !inRoom;
    const canEnd = (isAdmin || isAssignedInstructor) && session?.status === "live" && inRoom;

    // ── Start Session (instructor marks as live) ──────────────────────────
    const handleStartSession = async () => {
        setStartingSession(true);
        try {
            await api.put(`/live-sessions/${id}/start`);
            setSession(prev => ({ ...prev, status: "live" }));
            await joinRoom();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to start session.", "error");
        } finally {
            setStartingSession(false);
        }
    };

    // ── Join Room ─────────────────────────────────────────────────────────
    const joinRoom = useCallback(async () => {
        // Get camera + mic
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
            showToast("Could not access camera/microphone. Please allow access.", "error");
            return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const token = localStorage.getItem("token");
        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            showToast("Connection error: " + err.message, "error");
        });

        // ── All peers already in room (sent to us on join) ─────────────────
        socket.on("all-peers", (existingPeers) => {
            existingPeers.forEach(({ socketId, name: peerName, role: peerRole }) => {
                const peer = createPeer(socketId, socket, stream, true);
                peersRef.current[socketId] = peer;
                setPeers(prev => [...prev, { socketId, peer, name: peerName, role: peerRole }]);
            });
        });

        // ── Someone new joined ─────────────────────────────────────────────
        socket.on("peer-joined", ({ socketId, name: peerName, role: peerRole }) => {
            const peer = createPeer(socketId, socket, stream, false);
            peersRef.current[socketId] = peer;
            setPeers(prev => [...prev, { socketId, peer, name: peerName, role: peerRole }]);
        });

        // ── Receive offer ──────────────────────────────────────────────────
        socket.on("offer", ({ from, offer }) => {
            const peer = peersRef.current[from];
            if (peer) peer.signal(offer);
        });

        // ── Receive answer ─────────────────────────────────────────────────
        socket.on("answer", ({ from, answer }) => {
            const peer = peersRef.current[from];
            if (peer) peer.signal(answer);
        });

        // ── ICE candidate ──────────────────────────────────────────────────
        socket.on("ice-candidate", ({ from, candidate }) => {
            const peer = peersRef.current[from];
            if (peer) peer.signal(candidate);
        });

        // ── Peer left ─────────────────────────────────────────────────────
        socket.on("peer-left", ({ socketId }) => {
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].destroy();
                delete peersRef.current[socketId];
            }
            setPeers(prev => prev.filter(p => p.socketId !== socketId));
        });

        // ── In-room chat ────────────────────────────────────────────────────
        socket.on("chat-message", (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        // ── Session ended by instructor/admin ──────────────────────────────
        socket.on("session-ended", () => {
            leaveRoom();
            // Update local state so feedback modal triggers
            setSession(prev => ({ ...prev, status: "completed" }));
            // Show feedback modal for students
            if (user?.role === "student") {
                setShowFeedbackModal(true);
            } else {
                showToast("The session has ended.", "info");
                navigate(-1);
            }
        });

        socket.on("error", ({ message }) => {
            showToast(message, "error");
            leaveRoom();
        });

        const instructorId = session.instructorId?._id || session.instructorId;
        socket.emit("join-room", { sessionId: id, instructorId });
        setInRoom(true);
    }, [id, session]);

    // ── Create WebRTC peer ────────────────────────────────────────────────
    const createPeer = (targetSocketId, socket, stream, initiator) => {
        const peer = new SimplePeer({ initiator, stream, trickle: true });

        peer.on("signal", (data) => {
            if (data.type === "offer") {
                socket.emit("offer", { to: targetSocketId, offer: data });
            } else if (data.type === "answer") {
                socket.emit("answer", { to: targetSocketId, answer: data });
            } else {
                socket.emit("ice-candidate", { to: targetSocketId, candidate: data });
            }
        });

        peer.on("stream", (remoteStream) => {
            setPeers(prev => prev.map(p =>
                p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p
            ));
        });

        peer.on("error", (err) => console.error("Peer error:", err));

        return peer;
    };

    // ── Leave / End room ──────────────────────────────────────────────────
    const leaveRoom = useCallback(() => {
        Object.values(peersRef.current).forEach(p => p.destroy());
        peersRef.current = {};
        setPeers([]);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setInRoom(false);
    }, []);

    const handleEndSession = async () => {
        if (!window.confirm("End this session for everyone?")) return;
        socketRef.current?.emit("end-session", { sessionId: id });
        await api.put(`/live-sessions/${id}/stop`).catch(() => { });
        setSession(prev => ({ ...prev, status: "completed" }));
        leaveRoom();
    };

    // ── Mic / Camera toggles ──────────────────────────────────────────────
    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
    };
    const toggleCam = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
    };

    // ── In-room chat send ─────────────────────────────────────────────────
    const sendRoomMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;
        const msg = { text: newMessage, sender: user?.name || "You", self: true, time: new Date() };
        socketRef.current.emit("chat-message", { sessionId: id, text: newMessage, sender: user?.name });
        setChatMessages(prev => [...prev, msg]);
        setNewMessage("");
    };

    // Also save to REST chat
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await api.post(`/chat/${id}`, { message: newMessage }).catch(() => { });
        sendRoomMessage(e);
    };

    // ── Render ────────────────────────────────────────────────────────────
    if (loading) return <div className="container mt-8 text-center text-muted">Loading session...</div>;
    if (error || !session) return (
        <div className="container mt-8 text-center">
            <p style={{ color: "var(--danger)" }}>{error || "Session not found."}</p>
            <Link to="/" className="btn btn-outline mt-4">Go Back</Link>
        </div>
    );

    return (
        <div className="container mt-8" style={{ paddingBottom: "4rem" }}>
            <Link to={isAdmin ? "/super-admin" : "/student/dashboard"}
                className="btn btn-outline flex items-center gap-2 mb-6"
                style={{ width: "fit-content" }}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>

                {/* ── Left: Video Area ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Session info header */}
                    <div className="card" style={{ padding: "1.25rem" }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>{session.title}</h2>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    {session.topic && <span>🏷 {session.topic} &nbsp;·&nbsp; </span>}
                                    Instructor: {session.instructorId?.firstName} {session.instructorId?.lastName}
                                    &nbsp;·&nbsp; {new Date(session.sessionDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                            </div>
                            <span style={{
                                padding: "0.3rem 0.85rem", borderRadius: "99px", fontWeight: "700",
                                fontSize: "0.75rem", textTransform: "uppercase",
                                backgroundColor: session.status === "live" ? "#fee2e2" : session.status === "completed" ? "#d1fae5" : "var(--border-color)",
                                color: session.status === "live" ? "#ef4444" : session.status === "completed" ? "#059669" : "var(--text-muted)",
                            }}>
                                {session.status === "live" && <span style={{ marginRight: "4px" }}>●</span>}
                                {session.status}
                            </span>
                        </div>
                    </div>

                    {/* ── Video grid ── */}
                    {inRoom ? (
                        <>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: peers.length === 0 ? "1fr" : peers.length <= 1 ? "1fr 1fr" : "repeat(3, 1fr)",
                                gap: "0.75rem",
                            }}>
                                {/* Local video */}
                                <VideoTile
                                    videoRef={localVideoRef}
                                    label={`${user?.name || "You"} (You)`}
                                    muted
                                    camOn={camOn}
                                />
                                {/* Remote peers */}
                                {peers.map((p) => (
                                    <RemoteTile key={p.socketId} peer={p} />
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="card" style={{ padding: "1rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                                <ControlBtn onClick={toggleMic} active={micOn} icon={micOn ? <Mic size={20} /> : <MicOff size={20} />} label={micOn ? "Mute" : "Unmute"} />
                                <ControlBtn onClick={toggleCam} active={camOn} icon={camOn ? <Video size={20} /> : <VideoOff size={20} />} label={camOn ? "Stop Cam" : "Start Cam"} />
                                <ControlBtn onClick={leaveRoom} danger icon={<PhoneOff size={20} />} label="Leave" />
                                {canEnd && (
                                    <ControlBtn onClick={handleEndSession} danger icon={<PhoneOff size={20} />} label="End for All" />
                                )}
                            </div>
                        </>
                    ) : (
                        /* ── Not in room yet: waiting screen ── */
                        <div className="card" style={{
                            minHeight: "320px", display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: "1.25rem",
                            backgroundColor: "rgba(0,0,0,0.4)"
                        }}>
                            {session.status === "completed" ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>This session has ended.</p>
                            ) : session.status === "scheduled" ? (
                                <>
                                    <div style={{ fontSize: "3rem" }}>📅</div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "1rem", textAlign: "center" }}>
                                        Session is <strong>scheduled</strong> for<br />
                                        {new Date(session.sessionDate).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                                    </p>
                                    {canStart && (
                                        <button className="btn btn-primary"
                                            style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
                                            onClick={handleStartSession}
                                            disabled={startingSession}>
                                            {startingSession ? "Starting..." : "🎬 Start Session"}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: "3rem" }}>🔴</div>
                                    <p style={{ color: "white", fontSize: "1.1rem", fontWeight: "600" }}>Session is Live!</p>
                                    {canJoin && (
                                        <button className="btn btn-primary"
                                            style={{ padding: "0.75rem 2.5rem", fontSize: "1.1rem" }}
                                            onClick={joinRoom}>
                                            Join Session
                                        </button>
                                    )}
                                    {!canJoin && user?.role === "student" && (
                                        <p style={{ color: "var(--text-muted)" }}>You must be enrolled to join this session.</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: Chat ── */}
                <div className="card flex" style={{ flexDirection: "column", height: "600px" }}>
                    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <Users size={16} color="var(--primary)" />
                        <h3 style={{ fontSize: "1rem", margin: 0 }}>
                            Live Chat {inRoom && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({peers.length + 1} in room)</span>}
                        </h3>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        {(inRoom ? chatMessages : messages).length === 0 ? (
                            <p className="text-center text-muted" style={{ margin: "auto" }}>No messages yet. Say hi! 👋</p>
                        ) : (inRoom ? chatMessages : messages).map((msg, i) => {
                            const isMe = inRoom ? msg.self : (msg.user?._id === user?.id || msg.user === user?.id);
                            return (
                                <div key={i} style={{
                                    alignSelf: isMe ? "flex-end" : "flex-start",
                                    maxWidth: "85%",
                                    backgroundColor: isMe ? "var(--primary)" : "var(--border-color)",
                                    padding: "0.5rem 0.85rem",
                                    borderRadius: "12px",
                                    borderBottomRightRadius: isMe ? "2px" : "12px",
                                    borderBottomLeftRadius: isMe ? "12px" : "2px",
                                }}>
                                    {!isMe && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                                        {inRoom ? msg.sender : (msg.user?.name || "User")}
                                    </p>}
                                    <p style={{ fontSize: "0.875rem" }}>{inRoom ? msg.text : msg.message}</p>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={inRoom ? handleSendMessage : async (e) => {
                        e.preventDefault();
                        await api.post(`/chat/${id}`, { message: newMessage });
                        const chatRes = await api.get(`/chat/${id}`);
                        setMessages(chatRes.data);
                        setNewMessage("");
                    }} className="flex gap-2">
                        <input type="text" className="form-input" placeholder="Type a message..."
                            value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem" }}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Mandatory Feedback Modal for students once session completes */}
            {showFeedbackModal && session && (
                <FeedbackModal
                    sessionId={id}
                    instructorName={`${session.instructorId?.firstName || ""} ${session.instructorId?.lastName || ""}`}
                    onSubmitted={() => {
                        setShowFeedbackModal(false);
                        navigate("/student/sessions");
                    }}
                />
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function VideoTile({ videoRef, label, muted, camOn = true }) {
    return (
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", backgroundColor: "#111", aspectRatio: "4/3" }}>
            <video ref={videoRef} autoPlay playsInline muted={muted}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: camOn ? "block" : "none" }} />
            {!camOn && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "white" }}>
                        {label?.[0]?.toUpperCase() || "?"}
                    </div>
                </div>
            )}
            <div style={{ position: "absolute", bottom: "0.5rem", left: "0.5rem", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "white" }}>
                {label}
            </div>
        </div>
    );
}

function RemoteTile({ peer }) {
    const ref = useRef(null);

    useEffect(() => {
        if (peer.stream && ref.current) {
            ref.current.srcObject = peer.stream;
        }
    }, [peer.stream]);

    return (
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", backgroundColor: "#111", aspectRatio: "4/3" }}>
            {peer.stream ? (
                <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "white" }}>
                        {peer.name?.[0]?.toUpperCase() || "?"}
                    </div>
                </div>
            )}
            <div style={{ position: "absolute", bottom: "0.5rem", left: "0.5rem", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "white" }}>
                {peer.name} {peer.role === "instructor" ? "👩‍🏫" : peer.role === "admin" ? "⚙️" : ""}
            </div>
        </div>
    );
}

function ControlBtn({ onClick, active = true, danger, icon, label }) {
    return (
        <button onClick={onClick} title={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
            padding: "0.6rem 1rem", borderRadius: "10px", border: "none", cursor: "pointer",
            backgroundColor: danger ? "#ef4444" : active ? "var(--bg-pink-light)" : "var(--border-color)",
            color: danger ? "white" : active ? "var(--primary)" : "var(--text-muted)",
            fontSize: "0.7rem", fontWeight: "600", minWidth: "60px",
            transition: "all 0.15s ease",
        }}>
            {icon}
            {label}
        </button>
    );
}
