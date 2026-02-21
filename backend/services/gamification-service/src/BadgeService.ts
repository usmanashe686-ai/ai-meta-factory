import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BadgeService {
  // Check and award badges for a user based on actions
  async checkAndAwardBadges(userId: string): Promise<void> {
    // Get all badges
    const badges = await prisma.badge.findMany();
    for (const badge of badges) {
      const alreadyHas = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (alreadyHas) continue;

      const criteria = badge.criteria as any;
      let earned = false;

      switch (criteria.type) {
        case 'project_count':
          const projectCount = await prisma.project.count({ where: { userId } });
          if (projectCount >= criteria.threshold) earned = true;
          break;
        case 'export_count':
          // assuming ExportLog has userId
          const exportCount = await prisma.exportLog.count({ where: { userId } });
          if (exportCount >= criteria.threshold) earned = true;
          break;
        case 'template_use':
          // you'd need to track template usage; for now placeholder
          break;
        // add more criteria types as needed
        default:
          break;
      }

      if (earned) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        // Optionally trigger notification
      }
    }
  }

  // Get all badges for a user
  async getUserBadges(userId: string): Promise<any[]> {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  // Get all available badges
  async getAllBadges(): Promise<any[]> {
    return prisma.badge.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  // Admin: create a new badge
  async createBadge(data: { name: string; description: string; icon?: string; criteria: any }): Promise<any> {
    return prisma.badge.create({ data });
  }

  // Admin: delete a badge
  async deleteBadge(badgeId: string): Promise<void> {
    await prisma.badge.delete({ where: { id: badgeId } });
  }
}
