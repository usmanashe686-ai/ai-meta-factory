import { StorageService, StorageProviderType } from '../src/StorageService';
import * as dotenv from 'dotenv';

dotenv.config();

const TEST_FILE_PATH = 'test-file.txt';
const TEST_CONTENT = 'Hello, world! This is a test file.';

async function testProvider(type: StorageProviderType, config: any) {
  console.log(`\n🧪 Testing ${type.toUpperCase()} provider...`);
  try {
    const storage = new StorageService(type, config);

    // Upload
    console.log(`  Uploading ${TEST_FILE_PATH}...`);
    const fileId = await storage.upload(TEST_FILE_PATH, Buffer.from(TEST_CONTENT), { test: 'metadata' });
    console.log(`  ✅ Uploaded, fileId: ${fileId}`);

    // Download
    console.log(`  Downloading...`);
    const downloaded = await storage.download(fileId);
    const downloadedStr = downloaded.toString();
    console.log(`  ✅ Downloaded, content: "${downloadedStr}"`);
    if (downloadedStr !== TEST_CONTENT) {
      throw new Error('Content mismatch');
    }

    // Get URL
    try {
      const url = await storage.getUrl(fileId);
      console.log(`  ✅ URL: ${url}`);
    } catch (err: any) {
      console.log(`  ℹ️ URL not available: ${err.message}`);
    }

    // List (if supported)
    try {
      const files = await storage.list();
      console.log(`  ✅ List: ${files.length} files`);
    } catch (err: any) {
      console.log(`  ℹ️ List not supported: ${err.message}`);
    }

    // Delete
    await storage.delete(fileId);
    console.log(`  ✅ Deleted`);

  } catch (error: any) {
    console.error(`  ❌ ${type} test failed:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting storage service tests...\n');

  // Test S3 if credentials provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    await testProvider('s3', {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'test-bucket',
    });
  } else {
    console.log('⏭️ Skipping S3 tests (AWS credentials not set)');
  }

  // Test MinIO if configured
  if (process.env.MINIO_ENDPOINT) {
    await testProvider('minio', {
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'test-bucket',
    });
  } else {
    console.log('⏭️ Skipping MinIO tests (MINIO_ENDPOINT not set)');
  }

  // Test IPFS (requires local node or public gateway)
  if (process.env.IPFS_URL) {
    await testProvider('ipfs', { url: process.env.IPFS_URL });
  } else {
    console.log('⏭️ Skipping IPFS tests (IPFS_URL not set)');
  }

  console.log('\n✅ All tests completed.');
}

runTests().catch(console.error);
