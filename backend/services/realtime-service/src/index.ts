import http from 'http';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { ProjectSocket } from './sockets/ProjectSocket';
import { ChatSocket } from './sockets/ChatSocket';
import { PresenceManager } from './managers/PresenceManager';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Redis setup for both adapter and presence
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

// Presence manager
const presence = new PresenceManager(redisUrl);

async function startServer() {
  try {
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Redis adapter connected');

    await presence.connect();
    console.log('Presence manager connected');

    io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);

      // Initialize handlers with presence
      new ProjectSocket(io, socket, presence);
      new ChatSocket(io, socket);
    });

    const PORT = process.env.PORT || 3004;
    server.listen(PORT, () => {
      console.log(`Realtime service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
