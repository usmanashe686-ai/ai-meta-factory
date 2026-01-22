import { io, Socket } from 'socket.io-client';
import { useCommentStore } from '@/store/comment-store';
import { useActivityStore } from '@/store/activity-store';
import { useAnnotationStore } from '@/store/annotation-store';
import { usePermissionStore } from '@/store/permission-store';

class SocketIntegration {
  private static instance: SocketIntegration;
  private socket: Socket | null = null;
  private isConnected = false;
  
  static getInstance(): SocketIntegration {
    if (!SocketIntegration.instance) {
      SocketIntegration.instance = new SocketIntegration();
    }
    return SocketIntegration.instance;
  }
  
  connect(projectId: string, userId: string) {
    if (this.isConnected) return;
    
    // Connect to your Socket.io server
    this.socket = io('http://localhost:3001', {
      query: { projectId, userId }
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      
      // Join project room
      this.socket?.emit('join-project', projectId);
      
      // Log activity
      const activityStore = useActivityStore.getState();
      activityStore.addActivity({
        projectId,
        type: 'user_joined',
        userId,
        userName: 'Current User',
        data: {}
      });
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });
    
    // Comment handlers
    this.socket.on('comment-received', (comment) => {
      const commentStore = useCommentStore.getState();
      commentStore.addComment(comment);
    });
    
    this.socket.on('comment-resolved', (data) => {
      const commentStore = useCommentStore.getState();
      // Handle comment resolution
    });
    
    // Annotation handlers
    this.socket.on('annotation-received', (annotation) => {
      const annotationStore = useAnnotationStore.getState();
      annotationStore.addAnnotation(annotation);
    });
    
    // Activity handlers
    this.socket.on('activity-received', (activity) => {
      const activityStore = useActivityStore.getState();
      activityStore.addActivity(activity);
    });
    
    // Permission handlers
    this.socket.on('permission-changed', (data) => {
      const permissionStore = usePermissionStore.getState();
      // Handle permission changes
    });
    
    this.socket.on('user-invited', (data) => {
      const permissionStore = usePermissionStore.getState();
      permissionStore.grantPermission({
        userId: data.user.id,
        projectId: data.projectId,
        role: data.role,
        grantedBy: 'system'
      });
    });
    
    // User presence
    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data.userId);
    });
    
    this.socket.on('user-left', (data) => {
      console.log('User left:', data.userId);
    });
    
    // Error handling
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  emitCommentAdded(comment: any) {
    this.socket?.emit('comment-added', comment);
  }
  
  emitAnnotationAdded(annotation: any) {
    this.socket?.emit('annotation-added', annotation);
  }
  
  emitActivityAdded(activity: any) {
    this.socket?.emit('activity-added', activity);
  }
  
  emitPermissionChanged(data: any) {
    this.socket?.emit('permission-changed', data);
  }
  
  emitUserInvited(data: any) {
    this.socket?.emit('user-invited', data);
  }
  
  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const socketIntegration = SocketIntegration.getInstance();

// Hook for using socket in components
export const useSocket = () => {
  return {
    connect: (projectId: string, userId: string) => 
      socketIntegration.connect(projectId, userId),
    disconnect: () => socketIntegration.disconnect(),
    emitCommentAdded: (comment: any) => socketIntegration.emitCommentAdded(comment),
    emitAnnotationAdded: (annotation: any) => socketIntegration.emitAnnotationAdded(annotation),
    emitActivityAdded: (activity: any) => socketIntegration.emitActivityAdded(activity),
    emitPermissionChanged: (data: any) => socketIntegration.emitPermissionChanged(data),
    emitUserInvited: (data: any) => socketIntegration.emitUserInvited(data),
    isConnected: () => socketIntegration.isSocketConnected()
  };
};
