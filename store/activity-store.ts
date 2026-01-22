import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'component_added'
  | 'component_updated'
  | 'component_removed'
  | 'comment_added'
  | 'comment_resolved'
  | 'user_joined'
  | 'user_left'
  | 'permission_changed'
  | 'export_generated';

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  data: any;
  timestamp: string;
  read: boolean;
}

interface ActivityStore {
  activities: Activity[];
  unreadCount: number;
  
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  clearActivities: (projectId?: string) => void;
  getProjectActivities: (projectId: string, limit?: number) => Activity[];
  getUnreadActivities: (projectId?: string) => Activity[];
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      unreadCount: 0,
      
      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        set((state) => ({
          activities: [newActivity, ...state.activities],
          unreadCount: state.unreadCount + 1
        }));
        
        if (typeof window !== 'undefined' && (window as any).socket) {
          (window as any).socket.emit('activity-added', newActivity);
        }
      },
      
      markAsRead: (activityId) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === activityId ? { ...activity, read: true } : activity
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          activities: state.activities.map((activity) => ({
            ...activity,
            read: true
          })),
          unreadCount: 0
        }));
      },
      
      clearActivities: (projectId) => {
        if (projectId) {
          set((state) => ({
            activities: state.activities.filter(
              (activity) => activity.projectId !== projectId
            )
          }));
        } else {
          set({ activities: [], unreadCount: 0 });
        }
      },
      
      getProjectActivities: (projectId, limit = 50) => {
        const state = get();
        return state.activities
          .filter((activity) => activity.projectId === projectId)
          .slice(0, limit);
      },
      
      getUnreadActivities: (projectId) => {
        const state = get();
        return state.activities.filter((activity) => 
          !activity.read && (!projectId || activity.projectId === projectId)
        );
      }
    }),
    {
      name: 'activity-storage',
      version: 1
    }
  )
);
