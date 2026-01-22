import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useCommentStore, Comment } from '@/store/comment-store';
import { RichTextEditor } from './RichTextEditor';
import {
  MessageSquare,
  User,
  CheckCircle,
  XCircle,
  Reply,
  Edit2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentThreadProps {
  threadId: string;
  projectId: string;
  componentId?: string;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  threadId,
  projectId,
  componentId,
  position,
  onClose
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
  const {
    getThreadComments,
    addReply,
    updateComment,
    deleteComment,
    resolveThread,
    threads
  } = useCommentStore();
  
  const thread = threads.find(t => t.id === threadId);
  const comments = getThreadComments(threadId);
  const mainComment = comments.find(c => !c.threadId) || comments[0];
  const replies = comments.filter(c => c.threadId === threadId);
  
  const handleAddReply = async (content: string) => {
    try {
      const currentUser = {
        id: 'current-user-id',
        name: 'Current User',
        avatar: 'https://i.pravatar.cc/150?img=4'
      };
      
      addReply(threadId, {
        projectId,
        componentId,
        content,
        author: currentUser,
        resolved: false,
        mentions: extractMentions(content)
      });
      
      setIsReplying(false);
      toast.success('Reply added');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };
  
  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      updateComment(commentId, {
        content,
        updatedAt: new Date().toISOString()
      });
      
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
      toast.success('Comment deleted');
    }
  };
  
  const handleResolveThread = () => {
    resolveThread(threadId);
    toast.success('Thread resolved');
  };
  
  const extractMentions = (content: string): string[] => {
    const mentions: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const mentionElements = doc.querySelectorAll('.mention');
    
    mentionElements.forEach((el) => {
      const userId = el.getAttribute('data-id');
      if (userId) mentions.push(userId);
    });
    
    return mentions;
  };
  
  if (!thread || !mainComment) {
    return (
      <div className="p-4 bg-white rounded-lg border shadow-lg max-w-md">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Thread not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="bg-white rounded-lg border shadow-xl flex flex-col max-w-md max-h-[600px]"
      style={position ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000
      } : {}}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Comment Thread</h3>
          {thread.resolved && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Resolved
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!thread.resolved && (
            <button
              onClick={handleResolveThread}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Mark as resolved"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
              title="Close"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <img
            src={mainComment.author.avatar || 'https://i.pravatar.cc/150?img=4'}
            alt={mainComment.author.name}
            className="w-8 h-8 rounded-full"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{mainComment.author.name}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(mainComment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {editingCommentId === mainComment.id ? (
              <RichTextEditor
                onSubmit={(content) => handleUpdateComment(mainComment.id, content)}
                placeholder="Edit your comment..."
                autoFocus={true}
              />
            ) : (
              <div 
                className="mt-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: mainComment.content }}
              />
            )}
            
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              
              {mainComment.author.id === 'current-user-id' && (
                <>
                  <button
                    onClick={() => setEditingCommentId(mainComment.id)}
                    className="text-sm text-gray-600 hover:text-yellow-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteComment(mainComment.id)}
                    className="text-sm text-gray-600 hover:text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3">
                <img
                  src={reply.author.avatar || 'https://i.pravatar.cc/150?img=4'}
                  alt={reply.author.name}
                  className="w-6 h-6 rounded-full"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{reply.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {editingCommentId === reply.id ? (
                    <RichTextEditor
                      onSubmit={(content) => handleUpdateComment(reply.id, content)}
                      placeholder="Edit your reply..."
                      autoFocus={true}
                    />
                  ) : (
                    <div 
                      className="mt-1 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                  )}
                  
                  {reply.author.id === 'current-user-id' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditingCommentId(reply.id)}
                        className="text-xs text-gray-600 hover:text-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(reply.id)}
                        className="text-xs text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p>No replies yet</p>
            <p className="text-sm">Be the first to reply!</p>
          </div>
        )}
      </div>
      
      {isReplying && (
        <div className="p-4 border-t">
          <RichTextEditor
            onSubmit={handleAddReply}
            placeholder="Write a reply..."
            autoFocus={true}
          />
        </div>
      )}
      
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{comments.length} comments</span>
          </div>
          
          <button
            onClick={() => setIsReplying(true)}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            Add Reply
          </button>
        </div>
      </div>
    </div>
  );
};
