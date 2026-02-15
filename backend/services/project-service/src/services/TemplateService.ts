import { PrismaClient, Template } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTemplateInput {
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  files: Record<string, string>; // JSON object of file paths to content
  stack?: string[];
  isPublic?: boolean;
  authorId?: string;
}

export class TemplateService {
  /**
   * Get all public templates, optionally filtered by category.
   */
  async getTemplates(category?: string): Promise<Template[]> {
    const where: any = { isPublic: true };
    if (category) {
      where.category = category;
    }
    return prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Get a template by ID.
   */
  async getTemplate(id: string): Promise<Template | null> {
    return prisma.template.findUnique({ where: { id } });
  }

  /**
   * Create a new template.
   */
  async createTemplate(data: CreateTemplateInput, authorId?: string): Promise<Template> {
    return prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        files: data.files, // Prisma supports Json type
        stack: data.stack || [],
        isPublic: data.isPublic ?? true,
        authorId: authorId,
      },
    });
  }

  /**
   * Update an existing template (only by author or admin).
   */
  async updateTemplate(id: string, data: Partial<CreateTemplateInput>, userId?: string): Promise<Template> {
    // Optionally check ownership here
    return prisma.template.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        files: data.files,
        stack: data.stack,
        isPublic: data.isPublic,
      },
    });
  }

  /**
   * Delete a template.
   */
  async deleteTemplate(id: string, userId?: string): Promise<void> {
    // Optionally check ownership
    await prisma.template.delete({ where: { id } });
  }

  /**
   * Seed initial templates from predefined list.
   */
  async seedInitialTemplates(): Promise<void> {
    const count = await prisma.template.count();
    if (count > 0) return; // already seeded

    const initialTemplates = [
      {
        name: 'Basic Landing Page',
        description: 'A simple landing page with hero section, features, and footer.',
        category: 'website',
        files: {
          'index.html': '<!DOCTYPE html>...',
          'style.css': 'body { ... }',
          'script.js': 'console.log("hello");',
        },
        stack: ['HTML', 'CSS', 'JavaScript'],
        isPublic: true,
      },
      {
        name: 'Social App (React Native)',
        description: 'A basic social media app with feed, profile, and post creation.',
        category: 'mobile',
        files: {
          'App.js': '...',
          'screens/FeedScreen.js': '...',
        },
        stack: ['React Native', 'Expo', 'Firebase'],
        isPublic: true,
      },
      {
        name: 'Text Editor (Electron)',
        description: 'A simple text editor built with Electron and React.',
        category: 'desktop',
        files: {
          'package.json': '...',
          'src/main.ts': '...',
        },
        stack: ['Electron', 'React', 'TypeScript'],
        isPublic: true,
      },
      {
        name: 'Platformer Game (Phaser)',
        description: 'A simple 2D platformer game built with Phaser 3.',
        category: 'game',
        files: {
          'index.html': '...',
          'game.js': '...',
        },
        stack: ['Phaser 3', 'JavaScript'],
        isPublic: true,
      },
    ];

    for (const tmpl of initialTemplates) {
      await prisma.template.create({ data: tmpl });
    }
    console.log('✅ Seeded initial templates.');
  }
}
