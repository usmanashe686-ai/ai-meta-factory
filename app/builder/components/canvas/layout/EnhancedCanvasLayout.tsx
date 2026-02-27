'use client';

import { useEffect, useState } from 'react';
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
  const { platform } = usePlatformStore();
  const { isAIPanelOpen } = useUIStore();
  const { isAutoSaveEnabled, addBackup, loadBackups, restoreBackup } = useBackupStore();
  const { lastOpenedBackupId } = useSessionStore();
  const { loadSessionModel } = useLocalAIStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Load backups and restore last opened project
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

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Creating blank workspace...</p>
      </div>
    );
  }

  // Mobile layout: stack panels vertically, only one visible at a time
  if (isMobile) {
    const [mobileTab, setMobileTab] = useState<'explorer' | 'editor' | 'preview' | 'ai'>('editor');
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <CanvasToolbar />
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'explorer' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('explorer')}
          >
            Explorer
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'editor' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('editor')}
          >
            Editor
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('preview')}
          >
            Preview
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'ai' ? 'bg-purple-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('ai')}
          >
            AI
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'explorer' && <FileExplorer />}
          {mobileTab === 'editor' && <CodeEditor />}
          {mobileTab === 'preview' && <UniversalPreview />}
          {mobileTab === 'ai' && <AIChatSidebar />}
        </div>
      </div>
    );
  }

  // Desktop layout with resizable panels and AI sidebar overlay
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <CanvasToolbar />
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanels
          left={leftCollapsed ? null : <FileExplorer />}
          center={<CodeEditor />}
          right={rightCollapsed ? null : <UniversalPreview />}
          leftSize={leftCollapsed ? 0 : 18}
          rightSize={rightCollapsed ? 0 : 35}
          minLeftSize={leftCollapsed ? 0 : 15}
          minRightSize={rightCollapsed ? 0 : 25}
          onLeftToggle={() => setLeftCollapsed(!leftCollapsed)}
          onRightToggle={() => setRightCollapsed(!rightCollapsed)}
        />
        {/* AI Sidebar Overlay */}
        {isAIPanelOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-20 overflow-hidden">
            <AIChatSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
