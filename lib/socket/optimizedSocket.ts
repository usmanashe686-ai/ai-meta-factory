import { io, Socket } from 'socket.io-client';

interface ConnectionPool {
  [key: string]: Socket;
}

class SocketManager {
  private static instance: SocketManager;
  private connections: ConnectionPool = {};
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  private constructor() {}
  
  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }
  
  connect(namespace: string, options: any = {}): Socket {
    // Return existing connection if available
    if (this.connections[namespace]) {
      return this.connections[namespace];
    }
    
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(`${url}/${namespace}`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      ...options,
    });
    
    // Store connection
    this.connections[namespace] = socket;
    
    // Setup event handlers
    this.setupEventHandlers(socket, namespace);
    
    return socket;
  }
  
  private setupEventHandlers(socket: Socket, namespace: string) {
    socket.on('connect', () => {
      console.log(`✅ Socket connected to ${namespace}`);
      this.reconnectAttempts.set(namespace, 0);
      
      // Emit connection metrics
      socket.emit('connection-metrics', {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        namespace,
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected from ${namespace}:`, reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error(`⚠️ Socket connection error to ${namespace}:`, error);
      
      const attempts = this.reconnectAttempts.get(namespace) || 0;
      this.reconnectAttempts.set(namespace, attempts + 1);
      
      if (attempts >= this.maxReconnectAttempts) {
        console.warn(`Max reconnection attempts reached for ${namespace}`);
      }
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber} for ${namespace}`);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected to ${namespace} after ${attemptNumber} attempts`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error(`❌ Failed to reconnect to ${namespace}`);
    });
    
    // Ping/Pong for connection health
    setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', Date.now());
      }
    }, 30000);
    
    socket.on('pong', (latency) => {
      const roundTrip = Date.now() - latency;
      console.log(`📡 Socket latency to ${namespace}: ${roundTrip}ms`);
    });
  }
  
  disconnect(namespace: string): void {
    if (this.connections[namespace]) {
      this.connections[namespace].disconnect();
      delete this.connections[namespace];
      this.reconnectAttempts.delete(namespace);
    }
  }
  
  disconnectAll(): void {
    Object.keys(this.connections).forEach(namespace => {
      this.disconnect(namespace);
    });
  }
  
  getConnection(namespace: string): Socket | undefined {
    return this.connections[namespace];
  }
  
  isConnected(namespace: string): boolean {
    return this.connections[namespace]?.connected || false;
  }
  
  getConnectionStats(): Array<{ namespace: string; connected: boolean }> {
    return Object.entries(this.connections).map(([namespace, socket]) => ({
      namespace,
      connected: socket.connected,
    }));
  }
  
  // Batch emit for optimization
  batchEmit(namespace: string, events: Array<{ event: string; data: any }>, delay = 50): void {
    const socket = this.connections[namespace];
    if (!socket) return;
    
    events.forEach(({ event, data }, index) => {
      setTimeout(() => {
        if (socket.connected) {
          socket.emit(event, data);
        }
      }, index * delay);
    });
  }
  
  // Debounced emit
  createDebouncedEmit(namespace: string, event: string, delay = 100) {
    const socket = this.connections[namespace];
    if (!socket) return () => {};
    
    let timeout: NodeJS.Timeout;
    
    return (data: any) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (socket.connected) {
          socket.emit(event, data);
        }
      }, delay);
    };
  }
}

export const socketManager = SocketManager.getInstance();

// Hook for React components
export const useOptimizedSocket = (namespace: string, options?: any) => {
  return socketManager.connect(namespace, options);
};
