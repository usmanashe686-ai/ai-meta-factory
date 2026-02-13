import { Router } from 'express';
import FileController from '../controllers/FileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All file routes require authentication
router.use(authenticate);

/**
 * GET /projects/:projectId/files
 * List all files in a project (returns tree structure)
 */
router.get('/:projectId/files', FileController.listFiles.bind(FileController));

/**
 * GET /projects/:projectId/files/*
 * Get a single file's content (wildcard path)
 * Example: /projects/123/files/src/index.js
 */
router.get('/:projectId/files/*', FileController.getFile.bind(FileController));

/**
 * POST /projects/:projectId/files/*
 * Create or update a text file (expects JSON: { content: string })
 */
router.post('/:projectId/files/*', FileController.createOrUpdateFile.bind(FileController));

/**
 * POST /projects/:projectId/folders/*
 * Create a folder marker
 */
router.post('/:projectId/folders/*', FileController.createFolder.bind(FileController));

/**
 * DELETE /projects/:projectId/files/*
 * Delete a file or folder (recursive)
 */
router.delete('/:projectId/files/*', FileController.deleteFile.bind(FileController));

/**
 * POST /projects/:projectId/files/move
 * Move/rename a file or folder
 * Body: { source: string, destination: string }
 */
router.post('/:projectId/files/move', FileController.moveFile.bind(FileController));

/**
 * POST /projects/:projectId/upload
 * Upload a binary file (multipart/form-data)
 * Form field: file (the binary), path (destination path)
 */
router.post(
  '/:projectId/upload',
  FileController.uploadMiddleware,
  FileController.uploadFile.bind(FileController)
);

export default router;
