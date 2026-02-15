import React, { useEffect, useRef } from 'react';
import { useCollaboration } from './CollaborationProvider';

interface CursorOverlayProps {
  editorContainerRef: React.RefObject<HTMLDivElement>;
  getPositionFromLineColumn?: (line: number, column: number) => { x: number; y: number } | null;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({
  editorContainerRef,
  getPositionFromLineColumn,
}) => {
  const { users } = useCollaboration();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !editorContainerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = editorContainerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cursors for remote users
    users.forEach(user => {
      if (!user.cursor || user.id === useCollaboration().currentUser?.id) return;

      // If we have a position mapping function, use it; otherwise draw at (0,0) with a note
      let x = 0, y = 0;
      if (getPositionFromLineColumn) {
        const pos = getPositionFromLineColumn(user.cursor.line, user.cursor.column);
        if (pos) {
          x = pos.x;
          y = pos.y;
        }
      }

      // Draw cursor triangle
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y);
      ctx.lineTo(x, y + 10);
      ctx.closePath();
      ctx.fillStyle = user.color || '#ff0000';
      ctx.fill();

      // Draw user name
      ctx.font = '12px sans-serif';
      ctx.fillStyle = user.color || '#ff0000';
      ctx.fillText(user.name, x + 15, y - 5);
    });
  }, [users, editorContainerRef, getPositionFromLineColumn]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
