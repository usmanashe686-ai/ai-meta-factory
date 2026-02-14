'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';
import { Save, Download, Share2, Settings, Menu } from 'lucide-react';

const CanvasHeader: React.FC = () => {
  const { projectName, saveProject, exportProject } = useProjectStore();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-gray-200">
      {/* Left side: logo and project name */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-1 hover:bg-gray-800 rounded">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Meta Factory
          </span>
          {projectName && (
            <>
              <span className="text-gray-600">/</span>
              <span className="font-medium">{projectName}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={saveProject}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          onClick={exportProject}
          className="p-2 hover:bg-gray-800 rounded-md"
          title="Export"
        >
          <Download size={18} />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-md" title="Share">
          <Share2 size={18} />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-md" title="Settings">
          <Settings size={18} />
        </button>
        {/* User avatar placeholder */}
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
          U
        </div>
      </div>
    </header>
  );
};

export default CanvasHeader;
