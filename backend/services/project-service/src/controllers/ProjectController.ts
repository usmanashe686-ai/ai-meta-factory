import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class ProjectController {
  // GET /projects – list all projects for current user
  static async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /projects/:id – get single project
  static async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;

      const project = await prisma.project.findFirst({
        where: { id, userId },
        include: { builds: true, deployments: true },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /projects – create a new project
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, description, platform, template, visibility, isTemplate, config, tags } = req.body;

      // Validation
      if (!name || !platform) {
        return res.status(400).json({ error: 'Name and platform are required' });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          platform,
          template,
          visibility: visibility || 'private',
          isTemplate: isTemplate || false,
          userId,
          config: config || {},
          tags: tags || [],
        },
      });

      res.status(201).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /projects/:id – update project
  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;
      const { name, description, visibility, config, tags } = req.body;

      // Check ownership
      const existing = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          visibility,
          config,
          tags,
        },
      });

      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /projects/:id – delete project
  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;

      // Check ownership
      const existing = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Project not found' });
      }

      await prisma.project.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /projects/:id/fork – fork a project
  static async fork(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;

      // Find original project (public or owned)
      const original = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { visibility: 'public' },
          ],
        },
      });

      if (!original) {
        return res.status(404).json({ error: 'Project not found or not accessible' });
      }

      // Create forked copy
      const forked = await prisma.project.create({
        data: {
          name: `${original.name} (fork)`,
          description: original.description,
          platform: original.platform,
          template: original.template,
          visibility: 'private',
          isTemplate: false,
          userId, // new owner
          config: original.config,
          tags: original.tags,
        },
      });

      // Increment fork count
      await prisma.project.update({
        where: { id },
        data: { forks: { increment: 1 } },
      });

      res.status(201).json(forked);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
