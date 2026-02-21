import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  // Create a new report
  async createReport(data: {
    reporterId: string;
    reportedUserId?: string;
    reportedProjectId?: string;
    reason: string;
    description?: string;
  }): Promise<any> {
    if (!data.reportedUserId && !data.reportedProjectId) {
      throw new Error('Must specify either a user or a project to report');
    }
    return prisma.report.create({
      data: {
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId,
        reportedProjectId: data.reportedProjectId,
        reason: data.reason,
        description: data.description,
        status: 'pending',
      },
    });
  }

  // Get pending reports (admin only)
  async getPendingReports(): Promise<any[]> {
    return prisma.report.findMany({
      where: { status: 'pending' },
      include: {
        reporter: { select: { id: true, name: true } },
        reportedUser: { select: { id: true, name: true } },
        reportedProject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Review a report (admin only)
  async reviewReport(reportId: string, reviewerId: string, status: 'reviewed' | 'dismissed'): Promise<any> {
    return prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewerId,
      },
    });
  }

  // Take action on reported content (e.g., delete project, warn user)
  // This would be separate endpoints; we'll just provide a method to delete a project if needed.
}
