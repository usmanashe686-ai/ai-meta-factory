import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Middleware to ensure user is admin (stub - replace with actual auth)
const isAdmin = (req: any, res: any, next: any) => {
  // In real implementation, check user role from session/JWT
  // For now, we assume a header 'x-admin-key' or similar.
  // This is just a placeholder.
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === process.env.ADMIN_SECRET) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Apply admin middleware to all routes
router.use(isAdmin);

// ==================== User Management ====================

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      projectCount: u._count.projects,
      // Placeholder for admin flag – adjust if you add a role field
      isAdmin: u.email?.includes('admin') ?? false,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Cascade delete related records (projects, accounts, sessions, etc.) should be handled by Prisma onDelete: Cascade
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users/:id/toggle-admin
router.post('/users/:id/toggle-admin', async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  // If you have an isAdmin field in the User model, you'd update it here.
  // For now, we'll just return a success message (no actual change).
  res.json({ success: true, message: 'Admin status toggled (placeholder)' });
});

// ==================== Statistics ====================

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalExports] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.exportLog.count(),
    ]);
    res.json({
      totalUsers,
      totalProjects,
      totalExports,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== Report Moderation ====================

// GET /api/admin/reports – list pending reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'pending' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        reportedProject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/reports/:id/review – review a report
router.post('/reports/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'reviewed' or 'dismissed'
    const adminId = (req as any).user?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewerId: adminId,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Error reviewing report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/projects/:id – delete a reported project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
