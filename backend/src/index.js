require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Basic MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/game_mod_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('\n[WARNING] MongoDB connection failed:', err.message);
    console.error('[WARNING] The backend server will still run for Socket.io syncing, but data persistence is disabled.\n');
  });

// Sync Endpoint (for offline-sync architecture)
// This accepts { gameState, teams, answers }
app.post('/api/sync', async (req, res) => {
  const data = req.body;
  // Broadcasting the synced state to all clients
  io.emit('stateSynced', data);
  res.status(200).json({ success: true, message: 'Server synced with local state' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
