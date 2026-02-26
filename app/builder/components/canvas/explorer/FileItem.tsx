'use client';

import React from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Edit2, Copy, Trash2, Check, X,
  FileCode, FileJson, FileImage, File, FileType
} from 'lucide-react';
import { FileNode } from '../types/project.types';

interface FileItemProps {
  file: FileNode;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelect: (file: FileNode) => void;
  onRenameStart: (path: string, currentName: string) => void;
  onDelete: (path: string, type: 'file' | 'folder') => void;
  onDuplicate: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void;
  isRenaming: boolean;
  renamingName: string;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onRenameInputChange: (value: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
}

export function FileItem({
  file,
  expandedFolders,
  onToggleFolder,
  onSelect,
  onRenameStart,
  onDelete,
  onDuplicate,
  onContextMenu,
  isRenaming,
  renamingName,
  onRenameSubmit,
  onRenameCancel,
  onRenameInputChange,
  renameInputRef,
}: FileItemProps) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts': case 'tsx': case 'js': case 'jsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'css': case 'scss':
        return <FileText className="w-4 h-4 text-pink-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg':
        return <FileImage className="w-4 h-4 text-green-400" />;
      case 'py':
        return <FileType className="w-4 h-4 text-green-400" />;
      case 'dart':
        return <File className="w-4 h-4 text-blue-300" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer group"
      onContextMenu={(e) => onContextMenu(e, file.path, file.type)}
      onClick={() => {
        if (file.type === 'folder') {
          onToggleFolder(file.path);
        } else {
          onSelect(file);
        }
      }}
    >
      <div className="flex items-center w-4 mr-1">
        {file.type === 'folder' && (
          expandedFolders.has(file.path) ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )
        )}
      </div>

      <div className="mr-2">
        {file.type === 'folder' ? (
          expandedFolders.has(file.path) ? (
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500/70" />
          )
        ) : (
          getFileIcon(file.name)
        )}
      </div>

      {isRenaming ? (
        <div className="flex items-center flex-1">
          <input
            ref={renameInputRef}
            type="text"
            value={renamingName}
            onChange={(e) => onRenameInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameSubmit();
              if (e.key === 'Escape') onRenameCancel();
            }}
            onBlur={onRenameSubmit}
            className="flex-1 px-1 bg-gray-800 border border-blue-500 rounded text-sm"
            autoFocus
          />
          <button onClick={onRenameSubmit} className="ml-1 p-0.5">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={onRenameCancel} className="ml-1 p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <span className="text-sm truncate flex-1">{file.name}</span>
      )}

      {!isRenaming && (
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenameStart(file.path, file.name);
            }}
            className="p-0.5 hover:bg-gray-700 rounded"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {file.type === 'file' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(file.path);
              }}
              className="p-0.5 hover:bg-gray-700 rounded ml-1"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.path, file.type);
            }}
            className="p-0.5 hover:bg-gray-700 rounded ml-1"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
