'use client';

import { useEffect, useState } from 'react';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import { CanvasToolbar } from '../toolbar/CanvasToolbar';
import { AIChatSidebar } from '../ai/AIChatSidebar';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useUIStore } from '../state/ui-store';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useBackupStore } from '../state/backup-store';
import { useSessionStore } from '../state/session-store';
import { useLocalAIStore } from '../state/local-ai-store';
import { Folder, FileCode, MessageSquare, Play } from 'lucide-react';

export function EnhancedCanvasLayout() {
  const { project, files, activeFileId, setActiveFile, createBlankProject, setFiles, setProjectName } = useProjectStore();
  const { platform } = usePlatformStore();
  const { isAIPanelOpen, activeTab, setActiveTab } = useUIStore();
  const { isAutoSaveEnabled, addBackup, loadBackups, restoreBackup } = useBackupStore();
  const { lastOpenedBackupId } = useSessionStore();
  const { loadSessionModel } = useLocalAIStore();
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Load backups and restore last opened project
  useEffect(() => {
    const init = async () => {
      setMounted(true);
      await loadBackups();
      if (lastOpenedBackupId) {
        const backup = await restoreBackup(lastOpenedBackupId);
        if (backup) {
          setFiles(backup.files);
          setProjectName(backup.projectName);
        } else {
          createBlankProject();
        }
      } else {
        createBlankProject();
      }
      await loadSessionModel();
    };
    init();
  }, []);

  // Auto-select first file when files load and no file is active
  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFile(files[0].id);
    }
  }, [files, activeFileId, setActiveFile]);

  // Auto-save every 60 seconds
  useEffect(() => {
    if (!isAutoSaveEnabled || !project || files.length === 0) return;
    const interval = setInterval(() => {
      addBackup(files, project.name, 'Auto-save');
    }, 60000);
    return () => clearInterval(interval);
  }, [isAutoSaveEnabled, project, files, addBackup]);

  if (!mounted || !project) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Creating blank workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white overflow-hidden">
      <CanvasToolbar />
      
      <div className="flex-1 overflow-hidden relative">
        {/* Main Content Area controlled by activeTab */}
        <div className="h-full w-full">
          {activeTab === 'files' && <FileExplorer />}
          {activeTab === 'editor' && <CodeEditor />}
          {activeTab === 'preview' && <UniversalPreview />}
          {activeTab === 'ai' && <AIChatSidebar />}
        </div>

        {/* AI Sidebar Overlay for Desktop (when panel is toggled) */}
        {!isMobile && isAIPanelOpen && activeTab !== 'ai' && (
          <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-20 overflow-hidden">
            <AIChatSidebar />
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation for Mobile */}
      {isMobile && (
        <div className="h-16 border-t border-gray-800 bg-gray-900 flex items-center justify-around px-2 pb-safe shrink-0">
          <button 
            onClick={() => setActiveTab('files')} 
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'files' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Folder size={20} />
            <span className="text-[10px]">Files</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('editor')} 
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'editor' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <FileCode size={20} />
            <span className="text-[10px]">Code</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ai')} 
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'ai' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <MessageSquare size={20} />
            <span className="text-[10px]">AI Chat</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('preview')} 
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'preview' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Play size={20} />
            <span className="text-[10px]">Run</span>
          </button>
        </div>
      )}
    </div>
  );
}
