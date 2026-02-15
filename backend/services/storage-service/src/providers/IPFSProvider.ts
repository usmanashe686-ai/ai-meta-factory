import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { StorageProvider } from '../StorageService';

export class IPFSProvider implements StorageProvider {
  private ipfs: IPFSHTTPClient;

  constructor(config: { url: string }) {
    this.ipfs = create({ url: config.url });
  }

  async upload(filePath: string, content: Buffer | string, metadata?: Record<string, any>): Promise<string> {
    const data = typeof content === 'string' ? Buffer.from(content) : content;
    const result = await this.ipfs.add(data);
    // Pin the file to ensure it stays on the node (optional)
    await this.ipfs.pin.add(result.cid);
    return result.cid.toString();
  }

  async download(fileId: string): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of this.ipfs.cat(fileId)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete(fileId: string): Promise<void> {
    // IPFS doesn't have a delete operation in the traditional sense; unpin if you want to remove from local node
    await this.ipfs.pin.rm(fileId);
  }

  async list(prefix?: string): Promise<string[]> {
    // IPFS doesn't have a built-in directory listing; you'd need an external indexer.
    throw new Error('List not supported for IPFS provider');
  }

  async getUrl(fileId: string): Promise<string> {
    // Return a gateway URL (configurable)
    return `https://ipfs.io/ipfs/${fileId}`;
  }
}
