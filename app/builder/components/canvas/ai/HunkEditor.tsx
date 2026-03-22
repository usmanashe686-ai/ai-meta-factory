'use client';

import React, { useMemo } from 'react';
import { Check, X, Code, AlertCircle } from 'lucide-react';
import { DiffHunk } from './diff-utils';
import { applyPatch } from 'diff';

interface HunkEditorProps {
  hunks: DiffHunk[];
  baseContent: string;
  filePath: string;
  onApplyHunk: (hunk: DiffHunk) => void;
  onDiscardHunk: (hunkId: string) => void;
}

export const HunkEditor: React.FC<HunkEditorProps> = ({ 
  hunks, 
  baseContent, 
  filePath,
  onApplyHunk, 
  onDiscardHunk 
}) => {
  return (
    <div className="space-y-6">
      {hunks.map((hunk) => {
        // Generate a localized preview just for this hunk
        const hunkPatch = `--- a/${filePath}\n+++ b/${filePath}\n${hunk.content}`;
        let previewAfter: string | null = null;
        let hasError = false;

        try {
          const result = applyPatch(baseContent, hunkPatch);
          if (result === false) hasError = true;
          else previewAfter = result;
        } catch {
          hasError = true;
        }

        return (
          <div key={hunk.id} className="group border border-slate-800 rounded-xl overflow-hidden bg-[#0b0f1a] shadow-lg transition-all hover:border-slate-700">
            {/* Hunk Header */}
            <div className="bg-[#161b2a] px-3 py-2 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-500">{hunk.header}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onApplyHunk(hunk)}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded text-[10px] font-bold transition-all"
                >
                  <Check size={12} /> ACCEPT
                </button>
                <button 
                  onClick={() => onDiscardHunk(hunk.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded text-[10px] font-bold transition-all"
                >
                  <X size={12} /> REJECT
                </button>
              </div>
            </div>

            {/* Side-by-Side Visual Diff */}
            <div className="grid grid-cols-2 divide-x divide-slate-800 bg-black/20">
              {/* Left: Original Context (Removals) */}
              <div className="p-3 overflow-x-auto">
                <div className="text-[9px] uppercase tracking-widest text-slate-600 mb-2 font-bold">Original</div>
                <div className="text-[11px] font-mono leading-relaxed space-y-0.5">
                  {hunk.changes.filter(c => c.type !== 'add').map((change, i) => (
                    <div key={i} className={`${change.type === 'remove' ? 'bg-red-500/10 text-red-400/80' : 'text-slate-500 opacity-40'}`}>
                      {change.type === 'remove' ? '-' : ' '} {change.content || ' '}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Modified Context (Additions) */}
              <div className="p-3 overflow-x-auto bg-emerald-500/[0.02]">
                <div className="text-[9px] uppercase tracking-widest text-emerald-600/50 mb-2 font-bold">Proposed</div>
                {hasError ? (
                  <div className="flex flex-col items-center justify-center h-full text-amber-500/50 py-4">
                    <AlertCircle size={16} className="mb-1" />
                    <span className="text-[9px]">Context Mismatch</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono leading-relaxed space-y-0.5">
                    {hunk.changes.filter(c => c.type !== 'remove').map((change, i) => (
                      <div key={i} className={`${change.type === 'add' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}>
                        {change.type === 'add' ? '+' : ' '} {change.content || ' '}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
