import { Server, Socket } from 'socket.io';
import { VersionManager } from '@/lib/persistence/versioning';

// In-memory store for active projects (in production, use Redis)
const activeProjects = new Map<string, {
  lastSaved: Date;
  lastVersion: number;
  users: Set<string>;
  lock?: string; // userId holding lock
}>();

interface SavePayload {
  projectId: string;
  data: any;
  version: number;
  userId: string;
  userName?: string;
  timestamp: string;
  isAutoSave?: boolean;
}

export function setupSaveHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Socket connected:', socket.id);
    
    // Join project room
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      
      // Initialize project in memory store
      if (!activeProjects.has(projectId)) {
        activeProjects.set(projectId, {
          lastSaved: new Date(),
          lastVersion: 0,
          users: new Set()
        });
      }
      
      const project = activeProjects.get(projectId)!;
      project.users.add(socket.id);
      
      // Notify others
      socket.to(`project:${projectId}`).emit('project:user-joined', {
        userId: socket.id,
        timestamp: new Date().toISOString(),
        userCount: project.users.size
      });
      
      console.log(`User ${socket.id} joined project ${projectId}`);
    });
    
    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      
      const project = activeProjects.get(projectId);
      if (project) {
        project.users.delete(socket.id);
        
        // Clean up if no users
        if (project.users.size === 0) {
          activeProjects.delete(projectId);
        } else {
          // Notify others
          socket.to(`project:${projectId}`).emit('project:user-left', {
            userId: socket.id,
            timestamp: new Date().toISOString(),
            userCount: project.users.size
          });
        }
      }
    });
    
    // Handle project save
    socket.on('project:save', async (payload: SavePayload) => {
      const { projectId, data, version, userId, userName, timestamp, isAutoSave } = payload;
      
      console.log(`Saving project ${projectId}, version ${version} from user ${userId}`);
      
      try {
        const project = activeProjects.get(projectId);
        
        // Check for conflicts
        if (project && version <= project.lastVersion && version > 0) {
          socket.emit('project:conflict', {
            projectId,
            yourVersion: version,
            serverVersion: project.lastVersion,
            timestamp: new Date().toISOString(),
            message: 'Version conflict detected'
          });
          return;
        }
        
        // Save version history
        const savedVersion = await VersionManager.saveVersion(projectId, data, {
          label: isAutoSave ? undefined : `Manual save by ${userName || 'user'}`,
          isAutoSave,
          author: {
            id: userId,
            name: userName || 'Anonymous',
            color: generateColor(userId)
          }
        });
        
        // Update project state
        if (project) {
          project.lastSaved = new Date();
          project.lastVersion = version;
        }
        
        // Acknowledge save to sender
        socket.emit('project:saved', {
          success: true,
          projectId,
          version: savedVersion.version,
          timestamp: savedVersion.timestamp,
          versionId: savedVersion.id
        });
        
        // Broadcast to other users in the project
        socket.to(`project:${projectId}`).emit('project:remote-save', {
          projectId,
          userId,
          userName,
          version: savedVersion.version,
          timestamp: savedVersion.timestamp,
          isAutoSave,
          changes: savedVersion.changes
        });
        
        // Broadcast version created event
        io.to(`project:${projectId}`).emit('version:created', savedVersion);
        
      } catch (error) {
        console.error('Save error:', error);
        socket.emit('project:save-error', {
          success: false,
          error: 'Failed to save project',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    // Handle version history requests
    socket.on('version:list', async (projectId: string, options: any = {}) => {
      try {
        const versions = await VersionManager.getVersions(projectId, options);
        socket.emit('version:list-response', {
          success: true,
          projectId,
          versions,
          count: versions.length
        });
      } catch (error) {
        socket.emit('version:list-error', {
          success: false,
          error: 'Failed to fetch versions'
        });
      }
    });
    
    // Handle version restore requests
    socket.on('version:restore', async (versionId: string) => {
      try {
        const result = await VersionManager.restoreVersion(versionId);
        socket.emit('version:restored', {
          success: true,
          versionId,
          data: result.data,
          version: result.version
        });
        
        // Notify project room about restore
        const version = await VersionManager.getVersion(versionId);
        if (version) {
          socket.to(`project:${version.projectId}`).emit('project:restored', {
            versionId,
            version: version.version,
            restoredBy: socket.id,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        socket.emit('version:restore-error', {
          success: false,
          error: 'Failed to restore version'
        });
      }
    });
    
    // Request project lock (for editing)
    socket.on('project:lock-request', (projectId: string) => {
      const project = activeProjects.get(projectId);
      if (!project) return;
      
      if (!project.lock) {
        project.lock = socket.id;
        socket.emit('project:lock-acquired', { projectId });
        socket.to(`project:${projectId}`).emit('project:locked', {
          lockedBy: socket.id,
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit('project:lock-denied', {
          projectId,
          lockedBy: project.lock
        });
      }
    });
    
    // Release project lock
    socket.on('project:lock-release', (projectId: string) => {
      const project = activeProjects.get(projectId);
      if (project && project.lock === socket.id) {
        project.lock = undefined;
        socket.to(`project:${projectId}`).emit('project:lock-released', {
          releasedBy: socket.id,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      // Clean up user from all projects
      for (const [projectId, project] of activeProjects.entries()) {
        if (project.users.has(socket.id)) {
          project.users.delete(socket.id);
          
          // Release lock if held
          if (project.lock === socket.id) {
            project.lock = undefined;
            socket.to(`project:${projectId}`).emit('project:lock-released', {
              releasedBy: socket.id,
              timestamp: new Date().toISOString(),
              reason: 'disconnect'
            });
          }
          
          // Notify others
          socket.to(`project:${projectId}`).emit('project:user-left', {
            userId: socket.id,
            timestamp: new Date().toISOString(),
            userCount: project.users.size,
            reason: 'disconnect'
          });
          
          // Clean up if no users
          if (project.users.size === 0) {
            activeProjects.delete(projectId);
          }
        }
      }
      
      console.log('Socket disconnected:', socket.id);
    });
  });
}

function generateColor(str: string): string {
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
