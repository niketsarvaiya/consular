import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// Shared Redis connection for BullMQ — lazyConnect so build doesn't fail without Redis
export const redisConnection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required by BullMQ
  lazyConnect: true,
  enableOfflineQueue: false,
});

// ─── Queue Definitions ────────────────────────────────────────────────────────

export const policyRefreshQueue = new Queue("policy-refresh", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 500,
    removeOnFail: 200,
  },
});

export const ocrQueue = new Queue("ocr-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

// ─── Job Type Definitions ─────────────────────────────────────────────────────

export interface PolicyRefreshJobData {
  policyId: string;
  countryCode: string;
  visaType: string;
  triggeredByUserId: string;
}

export interface NotificationJobData {
  eventType: string;
  customerId?: string;
  applicationId?: string;
  opsUserId?: string;
  channel: string;
  recipient: string;
  templateVars: Record<string, string | number>;
}

export interface OcrJobData {
  passportId: string;
  fileKey: string;
  customerId: string;
}
