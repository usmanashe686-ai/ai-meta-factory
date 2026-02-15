import * as Minio from 'minio';
import { StorageProvider } from '../StorageService';
import { Readable } from 'stream';

export class MinIOProvider implements StorageProvider {
  private minio: Minio.Client;
  private bucket: string;

  constructor(config: { endPoint: string; port: number; useSSL: boolean; accessKey: string; secretKey: string; bucket: string }) {
    this.minio = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
  }

  async upload(filePath: string, content: Buffer | string, metadata?: Record<string, any>): Promise<string> {
    // Ensure bucket exists
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
    }

    const meta = metadata ? { 'Content-Type': 'application/octet-stream', ...metadata } : {};
    await this.minio.putObject(this.bucket, filePath, content, meta);
    return filePath;
  }

  async download(fileId: string): Promise<Buffer> {
    const stream = await this.minio.getObject(this.bucket, fileId);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async delete(fileId: string): Promise<void> {
    await this.minio.removeObject(this.bucket, fileId);
  }

  async list(prefix?: string): Promise<string[]> {
    const objects: string[] = [];
    const stream = this.minio.listObjects(this.bucket, prefix, true);
    return new Promise((resolve, reject) => {
      stream.on('data', obj => objects.push(obj.name));
      stream.on('end', () => resolve(objects));
      stream.on('error', reject);
    });
  }

  async getUrl(fileId: string): Promise<string> {
    // Generate a presigned URL valid for 24 hours (adjust as needed)
    return await this.minio.presignedGetObject(this.bucket, fileId, 24 * 60 * 60);
  }
}
