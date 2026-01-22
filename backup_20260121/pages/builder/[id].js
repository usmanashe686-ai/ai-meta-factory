import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useProjectStore } from '../../lib/store/project-store'
import BuilderCanvas from '../../components/builder/BuilderCanvas'
import ComponentLibrary from '../../components/builder/ComponentLibrary'
import PropertiesPanel from '../../components/builder/PropertiesPanel'
import CollaborationPanel from '../../components/builder/CollaborationPanel'
import SocketProvider from '../../components/providers/SocketProvider'
import { Button } from '../../components/ui/button'
import { Save, Undo, Redo, Users, Download, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function BuilderPage() {
  const router = useRouter()
  const { id } = router.query
  
  const {
    projectName,
    components,
    selectedComponentId,
    socketConnected,
    setProject,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    undo,
    redo,
    saveToHistory,
  } = useProjectStore()

  useEffect(() => {
    if (id) {
      setProject(id, `Project ${id}`)
    }
  }, [id, setProject])

  const handleAddComponent = useCallback((type) => {
    const newComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: getDefaultProps(type),
      position: { x: 100, y: 100 },
    }
    addComponent(newComponent)
    selectComponent(newComponent.id)
    toast.success(`Added ${type} component`)
  }, [addComponent, selectComponent])

  const handleUpdateComponent = useCallback((componentId, updates) => {
    updateComponent(componentId, updates)
  }, [updateComponent])

  const handleDeleteComponent = useCallback((componentId) => {
    deleteComponent(componentId)
    toast.success('Component deleted')
  }, [deleteComponent])

  const handleSave = () => {
    saveToHistory()
    toast.success('Project saved!')
  }

  if (!id) {
    return <div>Loading...</div>
  }

  return (
    <SocketProvider projectId={id}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900">{projectName}</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium">
                    {socketConnected ? (
                      <span className="text-green-600 flex items-center">
                        <Wifi className="w-3 h-3 mr-1" />
                        Live
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {components.length} components • {socketConnected ? 'Real-time collaboration' : 'Working offline'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={undo}>
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={redo}>
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Main Builder Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Component Library */}
          <div className="w-64 bg-white border-r overflow-y-auto">
            <ComponentLibrary onAddComponent={handleAddComponent} />
          </div>

          {/* Center Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div className="canvas-area">
              <BuilderCanvas
                components={components}
                selectedComponentId={selectedComponentId}
                onSelectComponent={selectComponent}
                onUpdateComponent={handleUpdateComponent}
                onDeleteComponent={handleDeleteComponent}
              />
            </div>
          </div>

          {/* Right Panel - Properties & Collaboration */}
          <div className="w-96 bg-white border-l overflow-y-auto flex flex-col">
            <div className="flex-1">
              <PropertiesPanel
                component={components.find(c => c.id === selectedComponentId)}
                onUpdate={(updates) => 
                  selectedComponentId && handleUpdateComponent(selectedComponentId, updates)
                }
                onDelete={() => 
                  selectedComponentId && handleDeleteComponent(selectedComponentId)
                }
              />
            </div>
            <div className="border-t">
              <CollaborationPanel />
            </div>
          </div>
        </div>
      </div>
    </SocketProvider>
  )
}

function getDefaultProps(type) {
  switch (type) {
    case 'button':
      return { text: 'Click Me', color: '#3B82F6' }
    case 'input':
      return { placeholder: 'Enter text...', label: 'Input' }
    case 'text':
      return { content: 'Text content', size: 'medium' }
    case 'card':
      return { title: 'Card Title', content: 'Card content' }
    default:
      return {}
  }
}
