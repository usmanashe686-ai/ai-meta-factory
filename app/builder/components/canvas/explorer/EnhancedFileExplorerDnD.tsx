'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = { FILE: 'file' };

function FileItem({ file, index }: { file: string; index: number }) {
  const { moveFile } = useProjectStore();

  const [, drag] = useDrag({
    type: ItemType.FILE,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.FILE,
    hover: (item: any) => {
      if (item.index !== index) {
        moveFile(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className="px-3 py-1 hover:bg-gray-700 rounded cursor-move">
      {file.split('/').pop()}
    </div>
  );
}

export function EnhancedFileExplorerDnD() {
  const { files } = useProjectStore();
  const fileKeys = Object.keys(files);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-2">
        {fileKeys.map((file, idx) => (
          <FileItem key={file} index={idx} file={file} />
        ))}
      </div>
    </DndProvider>
  );
}
