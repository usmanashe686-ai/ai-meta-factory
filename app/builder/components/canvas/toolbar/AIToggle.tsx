import React from 'react';
import { useUIStore } from '../../state/ui-store';

export const AIToggle: React.FC = () => {
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();

  return (
    <button
      onClick={toggleAIPanel}
      className={`px-3 py-1 rounded flex items-center ${
        isAIPanelOpen
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'bg-gray-600 text-white hover:bg-gray-700'
      }`}
      title="Toggle AI Assistant"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 2 2 0 00-2 2v4h-2a2 2 0 00-2 2z" />
      </svg>
      AI
    </button>
  );
};
// Toggle for AI panel
