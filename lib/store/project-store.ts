import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Component {
  id: string
  type: string
  props: Record<string, any>
  position: { x: number; y: number }
  size?: { width: number; height: number }
  parentId?: string
  childrenIds?: string[]
}

export interface ProjectState {
  // Current project
  projectId: string | null
  projectName: string
  components: Component[]
  selectedComponentId: string | null
  canvasSize: { width: number; height: number }
  
  // History for undo/redo
  past: Component[][]
  future: Component[][]
  
  // Collaboration
  collaborators: Record<string, { name: string; color: string; cursor: { x: number; y: number } }>
  chatMessages: Array<{
    id: string
    userId: string
    userName: string
    text: string
    timestamp: number
  }>
  
  // Socket integration
  socketConnected: boolean
  
  // Actions
  setProject: (projectId: string, projectName: string) => void
  addComponent: (component: Component, syncWithServer?: boolean) => void
  updateComponent: (componentId: string, updates: Partial<Component>, syncWithServer?: boolean) => void
  deleteComponent: (componentId: string, syncWithServer?: boolean) => void
  selectComponent: (componentId: string | null) => void
  moveComponent: (componentId: string, position: { x: number; y: number }, syncWithServer?: boolean) => void
  resizeComponent: (componentId: string, size: { width: number; height: number }, syncWithServer?: boolean) => void
  
  // History actions
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Collaboration actions
  addCollaborator: (userId: string, name: string, color: string) => void
  removeCollaborator: (userId: string) => void
  updateCursor: (userId: string, cursor: { x: number; y: number }) => void
  addChatMessage: (message: { id: string; userId: string; userName: string; text: string; timestamp: number }) => void
  clearChatMessages: () => void
  
  // Socket actions
  setSocketConnected: (connected: boolean) => void
  
  // Remote actions (called when other users make changes)
  remoteAddComponent: (component: Component) => void
  remoteUpdateComponent: (componentId: string, updates: Partial<Component>) => void
  remoteDeleteComponent: (componentId: string) => void
  remoteUpdateCursor: (userId: string, cursor: { x: number; y: number }) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      projectId: null,
      projectName: 'Untitled Project',
      components: [],
      selectedComponentId: null,
      canvasSize: { width: 1200, height: 800 },
      past: [],
      future: [],
      collaborators: {},
      chatMessages: [],
      socketConnected: false,
      
      // Actions
      setProject: (projectId, projectName) =>
        set({ 
          projectId, 
          projectName, 
          components: [], 
          past: [], 
          future: [],
          collaborators: {},
          chatMessages: []
        }),
      
      addComponent: (component, syncWithServer = true) => {
        const { components, saveToHistory } = get()
        saveToHistory()
        set({ components: [...components, component] })
      },
      
      updateComponent: (componentId, updates, syncWithServer = true) => {
        const { components, saveToHistory } = get()
        saveToHistory()
        set({
          components: components.map(comp =>
            comp.id === componentId ? { ...comp, ...updates } : comp
          ),
        })
      },
      
      deleteComponent: (componentId, syncWithServer = true) => {
        const { components, selectedComponentId, saveToHistory } = get()
        saveToHistory()
        set({
          components: components.filter(comp => comp.id !== componentId),
          selectedComponentId: selectedComponentId === componentId ? null : selectedComponentId,
        })
      },
      
      selectComponent: (componentId) =>
        set({ selectedComponentId: componentId }),
      
      moveComponent: (componentId, position, syncWithServer = true) => {
        const { components } = get()
        set({
          components: components.map(comp =>
            comp.id === componentId ? { ...comp, position } : comp
          ),
        })
      },
      
      resizeComponent: (componentId, size, syncWithServer = true) => {
        const { components } = get()
        set({
          components: components.map(comp =>
            comp.id === componentId ? { ...comp, size } : comp
          ),
        })
      },
      
      // History management
      undo: () => {
        const { past, components, future } = get()
        if (past.length === 0) return
        
        const previous = past[past.length - 1]
        const newPast = past.slice(0, -1)
        
        set({
          past: newPast,
          components: previous,
          future: [components, ...future],
        })
      },
      
      redo: () => {
        const { future, components, past } = get()
        if (future.length === 0) return
        
        const next = future[0]
        const newFuture = future.slice(1)
        
        set({
          past: [...past, components],
          components: next,
          future: newFuture,
        })
      },
      
      saveToHistory: () => {
        const { components, past } = get()
        // Keep only last 50 states
        const newPast = [...past, components].slice(-50)
        set({ past: newPast, future: [] })
      },
      
      // Collaboration
      addCollaborator: (userId, name, color) =>
        set((state) => ({
          collaborators: {
            ...state.collaborators,
            [userId]: { name, color, cursor: { x: 0, y: 0 } },
          },
        })),
      
      removeCollaborator: (userId) =>
        set((state) => {
          const newCollaborators = { ...state.collaborators }
          delete newCollaborators[userId]
          return { collaborators: newCollaborators }
        }),
      
      updateCursor: (userId, cursor) =>
        set((state) => ({
          collaborators: {
            ...state.collaborators,
            [userId]: { ...state.collaborators[userId], cursor },
          },
        })),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message].slice(-100)
        })),
      
      clearChatMessages: () =>
        set({ chatMessages: [] }),
      
      // Socket
      setSocketConnected: (connected) =>
        set({ socketConnected: connected }),
      
      // Remote actions
      remoteAddComponent: (component) => {
        const { components } = get()
        if (!components.find(c => c.id === component.id)) {
          set({ components: [...components, component] })
        }
      },
      
      remoteUpdateComponent: (componentId, updates) => {
        const { components } = get()
        set({
          components: components.map(comp =>
            comp.id === componentId ? { ...comp, ...updates } : comp
          ),
        })
      },
      
      remoteDeleteComponent: (componentId) => {
        const { components, selectedComponentId } = get()
        set({
          components: components.filter(comp => comp.id !== componentId),
          selectedComponentId: selectedComponentId === componentId ? null : selectedComponentId,
        })
      },
      
      remoteUpdateCursor: (userId, cursor) =>
        set((state) => ({
          collaborators: {
            ...state.collaborators,
            [userId]: { ...state.collaborators[userId], cursor },
          },
        })),
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
        components: state.components,
      }),
    }
  )
)
