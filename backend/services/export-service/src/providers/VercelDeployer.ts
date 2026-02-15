import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

export interface VercelDeploymentOptions {
  token: string;
  projectId: string;
  teamId?: string;
  files: Array<{ filePath: string; content: Buffer | string }>;
  projectSettings?: {
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
  };
}

export class VercelDeployer {
  private baseUrl = 'https://api.vercel.com';

  /**
   * Create a new deployment on Vercel.
   */
  async deploy(options: VercelDeploymentOptions): Promise<{ deploymentUrl: string; id: string }> {
    try {
      // Step 1: Prepare files for deployment (Vercel expects a source tarball or individual file uploads)
      // For simplicity, we'll create a tarball of all files and upload as one.
      const tarball = await this.createTarball(options.files);
      
      // Step 2: Create deployment using the tarball
      const form = new FormData();
      form.append('meta', JSON.stringify({}));
      form.append('projectSettings', JSON.stringify(options.projectSettings || {}));
      form.append('files', tarball, { filename: 'archive.tar.gz', contentType: 'application/gzip' });

      const response = await axios.post(`${this.baseUrl}/v13/deployments`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${options.token}`,
        },
        params: {
          projectId: options.projectId,
          teamId: options.teamId,
        },
      });

      return {
        deploymentUrl: response.data.url,
        id: response.data.id,
      };
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get deployment status.
   */
  async getDeploymentStatus(deploymentId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v13/deployments/${deploymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get deployment status: ${error.message}`);
    }
  }

  /**
   * List all deployments for a project.
   */
  async listDeployments(projectId: string, token: string, teamId?: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v13/deployments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId, teamId },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list deployments: ${error.message}`);
    }
  }

  /**
   * Helper to create a tarball (tar.gz) from an array of files.
   */
  private async createTarball(files: Array<{ filePath: string; content: Buffer | string }>): Promise<Buffer> {
    const tar = require('tar');
    const tempDir = await fs.mkdtemp('vercel-deploy-');
    try {
      // Write files to temp directory
      for (const file of files) {
        const fullPath = path.join(tempDir, file.filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, file.content);
      }

      // Create tarball in memory
      const tarballBuffer = await tar.c({ gzip: true, cwd: tempDir }, ['.']);
      return tarballBuffer;
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
