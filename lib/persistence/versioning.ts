import { format, formatDistanceToNow, parseISO } from 'date-fns';

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  timestamp: string;
  label?: string;
  description?: string;
  snapshot: {
    components: any[];
    layout: any;
    metadata: any;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };
  changes: {
    added: number;
    modified: number;
    removed: number;
    summary?: string;
  };
  tags?: string[];
  isAutoSave?: boolean;
  restoreData?: any;
}

export interface VersionDiff {
  type: 'added' | 'modified' | 'removed' | 'moved';
  componentId: string;
  componentName: string;
  componentType: string;
  before?: any;
  after?: any;
  positionChange?: { from: { x: number; y: number }; to: { x: number; y: number } };
}

export class VersionManager {
  private static MAX_VERSIONS = 100;
  private static DB_NAME = 'ProjectVersionsDB';
  private static DB_VERSION = 2;

  // Initialize IndexedDB
  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('versions')) {
          const store = db.createObjectStore('versions', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('version', 'version', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('diffs')) {
          const store = db.createObjectStore('diffs', { keyPath: 'id' });
          store.createIndex('versionId', 'versionId', { unique: false });
        }
      };
    });
  }

  static async saveVersion(projectId: string, data: any, options: {
    label?: string;
    description?: string;
    tags?: string[];
    isAutoSave?: boolean;
    author?: { id: string; name: string; avatar?: string; color?: string };
  } = {}): Promise<ProjectVersion> {
    const previousVersion = await this.getLatestVersion(projectId);
    const changes = await this.calculateChanges(projectId, data, previousVersion);
    
    const version: ProjectVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      version: data.metadata.version,
      timestamp: new Date().toISOString(),
      label: options.label,
      description: options.description,
      tags: options.tags || [],
      isAutoSave: options.isAutoSave || false,
      snapshot: {
        components: JSON.parse(JSON.stringify(data.components)),
        layout: JSON.parse(JSON.stringify(data.layout)),
        metadata: JSON.parse(JSON.stringify(data.metadata))
      },
      author: options.author || {
        id: data.metadata.lastModifiedBy?.id || 'system',
        name: data.metadata.lastModifiedBy?.name || 'Auto-save',
        color: this.generateColor(data.metadata.lastModifiedBy?.id || 'system')
      },
      changes
    };

    try {
      // Save to IndexedDB
      const db = await this.getDB();
      const tx = db.transaction(['versions', 'diffs'], 'readwrite');
      
      await new Promise((resolve, reject) => {
        tx.objectStore('versions').put(version);
        
        // Save detailed diff
        if (previousVersion) {
          const diffId = `diff_${previousVersion.id}_${version.id}`;
          const diff = {
            id: diffId,
            versionId: version.id,
            previousVersionId: previousVersion.id,
            changes: this.calculateDetailedDiff(previousVersion.snapshot, version.snapshot),
            timestamp: new Date().toISOString()
          };
          tx.objectStore('diffs').put(diff);
        }
        
        tx.oncomplete = () => resolve(version);
        tx.onerror = () => reject(tx.error);
      });

      // Also cache in localStorage for quick access
      this.cacheVersion(projectId, version);

      // Broadcast via Socket.io if available
      this.broadcastVersionCreated(version);

      return version;
    } catch (error) {
      console.error('Failed to save version to IndexedDB:', error);
      // Fallback to localStorage
      this.cacheVersion(projectId, version);
      return version;
    }
  }

  static async getVersions(projectId: string, options: {
    limit?: number;
    offset?: number;
    includeAutoSaves?: boolean;
    tags?: string[];
  } = {}): Promise<ProjectVersion[]> {
    const {
      limit = 50,
      offset = 0,
      includeAutoSaves = true,
      tags = []
    } = options;

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('versions', 'readonly');
        const store = tx.objectStore('versions');
        const index = store.index('projectId');
        const request = index.getAll(projectId);

        request.onsuccess = () => {
          let versions = request.result
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          // Apply filters
          if (!includeAutoSaves) {
            versions = versions.filter(v => !v.isAutoSave);
          }
          
          if (tags.length > 0) {
            versions = versions.filter(v => 
              v.tags?.some(tag => tags.includes(tag))
            );
          }

          // Apply pagination
          versions = versions.slice(offset, offset + limit);
          resolve(versions);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to fetch versions from IndexedDB:', error);
      // Fallback to localStorage cache
      return this.getCachedVersions(projectId, options);
    }
  }

  static async getVersion(versionId: string): Promise<ProjectVersion | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('versions', 'readonly');
        const store = tx.objectStore('versions');
        const request = store.get(versionId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to fetch version:', error);
      return null;
    }
  }

  static async getVersionDiff(versionId: string): Promise<VersionDiff[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diffs', 'readonly');
        const store = tx.objectStore('diffs');
        const index = store.index('versionId');
        const request = index.getAll(versionId);

        request.onsuccess = () => {
          const diffs = request.result[0]?.changes || [];
          resolve(diffs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to fetch diff:', error);
      return [];
    }
  }

  static async restoreVersion(versionId: string): Promise<{ success: boolean; data: any; version: ProjectVersion }> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Create a restore point before restoring
      const currentState = {
        components: useProjectStore?.getState()?.components || [],
        layout: useProjectStore?.getState()?.layout || {},
        metadata: useProjectStore?.getState()?.metadata || {}
      };

      const restoreVersion = await this.saveVersion(version.projectId, {
        ...currentState,
        metadata: {
          ...currentState.metadata,
          version: (currentState.metadata.version || 0) + 1,
          lastModified: new Date().toISOString(),
          restorePoint: true,
          restoredFrom: versionId
        }
      }, {
        label: `Restore point before restoring to v${version.version}`,
        isAutoSave: false,
        author: {
          id: 'system',
          name: 'Restore System',
          color: '#ff6b6b'
        }
      });

      // Update version with restore data
      version.restoreData = {
        restoredAt: new Date().toISOString(),
        restorePointId: restoreVersion.id,
        previousState: currentState
      };

      await this.updateVersion(versionId, version);

      return {
        success: true,
        data: version.snapshot,
        version
      };
    } catch (error) {
      console.error('Failed to restore version:', error);
      throw error;
    }
  }

  static async compareVersions(versionId1: string, versionId2: string): Promise<{
    version1: ProjectVersion;
    version2: ProjectVersion;
    diffs: VersionDiff[];
    summary: {
      componentsAdded: number;
      componentsRemoved: number;
      componentsModified: number;
      layoutChanged: boolean;
    };
  }> {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1),
      this.getVersion(versionId2)
    ]);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    const diffs = this.calculateDetailedDiff(version1.snapshot, version2.snapshot);

    return {
      version1,
      version2,
      diffs,
      summary: {
        componentsAdded: diffs.filter(d => d.type === 'added').length,
        componentsRemoved: diffs.filter(d => d.type === 'removed').length,
        componentsModified: diffs.filter(d => d.type === 'modified').length,
        layoutChanged: diffs.some(d => d.componentId === 'layout')
      }
    };
  }

  static async createLabel(versionId: string, label: string, description?: string): Promise<boolean> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) return false;

      version.label = label;
      version.description = description;
      version.tags = [...(version.tags || []), 'labeled'];

      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('versions', 'readwrite');
        tx.objectStore('versions').put(version);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Failed to create label:', error);
      return false;
    }
  }

  static async addTags(versionId: string, tags: string[]): Promise<boolean> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) return false;

      version.tags = [...new Set([...(version.tags || []), ...tags])];

      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('versions', 'readwrite');
        tx.objectStore('versions').put(version);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Failed to add tags:', error);
      return false;
    }
  }

  private static async getLatestVersion(projectId: string): Promise<ProjectVersion | null> {
    const versions = await this.getVersions(projectId, { limit: 1 });
    return versions[0] || null;
  }

  private static async calculateChanges(projectId: string, newData: any, previousVersion: ProjectVersion | null) {
    if (!previousVersion) {
      return {
        added: newData.components.length,
        modified: 0,
        removed: 0,
        summary: 'Initial version'
      };
    }

    const oldComponents = previousVersion.snapshot.components || [];
    const newComponents = newData.components || [];
    
    const added = newComponents.filter((nc: any) => 
      !oldComponents.some((oc: any) => oc.id === nc.id)
    ).length;
    
    const removed = oldComponents.filter((oc: any) => 
      !newComponents.some((nc: any) => nc.id === oc.id)
    ).length;
    
    const modified = newComponents.filter((nc: any) => {
      const oldComp = oldComponents.find((oc: any) => oc.id === nc.id);
      return oldComp && JSON.stringify(oldComp) !== JSON.stringify(nc);
    }).length;

    let summary = '';
    if (added > 0) summary += `Added ${added} component${added > 1 ? 's' : ''}. `;
    if (removed > 0) summary += `Removed ${removed} component${removed > 1 ? 's' : ''}. `;
    if (modified > 0) summary += `Modified ${modified} component${modified > 1 ? 's' : ''}. `;
    if (summary === '') summary = 'Minor changes';

    return { added, modified, removed, summary };
  }

  private static calculateDetailedDiff(oldSnapshot: any, newSnapshot: any): VersionDiff[] {
    const diffs: VersionDiff[] = [];
    const oldComponents = oldSnapshot.components || [];
    const newComponents = newSnapshot.components || [];

    // Find added components
    newComponents.forEach((nc: any) => {
      if (!oldComponents.some((oc: any) => oc.id === nc.id)) {
        diffs.push({
          type: 'added',
          componentId: nc.id,
          componentName: nc.name || nc.id,
          componentType: nc.type || 'unknown',
          after: nc
        });
      }
    });

    // Find removed components
    oldComponents.forEach((oc: any) => {
      if (!newComponents.some((nc: any) => nc.id === oc.id)) {
        diffs.push({
          type: 'removed',
          componentId: oc.id,
          componentName: oc.name || oc.id,
          componentType: oc.type || 'unknown',
          before: oc
        });
      }
    });

    // Find modified components
    newComponents.forEach((nc: any) => {
      const oldComp = oldComponents.find((oc: any) => oc.id === nc.id);
      if (oldComp && JSON.stringify(oldComp) !== JSON.stringify(nc)) {
        // Check for position changes
        if (oldComp.position && nc.position && 
            (oldComp.position.x !== nc.position.x || oldComp.position.y !== nc.position.y)) {
          diffs.push({
            type: 'moved',
            componentId: nc.id,
            componentName: nc.name || nc.id,
            componentType: nc.type || 'unknown',
            before: oldComp,
            after: nc,
            positionChange: {
              from: oldComp.position,
              to: nc.position
            }
          });
        } else {
          diffs.push({
            type: 'modified',
            componentId: nc.id,
            componentName: nc.name || nc.id,
            componentType: nc.type || 'unknown',
            before: oldComp,
            after: nc
          });
        }
      }
    });

    // Check layout changes
    if (JSON.stringify(oldSnapshot.layout) !== JSON.stringify(newSnapshot.layout)) {
      diffs.push({
        type: 'modified',
        componentId: 'layout',
        componentName: 'Layout',
        componentType: 'layout',
        before: oldSnapshot.layout,
        after: newSnapshot.layout
      });
    }

    return diffs;
  }

  private static async updateVersion(versionId: string, updates: Partial<ProjectVersion>): Promise<boolean> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) return false;

      const updatedVersion = { ...version, ...updates };
      const db = await this.getDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('versions', 'readwrite');
        tx.objectStore('versions').put(updatedVersion);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Failed to update version:', error);
      return false;
    }
  }

  private static cacheVersion(projectId: string, version: ProjectVersion) {
    const key = `project-${projectId}-versions`;
    const cached = localStorage.getItem(key);
    const versions = cached ? JSON.parse(cached) : [];
    
    versions.unshift(version);
    
    if (versions.length > this.MAX_VERSIONS) {
      versions.length = this.MAX_VERSIONS;
    }
    
    localStorage.setItem(key, JSON.stringify(versions));
    localStorage.setItem(`project-${projectId}-last`, JSON.stringify(version.snapshot));
    localStorage.setItem(`project-${projectId}-last-saved`, version.timestamp);
  }

  private static getCachedVersions(projectId: string, options: any = {}): ProjectVersion[] {
    const key = `project-${projectId}-versions`;
    const cached = localStorage.getItem(key);
    let versions = cached ? JSON.parse(cached) : [];

    // Apply filters
    if (!options.includeAutoSaves) {
      versions = versions.filter((v: ProjectVersion) => !v.isAutoSave);
    }
    
    if (options.tags?.length > 0) {
      versions = versions.filter((v: ProjectVersion) => 
        v.tags?.some((tag: string) => options.tags.includes(tag))
      );
    }

    if (options.limit) {
      versions = versions.slice(options.offset || 0, (options.offset || 0) + options.limit);
    }

    return versions;
  }

  private static generateColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  private static broadcastVersionCreated(version: ProjectVersion) {
    // This would be implemented with Socket.io
    if (typeof window !== 'undefined' && (window as any).socket) {
      (window as any).socket.emit('version:created', version);
    }
  }
}

// Helper function for components that need store access
let useProjectStore: any = null;
export function setProjectStore(store: any) {
  useProjectStore = store;
}
