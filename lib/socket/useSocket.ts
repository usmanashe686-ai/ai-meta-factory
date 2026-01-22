import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface SocketEventHandlers {
  onProjectSaved?: (data: any) => void;
  onRemoteSave?: (data: any) => void;
  onVersionCreated?: (version: any) => void;
  onConflict?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onLockAcquired?: (data: any) => void;
  onLockReleased?: (data: any) => void;
}

export function useSocket(handlers: SocketEventHandlers = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      toast.success('Connected to collaboration server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        toast.error('Disconnected from server');
      } else if (reason === 'io client disconnect') {
        toast.info('Disconnected');
      } else {
        toast.warning('Connection lost. Reconnecting...');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      toast.error(`Connection error: ${error.message}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      toast.success('Reconnected to server');
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      toast.error('Failed to reconnect. Please refresh the page.');
    });

    // Setup event handlers
    if (handlers.onProjectSaved) {
      newSocket.on('project:saved', handlers.onProjectSaved);
    }

    if (handlers.onRemoteSave) {
      newSocket.on('project:remote-save', handlers.onRemoteSave);
    }

    if (handlers.onVersionCreated) {
      newSocket.on('version:created', handlers.onVersionCreated);
    }

    if (handlers.onConflict) {
      newSocket.on('project:conflict', handlers.onConflict);
    }

    if (handlers.onUserJoined) {
      newSocket.on('project:user-joined', handlers.onUserJoined);
    }

    if (handlers.onUserLeft) {
      newSocket.on('project:user-left', handlers.onUserLeft);
    }

    if (handlers.onLockAcquired) {
      newSocket.on('project:lock-acquired', handlers.onLockAcquired);
    }

    if (handlers.onLockReleased) {
      newSocket.on('project:lock-released', handlers.onLockReleased);
    }

    setSocket(newSocket);

    return newSocket;
  }, [handlers, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const joinProject = useCallback((projectId: string) => {
    if (socket && isConnected) {
      socket.emit('project:join', projectId);
      console.log('Joined project:', projectId);
    }
  }, [socket, isConnected]);

  const leaveProject = useCallback((projectId: string) => {
    if (socket && isConnected) {
      socket.emit('project:leave', projectId);
      console.log('Left project:', projectId);
    }
  }, [socket, isConnected]);

  const requestLock = useCallback((projectId: string) => {
    if (socket && isConnected) {
      socket.emit('project:lock-request', projectId);
    }
  }, [socket, isConnected]);

  const releaseLock = useCallback((projectId: string) => {
    if (socket && isConnected) {
      socket.emit('project:lock-release', projectId);
    }
  }, [socket, isConnected]);

  const saveProject = useCallback((payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Save timeout'));
      }, 10000);

      socket.emit('project:save', payload);
      socket.once('project:saved', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Save failed'));
        }
      });

      socket.once('project:save-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.error || 'Save failed'));
      });
    });
  }, [socket, isConnected]);

  const getVersions = useCallback((projectId: string, options: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('version:list', projectId, options);
      socket.once('version:list-response', (response) => {
        if (response.success) {
          resolve(response.versions);
        } else {
          reject(new Error(response.error));
        }
      });

      socket.once('version:list-error', (error) => {
        reject(new Error(error.error));
      });
    });
  }, [socket, isConnected]);

  const restoreVersion = useCallback((versionId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('version:restore', versionId);
      socket.once('version:restored', (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });

      socket.once('version:restore-error', (error) => {
        reject(new Error(error.error));
      });
    });
  }, [socket, isConnected]);

  useEffect(() => {
    const socketInstance = connect();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [connect]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinProject,
    leaveProject,
    requestLock,
    releaseLock,
    saveProject,
    getVersions,
    restoreVersion
  };
}
