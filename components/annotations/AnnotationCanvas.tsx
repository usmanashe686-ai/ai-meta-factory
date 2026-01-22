import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text } from 'react-konva';
import { useAnnotationStore } from '@/store/annotation-store';

export const AnnotationCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const {
    selectedTool,
    color,
    strokeWidth,
    annotations,
    addAnnotation
  } = useAnnotationStore();
  
  const projectId = 'current-project'; // Get from context/props
  
  const handleMouseDown = (e: any) => {
    if (!stageRef.current) return;
    
    const pos = stageRef.current.getPointerPosition();
    setIsDrawing(true);
    
    if (selectedTool === 'pen') {
      const newLine = {
        tool: 'pen',
        points: [pos.x, pos.y],
        color,
        strokeWidth
      };
      setLines([...lines, newLine]);
    } else if (selectedTool === 'rectangle') {
      const newRect = {
        tool: 'rectangle',
        points: [pos.x, pos.y, pos.x, pos.y],
        color,
        strokeWidth
      };
      setLines([...lines, newRect]);
    } else if (selectedTool === 'circle') {
      const newCircle = {
        tool: 'circle',
        points: [pos.x, pos.y, 0],
        color,
        strokeWidth
      };
      setLines([...lines, newCircle]);
    } else if (selectedTool === 'arrow') {
      const newArrow = {
        tool: 'arrow',
        points: [pos.x, pos.y, pos.x, pos.y],
        color,
        strokeWidth
      };
      setLines([...lines, newArrow]);
    } else if (selectedTool === 'text') {
      const newText = {
        tool: 'text',
        points: [pos.x, pos.y],
        text: 'Double click to edit',
        color,
        fontSize: 16
      };
      setLines([...lines, newText]);
    }
  };
  
  const handleMouseMove = (e: any) => {
    if (!isDrawing || !stageRef.current) return;
    
    const pos = stageRef.current.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    if (selectedTool === 'pen') {
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    } else if (selectedTool === 'rectangle') {
      lastLine.points = [lastLine.points[0], lastLine.points[1], pos.x, pos.y];
      setLines([...lines.slice(0, -1), lastLine]);
    } else if (selectedTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - lastLine.points[0], 2) +
        Math.pow(pos.y - lastLine.points[1], 2)
      );
      lastLine.points[2] = radius;
      setLines([...lines.slice(0, -1), lastLine]);
    } else if (selectedTool === 'arrow') {
      lastLine.points = [lastLine.points[0], lastLine.points[1], pos.x, pos.y];
      setLines([...lines.slice(0, -1), lastLine]);
    }
  };
  
  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      addAnnotation({
        projectId,
        type: lastLine.tool,
        points: lastLine.points,
        color: lastLine.color,
        strokeWidth: lastLine.strokeWidth,
        author: {
          id: 'current-user',
          name: 'Current User'
        }
      });
    }
  };
  
  // Load saved annotations
  useEffect(() => {
    const savedAnnotations = annotations.filter(ann => ann.projectId === projectId);
    setLines(savedAnnotations.map(ann => ({
      tool: ann.type,
      points: ann.points,
      color: ann.color,
      strokeWidth: ann.strokeWidth
    })));
  }, [annotations, projectId]);
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth * 0.7}
      height={600}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      className="absolute inset-0"
    >
      <Layer>
        {/* Saved Annotations */}
        {annotations
          .filter(ann => ann.projectId === projectId)
          .map((annotation, i) => {
            if (annotation.type === 'pen') {
              return (
                <Line
                  key={annotation.id}
                  points={annotation.points}
                  stroke={annotation.color}
                  strokeWidth={annotation.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            } else if (annotation.type === 'rectangle') {
              return (
                <Rect
                  key={annotation.id}
                  x={annotation.points[0]}
                  y={annotation.points[1]}
                  width={annotation.points[2] - annotation.points[0]}
                  height={annotation.points[3] - annotation.points[1]}
                  stroke={annotation.color}
                  strokeWidth={annotation.strokeWidth}
                />
              );
            } else if (annotation.type === 'circle') {
              return (
                <Circle
                  key={annotation.id}
                  x={annotation.points[0]}
                  y={annotation.points[1]}
                  radius={annotation.points[2]}
                  stroke={annotation.color}
                  strokeWidth={annotation.strokeWidth}
                />
              );
            } else if (annotation.type === 'arrow') {
              return (
                <Arrow
                  key={annotation.id}
                  points={annotation.points}
                  stroke={annotation.color}
                  strokeWidth={annotation.strokeWidth}
                  fill={annotation.color}
                />
              );
            } else if (annotation.type === 'text') {
              return (
                <Text
                  key={annotation.id}
                  x={annotation.points[0]}
                  y={annotation.points[1]}
                  text={annotation.text || 'Text'}
                  fontSize={annotation.fontSize || 16}
                  fill={annotation.color}
                />
              );
            }
            return null;
          })}
        
        {/* Current Drawing Lines */}
        {lines.map((line, i) => {
          if (line.tool === 'pen') {
            return (
              <Line
                key={`current-${i}`}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            );
          } else if (line.tool === 'rectangle') {
            return (
              <Rect
                key={`current-${i}`}
                x={line.points[0]}
                y={line.points[1]}
                width={line.points[2] - line.points[0]}
                height={line.points[3] - line.points[1]}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
              />
            );
          } else if (line.tool === 'circle') {
            return (
              <Circle
                key={`current-${i}`}
                x={line.points[0]}
                y={line.points[1]}
                radius={line.points[2]}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
              />
            );
          } else if (line.tool === 'arrow') {
            return (
              <Arrow
                key={`current-${i}`}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                fill={line.color}
              />
            );
          } else if (line.tool === 'text') {
            return (
              <Text
                key={`current-${i}`}
                x={line.points[0]}
                y={line.points[1]}
                text={line.text}
                fontSize={line.fontSize}
                fill={line.color}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
};
