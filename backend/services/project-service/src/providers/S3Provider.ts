import * as Minio from 'minio';
import { Readable } from 'stream';

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
}

export interface S3ProviderConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class S3Provider {
  private client: Minio.Client;
  private bucket: string;

  constructor(config: S3ProviderConfig) {
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async putObject(key: string, data: Buffer | string, metadata?: Minio.ItemBucketMetadata): Promise<string> {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    await this.client.putObject(this.bucket, key, buffer, metadata);
    return key;
  }

  async getObject(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key);
    return this.streamToBuffer(stream);
  }

  async getObjectAsString(key: string): Promise<string> {
    const buffer = await this.getObject(key);
    return buffer.toString('utf-8');
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await this.client.removeObjects(this.bucket, keys);
  }

  async listObjects(prefix: string, recursive: boolean = false): Promise<S3Object[]> {
    const stream = this.client.listObjects(this.bucket, prefix, recursive);
    const objects: S3Object[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', obj => {
        objects.push({
          key: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          etag: obj.etag,
        });
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }

  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    await this.client.copyObject(this.bucket, destinationKey, `/${this.bucket}/${sourceKey}`);
  }

  async moveObject(sourceKey: string, destinationKey: string): Promise<void> {
    await this.copyObject(sourceKey, destinationKey);
    await this.deleteObject(sourceKey);
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, key);
      return true;
    } catch (err) {
      if (err.code === 'NotFound') return false;
      throw err;
    }
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

// Singleton instance (optional)
let s3ProviderInstance: S3Provider | null = null;

export function getS3Provider(config?: S3ProviderConfig): S3Provider {
  if (!s3ProviderInstance && config) {
    s3ProviderInstance = new S3Provider(config);
  }
  if (!s3ProviderInstance) {
    throw new Error('S3Provider not initialized. Call initS3Provider first.');
  }
  return s3ProviderInstance;
}

export function initS3Provider(config: S3ProviderConfig): S3Provider {
  s3ProviderInstance = new S3Provider(config);
  return s3ProviderInstance;
}
