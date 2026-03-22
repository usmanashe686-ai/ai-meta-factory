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

  useEffect(() => {
    if (fileDiffs.length > 0 && activeFile && workingContent === null) {
      setWorkingContent(activeFile.content ?? '');
    }
    if (fileDiffs.length === 0) {
      setWorkingContent(null);
    }
  }, [fileDiffs.length, activeFile, workingContent]);

  const handleArchitectRequest = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsStreaming(true);
    
    // ✅ PRODUCTION-GRADE SELECTION: User Focus -> Meaningful Content -> Null
    const targetFile = activeFile ?? 
                       files.find(f => f.content && f.content.trim().length > 0) ?? 
                       null;
    
    if (!targetFile) {
      addToConsole({ type: 'error', message: "No meaningful source context found." });
      setIsStreaming(false);
      return;
    }

    // This is the V1 "Token Bomb" mapping - we are about to replace this logic
    const richContext = buildAIContext({
      activeFile: {
        path: targetFile.path,
        content: targetFile.content ?? ''
      },
      allFiles: files.map(f => ({
        path: f.path,
        content: f.content ?? ''
      }))
    });

    try {
      await generate(input, 'auto', { context: richContext });
    } catch (err: any) {
      console.error("Architect Engine Error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a] p-4 border-l border-slate-800">
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Architect v2.2</span>
         </div>
       </div>
       
       <textarea 
         value={input} 
         onChange={(e) => setInput(e.target.value)}
         className="w-full bg-[#0d1117] text-slate-200 text-sm p-3 rounded-lg border border-slate-800 h-44 focus:border-blue-500/50 outline-none resize-none transition-all shadow-inner"
         placeholder="What are we building today?"
       />
       
       <button 
         onClick={handleArchitectRequest}
         disabled={isLoading || isStreaming}
         className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 p-2.5 rounded-lg text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
       >
         {isStreaming ? 'Thinking...' : 'Run Architect'}
       </button>
    </div>
  );
};
