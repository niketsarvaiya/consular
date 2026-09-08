import Razorpay from "razorpay";
import crypto from "crypto";
import { buildPayuRequest, payuTxnId, verifyPayuResponse } from "@/lib/payments/payu";
import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";
import { updateApplicationStatus } from "@/lib/services/application.service";
import { enqueueNotification } from "@/lib/services/notification.service";

// Lazy-init so build doesn't fail without env vars
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/** Which gateway new orders use. Existing unpaid orders keep the provider they were created with. */
export function activeProvider(): "razorpay" | "payu" {
  return process.env.PAYMENT_PROVIDER === "payu" ? "payu" : "razorpay";
}

/**
 * Creates a payment order for an application on the active gateway.
 * Only callable when checklist minimum is met.
 */
export async function createPaymentOrder(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: {
      policy: { select: { feeDetails: true } },
      paymentOrder: true,
      customer: { select: { fullName: true, email: true, phone: true } },
    },
  });

  // Check if payment order already exists and is unpaid
  if (application.paymentOrder?.status === "PAID") {
    throw new Error("Payment already completed for this application.");
  }

  const feeDetails = application.policy.feeDetails as {
    governmentFeeINR: number;
    serviceFeeINR: number;
    taxes?: number;
  };

  const subtotal = feeDetails.governmentFeeINR + feeDetails.serviceFeeINR;
  const taxes = feeDetails.taxes ?? Math.round(subtotal * 0.18); // 18% GST
  const totalINR = subtotal + taxes;
  const totalPaise = totalINR * 100; // Razorpay uses smallest currency unit

  const provider = activeProvider();
  const breakdown = {
    governmentFee: feeDetails.governmentFeeINR,
    serviceFee: feeDetails.serviceFeeINR,
    taxes,
    total: totalINR,
  };

  // PayU is a redirect POST flow — we hand the client a signed form to submit.
  let gatewayOrderId: string;
  let payu: ReturnType<typeof buildPayuRequest> | null = null;

  if (provider === "payu") {
    gatewayOrderId = payuTxnId(applicationId);
    const base = (process.env.APP_URL ?? "https://visasetgo.com").replace(/\/$/, "");
    payu = buildPayuRequest({
      txnid: gatewayOrderId,
      amountPaise: totalPaise,
      productinfo: "Visa Application Fee",
      firstname: application.customer?.fullName?.split(" ")[0] || "Applicant",
      email: application.customer?.email ?? "",
      phone: application.customer?.phone ?? "",
      surl: `${base}/api/payments/payu/callback`,
      furl: `${base}/api/payments/payu/callback`,
      udf1: applicationId,
    });
  } else {
    const rzpOrder = await getRazorpay().orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `cons_${applicationId.slice(-8)}`,
      notes: { applicationId, customerId: application.customerId },
    });
    gatewayOrderId = rzpOrder.id;
  }

  await prisma.paymentOrder.upsert({
    where: { applicationId },
    create: {
      applicationId,
      provider,
      gatewayOrderId,
      amount: totalPaise,
      currency: "INR",
      status: "CREATED",
      breakdown: {
        govFee: feeDetails.governmentFeeINR * 100,
        serviceFee: feeDetails.serviceFeeINR * 100,
        taxes: taxes * 100,
        total: totalPaise,
      },
    },
    update: { provider, gatewayOrderId, amount: totalPaise, status: "CREATED" },
  });

  await updateApplicationStatus(applicationId, "PAYMENT_PENDING");

  return {
    provider,
    orderId: gatewayOrderId,
    amount: totalPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    payu: payu ? { paymentUrl: payu.paymentUrl, fields: payu.fields } : null,
    breakdown,
  };
}

/**
 * Verifies a PayU callback/webhook POST and marks the order paid.
 * Safe to call twice — PayU posts to both the browser return URL and the webhook.
 */
export async function verifyPayuPayment(body: Record<string, string>) {
  if (!verifyPayuResponse(body)) throw new Error("Payment signature verification failed.");
  if (body.status !== "success") return { failed: true, applicationId: body.udf1 };

  return markOrderPaid({
    gatewayOrderId: body.txnid,
    gatewayPaymentId: body.mihpayid ?? body.txnid,
    gatewaySignature: body.hash,
  });
}

/**
 * Verifies Razorpay payment signature and marks order as paid.
 * This is called server-side after the Razorpay checkout callback.
 */
export async function verifyPayment(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Payment signature verification failed.");
  }

  return markOrderPaid({
    gatewayOrderId: razorpayOrderId,
    gatewayPaymentId: razorpayPaymentId,
    gatewaySignature: razorpaySignature,
  });
}

/**
 * Idempotently marks an order PAID + advances the application + notifies.
 * Shared by the client-callback verify flow and the Razorpay webhook, so a
 * payment is recorded even if the customer closes the tab before the callback.
 */
export async function markOrderPaid(params: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
}) {
  const { gatewayOrderId, gatewayPaymentId, gatewaySignature } = params;

  const paymentOrder = await prisma.paymentOrder.findUnique({
    where: { gatewayOrderId },
    include: {
      application: {
        include: { customer: true },
      },
    },
  });

  if (!paymentOrder) {
    // Unknown order (e.g. webhook for an order we didn't create) — ignore safely.
    return { unknownOrder: true };
  }

  if (paymentOrder.status === "PAID") {
    return { alreadyPaid: true };
  }

  // Mark payment as paid
  await prisma.$transaction(async (tx) => {
    await tx.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: {
        status: "PAID",
        gatewayPaymentId,
        gatewaySignature,
        paidAt: new Date(),
      },
    });

    await tx.application.update({
      where: { id: paymentOrder.applicationId },
      data: { status: "PAYMENT_RECEIVED" },
    });

    await tx.caseStatusHistory.create({
      data: {
        applicationId: paymentOrder.applicationId,
        fromStatus: "PAYMENT_PENDING",
        toStatus: "PAYMENT_RECEIVED",
        notes: `Payment received. ${paymentOrder.provider === "payu" ? "PayU" : "Razorpay"} ID: ${gatewayPaymentId}`,
      },
    });
  });

  await logAction({
    actorType: "system",
    action: "PAYMENT_VERIFIED",
    resourceType: "payment_order",
    resourceId: paymentOrder.id,
    newValue: { provider: paymentOrder.provider, gatewayPaymentId, amount: paymentOrder.amount },
  });

  // Notify customer
  const customer = paymentOrder.application.customer;
  if (customer) {
    await enqueueNotification({
      eventType: "payment_received",
      customerId: customer.id,
      applicationId: paymentOrder.applicationId,
      channel: "EMAIL",
      recipient: customer.email,
      templateVars: {
        customerName: customer.fullName,
        applicationId: paymentOrder.applicationId,
        amountINR: Math.round(paymentOrder.amount / 100),
        paymentId: gatewayPaymentId,
      },
    });
  }

  return { success: true, applicationId: paymentOrder.applicationId };
}
