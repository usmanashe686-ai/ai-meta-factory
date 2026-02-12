import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', ProjectController.list);
router.post('/', ProjectController.create);
router.get('/:id', ProjectController.getOne);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);
router.post('/:id/fork', ProjectController.fork);

export default router;
