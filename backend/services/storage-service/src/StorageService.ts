import { S3Provider } from './providers/S3Provider';
import { MinIOProvider } from './providers/MinIOProvider';
import { IPFSProvider } from './providers/IPFSProvider';

export type StorageProviderType = 's3' | 'minio' | 'ipfs';

export interface StorageProvider {
  upload(filePath: string, content: Buffer | string, metadata?: Record<string, any>): Promise<string>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  getUrl(fileId: string): Promise<string>;
}

export class StorageService {
  private provider: StorageProvider;

  constructor(providerType: StorageProviderType, config: any) {
    switch (providerType) {
      case 's3':
        this.provider = new S3Provider(config);
        break;
      case 'minio':
        this.provider = new MinIOProvider(config);
        break;
      case 'ipfs':
        this.provider = new IPFSProvider(config);
        break;
      default:
        throw new Error(`Unsupported storage provider: ${providerType}`);
    }
  }

  async upload(filePath: string, content: Buffer | string, metadata?: Record<string, any>): Promise<string> {
    return this.provider.upload(filePath, content, metadata);
  }

  async download(fileId: string): Promise<Buffer> {
    return this.provider.download(fileId);
  }

  async delete(fileId: string): Promise<void> {
    return this.provider.delete(fileId);
  }

  async list(prefix?: string): Promise<string[]> {
    return this.provider.list(prefix);
  }

  async getUrl(fileId: string): Promise<string> {
    return this.provider.getUrl(fileId);
  }
}
