const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server, Socket } = require("socket.io");

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);
const ALLOWED_ORIGINS = "*";

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  credentials: true,
};
app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Get request received on server");
});

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("join-room", (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        throw new Error("Room ID or User ID missing");
      }
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    } catch (error) {
      console.error(`Error in join-room: ${error.message}`);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("toggle-audio", (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        throw new Error("Room ID or User ID missing");
      }
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("toggle-audio", userId);
    } catch (error) {
      console.error(`Error in toggle-audio: ${error.message}`);
      socket.emit("error", { message: "Failed to toggle audio" });
    }
  });

  socket.on("toggle-video", (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        throw new Error("Room ID or User ID missing");
      }
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("toggle-video", userId);
    } catch (error) {
      console.error(`Error in toggle-video: ${error.message}`);
      socket.emit("error", { message: "Failed to toggle video" });
    }
  });

  socket.on("leave", (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        throw new Error("Room ID or User ID missing");
      }
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    } catch (error) {
      console.error(`Error in leave-room: ${error.message}`);
      socket.emit("error", { message: "Failed to leave room" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
