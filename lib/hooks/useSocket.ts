'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketMessage {
  type: 'system' | 'user'
  text: string
  timestamp: number
}

interface User {
  id: string
  name: string
  color: string
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: number
}

export const useSocket = (projectId: string, userId: string, userName: string, userColor: string) => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Connect to socket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    try {
      // For development on Termux, use localhost
      const socket = io('http://localhost:3001', {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('🟢 Socket connected:', socket.id)
        setIsConnected(true)
        setConnectionError(null)

        // Join project room
        socket.emit('join-project', {
          projectId,
          userId,
          userName,
          userColor
        })
      })

      socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected')
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message)
        setConnectionError(error.message)
      })

      // Listen for user list updates
      socket.on('user-list', (userList: User[]) => {
        console.log('👥 User list updated:', userList)
        setUsers(userList)
      })

      // Listen for new messages
      socket.on('new-message', (message: ChatMessage) => {
        console.log('💬 New message:', message)
        setMessages(prev => [...prev, message])
      })

      // Listen for system messages
      socket.on('message', (message: SocketMessage) => {
        console.log('📨 System message:', message)
        // Convert system message to chat message
        setMessages(prev => [...prev, {
          id: `sys_${message.timestamp}`,
          userId: 'system',
          userName: 'System',
          text: message.text,
          timestamp: message.timestamp
        }])
      })

      // Listen for component updates from others
      socket.on('component-added', (component) => {
        console.log('➕ Component added by other user:', component)
        // This will be handled by the store
      })

      socket.on('component-updated', ({ componentId, updates }) => {
        console.log('🔄 Component updated by other user:', componentId, updates)
        // This will be handled by the store
      })

      socket.on('component-deleted', (componentId) => {
        console.log('🗑️ Component deleted by other user:', componentId)
        // This will be handled by the store
      })

      socket.on('cursor-moved', ({ userId, cursor }) => {
        console.log('🎯 Cursor moved by user:', userId, cursor)
        // This will be handled by the store
      })

      socket.on('project-saved', ({ timestamp }) => {
        console.log('💾 Project saved by other user at:', new Date(timestamp).toLocaleTimeString())
      })

    } catch (error) {
      console.error('❌ Failed to initialize socket:', error)
      setConnectionError('Failed to initialize connection')
    }
  }, [projectId, userId, userName, userColor])

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-project', { projectId, userId, userName })
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [projectId, userId, userName])

  // Send component update
  const sendComponentUpdate = useCallback((componentId: string, updates: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update-component', { projectId, componentId, updates })
    }
  }, [projectId])

  // Add component
  const sendAddComponent = useCallback((component: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('add-component', { projectId, component })
    }
  }, [projectId])

  // Delete component
  const sendDeleteComponent = useCallback((componentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('delete-component', { projectId, componentId })
    }
  }, [projectId])

  // Move cursor
  const sendCursorMove = useCallback((cursor: { x: number; y: number }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('move-cursor', { projectId, userId, cursor })
    }
  }, [projectId, userId])

  // Send chat message
  const sendMessage = useCallback((text: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send-message', { projectId, userId, userName, text })
    }
  }, [projectId, userId, userName])

  // Save project
  const sendSaveProject = useCallback((components: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('save-project', { projectId, components })
    }
  }, [projectId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    users,
    messages,
    connectionError,
    connect,
    disconnect,
    sendComponentUpdate,
    sendAddComponent,
    sendDeleteComponent,
    sendCursorMove,
    sendMessage,
    sendSaveProject
  }
}
