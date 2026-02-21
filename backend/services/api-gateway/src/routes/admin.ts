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
      // If you have an isAdmin field, include it. For now, we can infer from email or a flag.
      // Let's add a simple check: users with email containing 'admin' are admins (for demo)
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
  // In a real app, you'd have a role field.
  res.json({ success: true, message: 'Admin status toggled (placeholder)' });
});

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

export default router;
