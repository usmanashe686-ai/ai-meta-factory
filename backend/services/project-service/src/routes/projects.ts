import { Router } from 'express';
import ProjectController from '../controllers/ProjectController';
import { authenticate } from '../middleware/auth'; // you'll need to create this

const router = Router();

// All project routes require authentication
router.use(authenticate);

/**
 * GET /projects
 * List all projects for the authenticated user
 */
router.get('/', ProjectController.listProjects.bind(ProjectController));

/**
 * GET /projects/:id
 * Get a single project by ID
 */
router.get('/:id', ProjectController.getProject.bind(ProjectController));

/**
 * POST /projects
 * Create a new project
 * Body: { name, description, type, framework }
 */
router.post('/', ProjectController.createProject.bind(ProjectController));

/**
 * PUT /projects/:id
 * Update an existing project
 * Body: { name, description, type, framework } (all optional)
 */
router.put('/:id', ProjectController.updateProject.bind(ProjectController));

/**
 * DELETE /projects/:id
 * Delete a project
 */
router.delete('/:id', ProjectController.deleteProject.bind(ProjectController));

export default router;
