import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

export interface ExportFile {
  path: string;
  content: string | Buffer;
}

export interface ExportOptions {
  format: 'zip' | 'github' | 'vercel';
  repoName?: string;
  githubToken?: string;
  vercelToken?: string;
}

export class ExportService {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  /**
   * Generate a ZIP archive from provided files.
   */
  async generateZip(files: ExportFile[]): Promise<Buffer> {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.path, file.content);
    });
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Export files to a GitHub repository.
   */
  async exportToGitHub(files: ExportFile[], repoName: string, token: string): Promise<void> {
    // GitHub API: create or update files in a repo
    const apiUrl = `https://api.github.com/repos/${repoName}/contents/`;
    for (const file of files) {
      const content = Buffer.isBuffer(file.content)
        ? file.content.toString('base64')
        : Buffer.from(file.content).toString('base64');

      try {
        // First, check if file exists to get its SHA
        let sha: string | undefined;
        try {
          const response = await axios.get(`${apiUrl}${file.path}`, {
            headers: { Authorization: `token ${token}` },
          });
          sha = response.data.sha;
        } catch (err) {
          // File doesn't exist, proceed without SHA
        }

        await axios.put(
          `${apiUrl}${file.path}`,
          {
            message: `Add ${file.path}`,
            content: content,
            sha: sha,
          },
          {
            headers: { Authorization: `token ${token}` },
          }
        );
      } catch (error) {
        throw new Error(`Failed to push ${file.path}: ${error.message}`);
      }
    }
  }

  /**
   * Export to Vercel (deploy project).
   * This is a placeholder – actual Vercel deployment requires their API and a built project.
   */
  async exportToVercel(files: ExportFile[], token: string): Promise<void> {
    // Vercel deployment API is more complex; requires creating a deployment with source files.
    // This is a simplified placeholder.
    throw new Error('Vercel export not fully implemented');
  }

  /**
   * Main export method based on options.
   */
  async export(files: ExportFile[], options: ExportOptions): Promise<Buffer | void> {
    switch (options.format) {
      case 'zip':
        return await this.generateZip(files);
      case 'github':
        if (!options.repoName || !options.githubToken) {
          throw new Error('GitHub export requires repoName and githubToken');
        }
        await this.exportToGitHub(files, options.repoName, options.githubToken);
        return;
      case 'vercel':
        if (!options.vercelToken) {
          throw new Error('Vercel export requires vercelToken');
        }
        await this.exportToVercel(files, options.vercelToken);
        return;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }
}
