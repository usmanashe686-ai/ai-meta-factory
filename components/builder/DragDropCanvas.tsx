'use client'

import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Grid, AlignCenter, AlignLeft, 
  AlignRight, Type, Square, Circle,
  Image as ImageIcon, Code, Layout
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CanvasItem {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  content: string
  styles: Record<string, any>
}

interface DragDropCanvasProps {
  items: CanvasItem[]
  onItemDrop: (item: CanvasItem) => void
  onItemUpdate: (id: string, updates: Partial<CanvasItem>) => void
  onItemDelete: (id: string) => void
}

export default function DragDropCanvas({
  items,
  onItemDrop,
  onItemUpdate,
  onItemDelete,
}: DragDropCanvasProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [gridSize, setGridSize] = useState(20)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  })

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (snapToGrid) {
      const snappedX = Math.round(x / gridSize) * gridSize
      const snappedY = Math.round(y / gridSize) * gridSize
      
      const newItem: CanvasItem = {
        id: `item-${Date.now()}`,
        type: 'container',
        x: snappedX,
        y: snappedY,
        width: 200,
        height: 100,
        content: 'New Component',
        styles: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
        },
      }
      onItemDrop(newItem)
    }
  }

  const handleItemDrag = (id: string, dx: number, dy: number) => {
    const item = items.find(item => item.id === id)
    if (!item) return

    let newX = item.x + dx
    let newY = item.y + dy

    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
    }

    onItemUpdate(id, { x: newX, y: newY })
  }

  const handleItemResize = (id: string, dw: number, dh: number) => {
    const item = items.find(item => item.id === id)
    if (!item) return

    let newWidth = Math.max(50, item.width + dw)
    let newHeight = Math.max(50, item.height + dh)

    if (snapToGrid) {
      newWidth = Math.round(newWidth / gridSize) * gridSize
      newHeight = Math.round(newHeight / gridSize) * gridSize
    }

    onItemUpdate(id, { width: newWidth, height: newHeight })
  }

  const componentPalette = [
    { type: 'container', label: 'Container', icon: <Square className="w-4 h-4" />, defaultSize: { w: 200, h: 100 } },
    { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, defaultSize: { w: 150, h: 40 } },
    { type: 'button', label: 'Button', icon: <Circle className="w-4 h-4" />, defaultSize: { w: 100, h: 40 } },
    { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" />, defaultSize: { w: 150, h: 150 } },
    { type: 'input', label: 'Input', icon: <AlignLeft className="w-4 h-4" />, defaultSize: { w: 200, h: 40 } },
    { type: 'card', label: 'Card', icon: <Layout className="w-4 h-4" />, defaultSize: { w: 250, h: 150 } },
  ]

  return (
    <div className="flex h-full">
      {/* Left Panel - Component Palette */}
      <Card className="w-64 border-r rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {componentPalette.map((component) => (
              <div
                key={component.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: component.type,
                    defaultSize: component.defaultSize,
                  }))
                }}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-accent transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded">
                  {component.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{component.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {component.defaultSize.w}×{component.defaultSize.h}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Canvas Settings</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Grid Size</span>
                  <span className="text-sm font-mono">{gridSize}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm">Show Grid</label>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Snap to Grid</label>
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Drag components here</p>
            <p className="text-sm mt-1">Click to add new components</p>
          </div>
        </div>

        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              opacity: 0.3,
            }}
          />
        )}

        {/* Droppable Canvas Area */}
        <div
          ref={setNodeRef}
          onClick={handleCanvasClick}
          className={cn(
            'absolute inset-0',
            isOver && 'bg-primary/5 ring-2 ring-primary ring-inset'
          )}
        >
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: item.x,
                  y: item.y,
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={cn(
                  'absolute cursor-move border-2',
                  selectedItem === item.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-gray-300 hover:border-primary',
                  'rounded-lg shadow-sm hover:shadow-md transition-all'
                )}
                style={{
                  width: item.width,
                  height: item.height,
                  ...item.styles,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedItem(item.id)
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify(item))
                  setSelectedItem(item.id)
                }}
              >
                {/* Resize Handles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-nw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY
                    const startWidth = item.width
                    const startHeight = item.height

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const dx = moveEvent.clientX - startX
                      const dy = moveEvent.clientY - startY
                      handleItemResize(item.id, -dx, -dy)
                      onItemUpdate(item.id, {
                        x: item.x + dx,
                        y: item.y + dy,
                      })
                    }

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove)
                      document.removeEventListener('mouseup', onMouseUp)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                  }}
                />
                <div className="absolute -top-1 right-0 w-2 h-2 bg-primary rounded-full cursor-ne-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY
                    const startWidth = item.width
                    const startHeight = item.height

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const dx = moveEvent.clientX - startX
                      const dy = moveEvent.clientY - startY
                      handleItemResize(item.id, dx, -dy)
                      onItemUpdate(item.id, { y: item.y + dy })
                    }

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove)
                      document.removeEventListener('mouseup', onMouseUp)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                  }}
                />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-sw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const dx = moveEvent.clientX - startX
                      const dy = moveEvent.clientY - startY
                      handleItemResize(item.id, -dx, dy)
                      onItemUpdate(item.id, { x: item.x + dx })
                    }

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove)
                      document.removeEventListener('mouseup', onMouseUp)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                  }}
                />
                <div className="absolute -bottom-1 right-0 w-2 h-2 bg-primary rounded-full cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const dx = moveEvent.clientX - startX
                      const dy = moveEvent.clientY - startY
                      handleItemResize(item.id, dx, dy)
                    }

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove)
                      document.removeEventListener('mouseup', onMouseUp)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                  }}
                />

                {/* Content */}
                <div className="w-full h-full p-2 overflow-auto">
                  {item.type === 'text' && (
                    <div className="text-center p-2">
                      <p className="text-lg font-medium">{item.content}</p>
                    </div>
                  )}
                  {item.type === 'button' && (
                    <button className="w-full h-full bg-primary text-primary-foreground rounded-md font-medium">
                      {item.content || 'Button'}
                    </button>
                  )}
                  {item.type === 'input' && (
                    <input
                      type="text"
                      placeholder={item.content || 'Enter text...'}
                      className="w-full h-full px-3 border rounded-md bg-white"
                    />
                  )}
                  {item.type === 'image' && (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">Image</span>
                    </div>
                  )}
                  {item.type === 'card' && (
                    <div className="w-full h-full p-4 bg-white rounded-md border">
                      <h3 className="font-bold mb-2">Card Title</h3>
                      <p className="text-sm text-gray-600">Card content goes here</p>
                    </div>
                  )}
                  {item.type === 'container' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-600">{item.content}</span>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemDelete(item.id)
                  }}
                >
                  ×
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Canvas Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border">
          <Button size="sm" variant="outline">
            <AlignLeft className="w-4 h-4 mr-2" />
            Align Left
          </Button>
          <Button size="sm" variant="outline">
            <AlignCenter className="w-4 h-4 mr-2" />
            Center
          </Button>
          <Button size="sm" variant="outline">
            <AlignRight className="w-4 h-4 mr-2" />
            Align Right
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <Button size="sm" variant="outline" onClick={() => setShowGrid(!showGrid)}>
            <Grid className="w-4 h-4 mr-2" />
            Grid: {showGrid ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Info Panel */}
        {selectedItem && (
          <Card className="absolute top-4 right-4 w-64">
            <CardContent className="pt-6">
              <h4 className="font-bold mb-4">Selected Component</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Position</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={items.find(i => i.id === selectedItem)?.x || 0}
                      onChange={(e) => onItemUpdate(selectedItem, { x: parseInt(e.target.value) })}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={items.find(i => i.id === selectedItem)?.y || 0}
                      onChange={(e) => onItemUpdate(selectedItem, { y: parseInt(e.target.value) })}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Y"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Size</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={items.find(i => i.id === selectedItem)?.width || 0}
                      onChange={(e) => onItemUpdate(selectedItem, { width: parseInt(e.target.value) })}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      value={items.find(i => i.id === selectedItem)?.height || 0}
                      onChange={(e) => onItemUpdate(selectedItem, { height: parseInt(e.target.value) })}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Height"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Content</label>
                  <input
                    type="text"
                    value={items.find(i => i.id === selectedItem)?.content || ''}
                    onChange={(e) => onItemUpdate(selectedItem, { content: e.target.value })}
                    className="w-full p-1 border rounded text-sm mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
