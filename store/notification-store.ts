import { create } from 'zustand';

export type NotificationType = 
  | 'invitation'
  | 'mention'
  | 'comment'
  | 'project_update'
  | 'team_update'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Real-time updates
  handleSocketNotification: (notification: any) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      read: false,
      timestamp: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new window.Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
      });
    }
  },
  
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  },
  
  removeNotification: (notificationId) => {
    const notification = get().notifications.find(n => n.id === notificationId);
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== notificationId),
      unreadCount: notification?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
    }));
  },
  
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
  
  handleSocketNotification: (notificationData) => {
    get().addNotification(notificationData);
  },
}));

// Initialize browser notifications
if (typeof window !== 'undefined') {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
