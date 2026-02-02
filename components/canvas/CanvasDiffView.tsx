"use client";

import { diffFiles, FileDiff } from "./diffUtils";

type CanvasDiffViewProps = {
  before: Record<string, string>;
  after: Record<string, string>;
};

export default function CanvasDiffView({ before, after }: CanvasDiffViewProps) {
  const fileDiffs = diffFiles(before, after);

  if (fileDiffs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center p-8">
          <div className="text-lg mb-2">No changes detected</div>
          <div className="text-sm">
            Generated files are identical to baseline
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 bg-gray-900">
      {fileDiffs.map((fileDiff) => (
        <div key={fileDiff.fileName} className="mb-8 last:mb-0">
          <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg border-b border-gray-700">
            <div className="font-mono text-sm font-medium">
              {fileDiff.fileName}
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-green-400">+{fileDiff.addedCount}</span>
              <span className="text-red-400">-{fileDiff.removedCount}</span>
            </div>
          </div>

          <div className="font-mono text-sm bg-gray-950 rounded-b-lg overflow-hidden">
            {fileDiff.lines.map((line, index) => {
              let bgColor = "bg-gray-950";
              let textColor = "text-gray-400";
              let prefix = "  ";
              let borderColor = "border-gray-800";

              if (line.type === "added") {
                bgColor = "bg-green-900/10";
                textColor = "text-green-300";
                prefix = "+ ";
                borderColor = "border-green-700/30";
              } else if (line.type === "removed") {
                bgColor = "bg-red-900/10";
                textColor = "text-red-300";
                prefix = "- ";
                borderColor = "border-red-700/30";
              }

              return (
                <div
                  key={index}
                  className={`flex border-l-2 ${borderColor} ${bgColor} hover:bg-gray-800/30 transition-colors`}
                >
                  <div className="w-12 px-2 py-1 text-right text-gray-500 select-none border-r border-gray-800">
                    {line.lineNumber}
                  </div>
                  <div className={`flex-1 px-3 py-1 ${textColor} whitespace-pre`}>
                    {prefix}
                    {line.value || " "}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-green-900/50 border border-green-700/50"></div>
            <span>Added lines</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-red-900/50 border border-red-700/50"></div>
            <span>Removed lines</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-gray-800 border border-gray-700"></div>
            <span>Unchanged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
