import AWS from 'aws-sdk';
import { StorageProvider } from '../StorageService';

export class S3Provider implements StorageProvider {
  private s3: AWS.S3;
  private bucket: string;

  constructor(config: { accessKeyId: string; secretAccessKey: string; region: string; bucket: string }) {
    AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
    this.s3 = new AWS.S3();
    this.bucket = config.bucket;
  }

  async upload(filePath: string, content: Buffer | string, metadata?: Record<string, any>): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: filePath,
      Body: content,
      Metadata: metadata as { [key: string]: string },
    };
    await this.s3.putObject(params).promise();
    return filePath; // or generate a URL
  }

  async download(fileId: string): Promise<Buffer> {
    const params = { Bucket: this.bucket, Key: fileId };
    const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer;
  }

  async delete(fileId: string): Promise<void> {
    const params = { Bucket: this.bucket, Key: fileId };
    await this.s3.deleteObject(params).promise();
  }

  async list(prefix?: string): Promise<string[]> {
    const params: AWS.S3.ListObjectsV2Request = { Bucket: this.bucket, Prefix: prefix };
    const data = await this.s3.listObjectsV2(params).promise();
    return (data.Contents || []).map(obj => obj.Key!);
  }

  async getUrl(fileId: string): Promise<string> {
    return `https://${this.bucket}.s3.amazonaws.com/${fileId}`;
  }
}
