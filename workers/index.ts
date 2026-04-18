/**
 * Standalone BullMQ worker process.
 * Run separately from Next.js: npm run worker
 */
import { Worker } from "bullmq";
import { redisConnection } from "@/lib/jobs/queue";
import { processPolicyRefreshJob } from "@/workers/processors/policy-refresh.processor";
import { processNotificationJob } from "@/workers/processors/notification.processor";
import { processOCRJob } from "@/workers/processors/ocr.processor";

console.log("[Worker] Starting Consular background workers...");

const policyWorker = new Worker("policy-refresh", processPolicyRefreshJob, { connection: redisConnection, concurrency: 2 });
policyWorker.on("completed", (job) => console.log(`[PolicyRefresh] Job ${job.id} completed`));
policyWorker.on("failed", (job, err) => console.error(`[PolicyRefresh] Job ${job?.id} failed:`, err.message));

const notificationWorker = new Worker("notifications", processNotificationJob, { connection: redisConnection, concurrency: 5 });
notificationWorker.on("completed", (job) => console.log(`[Notification] Job ${job.id} completed (${job.name})`));
notificationWorker.on("failed", (job, err) => console.error(`[Notification] Job ${job?.id} failed:`, err.message));

const ocrWorker = new Worker("ocr-processing", processOCRJob, { connection: redisConnection, concurrency: 3 });
ocrWorker.on("completed", (job) => console.log(`[OCR] Job ${job.id} completed`));
ocrWorker.on("failed", (job, err) => console.error(`[OCR] Job ${job?.id} failed:`, err.message));

async function shutdown() {
  console.log("[Worker] Shutting down gracefully...");
  await Promise.all([policyWorker.close(), notificationWorker.close(), ocrWorker.close()]);
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
console.log("[Worker] All workers started.");
