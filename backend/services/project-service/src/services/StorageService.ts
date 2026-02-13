import * as Minio from 'minio';
import { Readable } from 'stream';

export interface FileMetadata {
  projectId: string;
  path: string;          // virtual path within project (e.g., /src/index.js)
  content: Buffer | string;
  isFolder?: boolean;
}

export interface StoredFileInfo {
  bucket: string;
  key: string;
  size: number;
  lastModified: Date;
}

export class StorageService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
    this.bucketName = process.env.MINIO_BUCKET || 'projects';
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  /**
   * Save a file (or folder marker) to MinIO.
   * The key is constructed as: projects/{projectId}/{path}
   */
  async saveFile(projectId: string, virtualPath: string, content: Buffer | string, isFolder = false): Promise<string> {
    await this.ensureBucket();
    const key = `projects/${projectId}/${virtualPath}`.replace(/\/+/g, '/');
    
    if (isFolder) {
      // For folders, we store a zero‑byte marker with a trailing slash
      const folderKey = key.endsWith('/') ? key : key + '/';
      await this.minioClient.putObject(this.bucketName, folderKey, Buffer.from(''));
      return folderKey;
    } else {
      const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
      await this.minioClient.putObject(this.bucketName, key, buffer);
      return key;
    }
  }

  /**
   * Read a file's content as a string (UTF-8).
   */
  async readFile(projectId: string, virtualPath: string): Promise<string | null> {
    const key = `projects/${projectId}/${virtualPath}`.replace(/\/+/g, '/');
    try {
      const stream = await this.minioClient.getObject(this.bucketName, key);
      return await this.streamToString(stream);
    } catch (err) {
      if (err.code === 'NoSuchKey') return null;
      throw err;
    }
  }

  /**
   * Delete a file or folder (recursive).
   */
  async deleteFile(projectId: string, virtualPath: string): Promise<void> {
    const prefix = `projects/${projectId}/${virtualPath}`.replace(/\/+/g, '/');
    
    // List all objects with this prefix (including folders if marked)
    const objectsList: string[] = [];
    const stream = this.minioClient.listObjects(this.bucketName, prefix, true);
    
    await new Promise<void>((resolve, reject) => {
      stream.on('data', obj => objectsList.push(obj.name));
      stream.on('error', reject);
      stream.on('end', async () => {
        if (objectsList.length === 0) {
          // If it's a single file, delete it directly
          try {
            await this.minioClient.removeObject(this.bucketName, prefix);
          } catch (e) {
            // ignore if not exists
          }
        } else {
          await this.minioClient.removeObjects(this.bucketName, objectsList);
        }
        resolve();
      });
    });
  }

  /**
   * List all files/folders under a given virtual path (non‑recursive by default).
   */
  async listFiles(projectId: string, virtualPath: string = '', recursive = false): Promise<StoredFileInfo[]> {
    const prefix = `projects/${projectId}/${virtualPath}`.replace(/\/+/g, '/').replace(/\/$/, '') + '/';
    const stream = this.minioClient.listObjects(this.bucketName, prefix, recursive);
    
    const files: StoredFileInfo[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', obj => {
        files.push({
          bucket: this.bucketName,
          key: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
        });
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }

  /**
   * Move/rename a file or folder.
   */
  async moveFile(projectId: string, oldVirtualPath: string, newVirtualPath: string): Promise<void> {
    const oldPrefix = `projects/${projectId}/${oldVirtualPath}`.replace(/\/+/g, '/');
    const newPrefix = `projects/${projectId}/${newVirtualPath}`.replace(/\/+/g, '/');

    // List all objects under old prefix
    const objectsList: { name: string }[] = [];
    const stream = this.minioClient.listObjects(this.bucketName, oldPrefix, true);

    await new Promise<void>((resolve, reject) => {
      stream.on('data', obj => objectsList.push({ name: obj.name }));
      stream.on('error', reject);
      stream.on('end', async () => {
        if (objectsList.length === 0) {
          // Single file? Attempt copy & delete
          try {
            await this.minioClient.copyObject(this.bucketName, newPrefix, `${this.bucketName}/${oldPrefix}`);
            await this.minioClient.removeObject(this.bucketName, oldPrefix);
          } catch (e) {
            // ignore
          }
        } else {
          // Copy each object to new path, then delete old ones
          for (const obj of objectsList) {
            const relativePath = obj.name.substring(oldPrefix.length);
            const newKey = newPrefix + relativePath;
            await this.minioClient.copyObject(this.bucketName, newKey, `${this.bucketName}/${obj.name}`);
          }
          // Remove old objects
          await this.minioClient.removeObjects(this.bucketName, objectsList.map(o => o.name));
        }
        resolve();
      });
    });
  }

  private streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }
}

export default new StorageService();
