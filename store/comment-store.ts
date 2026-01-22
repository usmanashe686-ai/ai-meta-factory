import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Comment {
  id: string;
  projectId: string;
  componentId?: string;
  threadId?: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  mentions: string[];
  replies?: Comment[];
}

export interface CommentThread {
  id: string;
  projectId: string;
  componentId?: string;
  x: number;
  y: number;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  participants: string[];
}

interface CommentStore {
  comments: Comment[];
  threads: CommentThread[];
  selectedThreadId: string | null;
  
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  addReply: (threadId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  createThread: (thread: Omit<CommentThread, 'id' | 'createdAt' | 'updatedAt'>) => string;
  resolveThread: (threadId: string) => void;
  setSelectedThread: (threadId: string | null) => void;
  getThreadComments: (threadId: string) => Comment[];
  getComponentComments: (componentId: string) => Comment[];
}

export const useCommentStore = create<CommentStore>()(
  persist(
    (set, get) => ({
      comments: [],
      threads: [],
      selectedThreadId: null,
      
      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: []
        };
        
        set((state) => ({
          comments: [...state.comments, newComment]
        }));
        
        // Emit via Socket.io
        if (typeof window !== 'undefined') {
          (window as any).socketIntegration?.emitCommentAdded(newComment);
        }
      },
      
      updateComment: (commentId, updates) => {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, ...updates, updatedAt: new Date().toISOString() }
              : comment
          )
        }));
      },
      
      deleteComment: (commentId) => {
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== commentId)
        }));
      },
      
      addReply: (threadId, replyData) => {
        const newReply: Comment = {
          ...replyData,
          id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          threadId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          comments: [...state.comments, newReply]
        }));
      },
      
      createThread: (threadData) => {
        const newThread: CommentThread = {
          ...threadData,
          id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          threads: [...state.threads, newThread],
          selectedThreadId: newThread.id
        }));
        
        return newThread.id;
      },
      
      resolveThread: (threadId) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, resolved: true } : thread
          )
        }));
      },
      
      setSelectedThread: (threadId) => {
        set({ selectedThreadId: threadId });
      },
      
      getThreadComments: (threadId) => {
        const state = get();
        return state.comments.filter(
          (comment) => comment.threadId === threadId || comment.id === threadId
        );
      },
      
      getComponentComments: (componentId) => {
        const state = get();
        return state.comments.filter(
          (comment) => comment.componentId === componentId
        );
      }
    }),
    {
      name: 'comment-storage',
      version: 1
    }
  )
);
