import client from 'prom-client';
import Queue from 'bull';

// Create a registry
const register = new client.Registry();
register.setDefaultLabels({ app: 'queue-service' });
client.collectDefaultMetrics({ register });

// Queue metrics
export const queueSizeGauge = new client.Gauge({
  name: 'bull_queue_size',
  help: 'Current size of the queue',
  labelNames: ['queue'],
  registers: [register],
});

export const queueWaitingGauge = new client.Gauge({
  name: 'bull_queue_waiting',
  help: 'Number of waiting jobs',
  labelNames: ['queue'],
  registers: [register],
});

export const queueActiveGauge = new client.Gauge({
  name: 'bull_queue_active',
  help: 'Number of active jobs',
  labelNames: ['queue'],
  registers: [register],
});

export const queueCompletedCounter = new client.Counter({
  name: 'bull_job_completed_total',
  help: 'Total number of completed jobs',
  labelNames: ['queue', 'job'],
  registers: [register],
});

export const queueFailedCounter = new client.Counter({
  name: 'bull_job_failed_total',
  help: 'Total number of failed jobs',
  labelNames: ['queue', 'job'],
  registers: [register],
});

export const queueDurationHistogram = new client.Histogram({
  name: 'bull_job_duration_ms',
  help: 'Duration of jobs in ms',
  labelNames: ['queue', 'job'],
  buckets: [100, 500, 1000, 5000, 10000, 30000],
  registers: [register],
});

// Function to update metrics for a given queue
export async function updateQueueMetrics(queue: Queue.Queue, queueName: string) {
  const counts = await queue.getJobCounts();
  queueSizeGauge.labels(queueName).set(counts.waiting + counts.active + counts.delayed);
  queueWaitingGauge.labels(queueName).set(counts.waiting || 0);
  queueActiveGauge.labels(queueName).set(counts.active || 0);
}

// HTTP handler for metrics endpoint
export const metricsHandler = async (req: any, res: any) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export default register;
