'use client'

import { Button, Input, Type, Card, Box, FormInput } from 'lucide-react'

const components = [
  { type: 'button', label: 'Button', icon: Button, description: 'Interactive button with click events', color: 'bg-blue-100 text-blue-600' },
  { type: 'input', label: 'Input Field', icon: Input, description: 'Text input with validation', color: 'bg-green-100 text-green-600' },
  { type: 'text', label: 'Text', icon: Type, description: 'Text content with styling', color: 'bg-purple-100 text-purple-600' },
  { type: 'card', label: 'Card', icon: Card, description: 'Container with shadow and content', color: 'bg-yellow-100 text-yellow-600' },
  { type: 'container', label: 'Container', icon: Box, description: 'Layout container for grouping', color: 'bg-gray-100 text-gray-600' },
  { type: 'form', label: 'Form', icon: FormInput, description: 'Form with multiple inputs', color: 'bg-red-100 text-red-600' },
]

interface ComponentLibraryProps {
  onAddComponent: (type: string) => void
}

export default function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">Component Library</h3>
        <p className="text-sm text-gray-600">Drag and drop components to canvas</p>
      </div>
      
      <div className="space-y-3">
        {components.map((comp) => (
          <button
            key={comp.type}
            onClick={() => onAddComponent(comp.type)}
            className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3 group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`p-2 rounded-lg ${comp.color}`}>
              <comp.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{comp.label}</p>
              <p className="text-sm text-gray-500">{comp.description}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">AI-Powered Components</h4>
        <div className="space-y-2">
          <button className="w-full p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg text-left">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium text-purple-700">Generate with AI</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">Describe what you need</p>
          </button>
        </div>
      </div>
    </div>
  )
}
