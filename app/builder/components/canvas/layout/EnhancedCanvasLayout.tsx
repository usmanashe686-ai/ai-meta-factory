import { ModelDownloader } from '../ai-ui/ModelDownloader';
import { RunModel } from '../ai-ui/RunModel';
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
  const { isAIPanelOpen, activeTab } = useUIStore();
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

  // Mobile layout: stack panels vertically, only one visible at a time based on activeTab
  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <CanvasToolbar />
        <div className="flex-1 overflow-hidden">
          {activeTab === 'files' && <FileExplorer />}
          {activeTab === 'editor' && <CodeEditor />}
          {activeTab === 'preview' && <UniversalPreview />}
          {activeTab === 'ai' && <AIChatSidebar />}
        </div>
      </div>
    );
  }


  const { currentModel } = useLocalAIStore();

  // Desktop layout with Local AI integration
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <CanvasToolbar />

      {/* If no model → show downloader */}
      {!currentModel && (
        <div className="flex-1 flex items-center justify-center">
          <ModelDownloader />
        </div>
      )}

      {/* If model exists → show full IDE + AI */}
      {currentModel && (
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
            minLeftSize={leftCollapsed ? 0 : 15}
            minRightSize={rightCollapsed ? 0 : 25}
            onLeftToggle={() => setLeftCollapsed(!leftCollapsed)}
            onRightToggle={() => setRightCollapsed(!rightCollapsed)}
          />

          {/* AI Sidebar */}
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
