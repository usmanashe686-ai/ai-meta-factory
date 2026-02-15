import React, { useState, useEffect } from 'react';
import { Template } from './TemplateLibrary';
import { useProjectStore } from '../../state/project-store';
import { useRouter } from 'next/navigation';

interface TemplatePreviewProps {
  template: Template | null;
  onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('');
  const { createProjectFromTemplate } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    if (template && template.files) {
      // Set first file as active
      setActiveFile(Object.keys(template.files)[0] || '');
    }
  }, [template]);

  if (!template) return null;

  const handleUseTemplate = () => {
    createProjectFromTemplate(template);
    onClose();
    // Optionally navigate to canvas
    router.push('/builder');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{template.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-gray-700 p-2 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Files</h3>
            {Object.keys(template.files).map(file => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`block w-full text-left px-3 py-2 rounded text-sm mb-1 ${
                  activeFile === file
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {file}
              </button>
            ))}
          </div>
          <div className="w-2/3 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Preview</h3>
            {activeFile && template.files[activeFile] && (
              <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                <code>{template.files[activeFile]}</code>
              </pre>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUseTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};
