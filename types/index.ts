import type {
  VisaType,
  VisaCategory,
  PolicyStatus,
  ApplicationStatus,
  ChecklistItemStatus,
  PaymentStatus,
  OpsRole,
  NotificationChannel,
} from "@prisma/client";

// Re-export prisma enums for convenience
export type {
  VisaType,
  VisaCategory,
  PolicyStatus,
  ApplicationStatus,
  ChecklistItemStatus,
  PaymentStatus,
  OpsRole,
  NotificationChannel,
};

// ─── Policy Types ─────────────────────────────────────────────────────────────

export interface DocumentTemplate {
  key: string;        // e.g. "passport_front"
  title: string;
  description?: string;
  acceptedFormats: string[];
  maxFileSizeMb: number;
  isRequired: boolean;
}

export interface FeeDetails {
  currency: string;       // "INR"
  governmentFeeINR: number;
  serviceFeeINR: number;
  taxes?: number;
  notes?: string;
}

export interface EmbassyLink {
  label: string;
  url: string;
}

export interface EligibilityRule {
  type: "passport_validity" | "financial" | "travel_history" | "age" | "custom";
  description: string;
  minPassportValidityDays?: number;
  customRule?: string;
}

export interface PolicyDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "fees" | "timeline" | "requirements" | "eligibility" | "appointment" | "other";
}

// ─── Application Types ────────────────────────────────────────────────────────

export interface PassportOCRResult {
  fullName?: string;
  passportNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  issueDate?: string;
  issuePlace?: string;
  gender?: string;
  mrz?: string;
  confidence: Record<string, number>; // field -> confidence score 0-1
  rawResponse?: unknown;
}

export interface ChecklistProgress {
  total: number;
  uploaded: number;
  approved: number;
  rejected: number;
  pending: number;
  requiredTotal: number;
  requiredApproved: number;
  isMinimumMet: boolean; // all required docs approved
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Session Types ─────────────────────────────────────────────────────────────

export interface CustomerSession {
  id: string;
  email: string;
  fullName: string;
  type: "customer";
}

export interface OpsSession {
  id: string;
  email: string;
  fullName: string;
  role: OpsRole;
  type: "ops";
}

export type SessionUser = CustomerSession | OpsSession;

// ─── Notification Event Types ──────────────────────────────────────────────────

export type NotificationEventType =
  | "welcome"
  | "application_created"
  | "docs_pending"
  | "doc_rejected"
  | "docs_complete"
  | "payment_received"
  | "case_update"
  | "additional_docs_requested"
  | "visa_outcome"
  | "policy_refresh_alert";

export interface NotificationPayload {
  eventType: NotificationEventType;
  customerId?: string;
  applicationId?: string;
  opsUserId?: string;
  channel: NotificationChannel;
  templateVars: Record<string, string | number>;
}

// ─── Admin Dashboard Types ────────────────────────────────────────────────────

export interface CaseFilters {
  status?: ApplicationStatus;
  countryId?: string;
  visaType?: VisaType;
  assignedToId?: string;
  paymentStatus?: PaymentStatus;
  search?: string; // customer name / ref ID
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface DashboardMetrics {
  totalCases: number;
  newToday: number;
  pendingDocReview: number;
  pendingPayment: number;
  activeCases: number;
  approvedThisMonth: number;
  revenueThisMonth: number; // INR
  avgProcessingDays: number;
  policiesNeedingReview: number;
}
