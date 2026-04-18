import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z.string().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const passportCorrectionSchema = z.object({
  fullName: z.string().min(2),
  passportNumber: z
    .string()
    .min(6)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Passport number must be uppercase alphanumeric"),
  nationality: z.string().length(3, "Use ISO 3-letter country code"),
  dateOfBirth: z.string().datetime(),
  expiryDate: z.string().datetime(),
  issueDate: z.string().datetime().optional(),
  issuePlace: z.string().optional(),
  gender: z.enum(["M", "F", "X"]).optional(),
});

export const createApplicationSchema = z.object({
  countryId: z.string().cuid(),
  visaType: z.enum(["TOURIST", "BUSINESS"]),
  passportId: z.string().cuid(),
  travelDateFrom: z.string().datetime().optional(),
  travelDateTo: z.string().datetime().optional(),
  purposeNotes: z.string().max(500).optional(),
});

export const updateCaseStatusSchema = z.object({
  status: z.enum([
    "NEW_LEAD",
    "DOCS_PENDING",
    "DOCS_UNDER_REVIEW",
    "PAYMENT_PENDING",
    "PAYMENT_RECEIVED",
    "READY_TO_FILE",
    "FILED",
    "APPOINTMENT_PENDING",
    "BIOMETRICS_PENDING",
    "SUBMITTED",
    "ADDITIONAL_DOCS_REQUESTED",
    "APPROVED",
    "REJECTED",
    "CLOSED",
  ]),
  notes: z.string().max(1000).optional(),
});

export const policyEditorSchema = z.object({
  visaCategory: z.enum(["REQUIRED", "E_VISA", "ETA", "VISA_EXEMPT"]),
  eligibilityRules: z.array(z.unknown()),
  requiredDocuments: z.array(z.unknown()),
  optionalDocuments: z.array(z.unknown()),
  feeDetails: z.object({
    currency: z.string(),
    governmentFeeINR: z.number().min(0),
    serviceFeeINR: z.number().min(0),
    taxes: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
  processingTimeMin: z.number().int().min(1).optional(),
  processingTimeMax: z.number().int().min(1).optional(),
  processingNotes: z.string().optional(),
  appointmentNotes: z.string().optional(),
  biometricsNotes: z.string().optional(),
  embassyLinks: z.array(z.object({ label: z.string(), url: z.string().url() })),
  vacNotes: z.string().optional(),
  internalOpsNotes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PassportCorrectionInput = z.infer<typeof passportCorrectionSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
export type PolicyEditorInput = z.infer<typeof policyEditorSchema>;
