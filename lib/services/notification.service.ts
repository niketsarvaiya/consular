import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import type { NotificationChannel } from "@prisma/client";
import type { NotificationEventType } from "@/types";

interface EnqueueParams {
  eventType: NotificationEventType;
  customerId?: string;
  applicationId?: string;
  opsUserId?: string;
  channel: NotificationChannel;
  recipient: string;
  templateVars: Record<string, string | number>;
}

/**
 * Sends the notification immediately.
 * Runs inline (not via BullMQ) because the worker process cannot run on Vercel —
 * queued jobs were silently never delivered. Name kept so existing callers don't change.
 * Never throws: a failed email must not fail the request that triggered it.
 */
export async function enqueueNotification(params: EnqueueParams): Promise<void> {
  try {
    await sendNotificationNow(params);
  } catch (err) {
    console.warn("[notification] send failed:", (err as Error).message);
  }
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "465"),
    secure: parseInt(process.env.SMTP_PORT ?? "465") === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/** Renders, sends, and records a Communication row. Throws on send failure. */
export async function sendNotificationNow(params: EnqueueParams): Promise<void> {
  const { eventType, customerId, applicationId, channel, recipient, templateVars } = params;
  if (channel !== "EMAIL") return; // SMS/WhatsApp not wired yet

  const transport = getTransporter();
  if (!transport) {
    console.warn(`[notification] SMTP not configured — dropping "${eventType}" to ${recipient}`);
    return;
  }

  const communication = await prisma.communication.create({
    data: { eventType, channel: "EMAIL", status: "QUEUED", recipient, customerId, applicationId, templateId: eventType, metadata: templateVars as object },
  });

  try {
    const { subject, html } = renderEmailTemplate(eventType, templateVars);
    await transport.sendMail({ from: `"VisaSetGo" <${process.env.EMAIL_FROM}>`, to: recipient, subject, html: wrapEmailInLayout(html) });
    await prisma.communication.update({ where: { id: communication.id }, data: { status: "SENT", sentAt: new Date() } });
  } catch (error) {
    await prisma.communication.update({ where: { id: communication.id }, data: { status: "FAILED", failureReason: String(error).slice(0, 500) } });
    throw error;
  }
}

