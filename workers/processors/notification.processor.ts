import type { Job } from "bullmq";
import { sendNotificationNow } from "@/lib/services/notification.service";
import type { NotificationJobData } from "@/lib/jobs/queue";
import type { NotificationChannel } from "@prisma/client";
import type { NotificationEventType } from "@/types";

/** Drains anything still queued from before sending moved inline. */
export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const d = job.data;
  await sendNotificationNow({
    ...d,
    eventType: d.eventType as NotificationEventType,
    channel: d.channel as NotificationChannel,
  });
}
