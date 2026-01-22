'use client'

import { useState } from 'react'
import { useProjectStore } from '../../lib/store/project-store'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Users, Copy, UserPlus, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CollaborationPanel() {
  const { collaborators } = useProjectStore()
  const [inviteEmail, setInviteEmail] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    
    // TODO: Implement real invitation
    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
  }

  const handleCopyLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    toast.success('Project link copied!')
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    
    setChatMessages(prev => [...prev, {
      user: 'You',
      message: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setChatMessage('')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Collaboration
        </h3>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          <Copy className="w-3 h-3 mr-1" />
          Copy Link
        </Button>
      </div>

      {/* Online Users */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Online ({Object.keys(collaborators).length})
        </h4>
        <div className="space-y-2">
          {Object.entries(collaborators).map(([userId, user]) => (
            <div key={userId} className="flex items-center p-2 bg-gray-50 rounded">
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm">{user.name}</span>
              <div
                className="ml-auto w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: user.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Invite Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Invite Collaborators</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleInvite} size="sm">
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </h4>
        <div className="bg-gray-50 rounded-lg p-3 mb-2 max-h-32 overflow-y-auto">
          {chatMessages.map((msg, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{msg.user}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          ))}
          {chatMessages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No messages yet. Start the conversation!
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
