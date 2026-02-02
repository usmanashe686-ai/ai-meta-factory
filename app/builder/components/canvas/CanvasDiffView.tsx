"use client";

import React from 'react';
import { computeLineDiff, computeFileDiffs, getDiffSummary, type FileDiff } from './diffUtils';

interface CanvasDiffViewProps {
  before: Record<string, string>;
  after: Record<string, string>;
  className?: string;
  onOpenEditor?: (fileName: string) => void; // NEW: callback to open editor
}

export const CanvasDiffView: React.FC<CanvasDiffViewProps> = ({
  before,
  after,
  className = '',
  onOpenEditor
}) => {
  // Compute diffs
  const fileDiffs = computeFileDiffs(before, after);
  const summary = getDiffSummary(fileDiffs);

  if (fileDiffs.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <div className="text-lg mb-2">✨ No changes detected</div>
        <div className="text-sm">The generated files are identical to the baseline</div>
        <div className="mt-4">
          <button
            onClick={() => onOpenEditor?.('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Open Editor to Make Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Summary Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">
          {fileDiffs.length} file{fileDiffs.length !== 1 ? 's' : ''} changed
          {summary.totalAdded > 0 && `, +${summary.totalAdded}`}
          {summary.totalRemoved > 0 && `, -${summary.totalRemoved}`}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">+{summary.totalAdded}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">-{summary.totalRemoved}</span>
          </div>
          {onOpenEditor && (
            <button
              onClick={() => onOpenEditor('')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit All Files
            </button>
          )}
        </div>
      </div>

      {/* File Diffs */}
      <div className="flex-1 overflow-auto p-4">
        {fileDiffs.map((fileDiff) => (
          <div key={fileDiff.fileName} className="mb-6">
            {/* File Header with Edit Button */}
            <div className="flex items-center justify-between bg-gray-800 text-gray-100 px-4 py-2 rounded-t-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-mono text-sm">{fileDiff.fileName}</span>
                <span className="ml-3 text-xs px-2 py-1 bg-gray-700 rounded">
                  {fileDiff.added > 0 && `+${fileDiff.added}`}
                  {fileDiff.added > 0 && fileDiff.removed > 0 && ' '}
                  {fileDiff.removed > 0 && `-${fileDiff.removed}`}
                </span>
              </div>
              
              {/* EDIT BUTTON - NEW */}
              {onOpenEditor && (
                <button
                  onClick={() => onOpenEditor(fileDiff.fileName)}
                  className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit in Editor
                </button>
              )}
            </div>

            {/* Diff Lines */}
            <div className="font-mono text-sm bg-gray-900 text-gray-100 rounded-b-lg overflow-hidden">
              {fileDiff.lines.map((line, index) => {
                let bgColor = 'bg-gray-900';
                let borderColor = 'border-gray-800';
                let prefix = '  ';
                
                if (line.type === 'added') {
                  bgColor = 'bg-green-900/20';
                  borderColor = 'border-green-700/30';
                  prefix = '+ ';
                } else if (line.type === 'removed') {
                  bgColor = 'bg-red-900/20';
                  borderColor = 'border-red-700/30';
                  prefix = '- ';
                }

                return (
                  <div
                    key={index}
                    className={`flex border-l-4 ${borderColor} ${bgColor} hover:bg-gray-800/50 transition-colors`}
                  >
                    <div className="w-12 px-2 py-1 text-right text-gray-500 border-r border-gray-800 select-none">
                      {index + 1}
                    </div>
                    <div className="flex-1 px-3 py-1 whitespace-pre-wrap">
                      <span className={
                        line.type === 'added' 
                          ? 'text-green-300' 
                          : line.type === 'removed' 
                            ? 'text-red-300' 
                            : 'text-gray-300'
                      }>
                        {prefix}{line.content || ' '}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-green-500 mr-2"></div>
              <span>Added lines</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
              <span>Removed lines</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-gray-400 mr-2"></div>
              <span>Unchanged</span>
            </div>
          </div>
          
          {onOpenEditor && (
            <button
              onClick={() => onOpenEditor('')}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Open All Files in Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
