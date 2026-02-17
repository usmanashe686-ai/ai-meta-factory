import Queue from 'bull';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface AIJobData {
  type: 'generate' | 'explain' | 'fix' | 'optimize';
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  projectId?: string;
}

export const aiQueue = new Queue<AIJobData>('ai', redisUrl);

// Process jobs (consumer side)
aiQueue.process(async (job) => {
  const { type, prompt, model = 'tinyllama-1.1b', maxTokens = 300, temperature = 0.7 } = job.data;
  console.log(`Processing AI job ${job.id}, type: ${type}, model: ${model}`);

  // Here you would call your local AI service (Flask proxy) or a cloud fallback
  // For now, simulate work
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock response – replace with actual AI call
  const response = `AI response to: "${prompt.substring(0, 50)}..."`;

  return { text: response, usage: { prompt_tokens: 50, completion_tokens: 100 } };
});

aiQueue.on('completed', (job, result) => {
  console.log(`AI job ${job.id} completed`);
});

aiQueue.on('failed', (job, err) => {
  console.error(`AI job ${job.id} failed:`, err);
});

export default aiQueue;
