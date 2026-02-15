import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  format: 'zip' | 'apk' | 'exe' | 'ipa' | 'github' | 'vercel';
  platform?: 'web' | 'mobile' | 'desktop';
  includeNodeModules?: boolean;
  minify?: boolean;
}

export interface ProjectFile {
  path: string;
  content: string | Blob | ArrayBuffer;
  isBinary?: boolean;
}

export class UniversalExporter {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  /**
   * Add a file to the export archive.
   */
  addFile(file: ProjectFile): void {
    if (file.isBinary) {
      this.zip.file(file.path, file.content, { binary: true });
    } else {
      this.zip.file(file.path, file.content as string);
    }
  }

  /**
   * Add multiple files at once.
   */
  addFiles(files: ProjectFile[]): void {
    files.forEach(file => this.addFile(file));
  }

  /**
   * Generate and download the ZIP archive.
   */
  async downloadAsZip(filename: string = 'project.zip'): Promise<void> {
    const content = await this.zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);
  }

  /**
   * Export to GitHub (placeholder – would use GitHub API).
   */
  async exportToGitHub(repoName: string, token: string): Promise<void> {
    // This would push files to a GitHub repo
    throw new Error('GitHub export not implemented yet');
  }

  /**
   * Export to Vercel (placeholder – would use Vercel API).
   */
  async exportToVercel(): Promise<void> {
    throw new Error('Vercel export not implemented yet');
  }

  /**
   * Generate APK (placeholder – requires backend build service).
   */
  async generateApk(): Promise<Blob> {
    throw new Error('APK generation requires backend build service');
  }

  /**
   * Static helper to create a ZIP from project files and download.
   */
  static async exportProject(files: ProjectFile[], filename: string = 'project.zip'): Promise<void> {
    const exporter = new UniversalExporter();
    exporter.addFiles(files);
    await exporter.downloadAsZip(filename);
  }

  /**
   * Prepare a basic project structure (e.g., for web).
   */
  static createWebProjectFiles(
    html: string,
    css: string,
    js: string,
    additionalFiles: ProjectFile[] = []
  ): ProjectFile[] {
    const files: ProjectFile[] = [
      { path: 'index.html', content: html },
      { path: 'style.css', content: css },
      { path: 'script.js', content: js },
      ...additionalFiles,
    ];
    return files;
  }

  /**
   * Prepare React project files (simplified).
   */
  static createReactProjectFiles(
    appComponent: string,
    indexJs: string,
    packageJson: string
  ): ProjectFile[] {
    return [
      { path: 'src/App.js', content: appComponent },
      { path: 'src/index.js', content: indexJs },
      { path: 'package.json', content: packageJson },
      { path: 'public/index.html', content: '<div id="root"></div>' },
    ];
  }
}
