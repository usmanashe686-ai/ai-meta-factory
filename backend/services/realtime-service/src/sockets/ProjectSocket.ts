import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { PresenceManager, User } from '../managers/PresenceManager';

export class ProjectSocket {
  constructor(
    private io: Server,
    private socket: Socket,
    private presence: PresenceManager
  ) {
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('join-project', async ({ projectId, user }: { projectId: string; user: Omit<User, 'id'> }) => {
      const fullUser: User = { ...user, id: this.socket.id };
      
      // Join Socket.IO room
      this.socket.join(projectId);
      
      // Store in Redis presence
      await this.presence.addUser(projectId, this.socket.id, user);

      // Broadcast updated user list
      await this.broadcastUserList(projectId);

      // Notify others that user joined
      this.socket.to(projectId).emit('user-joined', fullUser);
    });

    this.socket.on('cursor-update', async (cursor: { line: number; column: number; file: string }) => {
      const projectId = this.getProjectId();
      if (!projectId) return;

      await this.presence.updateUserCursor(projectId, this.socket.id, cursor);
      
      // Broadcast to others
      this.socket.to(projectId).emit('cursor-updated', { userId: this.socket.id, cursor });
    });

    this.socket.on('code-change', ({ file, content }: { file: string; content: string }) => {
      const projectId = this.getProjectId();
      if (projectId) {
        this.socket.to(projectId).emit('code-changed', { file, content, userId: this.socket.id });
      }
    });

    this.socket.on('disconnect', async () => {
      const projectId = this.getProjectId();
      if (projectId) {
        await this.presence.removeUser(projectId, this.socket.id);
        await this.broadcastUserList(projectId);
        this.socket.to(projectId).emit('user-left', this.socket.id);
      }
    });
  }

  private getProjectId(): string | null {
    // Get the first room the socket is in (since we only join one project)
    const rooms = Array.from(this.socket.rooms).filter(room => room !== this.socket.id);
    return rooms.length > 0 ? rooms[0] : null;
  }

  private async broadcastUserList(projectId: string) {
    const users = await this.presence.getUsers(projectId);
    this.io.to(projectId).emit('user-list', users);
  }
}
