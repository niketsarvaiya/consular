import { cn } from "@/lib/utils/cn";
import type { ApplicationStatus, ChecklistItemStatus, PolicyStatus } from "@prisma/client";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info" | "muted";

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: BadgeVariant }> = {
  NEW_LEAD:                   { label: "New Lead",                  variant: "muted" },
  DOCS_PENDING:               { label: "Docs Pending",              variant: "warning" },
  DOCS_UNDER_REVIEW:          { label: "Under Review",              variant: "info" },
  PAYMENT_PENDING:            { label: "Payment Pending",           variant: "warning" },
  PAYMENT_RECEIVED:           { label: "Payment Received",          variant: "success" },
  READY_TO_FILE:              { label: "Ready to File",             variant: "info" },
  FILED:                      { label: "Filed",                     variant: "info" },
  APPOINTMENT_PENDING:        { label: "Appointment Pending",       variant: "warning" },
  BIOMETRICS_PENDING:         { label: "Biometrics Pending",        variant: "warning" },
  SUBMITTED:                  { label: "Submitted",                 variant: "info" },
  ADDITIONAL_DOCS_REQUESTED:  { label: "Additional Docs Requested", variant: "destructive" },
  APPROVED:                   { label: "Approved",                  variant: "success" },
  REJECTED:                   { label: "Rejected",                  variant: "destructive" },
  CLOSED:                     { label: "Closed",                    variant: "muted" },
};

const CHECKLIST_STATUS_CONFIG: Record<ChecklistItemStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:      { label: "Pending",      variant: "muted" },
  UPLOADED:     { label: "Uploaded",     variant: "info" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  APPROVED:     { label: "Approved",     variant: "success" },
  REJECTED:     { label: "Rejected",     variant: "destructive" },
};

const POLICY_STATUS_CONFIG: Record<PolicyStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE:       { label: "Active",       variant: "success" },
  DRAFT:        { label: "Draft",        variant: "muted" },
  NEEDS_REVIEW: { label: "Needs Review", variant: "warning" },
  ARCHIVED:     { label: "Archived",     variant: "muted" },
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:     "bg-slate-100 text-slate-700",
  success:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning:     "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  destructive: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info:        "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  muted:       "bg-slate-100 text-slate-500",
};

interface StatusBadgeProps {
  status: ApplicationStatus | ChecklistItemStatus | PolicyStatus;
  type: "application" | "checklist" | "policy";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let label = status.replace(/_/g, " ");
  let variant: BadgeVariant = "default";

  if (type === "application") {
    const config = APPLICATION_STATUS_CONFIG[status as ApplicationStatus];
    if (config) { label = config.label; variant = config.variant; }
  } else if (type === "checklist") {
    const config = CHECKLIST_STATUS_CONFIG[status as ChecklistItemStatus];
    if (config) { label = config.label; variant = config.variant; }
  } else if (type === "policy") {
    const config = POLICY_STATUS_CONFIG[status as PolicyStatus];
    if (config) { label = config.label; variant = config.variant; }
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", VARIANT_CLASSES[variant], className)}>
      {label}
    </span>
  );
}
