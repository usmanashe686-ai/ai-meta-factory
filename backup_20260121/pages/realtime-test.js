import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

export default function RealtimeTest() {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected!')
      setIsConnected(true)
      setMessages(prev => [...prev, 'Connected to server!'])
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('message', (msg) => {
      console.log('📨 Message:', msg)
      setMessages(prev => [...prev, msg.text])
    })

    socketInstance.on('new-message', (msg) => {
      console.log('💬 Chat:', msg)
      setMessages(prev => [...prev, `${msg.userName}: ${msg.text}`])
    })

    setSocket(socketInstance)

    // Join test room
    socketInstance.emit('join-project', {
      projectId: 'test-room',
      userId: `user_${Date.now()}`,
      userName: 'Test User',
      userColor: '#3B82F6'
    })

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('send-message', {
        projectId: 'test-room',
        userId: 'test-user',
        userName: 'You',
        text: input
      })
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">🚀 Real-time Collaboration Test</h1>
        
        {/* Connection Status */}
        <div className={`p-4 rounded-lg mb-6 ${isConnected ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isConnected ? '✅ Connected to Socket Server' : '❌ Disconnected - Start socket server'}
            </span>
          </div>
          {!isConnected && (
            <p className="mt-2 text-sm text-gray-300">
              Open a new Termux tab and run: <code className="bg-gray-800 px-2 py-1 rounded">node socket-server.js</code>
            </p>
          )}
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">💬 Real-time Chat</h2>
          
          <div className="h-64 overflow-y-auto mb-4 bg-gray-900 rounded p-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-700/50 rounded">
                  {msg}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No messages yet. Start chatting!
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !input.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium"
            >
              Send
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">🎯 Test Instructions</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</div>
              <div>
                <strong>Start Socket Server</strong>
                <p className="text-sm text-gray-300">In a new Termux tab: <code>node socket-server.js</code></p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</div>
              <div>
                <strong>Open Two Browser Tabs</strong>
                <p className="text-sm text-gray-300">Both pointing to this same URL</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</div>
              <div>
                <strong>Send Messages</strong>
                <p className="text-sm text-gray-300">Type in one tab, see it appear in the other instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 text-sm text-gray-400">
          <p>Socket Server: <code>localhost:3001</code></p>
          <p>Room: <code>test-room</code></p>
          <p>Status: {isConnected ? '🟢 Live' : '🔴 Offline'}</p>
        </div>
      </div>
    </div>
  )
}
