import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

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

interface CollaborationContextValue {
  socket: Socket | null;
  connected: boolean;
  users: User[];
  messages: Message[];
  currentUser: User | null;
  joinProject: (projectId: string, user: Omit<User, 'id'>) => void;
  sendMessage: (content: string) => void;
  updateCursor: (cursor: { line: number; column: number; file: string }) => void;
  sendCodeChange: (file: string, content: string) => void;
  error: string | null;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  serverUrl = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:3004',
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      if (reason === 'io server disconnect') {
        setError('Disconnected by server');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to collaboration server');
    });

    // User list updates
    newSocket.on('user-list', (userList: User[]) => {
      setUsers(userList);
    });

    newSocket.on('user-joined', (user: User) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    // Cursor updates
    newSocket.on('cursor-updated', ({ userId, cursor }: { userId: string; cursor: User['cursor'] }) => {
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, cursor } : u))
      );
    });

    // Code changes
    newSocket.on('code-changed', ({ file, content, userId }: { file: string; content: string; userId: string }) => {
      // This will be handled by a separate store/hook; we just emit event for now
      // Could trigger a global event or pass to a callback
      window.dispatchEvent(new CustomEvent('remote-code-change', { detail: { file, content, userId } }));
    });

    // Chat messages
    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl]);

  const joinProject = useCallback((projectId: string, user: Omit<User, 'id'>) => {
    if (!socket || !socket.id) return;
    const fullUser = { ...user, id: socket.id };
    setCurrentUser(fullUser);
    socket.emit('join-project', { projectId, user: fullUser });
  }, [socket]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !currentUser) return;
    socket.emit('send-message', {
      userId: currentUser.id,
      userName: currentUser.name,
      content,
    });
  }, [socket, currentUser]);

  const updateCursor = useCallback((cursor: { line: number; column: number; file: string }) => {
    if (!socket || !socket.id) return;
    socket.emit('cursor-update', cursor);
  }, [socket]);

  const sendCodeChange = useCallback((file: string, content: string) => {
    if (!socket || !socket.id) return;
    socket.emit('code-change', { file, content });
  }, [socket]);

  const value: CollaborationContextValue = {
    socket,
    connected,
    users,
    messages,
    currentUser,
    joinProject,
    sendMessage,
    updateCursor,
    sendCodeChange,
    error,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};
