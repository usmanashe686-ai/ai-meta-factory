'use client';

import React, { useState } from 'react';
import { 
  Save, Download, Upload, GitBranch, Play, Settings, Brain, 
  Zap, Globe, Users, Sparkles, Clock, FileText, Key 
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useUIStore } from '../state/ui-store';
import { usePreviewStore } from '../state/preview-store';

// Modals
import { ExportModal } from '../export/ExportModal';
import { BuildStatus } from './BuildStatus';
import { AIPairProgramming } from '../ai-ui/AIPairProgramming';
import { BackupManager } from '../ui/BackupManager';
import { DocsPanel } from '../docs/DocsPanel';
import { GitModal } from '../ui/GitModal';
import { SettingsModal } from '../ui/SettingsModal';
import { EnvVarsModal } from '../ui/EnvVarsModal';

export const CanvasToolbar: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPairProgramming, setShowPairProgramming] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [showGitModal, setShowGitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEnvVarsModal, setShowEnvVarsModal] = useState(false);

  const { project, saveProject, setProjectName, activeFileId, addToConsole } = useProjectStore();
  const { platform, stack } = usePlatformStore();
  const { toggleAIPanel, setActiveTab } = useUIStore();
  const { triggerRefresh } = usePreviewStore();

  const handleRun = () => {
    if (!activeFileId) {
      addToConsole({ type: 'error', message: 'No active file selected to run.' });
      return;
    }

    addToConsole({ type: 'info', message: `Compiling ${activeFileId}...` });

    try {
      triggerRefresh();
      if (setActiveTab) setActiveTab('Run');
      addToConsole({ type: 'info', message: 'Preview synchronized successfully.' });
    } catch (err) {
      addToConsole({ type: 'error', message: `Run failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    }
  };

  const handleSave = async () => {
    try {
      await saveProject();
      addToConsole({ type: 'info', message: 'Project saved to local storage.' });
    } catch (error) {
      addToConsole({ type: 'error', message: 'Critical: Failed to persist project state.' });
    }
  };

  const handleAIClick = () => {
    if (setActiveTab) setActiveTab('ai');
    toggleAIPanel();
  };

  return (
    <>
      <div className="h-12 border-b border-gray-700 bg-gray-800 px-4 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-4 min-w-max">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:inline">AI Meta Factory</span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={project?.name || 'Untitled'}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none text-sm px-2 py-1 hover:bg-gray-700 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded uppercase tracking-wider">
              {stack || platform}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button onClick={handleSave} className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all active:scale-95">
            <Save size={14} /><span className="hidden md:inline">Save</span>
          </button>
          <button onClick={handleAIClick} className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded text-sm shadow-md">
            <Brain size={14} /><span className="hidden md:inline">AI Assistant</span>
          </button>
          <button onClick={handleRun} className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-transform active:scale-95 shadow-lg shadow-green-900/20">
            <Play size={14} /><span>Run</span>
          </button>
          <div className="h-6 w-px bg-gray-600 mx-1 hidden lg:block" />
          <button onClick={() => setShowSettingsModal(true)} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
          <BuildStatus />
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      {showPairProgramming && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md h-[80vh] bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            <AIPairProgramming onClose={() => setShowPairProgramming(false)} />
          </div>
        </div>
      )}
      {showBackupManager && <BackupManager onClose={() => setShowBackupManager(false)} />}
      {showDocsPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl h-[80vh] bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            <DocsPanel onClose={() => setShowDocsPanel(false)} />
          </div>
        </div>
      )}
      {showGitModal && <GitModal onClose={() => setShowGitModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {showEnvVarsModal && <EnvVarsModal onClose={() => setShowEnvVarsModal(false)} />}
    </>
  );
};
