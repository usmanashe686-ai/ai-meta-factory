import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export interface User {
  id: string;
  name: string;
  color?: string;
  cursor?: { line: number; column: number; file: string };
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export class RealtimeService {
  private io: SocketServer;
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private rooms: Map<string, Set<string>> = new Map(); // projectId -> set of userIds
  private users: Map<string, User> = new Map(); // socketId -> User
  private socketToProject: Map<string, string> = new Map(); // socketId -> projectId

  constructor(server: HttpServer, redisUrl: string = 'redis://localhost:6379') {
    this.io = new SocketServer(server, {
      cors: { origin: '*' }, // configure appropriately in production
    });

    // Redis clients for pub/sub (scaling)
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = this.pubClient.duplicate();

    this.setupRedis();
    this.setupSocketHandlers();
  }

  private async setupRedis() {
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    this.io.adapter(createAdapter(this.pubClient, this.subClient));
    console.log('Redis adapter connected');
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Join a project room
      socket.on('join-project', ({ projectId, user }: { projectId: string; user: User }) => {
        socket.join(projectId);
        this.socketToProject.set(socket.id, projectId);
        this.users.set(socket.id, { ...user, id: socket.id });

        if (!this.rooms.has(projectId)) {
          this.rooms.set(projectId, new Set());
        }
        this.rooms.get(projectId)!.add(socket.id);

        // Broadcast updated user list
        this.broadcastUserList(projectId);

        // Notify others that user joined
        socket.to(projectId).emit('user-joined', user);
      });

      // Cursor update
      socket.on('cursor-update', (cursor: { line: number; column: number; file: string }) => {
        const user = this.users.get(socket.id);
        if (user) {
          user.cursor = cursor;
          const projectId = this.socketToProject.get(socket.id);
          if (projectId) {
            socket.to(projectId).emit('cursor-updated', { userId: socket.id, cursor });
          }
        }
      });

      // Code change
      socket.on('code-change', ({ file, content }: { file: string; content: string }) => {
        const projectId = this.socketToProject.get(socket.id);
        if (projectId) {
          // Broadcast to others in room (excluding sender)
          socket.to(projectId).emit('code-changed', { file, content, userId: socket.id });
        }
      });

      // Chat message
      socket.on('send-message', (message: Omit<Message, 'id' | 'timestamp'>) => {
        const projectId = this.socketToProject.get(socket.id);
        if (projectId) {
          const fullMessage: Message = {
            ...message,
            id: `${Date.now()}-${socket.id}`,
            timestamp: Date.now(),
          };
          this.io.to(projectId).emit('new-message', fullMessage);
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const projectId = this.socketToProject.get(socket.id);
        if (projectId) {
          this.rooms.get(projectId)?.delete(socket.id);
          this.socketToProject.delete(socket.id);
          this.users.delete(socket.id);
          this.broadcastUserList(projectId);
          socket.to(projectId).emit('user-left', socket.id);
        }
      });
    });
  }

  private broadcastUserList(projectId: string) {
    const userIds = Array.from(this.rooms.get(projectId) || []);
    const usersList = userIds.map(id => this.users.get(id)).filter(Boolean);
    this.io.to(projectId).emit('user-list', usersList);
  }

  // API to get active users (optional)
  getActiveUsers(projectId: string): User[] {
    const userIds = this.rooms.get(projectId) || new Set();
    return Array.from(userIds).map(id => this.users.get(id)).filter(Boolean);
  }
}
