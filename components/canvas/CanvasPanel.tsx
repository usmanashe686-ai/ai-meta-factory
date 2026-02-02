"use client";

import { useState } from "react";
import CanvasDiffView from "./CanvasDiffView";

type CanvasPanelProps = {
  baseFiles: Record<string, string>;
  generatedFiles: Record<string, string>;
  onGenerateComponents?: () => void;
};

export default function CanvasPanel({ 
  baseFiles, 
  generatedFiles,
  onGenerateComponents 
}: CanvasPanelProps) {
  const [mode, setMode] = useState<"preview" | "diff">("preview");
  
  const hasGeneratedFiles = Object.keys(generatedFiles).length > 0;
  const hasBaseFiles = Object.keys(baseFiles).length > 0;

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🎨 Component Canvas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {hasGeneratedFiles 
              ? `${Object.keys(generatedFiles).length} generated files`
              : "No files generated yet"}
          </p>
        </div>
        
        {/* Mode Toggle */}
        {hasGeneratedFiles && (
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setMode("preview")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "preview"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setMode("diff")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "diff"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Diff View
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {!hasGeneratedFiles ? (
          // Empty state - matches your existing design
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🎨</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Drag & Drop Canvas</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Drag generated components here to build complete layouts and pages
            </p>
            <button 
              onClick={onGenerateComponents}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Generate Components First
            </button>
          </div>
        ) : mode === "diff" ? (
          // Diff View
          <div className="h-full p-6">
            <CanvasDiffView before={baseFiles} after={generatedFiles} />
          </div>
        ) : (
          // Preview View
          <div className="h-full p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 h-full overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(generatedFiles).map(([fileName, content]) => (
                  <div key={fileName} className="bg-white border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                      <div className="font-mono text-sm font-medium truncate">{fileName}</div>
                      <div className="text-xs text-gray-500">
                        {content.split('\n').length} lines
                      </div>
                    </div>
                    <pre className="p-4 text-xs bg-gray-50 max-h-40 overflow-auto">
                      {content.substring(0, 200)}
                      {content.length > 200 ? "..." : ""}
                    </pre>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Generated Files Summary</div>
                    <div className="text-sm text-gray-600">
                      {Object.keys(generatedFiles).length} files, {Object.values(generatedFiles).reduce((acc, content) => acc + content.split('\n').length, 0)} total lines
                    </div>
                  </div>
                  <button 
                    onClick={() => setMode("diff")}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
