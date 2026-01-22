'use client'

import { useRef, useState } from 'react'
import { useProjectStore } from '../../lib/store/project-store'

export default function BuilderCanvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
}) {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const { collaborators } = useProjectStore()

  const handleDragStart = (e, componentId) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    
    if (canvasRect) {
      setDragOffset({
        x: e.clientX - rect.left + canvasRect.left,
        y: e.clientY - rect.top + canvasRect.top,
      })
    }
    
    setIsDragging(componentId)
    e.dataTransfer.setData('text/plain', componentId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    
    if (!isDragging || !canvasRef.current) return
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left - dragOffset.x
    const y = e.clientY - canvasRect.top - dragOffset.y
    
    onUpdateComponent(isDragging, {
      position: { x, y },
    })
    
    setIsDragging(null)
  }

  const renderComponent = (comp) => {
    const isSelected = selectedComponentId === comp.id
    
    const style = {
      left: `${comp.position.x}px`,
      top: `${comp.position.y}px`,
      width: comp.size?.width ? `${comp.size.width}px` : 'auto',
      height: comp.size?.height ? `${comp.size.height}px` : 'auto',
    }

    return (
      <div
        key={comp.id}
        className={`absolute cursor-move border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'} rounded transition-all`}
        style={style}
        draggable
        onDragStart={(e) => handleDragStart(e, comp.id)}
        onClick={() => onSelectComponent(comp.id)}
        onDoubleClick={() => {
          if (confirm('Delete this component?')) {
            onDeleteComponent(comp.id)
          }
        }}
      >
        {/* Component content */}
        {renderComponentContent(comp)}
        
        {/* Resize handles */}
        {isSelected && (
          <>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white" />
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize border border-white" />
            <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white" />
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize border border-white" />
          </>
        )}
      </div>
    )
  }

  const renderComponentContent = (comp) => {
    switch (comp.type) {
      case 'button':
        return (
          <button
            className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: comp.props.color || '#3B82F6' }}
          >
            {comp.props.text || 'Button'}
          </button>
        )
      case 'input':
        return (
          <div className="space-y-1 min-w-[200px]">
            <label className="block text-sm font-medium">
              {comp.props.label || 'Input'}
            </label>
            <input
              type="text"
              placeholder={comp.props.placeholder || 'Enter text...'}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>
        )
      case 'text':
        return (
          <p className={`p-2 ${comp.props.size === 'large' ? 'text-lg' : 'text-base'}`}>
            {comp.props.content || 'Text content'}
          </p>
        )
      case 'card':
        return (
          <div className="border rounded-lg p-4 min-w-[200px] shadow-sm bg-white">
            <h3 className="font-semibold mb-2">{comp.props.title || 'Card Title'}</h3>
            <p className="text-gray-600">{comp.props.content || 'Card content'}</p>
          </div>
        )
      default:
        return (
          <div className="border rounded p-4 min-w-[100px] min-h-[50px] bg-white">
            {comp.type}
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Builder Canvas</h2>
        <p className="text-sm text-gray-600">
          Drag components • Click to select • Double-click to delete
        </p>
      </div>
      
      <div
        ref={canvasRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] bg-gray-50 canvas-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Render all components */}
        {components.map(renderComponent)}
        
        {/* Render collaborator cursors */}
        {Object.entries(collaborators).map(([userId, user]) => (
          <div
            key={userId}
            className="absolute pointer-events-none"
            style={{
              left: `${user.cursor.x}px`,
              top: `${user.cursor.y}px`,
              color: user.color,
            }}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-current" />
              <div className="absolute -top-6 -left-2 text-xs font-medium px-2 py-1 rounded bg-current text-white whitespace-nowrap">
                {user.name}
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 border-4 border-dashed border-gray-300 rounded-full mb-4 animate-pulse"></div>
            <p className="text-lg font-medium">Canvas is empty</p>
            <p className="text-sm">Add components from the library</p>
            <p className="text-xs mt-2 text-gray-500">
              Real-time sync: {Object.keys(collaborators).length > 1 ? 'Active' : 'Waiting for collaborators'}
            </p>
          </div>
        )}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>{components.length} components</span>
        <span>{Object.keys(collaborators).length} collaborators</span>
      </div>
    </div>
  )
}
