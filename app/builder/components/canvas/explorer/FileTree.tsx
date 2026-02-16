'use client';

import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, File, FileText, FileCode } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface FileTreeProps {
  tree: Record<string, any>;
  depth?: number;
  onContextMenu: (e: React.MouseEvent, path?: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  depth = 0,
  onContextMenu
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const activeFileId = useProjectStore((state) => state.activeFileId);
  const setActiveFile = useProjectStore((state) => state.setActiveFile);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileClick = (path: string) => {
    setActiveFile(path);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return <FileCode size={14} className="text-blue-400" />;
      case 'ts':
      case 'js':
        return <FileCode size={14} className="text-yellow-400" />;
      case 'css':
      case 'scss':
        return <FileCode size={14} className="text-purple-400" />;
      case 'json':
        return <FileText size={14} className="text-green-400" />;
      case 'md':
        return <FileText size={14} className="text-gray-400" />;
      default:
        return <File size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="select-none">
      {Object.entries(tree).map(([key, value]) => {
        const isFolder = value.type === 'folder';
        const isExpanded = expanded[key];

        return (
          <div key={key}>
            <div
              className={`flex items-center px-2 py-1 rounded cursor-pointer ${
                activeFileId === value.path ? 'bg-blue-900/30 text-blue-300' : 'hover:bg-gray-800'
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (isFolder) {
                  toggleExpand(key);
                } else {
                  handleFileClick(value.path);
                }
              }}
              onContextMenu={(e) => onContextMenu(e, value.path)}
            >
              {isFolder ? (
                <>
                  {isExpanded ? (
                    <ChevronDown size={14} className="mr-1 text-gray-400" />
                  ) : (
                    <ChevronRight size={14} className="mr-1 text-gray-400" />
                  )}
                  <Folder size={14} className="mr-2 text-yellow-500" />
                </>
              ) : (
                <div className="w-6 mr-1 flex justify-center">
                  {getFileIcon(key)}
                </div>
              )}
              <span className={`text-sm ${isFolder ? 'font-medium' : ''}`}>
                {key}
              </span>

              {key === '.keep' && (
                <span className="ml-2 text-xs px-1 bg-gray-700 rounded">dir</span>
              )}
            </div>

            {isFolder && isExpanded && value.children && (
              <FileTree
                tree={value.children}
                depth={depth + 1}
                onContextMenu={onContextMenu}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
