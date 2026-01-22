'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Copy, Eye } from 'lucide-react'

export default function PropertiesPanel({ component, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('properties')
  
  if (!component) {
    return (
      <div className="p-4 text-center">
        <div className="w-16 h-16 border-4 border-dashed border-gray-300 rounded-full mx-auto mb-4"></div>
        <p className="font-medium">No component selected</p>
        <p className="text-sm text-gray-500 mt-1">
          Click on a component to edit its properties
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Component Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold capitalize">{component.type} Properties</h3>
          <p className="text-sm text-gray-500">ID: {component.id.slice(0, 8)}...</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'styles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('styles')}
        >
          Styles
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'layout' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
      </div>

      {/* Properties Content */}
      <div className="space-y-4">
        {activeTab === 'properties' && (
          <>
            {/* Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="posX">X Position</Label>
                <Input
                  id="posX"
                  type="number"
                  value={component.position.x}
                  onChange={(e) => onUpdate({
                    position: { ...component.position, x: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="posY">Y Position</Label>
                <Input
                  id="posY"
                  type="number"
                  value={component.position.y}
                  onChange={(e) => onUpdate({
                    position: { ...component.position, y: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>

            {/* Component-specific properties */}
            {component.type === 'button' && (
              <>
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={component.props.text || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, text: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="buttonColor">Color</Label>
                  <Input
                    id="buttonColor"
                    type="color"
                    value={component.props.color || '#3B82F6'}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, color: e.target.value }
                    })}
                    className="h-10"
                  />
                </div>
              </>
            )}

            {component.type === 'input' && (
              <>
                <div>
                  <Label htmlFor="inputLabel">Label</Label>
                  <Input
                    id="inputLabel"
                    value={component.props.label || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, label: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="inputPlaceholder">Placeholder</Label>
                  <Input
                    id="inputPlaceholder"
                    value={component.props.placeholder || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, placeholder: e.target.value }
                    })}
                  />
                </div>
              </>
            )}

            {component.type === 'text' && (
              <div>
                <Label htmlFor="textContent">Content</Label>
                <textarea
                  id="textContent"
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={3}
                  value={component.props.content || ''}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, content: e.target.value }
                  })}
                />
              </div>
            )}

            {component.type === 'card' && (
              <>
                <div>
                  <Label htmlFor="cardTitle">Title</Label>
                  <Input
                    id="cardTitle"
                    value={component.props.title || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, title: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="cardContent">Content</Label>
                  <textarea
                    id="cardContent"
                    className="w-full px-3 py-2 border rounded text-sm"
                    rows={3}
                    value={component.props.content || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, content: e.target.value }
                    })}
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'styles' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Style editing coming soon. For now, edit in the Properties tab.
            </p>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={component.size?.width || ''}
                  onChange={(e) => onUpdate({
                    size: { 
                      ...component.size, 
                      width: parseInt(e.target.value) || undefined 
                    }
                  })}
                  placeholder="Auto"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={component.size?.height || ''}
                  onChange={(e) => onUpdate({
                    size: { 
                      ...component.size, 
                      height: parseInt(e.target.value) || undefined 
                    }
                  })}
                  placeholder="Auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
