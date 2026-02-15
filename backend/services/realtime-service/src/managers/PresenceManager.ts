import { createClient, RedisClientType } from 'redis';

export interface User {
  id: string;
  name: string;
  color?: string;
  cursor?: { line: number; column: number; file: string };
}

export class PresenceManager {
  private pubClient: RedisClientType;
  private subClient: RedisClientType;

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = this.pubClient.duplicate();
  }

  async connect() {
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    console.log('PresenceManager connected to Redis');
  }

  async disconnect() {
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
  }

  // User presence in a project
  async addUser(projectId: string, socketId: string, user: Omit<User, 'id'>) {
    const key = `project:${projectId}:users`;
    const userData = JSON.stringify({ ...user, id: socketId });
    await this.pubClient.hSet(key, socketId, userData);
    // Set expiry on the hash (e.g., 1 hour) to clean up stale entries if not removed on disconnect
    await this.pubClient.expire(key, 3600);
  }

  async updateUserCursor(projectId: string, socketId: string, cursor: User['cursor']) {
    const key = `project:${projectId}:users`;
    const userJson = await this.pubClient.hGet(key, socketId);
    if (userJson) {
      const user = JSON.parse(userJson);
      user.cursor = cursor;
      await this.pubClient.hSet(key, socketId, JSON.stringify(user));
    }
  }

  async removeUser(projectId: string, socketId: string) {
    const key = `project:${projectId}:users`;
    await this.pubClient.hDel(key, socketId);
  }

  async getUsers(projectId: string): Promise<User[]> {
    const key = `project:${projectId}:users`;
    const usersMap = await this.pubClient.hGetAll(key);
    return Object.values(usersMap).map(val => JSON.parse(val));
  }

  // Room management (for Socket.IO rooms we still use io.sockets.adapter.rooms, but we might also track in Redis for cross-instance awareness)
  // For now, we can rely on Socket.IO's built-in room with Redis adapter; this is just extra.
}
