"use client";

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FileExplorerContent } from './FileExplorerContent';

export function DnDFileExplorer() {
  return (
    <DndProvider backend={HTML5Backend}>
      <FileExplorerContent />
    </DndProvider>
  );
}
