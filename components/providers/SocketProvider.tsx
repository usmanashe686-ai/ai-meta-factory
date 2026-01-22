'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/lib/socket/useSocket';

interface SocketContextType {
  socket: ReturnType<typeof useSocket>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useSocket({
    onProjectSaved: (data) => {
      console.log('Project saved via socket:', data);
    },
    onVersionCreated: (version) => {
      console.log('New version created:', version);
    },
    onConflict: (data) => {
      console.warn('Conflict detected:', data);
    }
  });

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
