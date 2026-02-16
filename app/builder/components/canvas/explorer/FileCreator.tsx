'use client';

import { useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';
import { X } from 'lucide-react';

interface FileCreatorProps {
  parentPath: string;           // the directory where the new item will be created
  onClose: () => void;
  onCreated?: (node: FileNode) => void;
}

export function FileCreator({ parentPath, onClose, onCreated }: FileCreatorProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'file' | 'folder'>('file');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const project = useProjectStore(state => state.project);
  const createFile = useProjectStore(state => state.createFile);
  const projectId = project?.id;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Basic name validation: no slashes, no weird characters
    if (name.includes('/') || name.includes('\\')) {
      setError('Name cannot contain slashes');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const fullPath = parentPath ? `${parentPath}/${name}` : name;

      // If we have a projectId, try to create via API
      if (projectId) {
        const endpoint = type === 'folder'
          ? `/api/projects/${projectId}/folders/${encodeURIComponent(fullPath)}`
          : `/api/projects/${projectId}/files/${encodeURIComponent(fullPath)}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          ...(type === 'file' && { body: JSON.stringify({ content: '' }) }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to create ${type}`);
        }
      }

      // Update local store
      createFile(fullPath, '', type === 'folder');

      // Create a local node for the callback
      const newNode: FileNode = {
        id: fullPath,
        name,
        type,
        path: fullPath,
        ...(type === 'folder' ? { children: [] } : { content: '' }),
      };

      onCreated?.(newNode);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={type === 'file'}
                  onChange={() => setType('file')}
                  className="mr-2"
                />
                File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="folder"
                  checked={type === 'folder'}
                  onChange={() => setType('folder')}
                  className="mr-2"
                />
                Folder
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'folder' ? 'folder-name' : 'file.tsx'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
