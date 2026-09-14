import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { enqueueNotification } from "@/lib/services/notification.service";

// ─── Public tracking links ────────────────────────────────────────────────────
// Family members get a link, not an account. The token is an HMAC of the
// application id, so it needs no column and no lookup to verify.
// ponytail: not revocable — add a `trackingToken` column if a link ever needs killing.

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required for tracking links.");
  return s;
}

export function trackingToken(applicationId: string): string {
  return crypto.createHmac("sha256", secret()).update(`track:${applicationId}`).digest("base64url").slice(0, 32);
}

export function verifyTrackingToken(applicationId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = trackingToken(applicationId);
  return token.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function trackingUrl(applicationId: string): string {
  const base = (process.env.APP_URL ?? "https://visasetgo.com").replace(/\/$/, "");
  return `${base}/track/${applicationId}?t=${trackingToken(applicationId)}`;
}

// ─── Trips ────────────────────────────────────────────────────────────────────

/** Returns the application's trip, creating one around it if it has none. Owner-scoped. */
export async function ensureTrip(applicationId: string, customerId: string) {
  const app = await prisma.application.findFirst({
    where: { id: applicationId, customerId },
    include: { country: { select: { name: true } }, passport: { select: { fullName: true } }, trip: true },
  });
  if (!app) throw new Error("Application not found.");
  if (app.trip) return app.trip;

  const surname = app.passport.fullName.trim().split(/\s+/).pop() ?? "My";
  const trip = await prisma.trip.create({
    data: { customerId, name: `${surname} family — ${app.country.name}` },
  });
  await prisma.application.update({ where: { id: app.id }, data: { tripId: trip.id } });
  return trip;
}

/** Trip + all its applications, owner-scoped. */
export async function getTrip(tripId: string, customerId: string) {
  return prisma.trip.findFirst({
    where: { id: tripId, customerId },
    include: {
      applications: {
        orderBy: { createdAt: "asc" },
        include: {
          country: { select: { name: true, flagUrl: true, code: true } },
          passport: { select: { fullName: true } },
          checklistItems: { select: { isRequired: true, status: true } },
          paymentOrder: { select: { status: true } },
        },
      },
    },
  });
}

/** Emails a family member their tracking link. No-op if the traveller is the account holder. */
export async function notifyTravellerAdded(applicationId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      customer: { select: { fullName: true, email: true } },
      passport: { select: { fullName: true } },
      country: { select: { name: true } },
    },
  });
  if (!app?.travellerEmail) return;
  if (app.travellerEmail.toLowerCase() === app.customer.email.toLowerCase()) return;

  await enqueueNotification({
    eventType: "trip_traveller_added",
    applicationId: app.id,
    customerId: app.customerId,
    channel: "EMAIL",
    recipient: app.travellerEmail,
    templateVars: {
      travellerName: app.passport.fullName.split(" ")[0] || "there",
      appliedBy: app.customer.fullName,
      countryName: app.country.name,
      visaType: app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase(),
      trackingUrl: trackingUrl(app.id),
    },
  });
}
