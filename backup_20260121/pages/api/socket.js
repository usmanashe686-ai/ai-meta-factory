import { Server } from 'socket.io'
import { createServer } from 'http'
import { parse } from 'url'

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')
    
    const httpServer = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('Socket.io server')
    })
    
    const io = new Server(httpServer, {
      path: '/api/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    
    // Store project rooms
    const projectRooms = new Map()
    
    io.on('connection', (socket) => {
      console.log(`🟢 User connected: ${socket.id}`)
      
      // Join a project room
      socket.on('join-project', ({ projectId, userId, userName, userColor }) => {
        socket.join(projectId)
        console.log(`👤 ${userName} (${userId}) joined project: ${projectId}`)
        
        // Add user to room
        if (!projectRooms.has(projectId)) {
          projectRooms.set(projectId, new Map())
        }
        const room = projectRooms.get(projectId)
        room.set(userId, { id: userId, name: userName, color: userColor, socketId: socket.id })
        
        // Send updated user list to everyone in room
        const users = Array.from(room.values()).map(({ id, name, color }) => ({ id, name, color }))
        io.to(projectId).emit('user-list', users)
        
        // Welcome message
        socket.emit('message', {
          type: 'system',
          text: `Welcome to project ${projectId}!`,
          timestamp: Date.now()
        })
        
        // Notify others
        socket.to(projectId).emit('message', {
          type: 'system',
          text: `${userName} joined the project`,
          timestamp: Date.now()
        })
      })
      
      // Handle component updates
      socket.on('update-component', ({ projectId, componentId, updates }) => {
        console.log(`🔄 Component updated: ${componentId}`)
        socket.to(projectId).emit('component-updated', { componentId, updates })
      })
      
      // Handle new component
      socket.on('add-component', ({ projectId, component }) => {
        console.log(`➕ Component added: ${component.id}`)
        socket.to(projectId).emit('component-added', component)
      })
      
      // Handle component deletion
      socket.on('delete-component', ({ projectId, componentId }) => {
        console.log(`🗑️ Component deleted: ${componentId}`)
        socket.to(projectId).emit('component-deleted', componentId)
      })
      
      // Handle cursor movement
      socket.on('move-cursor', ({ projectId, userId, cursor }) => {
        socket.to(projectId).emit('cursor-moved', { userId, cursor })
      })
      
      // Handle chat messages
      socket.on('send-message', ({ projectId, userId, userName, text }) => {
        const message = {
          id: Date.now().toString(),
          userId,
          userName,
          text,
          timestamp: Date.now()
        }
        console.log(`💬 ${userName}: ${text}`)
        io.to(projectId).emit('new-message', message)
      })
      
      // Handle project save
      socket.on('save-project', ({ projectId, components }) => {
        console.log(`💾 Project saved: ${projectId} (${components.length} components)`)
        socket.to(projectId).emit('project-saved', { timestamp: Date.now() })
      })
      
      // Handle user leaving
      socket.on('leave-project', ({ projectId, userId, userName }) => {
        socket.leave(projectId)
        
        if (projectRooms.has(projectId)) {
          const room = projectRooms.get(projectId)
          room.delete(userId)
          
          // Send updated user list
          const users = Array.from(room.values()).map(({ id, name, color }) => ({ id, name, color }))
          io.to(projectId).emit('user-list', users)
          
          // Notify others
          socket.to(projectId).emit('message', {
            type: 'system',
            text: `${userName} left the project`,
            timestamp: Date.now()
          })
        }
      })
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`)
        
        // Find and remove user from all rooms
        for (const [projectId, room] of projectRooms.entries()) {
          for (const [userId, user] of room.entries()) {
            if (user.socketId === socket.id) {
              room.delete(userId)
              
              // Send updated user list
              const users = Array.from(room.values()).map(({ id, name, color }) => ({ id, name, color }))
              io.to(projectId).emit('user-list', users)
              
              // Notify others
              io.to(projectId).emit('message', {
                type: 'system',
                text: `${user.name} disconnected`,
                timestamp: Date.now()
              })
              
              break
            }
          }
        }
      })
    })
    
    httpServer.listen(3001, () => {
      console.log('🚀 Socket.io server running on port 3001')
    })
    
    res.socket.server.io = io
  }
  
  res.end()
}

export default socketHandler
