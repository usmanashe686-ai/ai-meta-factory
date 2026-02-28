import { PrismaClient } from '@prisma/client';
import JSZip from 'jszip';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export class DataExportService {
  /**
   * Export all personal data for a given user.
   * Returns a ZIP buffer containing JSON files.
   */
  async exportUserData(userId: string): Promise<Buffer> {
    // Gather user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new Error('User not found');

    // Gather user's projects
    const projects = await prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Gather API keys (if applicable)
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Gather export logs (optional)
    const exportLogs = await prisma.exportLog.findMany({
      where: { userId },
      select: {
        id: true,
        projectId: true,
        projectName: true,
        format: true,
        platform: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Build the export structure
    const exportData = {
      user,
      projects,
      apiKeys,
      exportLogs,
      exportedAt: new Date().toISOString(),
    };

    // Create ZIP
    const zip = new JSZip();
    zip.file('user.json', JSON.stringify(exportData, null, 2));
    // Optionally include project files? For now just metadata.

    // Generate ZIP buffer
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Stream the export directly as a download response.
   * This can be used in an Express route.
   */
  async exportAsStream(userId: string, res: any): Promise<void> {
    const buffer = await this.exportUserData(userId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.zip"`);
    res.send(buffer);
  }
}
