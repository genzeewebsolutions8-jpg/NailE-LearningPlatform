const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.set("io", io);

// Serve static uploaded files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("Nail E-Learning Backend is running 🚀");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/live-sessions", require("./routes/liveSessionRoutes"));
app.use("/api/videos", require("./routes/preRecordedVideoRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/chat", require("./routes/liveChatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/landing-video", require("./routes/landingVideoRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));

// ─── Socket.io Live Session Signaling ──────────────────────────────────────
// roomPeers: { sessionId: [ { socketId, userId, name, role } ] }
const roomPeers = {};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: no token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("firstName lastName role enrolledSessions");
    if (!user) return next(new Error("Authentication error: user not found"));
    socket.user = {
      id: decoded.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
      enrolledSessions: user.enrolledSessions?.map(s => s.toString()) || [],
    };
    next();
  } catch (err) {
    next(new Error("Authentication error: invalid token"));
  }
});

io.on("connection", (socket) => {
  const { id: userId, name, role, enrolledSessions } = socket.user;

  // ── join-room ──────────────────────────────────────────────────────────────
  socket.on("join-room", ({ sessionId, instructorId }) => {
    const isAdmin = role === "admin" || role === "superadmin";
    const isInstructor = role === "instructor" && userId === instructorId;
    const isEnrolledStudent = role === "student" && enrolledSessions.includes(sessionId);

    if (!isAdmin && !isInstructor && !isEnrolledStudent) {
      socket.emit("error", { message: "You are not authorized to join this session." });
      return;
    }

    socket.join(sessionId);

    if (!roomPeers[sessionId]) roomPeers[sessionId] = [];

    // Tell this new peer about everyone already in the room
    const existingPeers = roomPeers[sessionId].filter(p => p.socketId !== socket.id);
    socket.emit("all-peers", existingPeers);

    // Tell everyone else in the room about this new peer
    socket.to(sessionId).emit("peer-joined", {
      socketId: socket.id,
      userId,
      name,
      role,
    });

    roomPeers[sessionId].push({ socketId: socket.id, userId, name, role });
    socket.currentRoom = sessionId;
    console.log(`[WS] ${name} (${role}) joined room ${sessionId}`);
  });

  // ── WebRTC signaling relay ─────────────────────────────────────────────────
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // ── end-session (instructor / admin) ────────────────────────────────────────
  socket.on("end-session", ({ sessionId }) => {
    const isAdmin = role === "admin" || role === "superadmin";
    const isInstructor = role === "instructor";
    if (!isAdmin && !isInstructor) return;
    io.to(sessionId).emit("session-ended");
    delete roomPeers[sessionId];
    console.log(`[WS] Session ${sessionId} ended by ${name}`);
  });

  // ── disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const sessionId = socket.currentRoom;
    if (sessionId && roomPeers[sessionId]) {
      roomPeers[sessionId] = roomPeers[sessionId].filter(p => p.socketId !== socket.id);
      socket.to(sessionId).emit("peer-left", { socketId: socket.id });
    }
    console.log(`[WS] ${name} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});