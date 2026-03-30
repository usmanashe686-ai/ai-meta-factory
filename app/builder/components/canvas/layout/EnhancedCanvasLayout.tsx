'use client';

import { ModelDownloader } from '../ai-ui/ModelDownloader';
import { RunModel } from '../ai-ui/RunModel';
import { useEffect, useState } from 'react';
import { Folder, FileText, Brain, Globe } from 'lucide-react';
import { ResizablePanels } from './ResizablePanels';
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

export function EnhancedCanvasLayout() {
  const { project, files, activeFileId, setActiveFile, createBlankProject, setFiles, setProjectName } = useProjectStore();
  const { isAIPanelOpen, activeTab, setActiveTab } = useUIStore();
  const { isAutoSaveEnabled, addBackup, loadBackups, restoreBackup } = useBackupStore();
  const { lastOpenedBackupId } = useSessionStore();
  const { loadSessionModel, currentModel } = useLocalAIStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const init = async () => {
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

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFile(files[0].id);
    }
  }, [files, activeFileId, setActiveFile]);

  useEffect(() => {
    if (!isAutoSaveEnabled || !project || files.length === 0) return;
    const interval = setInterval(() => {
      addBackup(files, project.name, 'Auto-save');
    }, 60000);
    return () => clearInterval(interval);
  }, [isAutoSaveEnabled, project, files, addBackup]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Creating blank workspace...</p>
      </div>
    );
  }

  // MOBILE LAYOUT WITH NAVIGATION BAR
  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-[#0f172a] text-white">
        <CanvasToolbar />
        <div className="flex-1 overflow-hidden pb-16">
          {activeTab === 'files' && <FileExplorer />}
          {activeTab === 'editor' && <CodeEditor />}
          {activeTab === 'preview' && <UniversalPreview />}
          {activeTab === 'ai' && <AIChatSidebar />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#1e293b] border-t border-gray-700 flex items-center justify-around px-2 z-50">
          <button onClick={() => setActiveTab('files')} className={`flex flex-col items-center flex-1 ${activeTab === 'files' ? 'text-blue-500' : 'text-gray-400'}`}>
            <Folder size={20} /><span className="text-[10px] mt-1">Files</span>
          </button>
          <button onClick={() => setActiveTab('editor')} className={`flex flex-col items-center flex-1 ${activeTab === 'editor' ? 'text-blue-500' : 'text-gray-400'}`}>
            <FileText size={20} /><span className="text-[10px] mt-1">Code</span>
          </button>
          <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center flex-1 ${activeTab === 'ai' ? 'text-blue-500' : 'text-gray-400'}`}>
            <Brain size={20} /><span className="text-[10px] mt-1">AI Chat</span>
          </button>
          <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center flex-1 ${activeTab === 'preview' ? 'text-blue-500' : 'text-gray-400'}`}>
            <Globe size={20} /><span className="text-[10px] mt-1">Run</span>
          </button>
        </div>
      </div>
    );
  }

  // DESKTOP LAYOUT
  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      <CanvasToolbar />
      {!currentModel ? (
        <div className="flex-1 flex items-center justify-center">
          <ModelDownloader />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden relative">
          <ResizablePanels
            left={leftCollapsed ? null : <FileExplorer />}
            center={
              <div className="h-full flex flex-col">
                <CodeEditor />
                <div className="border-t border-gray-700">
                  <RunModel />
                </div>
              </div>
            }
            right={rightCollapsed ? null : <UniversalPreview />}
            leftSize={leftCollapsed ? 0 : 18}
            rightSize={rightCollapsed ? 0 : 35}
            onLeftToggle={() => setLeftCollapsed(!leftCollapsed)}
            onRightToggle={() => setRightCollapsed(!rightCollapsed)}
          />
          {isAIPanelOpen && (
            <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-20 overflow-hidden">
              <AIChatSidebar />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
