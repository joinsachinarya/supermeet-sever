const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = ["https://super-meet.vercel.app", "http://localhost:3000"];

// Express app setup
const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: ALLOWED_ORIGINS,
  credentials: true
};

app.use(cors(corsOptions));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// Routes
app.get('/', (req, res) => {
  res.send("Hello World");
});

// Socket event handlers
const handleSocketConnection = (socket) => {
  console.log("New user connected", socket.id);

  const handleJoinRoom = (roomId, userId) => {
    try {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    } catch (error) {
      console.error(`Error in join-room: ${error.message}`);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };

  const handleToggleAudio = (roomId, userId) => {
    try {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('toggle-audio', userId);
    } catch (error) {
      console.error(`Error in toggle-audio: ${error.message}`);
      socket.emit('error', { message: 'Failed to toggle audio' });
    }
  };

  const handleToggleVideo = (roomId, userId) => {
    try {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('toggle-video', userId);
    } catch (error) {
      console.error(`Error in toggle-video: ${error.message}`);
      socket.emit('error', { message: 'Failed to toggle video' });
    }
  };

  const handleLeaveRoom = (roomId, userId) => {
    try {
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    } catch (error) {
      console.error(`Error in leave-room: ${error.message}`);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  };

  // Register event listeners
  socket.on('join-room', handleJoinRoom);
  socket.on('toggle-audio', handleToggleAudio);
  socket.on('toggle-video', handleToggleVideo);
  socket.on('leave', handleLeaveRoom);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

io.on("connection", handleSocketConnection);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});