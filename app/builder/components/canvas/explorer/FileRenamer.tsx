'use client';

import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../state/project-store';
import { X, Check } from 'lucide-react';

interface FileRenamerProps {
  path: string;
  currentName: string;
  onClose: () => void;
  onRenamed?: (newPath: string) => void;
}

export function FileRenamer({ path, currentName, onClose, onRenamed }: FileRenamerProps) {
  const [name, setName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const project = useProjectStore(state => state.project);
  const renameFile = useProjectStore(state => state.renameFile);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || name === currentName) {
      onClose();
      return;
    }

    // Basic validation
    if (name.includes('/') || name.includes('\\')) {
      setError('Name cannot contain slashes');
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      const newPath = path.split('/').slice(0, -1).concat(name).join('/');

      // Try API call if project exists
      if (project?.id) {
        const response = await fetch(`/api/projects/${project.id}/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPath: path, newPath }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to rename');
        }
      }

      // Update local store
      renameFile(path, newPath);
      onRenamed?.(newPath);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="flex items-center space-x-1">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isRenaming}
        className="flex-1 px-1 bg-gray-800 border border-blue-500 rounded text-sm text-white"
      />
      <button
        onClick={handleSubmit}
        disabled={isRenaming}
        className="p-0.5 hover:bg-gray-700 rounded"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        onClick={onClose}
        className="p-0.5 hover:bg-gray-700 rounded"
      >
        <X className="w-3 h-3" />
      </button>
      {error && <span className="text-xs text-red-400 ml-2">{error}</span>}
    </div>
  );
}
