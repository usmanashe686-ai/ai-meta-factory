'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  MeasuringStrategy,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { snapCenterToCursor } from '@dnd-kit/modifiers'

interface DndProviderProps {
  children: ReactNode
}

export const BuilderDndContext = createContext<any>(null)

export function useBuilderDnd() {
  const context = useContext(BuilderDndContext)
  if (!context) {
    throw new Error('useBuilderDnd must be used within DndProvider')
  }
  return context
}

export function DndProvider({ children }: DndProviderProps) {
  const [state, dispatch] = useReducer(dndReducer, initialState)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    dispatch({ type: 'SET_ACTIVE_ID', payload: event.active.id })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      dispatch({
        type: 'MOVE_COMPONENT',
        payload: { activeId: active.id, overId: over.id },
      })
    }

    dispatch({ type: 'SET_ACTIVE_ID', payload: null })
  }

  function handleDragCancel() {
    dispatch({ type: 'SET_ACTIVE_ID', payload: null })
  }

  return (
    <BuilderDndContext.Provider value={{ state, dispatch }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        modifiers={[snapCenterToCursor]}
      >
        {children}
        <DragOverlay>
          {state.activeId ? (
            <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-primary">
              Dragging: {state.activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </BuilderDndContext.Provider>
  )
}

const initialState = {
  components: [],
  activeId: null,
  history: [],
  historyIndex: -1,
}

function dndReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_COMPONENTS':
      return {
        ...state,
        components: action.payload,
        history: [...state.history, action.payload],
        historyIndex: state.historyIndex + 1,
      }
    case 'ADD_COMPONENT':
      const newComponents = [...state.components, action.payload]
      return {
        ...state,
        components: newComponents,
        history: [...state.history, newComponents],
        historyIndex: state.historyIndex + 1,
      }
    case 'UPDATE_COMPONENT':
      const updatedComponents = state.components.map((comp: any) =>
        comp.id === action.payload.id ? { ...comp, ...action.payload.data } : comp
      )
      return {
        ...state,
        components: updatedComponents,
        history: [...state.history, updatedComponents],
        historyIndex: state.historyIndex + 1,
      }
    case 'DELETE_COMPONENT':
      const filteredComponents = state.components.filter(
        (comp: any) => comp.id !== action.payload
      )
      return {
        ...state,
        components: filteredComponents,
        history: [...state.history, filteredComponents],
        historyIndex: state.historyIndex + 1,
      }
    case 'MOVE_COMPONENT':
      const oldIndex = state.components.findIndex(
        (comp: any) => comp.id === action.payload.activeId
      )
      const newIndex = state.components.findIndex(
        (comp: any) => comp.id === action.payload.overId
      )
      const movedComponents = [...state.components]
      const [removed] = movedComponents.splice(oldIndex, 1)
      movedComponents.splice(newIndex, 0, removed)
      return {
        ...state,
        components: movedComponents,
        history: [...state.history, movedComponents],
        historyIndex: state.historyIndex + 1,
      }
    case 'SET_ACTIVE_ID':
      return { ...state, activeId: action.payload }
    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          components: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        }
      }
      return state
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          components: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        }
      }
      return state
    default:
      return state
  }
}
