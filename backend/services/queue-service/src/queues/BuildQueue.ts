import Queue from 'bull';
import Redis from 'ioredis';

// Redis connection (use environment variables in production)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface BuildJobData {
  projectId: string;
  buildType: 'apk' | 'zip' | 'github' | 'vercel';
  files: Array<{ path: string; content: string }>;
  options?: Record<string, any>;
}

// Create a Bull queue for builds
export const buildQueue = new Queue<BuildJobData>('builds', redisUrl);

// Process jobs (consumer side)
buildQueue.process(async (job) => {
  const { projectId, buildType, files, options } = job.data;
  console.log(`Processing build job ${job.id} for project ${projectId}, type: ${buildType}`);

  // Simulate build work (replace with actual build logic)
  await new Promise(resolve => setTimeout(resolve, 5000));

  // In real implementation, you'd call your build service (e.g., Go service) here
  // and update the project status in the database.

  return { success: true, artifactUrl: `https://storage.example.com/${projectId}.${buildType}` };
});

// Optional: event listeners for monitoring
buildQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

buildQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

export default buildQueue;
