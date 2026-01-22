import { useEffect, useCallback, useState, useRef } from 'react';
import { debounce } from 'lodash.debounce';
import { useProjectStore } from '@/store/project-store';
import toast from 'react-hot-toast';
import { useSocket } from '@/lib/socket/useSocket';
import { VersionManager } from '@/lib/persistence/versioning';

export const useAutoSave = (projectId: string, interval = 30000) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { components, layout, metadata } = useProjectStore();
  const { socket, isConnected } = useSocket();
  const lastSaveRef = useRef<string>('');

  // Generate hash of current state to detect changes
  const generateStateHash = useCallback((data: any) => {
    return JSON.stringify({
      components: data.components,
      layout: data.layout,
      metadataVersion: data.metadata.version
    });
  }, []);

  // Save function with Socket.io integration
  const saveProject = useCallback(async (manual = false, force = false) => {
    if (isSaving && !force) return;
    
    const currentState = {
      id: projectId,
      components,
      layout,
      metadata: {
        ...metadata,
        lastModified: new Date().toISOString(),
        version: (metadata.version || 0) + 1,
        lastModifiedBy: {
          id: socket?.id || 'local-user',
          name: 'Current User'
        }
      }
    };

    const currentHash = generateStateHash(currentState);
    
    // Skip if no changes detected (unless forced)
    if (!force && currentHash === lastSaveRef.current) {
      if (manual) {
        toast.success('No changes to save');
      }
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    const saveToast = manual 
      ? toast.loading('Saving project...')
      : null;

    try {
      // Save version history
      const version = await VersionManager.saveVersion(projectId, currentState);
      
      // Save via Socket.io if connected
      if (socket && isConnected) {
        socket.emit('project:save', {
          projectId,
          data: currentState,
          version: version.version,
          userId: socket.id,
          timestamp: new Date().toISOString()
        });

        // Wait for server acknowledgment
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Save timeout'));
          }, 5000);

          socket.once('project:saved', (response) => {
            clearTimeout(timeout);
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error || 'Save failed'));
            }
          });
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(`project-${projectId}`, JSON.stringify(currentState));
        localStorage.setItem(`project-last-saved-${projectId}`, new Date().toISOString());
        
        // Save to indexedDB for larger projects
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('ProjectDatabase', 1);
            dbRequest.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains('projects')) {
                db.createObjectStore('projects', { keyPath: 'id' });
              }
              if (!db.objectStoreNames.contains('versions')) {
                const store = db.createObjectStore('versions', { keyPath: 'id' });
                store.createIndex('projectId', 'projectId', { unique: false });
              }
            };
            
            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              const tx = db.transaction(['projects', 'versions'], 'readwrite');
              tx.objectStore('projects').put(currentState);
              tx.objectStore('versions').put(version);
              tx.oncomplete = () => console.log('Saved to IndexedDB');
            };
          } catch (error) {
            console.warn('IndexedDB not available:', error);
          }
        }
      }

      // Update state
      lastSaveRef.current = currentHash;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      if (manual) {
        toast.success('Project saved successfully!', { 
          id: saveToast,
          duration: 3000 
        });
      } else {
        // Silent auto-save with subtle notification
        toast.success('Auto-saved', { 
          id: 'auto-save',
          duration: 2000,
          position: 'bottom-right'
        });
      }

      // Update metadata in store
      useProjectStore.getState().updateMetadata({
        version: currentState.metadata.version,
        lastModified: currentState.metadata.lastModified
      });

    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
      toast.error(`Save failed: ${errorMessage}`, {
        duration: 5000
      });
      
      // Store locally as backup
      localStorage.setItem(`project-backup-${projectId}-${Date.now()}`, JSON.stringify({
        ...currentState,
        backupTimestamp: new Date().toISOString(),
        error: errorMessage
      }));
    } finally {
      setIsSaving(false);
    }
  }, [projectId, components, layout, metadata, isSaving, socket, isConnected, generateStateHash]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(() => {
      if (hasUnsavedChanges && !isSaving) {
        saveProject();
      }
    }, interval, { leading: false, trailing: true }),
    [saveProject, hasUnsavedChanges, isSaving, interval]
  );

  // Track changes for auto-save
  useEffect(() => {
    const currentHash = generateStateHash({ components, layout, metadata });
    
    if (lastSaveRef.current && currentHash !== lastSaveRef.current) {
      setHasUnsavedChanges(true);
      debouncedSave();
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [components, layout, metadata, debouncedSave, generateStateHash]);

  // Manual save trigger
  const manualSave = () => {
    saveProject(true);
  };

  // Force save (ignore hash check)
  const forceSave = () => {
    saveProject(true, true);
  };

  // Keyboard shortcut: Ctrl/Cmd + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
      }
      
      // Ctrl+Shift+S for force save
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        forceSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualSave, forceSave]);

  // Initialize last saved state
  useEffect(() => {
    const saved = localStorage.getItem(`project-last-saved-${projectId}`);
    if (saved) {
      setLastSaved(new Date(saved));
    }
    
    // Load last hash from localStorage
    const lastState = localStorage.getItem(`project-${projectId}`);
    if (lastState) {
      lastSaveRef.current = generateStateHash(JSON.parse(lastState));
    }
  }, [projectId, generateStateHash]);

  // Listen for remote saves
  useEffect(() => {
    if (!socket) return;

    const handleRemoteSave = (data: any) => {
      if (data.projectId === projectId && data.userId !== socket.id) {
        toast.info(`${data.userName || 'Another user'} saved the project`, {
          duration: 3000,
          position: 'bottom-right'
        });
        setLastSaved(new Date(data.timestamp));
      }
    };

    const handleConflict = (data: any) => {
      toast.error('Conflict detected! Please resolve.', {
        duration: 5000,
        position: 'top-center'
      });
      // Trigger conflict resolution UI
      console.log('Conflict data:', data);
    };

    socket.on('project:remote-save', handleRemoteSave);
    socket.on('project:conflict', handleConflict);

    return () => {
      socket.off('project:remote-save', handleRemoteSave);
      socket.off('project:conflict', handleConflict);
    };
  }, [socket, projectId]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveStatus,
    manualSave,
    forceSave,
    saveProject
  };
};
