const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app);

// Use CORS middleware
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
// Relay signaling messages
socket.on('signal', (data) => {

  const { targetId, signalData } = data;
  io.to(targetId).emit('signal', {
    fromId: socket.id,
    signalData,
  });
  if (signalData.type === 'decline') {
    console.log("socket.id of the caller", data.targetId, "signal data type is ", signalData.type)
    io.to(data.targetId).emit('signal', { fromId: data.targetId, signalData});
  }
});


  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3002, () => {
  console.log('Server is running on port 3002');
});
