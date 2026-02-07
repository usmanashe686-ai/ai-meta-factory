'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useProjectStore } from '../state/project-store';

export function ExportProject() {
  const { files } = useProjectStore();

  const handleExport = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content);
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
