"use client";

import { useState } from 'react';
import { Maximize2, Minimize2, Settings, Terminal, Download, Share2, Save } from 'lucide-react';
import { EnhancedFileExplorer } from '../explorer/EnhancedFileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { AIAssistant } from '../ai/AIAssistant';
import { PreviewEngine } from '../preview/PreviewEngine';
import { useProjectStore } from '../state/project-store';
import { ExportModal } from '../export/ExportModal';

// Remove children prop requirement
export function EnhancedCanvasLayout() {
  const [fullScreen, setFullScreen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { name, stack } = useProjectStore();

  const handleSave = () => {
    console.log('Saving project...');
  };

  const handleShare = () => {
    console.log('Sharing project...');
  };

  return (
    <>
      <div className={`${fullScreen ? 'fixed inset-0' : 'h-screen'} flex flex-col bg-gray-950`}>
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {name || 'Untitled Project'}
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-500/20 rounded">{stack.frontend}</span>
                {stack.backend !== 'none' && (
                  <span className="px-2 py-1 bg-green-500/20 rounded">{stack.backend}</span>
                )}
                <span className="px-2 py-1 bg-yellow-500/20 rounded">{stack.database}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <div className="w-px h-6 bg-gray-800 mx-2"></div>
              
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Terminal"
              >
                <Terminal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFullScreen(!fullScreen)}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title={fullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left - File Explorer */}
          <div className="w-64 border-r border-gray-800">
            <EnhancedFileExplorer />
          </div>
          
          {/* Center - Editor & Preview */}
          <div className="flex-1 flex">
            {/* Code Editor (Left side of center) */}
            <div className="flex-1 border-r border-gray-800">
              <CodeEditor />
            </div>
            
            {/* Preview (Right side of center) */}
            <div className="w-1/2 border-r border-gray-800">
              <PreviewEngine />
            </div>
          </div>
          
          {/* Right - AI Assistant */}
          <div className="w-80">
            <AIAssistant />
          </div>
        </div>
        
        {/* Terminal */}
        {showTerminal && (
          <div className="h-48 border-t border-gray-800 bg-black">
            <div className="h-full font-mono text-sm">
              <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                <span>Terminal</span>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="p-4">
                <div className="text-green-400">$ npm run dev</div>
                <div className="text-gray-300 mt-2">Starting development server...</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
