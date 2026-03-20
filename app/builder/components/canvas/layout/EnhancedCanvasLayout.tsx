'use client';

import React, { Component, ReactNode, useEffect, useState } from 'react';
import { ResizablePanels } from './ResizablePanels';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import { CanvasToolbar } from '../toolbar/CanvasToolbar';
import { AIChatSidebar } from '../ai/AIChatSidebar';
import { DocsPanel } from '../docs/DocsPanel';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useUIStore } from '../state/ui-store';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useBackupStore } from '../state/backup-store';
import { useSessionStore } from '../state/session-store';
import { useLocalAIStore } from '../state/local-ai-store';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Workspace Error</h2>
          <p className="text-gray-400 mb-6">
            Something broke while loading your project.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 rounded-lg"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // Guard: wait for project, files, and active file
  if (!project || !files || files.length === 0 || !activeFileId) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Loading workspace...</p>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    const [mobileTab, setMobileTab] = useState<'explorer' | 'editor' | 'preview' | 'ai' | 'docs'>('editor');
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <CanvasToolbar />
        <div className="flex border-b border-gray-700 bg-gray-800">
          {['explorer', 'editor', 'preview', 'ai', 'docs'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium ${
                mobileTab === tab
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
              onClick={() => setMobileTab(tab as typeof mobileTab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'explorer' && <FileExplorer />}
          {mobileTab === 'editor' && <CodeEditor />}
          {mobileTab === 'preview' && <UniversalPreview />}
          {mobileTab === 'ai' && <AIChatSidebar />}
          {mobileTab === 'docs' && <DocsPanel onClose={() => setMobileTab('editor')} />}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <ErrorBoundary>
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
          {isAIPanelOpen && (
            <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-20 overflow-hidden">
              <AIChatSidebar />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
