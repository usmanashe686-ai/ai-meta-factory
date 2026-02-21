import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/analytics/export – record an export event
router.post('/export', async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      format,
      platform,
      status,
      error,
      duration,
      metadata,
    } = req.body;

    if (!format || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const log = await prisma.exportLog.create({
      data: {
        projectId,
        projectName,
        format,
        platform,
        status,
        error,
        duration,
        metadata: metadata || {},
        userId: (req as any).user?.id,
      },
    });

    res.status(201).json({ id: log.id });
  } catch (err) {
    console.error('Failed to record export:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/exports – retrieve export logs (for dashboard)
router.get('/exports', async (req, res) => {
  try {
    const { limit = 50, offset = 0, format, status } = req.query;

    const where: any = {};
    if (format) where.format = format;
    if (status) where.status = status;

    const logs = await prisma.exportLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.exportLog.count({ where });

    res.json({ logs, total });
  } catch (err) {
    console.error('Failed to fetch export logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/export-stats – aggregated stats
router.get('/export-stats', async (req, res) => {
  try {
    const totalExports = await prisma.exportLog.count();
    const successCount = await prisma.exportLog.count({ where: { status: 'success' } });
    const failedCount = await prisma.exportLog.count({ where: { status: 'failed' } });

    const byFormat = await prisma.exportLog.groupBy({
      by: ['format'],
      _count: { format: true },
    });

    const last7Days = await prisma.exportLog.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      total: totalExports,
      success: successCount,
      failed: failedCount,
      byFormat,
      last7Days,
    });
  } catch (err) {
    console.error('Failed to compute export stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
