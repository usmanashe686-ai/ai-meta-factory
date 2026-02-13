'use client';

import { useProjectStore } from '../state/project-store';
import { 
  Save, 
  Play, 
  Settings, 
  Braces,
  Sparkles,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

export function EditorToolbar() {
  const { activeFileId, saveCurrentFile, formatCurrentFile, runPreview } = useProjectStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  const handleSave = async () => {
    if (!activeFileId) return;
    setIsSaving(true);
    try {
      await saveCurrentFile();
    } finally {
      // Give a brief visual feedback even if the save resolves quickly
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleFormat = async () => {
    if (!activeFileId) return;
    setIsFormatting(true);
    try {
      await formatCurrentFile();
    } finally {
      setTimeout(() => setIsFormatting(false), 300);
    }
  };

  const handleRun = () => {
    if (!activeFileId) return;
    runPreview();
  };

  const handleAIGenerate = () => {
    // This could open the AI panel or trigger an AI generation modal
    console.log('Open AI panel');
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-700 text-gray-300">
      <div className="flex items-center gap-1">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!activeFileId || isSaving}
          className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
          title="Save (Ctrl+S)"
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
        </button>

        {/* Format button */}
        <button
          onClick={handleFormat}
          disabled={!activeFileId || isFormatting}
          className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50"
          title="Format Code (Shift+Alt+F)"
        >
          {isFormatting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Braces size={18} />
          )}
        </button>

        {/* Run / Preview button */}
        <button
          onClick={handleRun}
          disabled={!activeFileId}
          className="p-1.5 rounded hover:bg-gray-700"
          title="Run Preview (Ctrl+Enter)"
        >
          <Play size={18} />
        </button>

        {/* AI Generate button – opens AI panel */}
        <button
          onClick={handleAIGenerate}
          className="p-1.5 rounded hover:bg-gray-700 text-purple-400"
          title="AI Generate (Ctrl+I)"
        >
          <Sparkles size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Language indicator – could be dynamic based on active file */}
        <span className="text-xs px-2 py-1 bg-gray-700 rounded">
          {activeFileId ? 'TypeScript' : '—'}
        </span>

        {/* Export dropdown placeholder */}
        <button className="p-1.5 rounded hover:bg-gray-700" title="Export">
          <Download size={18} />
        </button>

        {/* Share placeholder */}
        <button className="p-1.5 rounded hover:bg-gray-700" title="Share">
          <Share2 size={18} />
        </button>

        {/* Settings placeholder */}
        <button className="p-1.5 rounded hover:bg-gray-700" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
