import { Socket } from 'socket.io';
import { Server } from 'socket.io';

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

// Shared state (could be separate from project socket)
const socketToProject: Map<string, string> = new Map(); // socketId -> projectId

export class ChatSocket {
  constructor(private io: Server, private socket: Socket) {
    // Need to know which project this socket is in – we can either get from handshake or listen to join events.
    // For simplicity, we'll assume the client sends projectId with each message.
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('send-message', (message: Omit<Message, 'id' | 'timestamp'>) => {
      // Client must include projectId in message
      const { projectId, ...msg } = message as any;
      if (!projectId) return;

      const fullMessage: Message = {
        ...msg,
        id: `${Date.now()}-${this.socket.id}`,
        timestamp: Date.now(),
      };
      this.io.to(projectId).emit('new-message', fullMessage);
    });

    // Optional: typing indicators
    this.socket.on('typing', ({ projectId, isTyping }: { projectId: string; isTyping: boolean }) => {
      this.socket.to(projectId).emit('user-typing', { userId: this.socket.id, isTyping });
    });
  }
}
