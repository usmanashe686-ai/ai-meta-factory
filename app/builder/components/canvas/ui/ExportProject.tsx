'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

// Helper to flatten tree into a record of path -> content
const flattenFiles = (nodes: FileNode[], basePath = ''): Record<string, string> => {
  let result: Record<string, string> = {};
  nodes.forEach(node => {
    const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
    if (node.type === 'file') {
      // Provide fallback empty string if content is undefined
      result[fullPath] = node.content ?? '';
    } else if (node.children) {
      result = { ...result, ...flattenFiles(node.children, fullPath) };
    }
  });
  return result;
};

export function ExportProject() {
  const { files } = useProjectStore();

  const handleExport = async () => {
    const zip = new JSZip();
    const flatFiles = flattenFiles(files);

    Object.entries(flatFiles).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'project.zip');
  };

  return (
    <button
      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
      onClick={handleExport}
    >
      Export ZIP
    </button>
  );
}
