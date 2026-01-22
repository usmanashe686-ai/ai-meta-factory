import React from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { useCommentStore } from '@/store/comment-store';

interface ComponentCommentIndicatorProps {
  componentId: string;
  x: number;
  y: number;
  onClick: () => void;
}

export const ComponentCommentIndicator: React.FC<ComponentCommentIndicatorProps> = ({
  componentId,
  x,
  y,
  onClick
}) => {
  const { getComponentComments } = useCommentStore();
  const comments = getComponentComments(componentId);
  const resolvedComments = comments.filter(c => c.resolved).length;
  const unresolvedComments = comments.length - resolvedComments;
  
  if (comments.length === 0) return null;
  
  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`p-2 rounded-full shadow-lg ${
          unresolvedComments > 0 ? 'bg-blue-500' : 'bg-green-500'
        }`}>
          {unresolvedComments > 0 ? (
            <MessageSquare className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Comment count badge */}
        {comments.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {comments.length}
          </div>
        )}
        
        {/* Resolved count badge */}
        {resolvedComments > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {resolvedComments}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-sm rounded px-2 py-1 whitespace-nowrap">
          {unresolvedComments > 0 ? (
            <span>{unresolvedComments} unresolved comment{unresolvedComments !== 1 ? 's' : ''}</span>
          ) : (
            <span>All comments resolved</span>
          )}
        </div>
      </div>
    </div>
  );
};
