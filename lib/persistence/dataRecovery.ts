/**
 * Data recovery and backup system
 */

export interface Backup {
  id: string;
  timestamp: string;
  data: any;
  type: 'auto' | 'manual' | 'error';
  metadata?: {
    projectId: string;
    version: number;
    user?: string;
    cause?: string;
  };
}

export class DataRecoveryManager {
  private static MAX_BACKUPS = 20;
  private static BACKUP_INTERVAL = 60000; // 1 minute
  private backupInterval: NodeJS.Timeout | null = null;

  static async createBackup(
    data: any,
    type: Backup['type'] = 'auto',
    metadata?: Backup['metadata']
  ): Promise<Backup> {
    const backup: Backup = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      type,
      metadata,
    };

    // Store in localStorage
    this.storeBackup(backup);

    // Also send to server if online
    if (navigator.onLine) {
      try {
        await this.sendBackupToServer(backup);
      } catch (error) {
        console.warn('Failed to send backup to server:', error);
      }
    }

    return backup;
  }

  private static storeBackup(backup: Backup): void {
    const key = 'project-backups';
    const backups = this.getStoredBackups();
    
    // Add new backup
    backups.unshift(backup);
    
    // Keep only recent backups
    if (backups.length > this.MAX_BACKUPS) {
      backups.length = this.MAX_BACKUPS;
    }
    
    localStorage.setItem(key, JSON.stringify(backups));
  }

  static getStoredBackups(): Backup[] {
    const key = 'project-backups';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  static getLatestBackup(): Backup | null {
    const backups = this.getStoredBackups();
    return backups[0] || null;
  }

  static restoreFromBackup(backupId: string): any | null {
    const backups = this.getStoredBackups();
    const backup = backups.find(b => b.id === backupId);
    return backup ? backup.data : null;
  }

  static findBackupByTimestamp(timestamp: string): Backup | null {
    const backups = this.getStoredBackups();
    return backups.find(b => b.timestamp === timestamp) || null;
  }

  static clearOldBackups(keepLast: number = 10): void {
    const backups = this.getStoredBackups();
    if (backups.length > keepLast) {
      const recentBackups = backups.slice(0, keepLast);
      localStorage.setItem('project-backups', JSON.stringify(recentBackups));
    }
  }

  private static async sendBackupToServer(backup: Backup): Promise<void> {
    // Implement server backup logic here
    // For now, just log
    console.log('Backup sent to server:', backup.id);
  }

  // Auto-backup system
  startAutoBackup(getData: () => any, projectId: string): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(async () => {
      try {
        const data = getData();
        await DataRecoveryManager.createBackup(data, 'auto', {
          projectId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Auto-backup failed:', error);
      }
    }, DataRecoveryManager.BACKUP_INTERVAL);
  }

  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Crash recovery
  static checkForCrashRecovery(): boolean {
    const crashFlag = localStorage.getItem('app-crash-flag');
    return crashFlag === 'true';
  }

  static setCrashFlag(): void {
    localStorage.setItem('app-crash-flag', 'true');
  }

  static clearCrashFlag(): void {
    localStorage.removeItem('app-crash-flag');
  }

  // Data validation
  static validateProjectData(data: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!data) {
      errors.push('No data provided');
      return { valid: false, errors, warnings };
    }

    if (!data.components || !Array.isArray(data.components)) {
      errors.push('Invalid components data');
    }

    if (!data.layout || typeof data.layout !== 'object') {
      warnings.push('Layout data might be incomplete');
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      errors.push('Missing metadata');
    } else {
      if (!data.metadata.id) warnings.push('Project ID missing');
      if (!data.metadata.version && data.metadata.version !== 0) {
        warnings.push('Version number missing');
      }
    }

    // Check for circular references
    try {
      JSON.stringify(data);
    } catch (error) {
      errors.push('Data contains circular references');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Data repair
  static repairProjectData(data: any): any {
    const repaired = { ...data };

    // Ensure arrays exist
    if (!repaired.components || !Array.isArray(repaired.components)) {
      repaired.components = [];
    }

    // Ensure layout exists
    if (!repaired.layout || typeof repaired.layout !== 'object') {
      repaired.layout = {};
    }

    // Ensure metadata exists
    if (!repaired.metadata || typeof repaired.metadata !== 'object') {
      repaired.metadata = {};
    }

    // Ensure required metadata fields
    if (!repaired.metadata.id) {
      repaired.metadata.id = `recovered_${Date.now()}`;
    }

    if (repaired.metadata.version === undefined) {
      repaired.metadata.version = 0;
    }

    if (!repaired.metadata.created) {
      repaired.metadata.created = new Date().toISOString();
    }

    if (!repaired.metadata.lastModified) {
      repaired.metadata.lastModified = new Date().toISOString();
    }

    return repaired;
  }
}

// Hook for React components
export const useDataRecovery = (projectId: string) => {
  const recoveryManager = new DataRecoveryManager();

  const createManualBackup = async (data: any) => {
    return await DataRecoveryManager.createBackup(data, 'manual', {
      projectId,
      user: 'current-user',
    });
  };

  const getRecoveryOptions = () => {
    const backups = DataRecoveryManager.getStoredBackups();
    return backups.map(backup => ({
      id: backup.id,
      timestamp: backup.timestamp,
      type: backup.type,
      data: backup.data,
    }));
  };

  const restoreProject = (backupId: string) => {
    const data = DataRecoveryManager.restoreFromBackup(backupId);
    if (data) {
      // Validate and repair data
      const validation = DataRecoveryManager.validateProjectData(data);
      if (!validation.valid) {
        console.warn('Backup validation issues:', validation.errors);
        return DataRecoveryManager.repairProjectData(data);
      }
      return data;
    }
    return null;
  };

  return {
    createManualBackup,
    getRecoveryOptions,
    restoreProject,
    startAutoBackup: (getData: () => any) => 
      recoveryManager.startAutoBackup(getData, projectId),
    stopAutoBackup: () => recoveryManager.stopAutoBackup(),
  };
};
