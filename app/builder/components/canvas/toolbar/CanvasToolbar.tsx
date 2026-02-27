'use client';

import React, { useState } from 'react';
import {
  Save, Download, Upload, GitBranch, Play, Settings, Brain,
  Zap, Globe, Users, Sparkles, Clock, FileText
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useUIStore } from '../state/ui-store';
import { usePreviewStore } from '../state/preview-store';
import { ExportModal } from '../export/ExportModal';
import { BuildStatus } from './BuildStatus';
import { AIPairProgramming } from '../ai-ui/AIPairProgramming';
import { BackupManager } from '../ui/BackupManager';
import { DocsPanel } from '../docs/DocsPanel';
import { GitModal } from '../ui/GitModal';
import { SettingsModal } from '../ui/SettingsModal';

interface CanvasToolbarProps {
  onOpenAI?: () => void; // kept for backward compatibility
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onOpenAI }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPairProgramming, setShowPairProgramming] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [showGitModal, setShowGitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const project = useProjectStore((state) => state.project);
  const { platform, stack } = usePlatformStore();
  const setProjectName = useProjectStore((state) => state.setProjectName);
  const { toggleAIPanel } = useUIStore();
  const { triggerRefresh } = usePreviewStore();

  const handleSave = () => {
    alert('Project saved successfully!');
  };

  const handleDeploy = () => {
    setShowExportModal(true);
  };

  const handleAIClick = () => {
    if (onOpenAI) onOpenAI();
    else toggleAIPanel();
  };

  const handleRun = () => {
    triggerRefresh();
  };

  const handleGit = () => {
    setShowGitModal(true);
  };

  const handleUsers = () => {
    // In offline mode, we can disable or remove this button.
    alert('Users feature is disabled in offline mode.');
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  return (
    <>
      <div className="h-12 border-b border-gray-700 bg-gray-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm">AI Meta Factory</span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={project?.name || 'Untitled'}
              onChange={handleProjectNameChange}
              className="bg-transparent border-none text-sm px-2 py-1 hover:bg-gray-700 rounded"
            />
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">
              {stack || platform}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          <button
            onClick={handleAIClick}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded text-sm"
          >
            <Brain size={14} />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => setShowPairProgramming(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
            title="AI Pair Programming"
          >
            <Sparkles size={14} />
            <span>Pair</span>
          </button>

          <button
            onClick={handleDeploy}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <Globe size={14} />
            <span>Deploy</span>
          </button>

          <button
            onClick={handleRun}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            <Play size={14} />
            <span>Run</span>
          </button>

          <BuildStatus />
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handleGit} className="p-2 hover:bg-gray-700 rounded">
            <GitBranch size={16} />
          </button>
          <button onClick={handleUsers} className="p-2 hover:bg-gray-700 rounded opacity-50 cursor-not-allowed" disabled>
            <Users size={16} />
          </button>
          <button onClick={handleSettings} className="p-2 hover:bg-gray-700 rounded">
            <Settings size={16} />
          </button>
          <button onClick={() => setShowBackupManager(true)} className="p-2 hover:bg-gray-700 rounded" title="Backups">
            <Clock size={16} />
          </button>
          <button onClick={() => setShowDocsPanel(true)} className="p-2 hover:bg-gray-700 rounded" title="Project Docs">
            <FileText size={16} />
          </button>
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />

      {showPairProgramming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-96 h-[600px] bg-gray-900 rounded-lg overflow-hidden">
            <AIPairProgramming onClose={() => setShowPairProgramming(false)} />
          </div>
        </div>
      )}

      {showBackupManager && <BackupManager onClose={() => setShowBackupManager(false)} />}

      {showDocsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-96 h-[600px] bg-gray-900 rounded-lg overflow-hidden">
            <DocsPanel onClose={() => setShowDocsPanel(false)} />
          </div>
        </div>
      )}

      {showGitModal && <GitModal onClose={() => setShowGitModal(false)} />}

      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </>
  );
};
