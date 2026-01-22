const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer((req, res) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    res.end()
    return
  }
  
  res.writeHead(200, { 
    ...headers,
    'Content-Type': 'text/plain' 
  })
  res.end('AI Meta Factory Socket Server')
})

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://usman-umer.web.app',
      'https://usman-umer.firebaseapp.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Store active connections
const rooms = new Map()

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`)
  
  socket.on('join-project', ({ projectId, userId, userName, userColor }) => {
    socket.join(projectId)
    console.log(`👤 ${userName} joined ${projectId}`)
    
    // Store user info
    if (!rooms.has(projectId)) {
      rooms.set(projectId, new Map())
    }
    const room = rooms.get(projectId)
    room.set(userId, { id: userId, name: userName, color: userColor })
    
    // Broadcast to room
    const users = Array.from(room.values())
    io.to(projectId).emit('user-list', users)
    
    // Welcome message
    socket.emit('message', {
      type: 'system',
      text: `Welcome to ${projectId}!`,
      timestamp: Date.now()
    })
    
    socket.to(projectId).emit('message', {
      type: 'system',
      text: `${userName} joined the room`,
      timestamp: Date.now()
    })
  })
  
  socket.on('send-message', ({ projectId, userId, userName, text }) => {
    const message = {
      id: Date.now().toString(),
      userId,
      userName,
      text,
      timestamp: Date.now()
    }
    
    console.log(`💬 ${projectId}: ${userName}: ${text}`)
    io.to(projectId).emit('new-message', message)
  })
  
  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`)
    
    // Clean up user from all rooms
    for (const [projectId, room] of rooms.entries()) {
      for (const [userId, user] of room.entries()) {
        if (user.socketId === socket.id) {
          room.delete(userId)
          io.to(projectId).emit('message', {
            type: 'system',
            text: `${user.name} left`,
            timestamp: Date.now()
          })
          break
        }
      }
    }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`)
  console.log(`📡 Accepting connections from:`)
  console.log(`   • http://localhost:3000`)
  console.log(`   • https://usman-umer.web.app`)
  console.log(`   • https://usman-umer.firebaseapp.com`)
})
