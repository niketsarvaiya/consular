import { notificationQueue } from "@/lib/jobs/queue";
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

export async function enqueueNotification(params: EnqueueParams): Promise<void> {
  try {
    await notificationQueue.add(
      params.eventType,
      { ...params },
      {
        // Deduplicate notifications for the same event + application within 5 minutes
        jobId: params.applicationId
          ? `notif-${params.eventType}-${params.applicationId}-${Math.floor(Date.now() / 300000)}`
          : undefined,
      }
    );
  } catch (err) {
    // Notifications are non-critical — log and continue if Redis is unavailable
    console.warn("[enqueueNotification] Failed to enqueue (Redis unavailable?):", (err as Error).message);
  }
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
      subject: "Welcome to Consular",
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

  return templates[eventType] ?? { subject: "Consular Update", html: `<p>${vars.message ?? ""}</p>` };
}
