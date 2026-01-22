'use client'

import { Component } from '@/lib/types/builder'
import { Move, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ComponentRendererProps {
  component: Component
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Component>) => void
  onDelete: () => void
}

export default function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ComponentRendererProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...component.position }

    const handleMouseMove = (e: MouseEvent) => {
      setIsDragging(true)
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      
      onUpdate({
        position: {
          x: startPos.x + dx,
          y: startPos.y + dy
        }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDuplicate = () => {
    const newComponent = {
      ...component,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    }
    onUpdate(newComponent)
    setContextMenu(null)
  }

  const renderComponent = () => {
    const style = {
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      width: component.size?.width ? `${component.size.width}px` : 'auto',
      height: component.size?.height ? `${component.size.height}px` : 'auto',
      opacity: isDragging ? 0.7 : 1,
    }

    const baseClasses = 'absolute cursor-move select-none'
    const selectedClasses = isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''

    switch (component.type) {
      case 'button':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses, 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors')}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            {component.props.text || 'Button'}
          </div>
        )
      case 'input':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses, 'min-w-[200px]')}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.props.label || 'Label'}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder={component.props.placeholder || 'Placeholder'}
              value={component.props.value || ''}
              onChange={(e) => onUpdate({ props: { ...component.props, value: e.target.value } })}
            />
          </div>
        )
      case 'text':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses, 'max-w-[300px]')}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <p className="text-gray-900">{component.props.content || 'Text content'}</p>
          </div>
        )
      case 'heading':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses)}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            {component.props.level === 'h1' && (
              <h1 className="text-2xl font-bold text-gray-900">{component.props.content || 'Heading'}</h1>
            )}
            {component.props.level === 'h2' && (
              <h2 className="text-xl font-bold text-gray-900">{component.props.content || 'Heading'}</h2>
            )}
            {component.props.level === 'h3' && (
              <h3 className="text-lg font-bold text-gray-900">{component.props.content || 'Heading'}</h3>
            )}
          </div>
        )
      case 'card':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses, 'w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-sm')}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <h3 className="font-semibold text-gray-900 mb-2">
              {component.props.title || 'Card Title'}
            </h3>
            <p className="text-gray-600">
              {component.props.content || 'Card content goes here'}
            </p>
          </div>
        )
      case 'image':
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses)}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <img
              src={component.props.src || 'https://via.placeholder.com/300x200'}
              alt={component.props.alt || 'Image'}
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )
      default:
        return (
          <div
            style={style}
            className={cn(baseClasses, selectedClasses, 'px-4 py-2 bg-gray-100 border rounded')}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            {component.type}
          </div>
        )
    }
  }

  return (
    <>
      {renderComponent()}
      
      {isSelected && (
        <>
          <div
            style={{
              left: `${component.position.x}px`,
              top: `${component.position.y}px`,
            }}
            className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1 cursor-move"
            onMouseDown={handleMouseDown}
          >
            <Move className="w-4 h-4" />
          </div>
          
          {/* Resize handles */}
          <div
            style={{
              left: `${component.position.x + (component.size?.width || 100) - 4}px`,
              top: `${component.position.y + (component.size?.height || 50) - 4}px`,
            }}
            className="absolute w-2 h-2 bg-green-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation()
              const startWidth = component.size?.width || 100
              const startHeight = component.size?.height || 50
              const startX = e.clientX
              const startY = e.clientY
              
              const handleMouseMove = (e: MouseEvent) => {
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                
                onUpdate({
                  size: {
                    width: Math.max(50, startWidth + dx),
                    height: Math.max(30, startHeight + dy)
                  }
                })
              }
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }
              
              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          />
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={handleDuplicate}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center"
              onClick={() => {
                onDelete()
                setContextMenu(null)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  )
}
