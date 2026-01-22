import React, { useState } from 'react';
import { CollaborationSidebar } from './CollaborationSidebar';
import { ComponentCommentIndicator } from './ComponentCommentIndicator';
import { AnnotationCanvas } from './annotations/AnnotationCanvas';
import { 
  MessageSquare, 
  Users,
  PenTool,
  X
} from 'lucide-react';

interface MainLayoutWithCollaborationProps {
  children: React.ReactNode;
  projectId: string;
}

export const MainLayoutWithCollaboration: React.FC<MainLayoutWithCollaborationProps> = ({
  children,
  projectId
}) => {
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedComponentPosition, setSelectedComponentPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Mock components data - replace with your actual components
  const mockComponents = [
    { id: 'comp-1', name: 'Header', x: 100, y: 50 },
    { id: 'comp-2', name: 'Button', x: 300, y: 200 },
    { id: 'comp-3', name: 'Form', x: 500, y: 350 },
  ];
  
  const handleComponentClick = (componentId: string, x: number, y: number) => {
    setSelectedComponentId(componentId);
    setSelectedComponentPosition({ x, y });
    setIsCollaborationOpen(true);
  };
  
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">AI App Builder</h1>
            <div className="text-sm text-gray-500">
              Project: <span className="font-medium">{projectId}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Collaboration Toggle Button */}
            <button
              onClick={() => setIsCollaborationOpen(!isCollaborationOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                isCollaborationOpen 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isCollaborationOpen ? (
                <>
                  <X className="w-4 h-4" />
                  Close Collaboration
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Open Collaboration
                </>
              )}
            </button>
            
            {/* Quick Access Buttons */}
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => {
                  setIsCollaborationOpen(true);
                  // Could set specific tab here
                }}
                className="p-2 hover:bg-gray-100 border-r"
                title="Comments"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsCollaborationOpen(true);
                  // Could set specific tab here
                }}
                className="p-2 hover:bg-gray-100 border-r"
                title="Team"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsCollaborationOpen(true);
                  // Could set specific tab here
                }}
                className="p-2 hover:bg-gray-100"
                title="Draw"
              >
                <PenTool className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex">
        {/* Main Canvas/Workspace */}
        <div className="flex-1 p-6">
          {/* Annotation Canvas Overlay */}
          <div className="relative border rounded-lg bg-white min-h-[600px] mb-6">
            {children}
            
            {/* Component Comment Indicators */}
            {mockComponents.map((component) => (
              <ComponentCommentIndicator
                key={component.id}
                componentId={component.id}
                x={component.x}
                y={component.y}
                onClick={() => handleComponentClick(component.id, component.x, component.y)}
              />
            ))}
            
            {/* Drawing Canvas */}
            <div className="absolute inset-0 pointer-events-none">
              <AnnotationCanvas />
            </div>
          </div>
          
          {/* Collaboration Status Bar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">3 users online</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">12 total comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">5 annotations</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsCollaborationOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All Activity →
              </button>
            </div>
          </div>
        </div>
        
        {/* Collaboration Sidebar */}
        <CollaborationSidebar
          projectId={projectId}
          isOpen={isCollaborationOpen}
          onClose={() => setIsCollaborationOpen(false)}
          componentId={selectedComponentId || undefined}
          position={selectedComponentPosition || undefined}
        />
      </div>
      
      {/* Quick Collaboration Panel (Mini) */}
      {!isCollaborationOpen && (
        <div className="fixed right-4 bottom-4 bg-white rounded-lg shadow-lg border p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollaborationOpen(true)}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Open Collaboration"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="text-xs text-gray-600">
              <div className="font-medium">Collaboration</div>
              <div>3 online • 12 comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
