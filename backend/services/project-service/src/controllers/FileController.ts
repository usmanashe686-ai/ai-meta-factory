import { Request, Response } from 'express';
import prisma from '../prisma';  // adjust path if needed
import StorageService from '../services/StorageService';
import multer from 'multer';

// Configure multer for in‑memory file uploads (for binary files)
const upload = multer({ storage: multer.memoryStorage() });

export class FileController {
  /**
   * GET /projects/:projectId/files
   * List all files in a project (returns a tree structure)
   */
  async listFiles(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get files from storage (we can also store a tree in the DB, but for simplicity we list from MinIO)
      const files = await StorageService.listFiles(projectId, '', true); // recursive

      // Convert flat list to tree structure
      const tree = this.buildTree(files.map(f => f.key.replace(`projects/${projectId}/`, '')));
      
      res.json(tree);
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /projects/:projectId/files/:path(*)   (the wildcard captures the full path)
   * Get a single file's content
   */
  async getFile(req: Request, res: Response) {
    try {
      const { projectId, path } = req.params; // path is the captured wildcard
      if (!path) {
        return res.status(400).json({ error: 'Path required' });
      }

      const content = await StorageService.readFile(projectId, path);
      if (content === null) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Determine content type (optional)
      const ext = path.split('.').pop();
      const contentType = this.getContentType(ext);

      res.setHeader('Content-Type', contentType);
      res.send(content);
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /projects/:projectId/files/:path(*)
   * Create or update a file (text content)
   * Expects JSON body: { content: string }
   */
  async createOrUpdateFile(req: Request, res: Response) {
    try {
      const { projectId, path } = req.params;
      const { content } = req.body;

      if (!path || content === undefined) {
        return res.status(400).json({ error: 'Path and content required' });
      }

      // Optionally validate project existence
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      await StorageService.saveFile(projectId, path, content);
      res.json({ success: true, path });
    } catch (error) {
      console.error('Error saving file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /projects/:projectId/folders/:path(*)
   * Create a folder (marker)
   */
  async createFolder(req: Request, res: Response) {
    try {
      const { projectId, path } = req.params;
      if (!path) {
        return res.status(400).json({ error: 'Path required' });
      }

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      await StorageService.saveFile(projectId, path, '', true); // empty buffer, isFolder true
      res.json({ success: true, path });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /projects/:projectId/files/:path(*)
   * Delete a file or folder
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { projectId, path } = req.params;
      if (!path) {
        return res.status(400).json({ error: 'Path required' });
      }

      await StorageService.deleteFile(projectId, path);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /projects/:projectId/files/move
   * Move a file/folder
   * Body: { source: string, destination: string }
   */
  async moveFile(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { source, destination } = req.body;

      if (!source || !destination) {
        return res.status(400).json({ error: 'Source and destination required' });
      }

      await StorageService.moveFile(projectId, source, destination);
      res.json({ success: true });
    } catch (error) {
      console.error('Error moving file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /projects/:projectId/upload
   * Upload a binary file (using multer)
   */
  uploadMiddleware = upload.single('file');

  async uploadFile(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { path } = req.body; // destination path (including filename)
      const file = req.file;

      if (!path || !file) {
        return res.status(400).json({ error: 'Path and file required' });
      }

      await StorageService.saveFile(projectId, path, file.buffer);
      res.json({ success: true, path });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper: build tree from flat paths
  private buildTree(paths: string[]): any[] {
    const root: any[] = [];

    for (const fullPath of paths) {
      const parts = fullPath.split('/').filter(p => p);
      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const existing = currentLevel.find(item => item.name === part);

        if (existing) {
          currentLevel = existing.children || (existing.children = []);
        } else {
          const newNode: any = {
            id: fullPath, // you might want a unique ID; for simplicity we use the full path
            name: part,
            type: isLast && !fullPath.endsWith('/') ? 'file' : 'folder',
            path: fullPath,
          };
          if (!isLast || fullPath.endsWith('/')) {
            newNode.children = [];
            currentLevel.push(newNode);
            currentLevel = newNode.children;
          } else {
            currentLevel.push(newNode);
          }
        }
      }
    }
    return root;
  }

  private getContentType(ext?: string): string {
    const map: Record<string, string> = {
      js: 'application/javascript',
      ts: 'application/x-typescript',
      jsx: 'application/javascript',
      tsx: 'application/x-typescript',
      html: 'text/html',
      css: 'text/css',
      json: 'application/json',
      md: 'text/markdown',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };
    return map[ext || ''] || 'application/octet-stream';
  }
}

export default new FileController();
