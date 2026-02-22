import { Router } from 'express';
import { DataExportService } from '../../../export-service/src/DataExportService';

const router = Router();

// Assume you have authentication middleware that attaches user object
// You may also have other user-related endpoints (profile, etc.)
// Merge this with your existing user routes.

/**
 * GET /user/export-data
 * Export all user data as a ZIP file (GDPR right to data portability).
 */
router.get('/export-data', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const exportService = new DataExportService();
    await exportService.exportAsStream(userId, res);
  } catch (err) {
    console.error('Data export failed:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// If you already have other user routes (e.g., profile), keep them here.
// For example:
// router.get('/profile', ...);
// router.put('/profile', ...);

export default router;
