'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bot, Sparkles, RefreshCw, Zap, 
  History, FileText, Trash2, Check, 
  X, Layers, AlertTriangle 
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { useLocalAIStore } from '../state/local-ai-store';
import { buildAIContext } from './context-builder';
import { parseDiffIntoHunks, DiffHunk } from './diff-utils';
import { HunkEditor } from './HunkEditor';
import { applyPatch } from 'diff';

export const AIChatSidebar: React.FC = () => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingDiff, setStreamingDiff] = useState('');
  const [pendingHunks, setPendingHunks] = useState<DiffHunk[]>([]);
  const [workingContent, setWorkingContent] = useState<string | null>(null);
  const [recentFilePaths, setRecentFilePaths] = useState<string[]>([]);

  const { files, activeFileId, updateFileContent, addToConsole } = useProjectStore();
  const { generate, isLoading, currentModel, fetchAvailableModels } = useLocalAIStore();

  const activeFile = files.find(f => f.id === activeFileId);

  // 1. Fetch models on mount
  useEffect(() => {
    fetchAvailableModels();
  }, []);

  // 2. Track "Hot Files" for Context Awareness
  useEffect(() => {
    if (activeFile) {
      setRecentFilePaths(prev => {
        const filtered = prev.filter(p => p !== activeFile.path);
        return [activeFile.path, ...filtered].slice(0, 4);
      });
    }
  }, [activeFileId]);

  // 3. Sequential Patching: Initialize local working copy when hunks arrive
  useEffect(() => {
    if (pendingHunks.length > 0 && activeFile && !workingContent) {
      setWorkingContent(activeFile.content);
    }
    if (pendingHunks.length === 0) {
      setWorkingContent(null);
    }
  }, [pendingHunks, activeFile]);

  const handleArchitectRequest = async () => {
    if (!activeFile || !input.trim() || isLoading) return;
    
    setStreamingDiff('');
    setIsStreaming(true);
    setPendingHunks([]);

    try {
      // BUILD DETERMINISTIC CONTEXT (Imports + File Tree + Hot Files)
      const richContext = buildAIContext({
        activeFile,
        allFiles: files,
        recentFilePaths: recentFilePaths.slice(1) // Don't include active file twice
      });

      // CALL ENGINE
      const fullDiff = await generate(
        richContext + "\nUser Request: " + input, 
        'auto', 
        { max_tokens: 2000 },
        (token) => setStreamingDiff(prev => prev + token)
      );
      
      const parsed = parseDiffIntoHunks(fullDiff);
      
      if (parsed.length === 0) {
        addToConsole({ type: 'error', message: "AI returned invalid diff format." });
      }

      setPendingHunks(parsed);
    } catch (err: any) {
      addToConsole({ type: 'error', message: err.message });
    } finally {
      setIsStreaming(false);
      setInput('');
    }
  };

  const applyHunk = (hunk: DiffHunk) => {
    const currentBase = workingContent || activeFile?.content;
    if (!activeFile || !currentBase) return;

    // Create a standalone patch for this specific hunk
    const hunkPatch = `--- a/${activeFile.path}\n+++ b/${activeFile.path}\n${hunk.content}`;
    
    try {
      const patched = applyPatch(currentBase, hunkPatch);
      
      if (patched !== false) {
        setWorkingContent(patched); // Update local sequence
        updateFileContent(activeFile.id, patched); // Sync to global IDE state
        setPendingHunks(prev => prev.filter(h => h.id !== hunk.id));
        addToConsole({ type: 'success', message: `Hunk applied to ${activeFile.path}` });
      } else {
        throw new Error("Context mismatch. This hunk's line numbers are no longer valid.");
      }
    } catch (err: any) {
      addToConsole({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a] text-slate-300 border-l border-slate-800 shadow-2xl">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-800 bg-[#161b2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400 fill-amber-400/20" />
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">
            {currentModel?.name || 'Local Architect'}
          </span>
        </div>
        {pendingHunks.length > 0 && (
          <button 
            onClick={() => setPendingHunks([])}
            className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* BREADCRUMBS: The "Hot Files" context view */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/50 mb-2">
          {recentFilePaths.map(path => (
            <div key={path} className="flex items-center gap-1 px-2 py-1 bg-slate-900/50 rounded border border-slate-800 text-[9px] text-slate-500 whitespace-nowrap">
              <FileText size={10} /> {path.split('/').pop()}
            </div>
          ))}
        </div>

        {/* STREAMING FEEDBACK */}
        {isStreaming && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
              <RefreshCw size={12} className="animate-spin" /> GENERATING UNIFIED DIFF...
            </div>
            <pre className="p-3 bg-black/40 rounded-lg border border-emerald-500/20 text-[10px] font-mono text-emerald-500/60 whitespace-pre-wrap overflow-hidden">
              {streamingDiff || "Awaiting first token..."}
            </pre>
          </div>
        )}

        {/* HUNK QUEUE */}
        {pendingHunks.length > 0 && !isStreaming ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Proposed Changes ({pendingHunks.length})
              </span>
            </div>
            <HunkEditor 
              hunks={pendingHunks} 
              onApplyHunk={applyHunk}
              onDiscardHunk={(id) => setPendingHunks(prev => prev.filter(h => h.id !== id))}
            />
          </div>
        ) : !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
            <Layers size={48} className="mb-4" />
            <p className="text-xs font-medium">No pending changes</p>
            <p className="text-[10px]">Describe a change below to start refactoring</p>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-[#161b2a] border-t border-slate-800">
        {!activeFile && (
          <div className="mb-2 flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
            <AlertTriangle size={12} /> Select a file to edit
          </div>
        )}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !activeFile}
            placeholder="e.g. 'Add a new method to handle user login...'"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pr-12 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none resize-none h-28 transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleArchitectRequest}
            disabled={isLoading || !input.trim() || !activeFile}
            className="absolute right-3 bottom-3 p-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-lg transition-all active:scale-90 shadow-xl"
          >
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        </div>
      </div>

    </div>
  );
};
