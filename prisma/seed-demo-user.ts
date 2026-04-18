import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo customer...");

  // ─── Customer ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const customer = await prisma.customer.upsert({
    where: { email: "arjun.mehta@gmail.com" },
    update: {},
    create: {
      email: "arjun.mehta@gmail.com",
      passwordHash,
      fullName: "Arjun Mehta",
      phone: "+91 98765 43210",
      isVerified: true,
      consentGivenAt: new Date("2024-07-01"),
    },
  });

  // ─── Passport ────────────────────────────────────────────────────────────────
  const existingPassport = await prisma.passport.findFirst({ where: { customerId: customer.id } });
  const passport = existingPassport ?? await prisma.passport.create({
    data: {
      customerId: customer.id,
      passportNumber: "DEMO_ENC_P1234567",  // would be AES-256 encrypted in real flow
      fullName: "MEHTA ARJUN KUMAR",
      nationality: "IND",
      dateOfBirth: new Date("1992-08-14"),
      gender: "M",
      issueDate: new Date("2020-03-10"),
      issuePlace: "Mumbai RPO",
      expiryDate: new Date("2030-03-09"),
      manuallyVerified: true,
    },
  });

  // ─── Policies ────────────────────────────────────────────────────────────────
  const uae = await prisma.country.findUniqueOrThrow({ where: { code: "AE" } });
  const th  = await prisma.country.findUniqueOrThrow({ where: { code: "TH" } });
  const sg  = await prisma.country.findUniqueOrThrow({ where: { code: "SG" } });

  const uaePolicy = await prisma.visaPolicy.findFirstOrThrow({ where: { countryId: uae.id, visaType: "TOURIST", nationality: "IND" } });
  const thPolicy  = await prisma.visaPolicy.findFirstOrThrow({ where: { countryId: th.id,  visaType: "TOURIST", nationality: "IND" } });
  const sgPolicy  = await prisma.visaPolicy.findFirstOrThrow({ where: { countryId: sg.id,  visaType: "TOURIST", nationality: "IND" } });

  const ops = await prisma.opsUser.findUniqueOrThrow({ where: { email: "ops@consular.in" } });

  // ─── Application 1: UAE — APPROVED (completed journey) ───────────────────────
  const app1 = await prisma.application.create({
    data: {
      customerId: customer.id,
      passportId: passport.id,
      countryId: uae.id,
      visaType: "TOURIST",
      policyId: uaePolicy.id,
      policyVersionNumber: uaePolicy.versionNumber,
      status: "APPROVED",
      travelDateFrom: new Date("2024-12-20"),
      travelDateTo: new Date("2025-01-03"),
      purposeNotes: "Family vacation to Dubai and Abu Dhabi",
      assignedToId: ops.id,
      createdAt: new Date("2024-11-28"),
    },
  });

  await prisma.caseStatusHistory.createMany({
    data: [
      { applicationId: app1.id, fromStatus: null,              toStatus: "NEW_LEAD",          changedById: null,   notes: "Application created", changedAt: new Date("2024-11-28T10:00:00Z") },
      { applicationId: app1.id, fromStatus: "NEW_LEAD",        toStatus: "DOCS_PENDING",      changedById: null,   notes: "Checklist generated", changedAt: new Date("2024-11-28T10:01:00Z") },
      { applicationId: app1.id, fromStatus: "DOCS_PENDING",    toStatus: "DOCS_UNDER_REVIEW", changedById: ops.id, notes: "All documents received", changedAt: new Date("2024-11-30T09:15:00Z") },
      { applicationId: app1.id, fromStatus: "DOCS_UNDER_REVIEW", toStatus: "PAYMENT_PENDING", changedById: ops.id, notes: "Documents approved", changedAt: new Date("2024-12-02T11:30:00Z") },
      { applicationId: app1.id, fromStatus: "PAYMENT_PENDING", toStatus: "PAYMENT_RECEIVED",  changedById: null,   notes: "Payment verified via Razorpay", changedAt: new Date("2024-12-02T14:22:00Z") },
      { applicationId: app1.id, fromStatus: "PAYMENT_RECEIVED", toStatus: "SUBMITTED", changedById: ops.id, notes: "Application submitted to UAE ICA portal", changedAt: new Date("2024-12-03T10:00:00Z") },
      { applicationId: app1.id, fromStatus: "SUBMITTED", toStatus: "APPROVED",      changedById: ops.id, notes: "Visa approved by UAE ICA. Visa No: UAE-2024-8821943", changedAt: new Date("2024-12-05T16:45:00Z") },
    ],
  });

  await prisma.checklistItem.createMany({
    data: [
      { applicationId: app1.id, itemKey: "passport_front",   title: "Passport Front Page",       description: "Clear color scan", isRequired: true,  acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 0, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:00:00Z") },
      { applicationId: app1.id, itemKey: "passport_back",    title: "Passport Back Page",         description: "Clear color scan", isRequired: true,  acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 1, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:00:00Z") },
      { applicationId: app1.id, itemKey: "photo",            title: "Passport Size Photo",        description: "White background", isRequired: true,  acceptedFormats: ["JPEG","PNG"],       maxFileSizeMb: 2,  status: "APPROVED", sortOrder: 2, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:05:00Z") },
      { applicationId: app1.id, itemKey: "bank_statement",   title: "Bank Statement",             description: "Last 3 months",    isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 10, status: "APPROVED", sortOrder: 3, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:10:00Z") },
      { applicationId: app1.id, itemKey: "travel_itinerary", title: "Travel Itinerary",           description: "Return tickets",   isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 4, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:15:00Z") },
      { applicationId: app1.id, itemKey: "hotel_booking",    title: "Hotel Booking Confirmation", description: "Full stay proof",  isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 5, reviewedById: ops.id, reviewedAt: new Date("2024-12-02T11:20:00Z") },
      { applicationId: app1.id, itemKey: "salary_slip",      title: "Salary Slips",               description: "Optional",         isRequired: false, acceptedFormats: ["PDF"],              maxFileSizeMb: 10, status: "UPLOADED", sortOrder: 6 },
    ],
  });

  await prisma.paymentOrder.create({
    data: {
      applicationId: app1.id,
      razorpayOrderId: "order_DEMO_UAE001",
      razorpayPaymentId: "pay_DEMO_UAE001",
      razorpaySignature: "demo_sig_uae001",
      amount: 888600, // ₹8,886 in paise
      currency: "INR",
      status: "PAID",
      paidAt: new Date("2024-12-02T14:22:00Z"),
      breakdown: { govFee: 550000, serviceFee: 150000, taxes: 54000, total: 888600 },
    },
  });

  await prisma.caseNote.createMany({
    data: [
      { applicationId: app1.id, content: "Customer submitted all documents promptly. Bank statement shows healthy balance. Approved without any issues.", noteType: "internal", authorId: ops.id, createdAt: new Date("2024-12-02T11:30:00Z") },
      { applicationId: app1.id, content: "Visa No: UAE-2024-8821943. Validity: 20 Dec 2024 – 19 Jan 2025 (30 days single entry). Emailed to customer.", noteType: "customer_visible", authorId: ops.id, createdAt: new Date("2024-12-05T16:50:00Z") },
    ],
  });

  // ─── Application 2: Thailand — DOCS_PENDING (in progress) ────────────────────
  const app2 = await prisma.application.create({
    data: {
      customerId: customer.id,
      passportId: passport.id,
      countryId: th.id,
      visaType: "TOURIST",
      policyId: thPolicy.id,
      policyVersionNumber: thPolicy.versionNumber,
      status: "DOCS_PENDING",
      travelDateFrom: new Date("2025-04-12"),
      travelDateTo: new Date("2025-04-22"),
      purposeNotes: "Short trip to Bangkok and Phuket with college friends",
      createdAt: new Date("2025-03-25"),
    },
  });

  await prisma.caseStatusHistory.createMany({
    data: [
      { applicationId: app2.id, fromStatus: null,           toStatus: "NEW_LEAD",     changedById: null, notes: "Application created", changedAt: new Date("2025-03-25T08:30:00Z") },
      { applicationId: app2.id, fromStatus: "NEW_LEAD",     toStatus: "DOCS_PENDING", changedById: null, notes: "Checklist generated", changedAt: new Date("2025-03-25T08:31:00Z") },
    ],
  });

  await prisma.checklistItem.createMany({
    data: [
      { applicationId: app2.id, itemKey: "passport_front",   title: "Passport Front Page",  description: "Valid 6+ months", isRequired: true, acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5, status: "APPROVED", sortOrder: 0, reviewedById: ops.id, reviewedAt: new Date("2025-03-26T10:00:00Z") },
      { applicationId: app2.id, itemKey: "travel_itinerary", title: "Return Flight Ticket",  description: "Confirmed return", isRequired: true, acceptedFormats: ["PDF"],              maxFileSizeMb: 5, status: "UPLOADED", sortOrder: 1 },
      { applicationId: app2.id, itemKey: "hotel_booking",    title: "Accommodation Proof",   description: "Hotel booking",   isRequired: true, acceptedFormats: ["PDF"],              maxFileSizeMb: 5, status: "PENDING",  sortOrder: 2 },
    ],
  });

  // ─── Application 3: Singapore — REJECTED (past failed attempt) ───────────────
  const app3 = await prisma.application.create({
    data: {
      customerId: customer.id,
      passportId: passport.id,
      countryId: sg.id,
      visaType: "TOURIST",
      policyId: sgPolicy.id,
      policyVersionNumber: sgPolicy.versionNumber,
      status: "REJECTED",
      travelDateFrom: new Date("2024-08-10"),
      travelDateTo: new Date("2024-08-17"),
      purposeNotes: "Business meeting in Singapore",
      assignedToId: ops.id,
      createdAt: new Date("2024-07-05"),
    },
  });

  await prisma.caseStatusHistory.createMany({
    data: [
      { applicationId: app3.id, fromStatus: null,              toStatus: "NEW_LEAD",              changedById: null,   notes: "Application created",          changedAt: new Date("2024-07-05T09:00:00Z") },
      { applicationId: app3.id, fromStatus: "NEW_LEAD",        toStatus: "DOCS_PENDING",          changedById: null,   notes: "Checklist generated",          changedAt: new Date("2024-07-05T09:01:00Z") },
      { applicationId: app3.id, fromStatus: "DOCS_PENDING",    toStatus: "DOCS_UNDER_REVIEW",     changedById: ops.id, notes: "Documents submitted",          changedAt: new Date("2024-07-08T10:00:00Z") },
      { applicationId: app3.id, fromStatus: "DOCS_UNDER_REVIEW", toStatus: "PAYMENT_PENDING",     changedById: ops.id, notes: "Docs approved",                changedAt: new Date("2024-07-09T14:00:00Z") },
      { applicationId: app3.id, fromStatus: "PAYMENT_PENDING", toStatus: "PAYMENT_RECEIVED",      changedById: null,   notes: "Payment received",             changedAt: new Date("2024-07-09T16:30:00Z") },
      { applicationId: app3.id, fromStatus: "PAYMENT_RECEIVED", toStatus: "SUBMITTED", changedById: ops.id, notes: "Submitted to ICA Singapore",   changedAt: new Date("2024-07-10T09:00:00Z") },
      { applicationId: app3.id, fromStatus: "SUBMITTED", toStatus: "REJECTED",         changedById: ops.id, notes: "Visa rejected by ICA Singapore. Reason: Insufficient financial proof and incomplete travel history.", changedAt: new Date("2024-07-18T11:00:00Z") },
    ],
  });

  await prisma.checklistItem.createMany({
    data: [
      { applicationId: app3.id, itemKey: "passport_front",   title: "Passport Front Page",       isRequired: true,  acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 0, reviewedById: ops.id, reviewedAt: new Date("2024-07-09T13:00:00Z") },
      { applicationId: app3.id, itemKey: "photo",            title: "Recent Photograph",          isRequired: true,  acceptedFormats: ["JPEG","PNG"],       maxFileSizeMb: 2,  status: "APPROVED", sortOrder: 1, reviewedById: ops.id, reviewedAt: new Date("2024-07-09T13:05:00Z") },
      { applicationId: app3.id, itemKey: "bank_statement",   title: "Bank Statement",             isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 10, status: "APPROVED", sortOrder: 2, reviewedById: ops.id, reviewedAt: new Date("2024-07-09T13:10:00Z"), internalNote: "Balance low (~INR 45k) — flagged but approved to proceed" },
      { applicationId: app3.id, itemKey: "travel_itinerary", title: "Flight Bookings",            isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 3, reviewedById: ops.id, reviewedAt: new Date("2024-07-09T13:15:00Z") },
      { applicationId: app3.id, itemKey: "hotel_booking",    title: "Hotel Booking",              isRequired: true,  acceptedFormats: ["PDF"],              maxFileSizeMb: 5,  status: "APPROVED", sortOrder: 4, reviewedById: ops.id, reviewedAt: new Date("2024-07-09T13:20:00Z") },
      { applicationId: app3.id, itemKey: "employment_letter", title: "Employment / Business Letter", isRequired: false, acceptedFormats: ["PDF"],             maxFileSizeMb: 5,  status: "PENDING",  sortOrder: 5 },
    ],
  });

  await prisma.paymentOrder.create({
    data: {
      applicationId: app3.id,
      razorpayOrderId: "order_DEMO_SG001",
      razorpayPaymentId: "pay_DEMO_SG001",
      razorpaySignature: "demo_sig_sg001",
      amount: 697800, // ₹6,978 in paise
      currency: "INR",
      status: "PAID",
      paidAt: new Date("2024-07-09T16:30:00Z"),
      breakdown: { govFee: 450000, serviceFee: 120000, taxes: 104400, total: 697800 },
    },
  });

  await prisma.caseNote.createMany({
    data: [
      { applicationId: app3.id, content: "Bank balance was on the lower end. Advised customer to provide employment letter but they declined. Proceeded as is.", noteType: "internal", authorId: ops.id, createdAt: new Date("2024-07-09T14:00:00Z") },
      { applicationId: app3.id, content: "We're sorry to inform you that your Singapore tourist visa application has been rejected by ICA. The rejection reason cited was insufficient financial proof. We recommend applying again with a stronger bank statement (min. INR 1 lakh average balance) and an employment letter. Our service fee will be waived on your next Singapore application.", noteType: "customer_visible", authorId: ops.id, createdAt: new Date("2024-07-18T11:30:00Z") },
    ],
  });

  console.log("\n✅ Demo user created:");
  console.log("   Email:    arjun.mehta@gmail.com");
  console.log("   Password: Demo@1234");
  console.log("\n   Applications:");
  console.log(`   → UAE Tourist Visa   [APPROVED]         ID: ${app1.id}`);
  console.log(`   → Thailand Tourist   [DOCS_PENDING]     ID: ${app2.id}`);
  console.log(`   → Singapore Tourist  [REJECTED]         ID: ${app3.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
