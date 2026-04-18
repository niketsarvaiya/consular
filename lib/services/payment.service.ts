import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";
import { updateApplicationStatus } from "@/lib/services/application.service";
import { enqueueNotification } from "@/lib/services/notification.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Creates a Razorpay payment order for an application.
 * Only callable when checklist minimum is met.
 */
export async function createPaymentOrder(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: {
      policy: { select: { feeDetails: true } },
      paymentOrder: true,
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

  // Create Razorpay order
  const rzpOrder = await razorpay.orders.create({
    amount: totalPaise,
    currency: "INR",
    receipt: `cons_${applicationId.slice(-8)}`,
    notes: {
      applicationId,
      customerId: application.customerId,
    },
  });

  // Upsert payment order record
  const paymentOrder = await prisma.paymentOrder.upsert({
    where: { applicationId },
    create: {
      applicationId,
      razorpayOrderId: rzpOrder.id,
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
    update: {
      razorpayOrderId: rzpOrder.id,
      amount: totalPaise,
      status: "CREATED",
    },
  });

  // Update application status
  await updateApplicationStatus(applicationId, "PAYMENT_PENDING");

  return {
    orderId: rzpOrder.id,
    amount: totalPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    breakdown: {
      governmentFee: feeDetails.governmentFeeINR,
      serviceFee: feeDetails.serviceFeeINR,
      taxes,
      total: totalINR,
    },
  };
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

  const paymentOrder = await prisma.paymentOrder.findUniqueOrThrow({
    where: { razorpayOrderId },
    include: {
      application: {
        include: { customer: true },
      },
    },
  });

  if (paymentOrder.status === "PAID") {
    return { alreadyPaid: true };
  }

  // Mark payment as paid
  await prisma.$transaction(async (tx) => {
    await tx.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
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
        notes: `Payment received. Razorpay ID: ${razorpayPaymentId}`,
      },
    });
  });

  await logAction({
    actorType: "system",
    action: "PAYMENT_VERIFIED",
    resourceType: "payment_order",
    resourceId: paymentOrder.id,
    newValue: { razorpayPaymentId, amount: paymentOrder.amount },
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
        paymentId: razorpayPaymentId,
      },
    });
  }

  return { success: true, applicationId: paymentOrder.applicationId };
}
