'use client'

import { Square, Type, FileText } from 'lucide-react'

const COMPONENTS = [
  { type: 'button', label: 'Button', icon: Square, color: 'bg-blue-500' },
  { type: 'input', label: 'Input', icon: Type, color: 'bg-green-500' },
  { type: 'text', label: 'Text', icon: FileText, color: 'bg-purple-500' },
  { type: 'card', label: 'Card', icon: Square, color: 'bg-orange-500' },
]

export default function ComponentLibrary({ onAddComponent }) {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Component Library</h3>
      <div className="space-y-3">
        {COMPONENTS.map(({ type, label, icon: Icon, color }) => (
          <div
            key={type}
            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onAddComponent(type)}
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-gray-500">Click to add</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-800">🎯 Real-time Test</h4>
        <p className="text-sm text-blue-700">
          Open this page in two browser tabs to see real-time collaboration!
        </p>
        <ul className="mt-2 text-sm text-blue-600 space-y-1">
          <li>• Components sync instantly</li>
          <li>• See others' cursors</li>
          <li>• Chat in real-time</li>
          <li>• Watch changes live</li>
        </ul>
      </div>
    </div>
  )
}
