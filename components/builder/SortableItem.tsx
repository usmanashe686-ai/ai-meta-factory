'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Settings, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SortableItemProps {
  id: string
  component: any
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleVisibility: (id: string) => void
}

export function SortableItem({
  id,
  component,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className={`mb-2 ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} transition-all`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-accent p-1 rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{component.name}</div>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {component.type}
                  </span>
                  {!component.visible && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {component.description || 'No description'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onToggleVisibility(id)}
              >
                {component.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit(id)}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
