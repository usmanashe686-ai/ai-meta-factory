"use client";

import { useState, useEffect } from 'react';
import { diffLines } from 'diff';
import {
  RefreshCw, Check, X, AlertCircle, Zap,
  Code, FileCode, GitMerge, ChevronDown, ChevronUp
} from 'lucide-react';

interface AIDiffToolProps {
  originalCode: string;
  currentCode: string;
  fileName: string;
  onAccept: (newCode: string) => void;
  onReject: () => void;
  onGenerateImprovement: () => Promise<string>;
  onRegenerate: () => Promise<string>;
}

interface CodeDiff {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  count?: number;
}

export default function AIDiffTool({
  originalCode,
  currentCode,
  fileName,
  onAccept,
  onReject,
  onGenerateImprovement,
  onRegenerate
}: AIDiffToolProps) {
  const [diffs, setDiffs] = useState<CodeDiff[]>([]);
  const [improvedCode, setImprovedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Calculate diffs when code changes
  useEffect(() => {
    if (originalCode && currentCode) {
      const lineDiffs = diffLines(originalCode, currentCode);
      const formattedDiffs: CodeDiff[] = lineDiffs.map(diff => ({
        type: diff.added
          ? 'added'
          : diff.removed
          ? 'removed'
          : 'unchanged',
        value: diff.value || '',
        count: diff.count || 0
      }));
      setDiffs(formattedDiffs);
    }
  }, [originalCode, currentCode]);

  // Get diff stats
  const diffStats = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    unchanged: diffs.filter(d => d.type === 'unchanged').length
  };

  // Get improvement suggestions
  const getImprovementSuggestions = () => {
    const suggestions: string[] = [];

    if (currentCode.includes('any')) {
      suggestions.push('Replace `any` with proper TypeScript types');
    }
    if (currentCode.includes('console.log')) {
      suggestions.push('Remove debug console logs for production');
    }
    if (currentCode.match(/style\s*=\s*{[^}]*}/)) {
      suggestions.push('Consider using Tailwind classes instead of inline styles');
    }
    if (currentCode.includes('// TODO')) {
      suggestions.push('Address TODO comments');
    }
    if (currentCode.includes('setTimeout') || currentCode.includes('setInterval')) {
      suggestions.push('Add cleanup for timers/intervals');
    }
    if (currentCode.includes('document.') || currentCode.includes('window.')) {
      suggestions.push('Check for SSR compatibility');
    }
    if (currentCode.length > 5000) {
      suggestions.push('Consider splitting component into smaller pieces');
    }

    return suggestions.length > 0
      ? suggestions.slice(0, 3)
      : ['Code looks good! No major improvements needed.'];
  };

  const handleGenerateImproved = async () => {
    setIsGenerating(true);
    try {
      const improved = await onGenerateImprovement();
      setImprovedCode(improved);
    } catch (error) {
      console.error('Failed to generate improvement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptImproved = () => {
    if (improvedCode) {
      onAccept(improvedCode);
      setImprovedCode('');
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const regenerated = await onRegenerate();
      onAccept(regenerated);
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = getImprovementSuggestions();

  return (
    <div className="border-t border-gray-800 bg-gray-900">
      {/* Diff Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitMerge className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">AI Code Analysis</h3>
              <p className="text-xs text-gray-400">
                {fileName} • {diffStats.added} additions, {diffStats.removed} deletions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
              className="px-3 py-1 text-xs border border-gray-700 rounded hover:bg-gray-800"
            >
              {viewMode === 'split' ? 'Unified View' : 'Split View'}
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-1 text-gray-400 hover:text-white"
            >
              {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-4 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-white mb-2">AI Suggestions</h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleGenerateImproved}
              disabled={isGenerating}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  Generate Improved Version
                </>
              )}
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-3 py-1.5 text-sm border border-gray-700 text-gray-300 rounded flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate Entire File
            </button>
          </div>
        </div>
      )}

      {/* Improved Code Preview */}
      {improvedCode && (
        <div className="p-4 border-b border-gray-800 bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Improved Version</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAcceptImproved}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded flex items-center gap-1 hover:bg-green-700"
              >
                <Check className="w-3 h-3" />
                Accept
              </button>
              <button
                onClick={() => setImprovedCode('')}
                className="px-3 py-1 text-sm border border-gray-700 text-gray-300 rounded flex items-center gap-1 hover:bg-gray-800"
              >
                <X className="w-3 h-3" />
                Dismiss
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded border border-gray-700 p-3">
            <pre className="text-sm text-green-400 overflow-auto max-h-48">
              {improvedCode}
            </pre>
          </div>
        </div>
      )}

      {/* Diff View */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Original */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-2">Original</div>
            <div className="bg-gray-950 rounded border border-gray-800 p-3">
              <pre className="text-sm text-gray-400 overflow-auto max-h-64">
                {originalCode}
              </pre>
            </div>
          </div>

          {/* Current */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-2">Your Changes</div>
            <div className="bg-gray-950 rounded border border-gray-800 p-3">
              <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                {currentCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onReject}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800"
          >
            Keep My Version
          </button>
          <button
            onClick={() => onAccept(originalCode)}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800"
          >
            Revert to Original
          </button>
        </div>
      </div>
    </div>
  );
}
