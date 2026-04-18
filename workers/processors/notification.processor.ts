import type { Job } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import { renderEmailTemplate } from "@/lib/services/notification.service";
import type { NotificationJobData } from "@/lib/jobs/queue";
import type { NotificationEventType } from "@/types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: parseInt(process.env.SMTP_PORT ?? "465") === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { eventType, customerId, applicationId, channel, recipient, templateVars } = job.data;

  if (channel !== "EMAIL") {
    console.log(`[Notification] Channel ${channel} not yet supported. Skipping.`);
    return;
  }

  const communication = await prisma.communication.create({
    data: { eventType, channel: "EMAIL", status: "QUEUED", recipient, customerId, applicationId, templateId: eventType, metadata: templateVars as object },
  });

  try {
    const { subject, html } = renderEmailTemplate(eventType as NotificationEventType, templateVars);
    await transporter.sendMail({ from: `"Consular" <${process.env.EMAIL_FROM}>`, to: recipient, subject, html: wrapEmailInLayout(html) });
    await prisma.communication.update({ where: { id: communication.id }, data: { status: "SENT", sentAt: new Date() } });
  } catch (error) {
    await prisma.communication.update({ where: { id: communication.id }, data: { status: "FAILED", failureReason: String(error).slice(0, 500) } });
    throw error;
  }
}

function wrapEmailInLayout(bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;line-height:1.6;margin:0;padding:0;background:#f5f5f5;}
    .wrapper{max-width:580px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);}
    .header{background:#0f172a;padding:24px 32px;} .header h1{color:#fff;font-size:18px;font-weight:600;margin:0;}
    .header span{color:#94a3b8;font-size:12px;} .body{padding:32px;} .body p{margin:0 0 16px;font-size:15px;}
    .body a{color:#2563eb;} blockquote{border-left:3px solid #e2e8f0;margin:0 0 16px;padding:8px 16px;color:#64748b;}
    .footer{border-top:1px solid #f1f5f9;padding:20px 32px;font-size:12px;color:#94a3b8;}
  </style></head><body><div class="wrapper">
    <div class="header"><h1>Consular</h1><span>Visa Processing Platform</span></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer"><p>Visa approval is at the sole discretion of the respective embassy or government authority.</p></div>
  </div></body></html>`;
}