export function wrapEmailInLayout(bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;line-height:1.6;margin:0;padding:0;background:#f5f5f5;}
    .wrapper{max-width:580px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);}
    .header{background:#0f172a;padding:24px 32px;} .header h1{color:#fff;font-size:18px;font-weight:600;margin:0;}
    .header span{color:#94a3b8;font-size:12px;} .body{padding:32px;} .body p{margin:0 0 16px;font-size:15px;}
    .body a{color:#2563eb;} blockquote{border-left:3px solid #e2e8f0;margin:0 0 16px;padding:8px 16px;color:#64748b;}
    .footer{border-top:1px solid #f1f5f9;padding:20px 32px;font-size:12px;color:#94a3b8;}
  </style></head><body><div class="wrapper">
    <div class="header"><h1>VisaSetGo</h1><span>Visas made simple</span></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer"><p>Visa approval is at the sole discretion of the respective embassy or government authority.</p></div>
  </div></body></html>`;
}

// ─── Email Templates ──────────────────────────────────────────────────────────
// Simple plain-HTML templates for V1. Migrate to React Email in V2.

export function renderEmailTemplate(
  eventType: NotificationEventType,
  vars: Record<string, string | number>
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const templates: Record<NotificationEventType, { subject: string; html: string }> = {
    welcome: {
      subject: "Welcome to VisaSetGo",
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>Your account has been created. You can now start your visa application.</p>
        <p><a href="${appUrl}/dashboard">Go to Dashboard</a></p>
      `,
    },
    application_created: {
      subject: `Visa Application Created – Ref #${vars.applicationId}`,
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>Your visa application has been created. Reference: <strong>${vars.applicationId}</strong></p>
        <p>Next step: Upload the required documents from your dashboard.</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}/documents">Upload Documents</a></p>
        <p style="font-size:12px;color:#888;">Visa approval is at the sole discretion of the respective embassy or government authority.</p>
      `,
    },
    docs_pending: {
      subject: "Action Required – Documents Needed",
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>Additional documents are required for your application <strong>${vars.applicationId}</strong>.</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}/documents">Upload Documents</a></p>
      `,
    },
    doc_rejected: {
      subject: `Document Rejected – ${vars.documentTitle}`,
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>The document "<strong>${vars.documentTitle}</strong>" was rejected for the following reason:</p>
        <blockquote>${vars.rejectionReason}</blockquote>
        <p>Please re-upload a corrected version.</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}/documents">Re-upload Document</a></p>
      `,
    },
    docs_complete: {
      subject: "Documents Approved – Proceed to Payment",
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>All your documents have been approved. You can now complete payment to confirm your application.</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}/payment">Make Payment</a></p>
      `,
    },
    payment_received: {
      subject: `Payment Confirmed – ₹${vars.amountINR}`,
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>We have received your payment of <strong>₹${vars.amountINR}</strong>.</p>
        <p>Payment ID: ${vars.paymentId}</p>
        <p>Your application is now being processed.</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}">Track Application</a></p>
      `,
    },
    case_update: {
      subject: `Application Update – ${vars.newStatus}`,
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>Your application status has been updated to: <strong>${vars.newStatus}</strong></p>
        <p>${vars.message ?? ""}</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}">View Application</a></p>
      `,
    },
    additional_docs_requested: {
      subject: "Additional Documents Required",
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>The embassy has requested additional documents for your application.</p>
        <p>${vars.message ?? ""}</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}/documents">Upload Documents</a></p>
      `,
    },
    visa_outcome: {
      subject: `Visa ${vars.outcome === "approved" ? "Approved" : "Decision Received"}`,
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>Your visa application has been ${vars.outcome}.</p>
        <p>${vars.message ?? ""}</p>
        <p><a href="${appUrl}/dashboard/application/${vars.applicationId}">View Details</a></p>
        <p style="font-size:12px;color:#888;">Visa approval is at the sole discretion of the respective embassy or government authority.</p>
      `,
    },
    password_reset: {
      subject: "Reset your VisaSetGo password",
      html: `
        <p>Hi ${vars.customerName},</p>
        <p>We received a request to reset your password. This link works for 1 hour:</p>
        <p><a href="${vars.resetUrl}">Reset my password</a></p>
        <p>If you didn't ask for this, you can ignore this email — your password won't change.</p>
      `,
    },
    trip_traveller_added: {
      subject: `${vars.appliedBy} has started your ${vars.countryName} visa application`,
      html: `
        <p>Hi ${vars.travellerName},</p>
        <p><strong>${vars.appliedBy}</strong> has applied for your <strong>${vars.countryName} ${vars.visaType} visa</strong> through VisaSetGo as part of their trip.</p>
        <p>You can follow the real-time status of your application here — no account needed:</p>
        <p><a href="${vars.trackingUrl}">Track my visa application</a></p>
        <p>Want to manage your own travel and visas? <a href="${appUrl}/auth/register">Create a free VisaSetGo account</a>.</p>
      `,
    },
    policy_refresh_alert: {
      subject: `Policy Update Detected – ${vars.countryName} ${vars.visaType}`,
      html: `
        <p>An automated refresh detected changes in the <strong>${vars.countryName} ${vars.visaType}</strong> visa policy.</p>
        <p>Change types: ${vars.changeTypes}</p>
        <p>Please review and approve or reject the update before it affects customers.</p>
        <p><a href="${appUrl}/admin/policy/${vars.countryCode}/${vars.visaTypeSlug}">Review Policy Changes</a></p>
      `,
    },
  };

  return templates[eventType] ?? { subject: "VisaSetGo Update", html: `<p>${vars.message ?? ""}</p>` };
}
