'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../state/project-store';
import { useLocalAIStore } from '../state/local-ai-store';
import { buildAIContext } from './context-builder';
import { parseDiffIntoHunks, DiffHunk } from './diff-utils';
import { HunkEditor } from './HunkEditor';
import { applyPatch } from 'diff';

export const AIChatSidebar: React.FC = () => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [fileDiffs, setFileDiffs] = useState<any[]>([]);
  const [workingContent, setWorkingContent] = useState<string | null>(null);

  const { files, activeFileId, updateFileContent, addToConsole } = useProjectStore();
  const { generate, isLoading } = useLocalAIStore();
  
  const activeFile = files.find(f => f.id === activeFileId);

  // ✅ THE ARCHITECT'S FIX: Explicit State Consistency
  useEffect(() => {
    if (fileDiffs.length > 0 && activeFile) {
      // Content is string | undefined, State is string | null
      // We explicitly map undefined -> null to maintain the "No Content" state
      const content = activeFile.content ?? null;
      
      if (workingContent === null) {
        setWorkingContent(content);
      }
    }
    
    if (fileDiffs.length === 0) {
      setWorkingContent(null);
    }
  }, [fileDiffs.length, activeFile, workingContent]);

  const handleArchitectRequest = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsStreaming(true);
    // Safe guard: Use activeFile, fallback to first file, or null.
    const targetFile = activeFile ?? files[0] ?? null;
    
    if (!targetFile) {
      addToConsole({ type: 'error', message: "No active file found for context." });
      setIsStreaming(false);
      return;
    }

    const richContext = buildAIContext({
      activeFile: targetFile,
      allFiles: files
    });

    try {
      await generate(input, 'auto', { context: richContext });
    } catch (err: any) {
      console.error("Architect error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a] p-4">
       <div className="text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-widest">Architect Mode</div>
       <textarea 
         value={input} 
         onChange={(e) => setInput(e.target.value)}
         className="w-full bg-slate-900 text-slate-200 text-sm p-3 rounded border border-slate-800 h-32 focus:border-blue-500 outline-none"
         placeholder="e.g., 'Refactor the theme logic to use CSS variables'..."
       />
       <button 
         onClick={handleArchitectRequest}
         disabled={isLoading || isStreaming}
         className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2 rounded text-xs font-bold text-white transition-colors"
       >
         {isStreaming ? 'Thinking...' : 'Generate Patch'}
       </button>
    </div>
  );
};
