import { useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useTeamStore } from '@/store/team-store';
import { toast } from 'react-hot-toast';
import { Wifi, WifiOff, Cloud, Save } from 'lucide-react';

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedUpdates, setQueuedUpdates] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { components, layout, metadata } = useProjectStore();
  const { currentTeam } = useTeamStore();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing changes...', {
        icon: <Wifi className="w-5 h-5" />,
      });
      syncQueuedUpdates();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Changes will be saved locally.', {
        icon: <WifiOff className="w-5 h-5" />,
        duration: 4000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save to localStorage when offline
  const saveToLocalStorage = useCallback(() => {
    try {
      const projectData = {
        components,
        layout,
        metadata: {
          ...metadata,
          lastModified: new Date().toISOString(),
          savedOffline: true,
        },
      };

      localStorage.setItem(`offline-project-${metadata.id}`, JSON.stringify(projectData));
      localStorage.setItem(`offline-queue-${metadata.id}`, JSON.stringify(queuedUpdates));
      
      console.log('Project saved offline');
    } catch (error) {
      console.error('Failed to save offline:', error);
    }
  }, [components, layout, metadata, queuedUpdates]);

  // Sync queued updates when back online
  const syncQueuedUpdates = useCallback(async () => {
    if (queuedUpdates.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const syncToast = toast.loading('Syncing offline changes...');

    try {
      // Process each queued update
      for (const update of queuedUpdates) {
        // Send to server (simulate API call)
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Syncing update:', update);
      }

      // Clear queue after successful sync
      setQueuedUpdates([]);
      localStorage.removeItem(`offline-queue-${metadata.id}`);
      
      toast.success('Offline changes synced successfully!', { id: syncToast });
    } catch (error) {
      console.error('Failed to sync updates:', error);
      toast.error('Failed to sync some changes', { id: syncToast });
    } finally {
      setIsSyncing(false);
    }
  }, [queuedUpdates, isSyncing, metadata.id]);

  // Add update to queue when offline
  const queueUpdate = useCallback((update: any) => {
    if (!isOnline) {
      setQueuedUpdates(prev => [...prev, update]);
      toast('Update queued for when you\'re back online', {
        icon: <Save className="w-5 h-5" />,
      });
      saveToLocalStorage();
      return true; // Indicate update was queued
    }
    return false; // Indicate update should be sent immediately
  }, [isOnline, saveToLocalStorage]);

  // Load offline data on mount
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const offlineData = localStorage.getItem(`offline-project-${metadata.id}`);
        const offlineQueue = localStorage.getItem(`offline-queue-${metadata.id}`);

        if (offlineData && !isOnline) {
          const data = JSON.parse(offlineData);
          // Apply offline data (in a real app, you'd merge carefully)
          console.log('Loaded offline data:', data);
        }

        if (offlineQueue) {
          const queue = JSON.parse(offlineQueue);
          setQueuedUpdates(queue);
        }
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    };

    loadOfflineData();
  }, [metadata.id, isOnline]);

  // Auto-save when going offline
  useEffect(() => {
    if (!isOnline) {
      saveToLocalStorage();
    }
  }, [isOnline, saveToLocalStorage]);

  // Periodic sync check
  useEffect(() => {
    if (isOnline && queuedUpdates.length > 0) {
      const interval = setInterval(() => {
        syncQueuedUpdates();
      }, 30000); // Try to sync every 30 seconds when online

      return () => clearInterval(interval);
    }
  }, [isOnline, queuedUpdates.length, syncQueuedUpdates]);

  return {
    isOnline,
    isSyncing,
    queuedUpdates,
    queueUpdate,
    syncQueuedUpdates,
    saveToLocalStorage,
    
    // Status indicators
    status: isOnline ? 'online' : 'offline',
    pendingSyncCount: queuedUpdates.length,
    
    // UI helpers
    getStatusIcon: () => 
      isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />,
    
    getStatusText: () => 
      isOnline ? 'Online' : 'Offline',
    
    getStatusColor: () => 
      isOnline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
  };
};
