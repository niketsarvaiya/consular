import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { DashboardClient, type DashboardApp } from "@/components/customer/DashboardClient";
import type { PlannedTrip } from "@/components/customer/ProfileMap";
import { EXPLORE_COUNTRIES } from "@/lib/explore-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Travel Atlas" };

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ISO-2 → { isoNumeric, flag } lookup for placing planned-trip markers
const ISO2_LOOKUP: Record<string, { numeric: string; flag: string; name: string }> =
  Object.fromEntries(
    EXPLORE_COUNTRIES.map((c) => [c.iso2, { numeric: c.isoNumeric, flag: c.flag, name: c.name }])
  );

// Map application status → the next thing the traveller should do
function nextAction(status: string, id: string): { label: string; href: string } {
  switch (status) {
    case "DOCS_PENDING":
    case "ADDITIONAL_DOCS_REQUESTED":
      return { label: "Upload documents", href: `/dashboard/application/${id}/documents` };
    case "PAYMENT_PENDING":
      return { label: "Complete payment", href: `/dashboard/application/${id}/payment` };
    default:
      return { label: "View application", href: `/dashboard/application/${id}` };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const [customer, applications] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.user.id },
      select: { visitedCountries: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { customerId: session.user.id },
      include: {
        country: { select: { name: true, flagUrl: true, code: true } },
        checklistItems: { select: { isRequired: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const initials = (session.user.name ?? "T")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const visited = customer?.visitedCountries ?? [];

  // Planned trips → markers (dedupe by country)
  const seen = new Set<string>();
  const planned: PlannedTrip[] = [];
  for (const app of applications) {
    const lk = ISO2_LOOKUP[app.country.code];
    if (!lk || seen.has(lk.numeric)) continue;
    seen.add(lk.numeric);
    planned.push({ geoId: lk.numeric, name: app.country.name, flag: lk.flag, status: app.status });
  }

  // Serialise applications for the client
  const apps: DashboardApp[] = applications.map((app) => {
    const requiredItems = app.checklistItems.filter((i) => i.isRequired);
    const approved = requiredItems.filter((i) => i.status === "APPROVED").length;
    const required = requiredItems.length;
    const progressPct = required > 0 ? Math.round((approved / required) * 100) : 0;
    return {
      id: app.id,
      ref: app.id.slice(-8).toUpperCase(),
      countryName: app.country.name,
      flagUrl: app.country.flagUrl ?? null,
      visaLabel: app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase(),
      visaType: app.visaType,
      status: app.status,
      required,
      approved,
      progressPct,
      next: nextAction(app.status, app.id),
    };
  });

  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  return (
    <DashboardClient
      greeting={getGreeting()}
      firstName={firstName}
      fullName={session.user.name ?? firstName}
      initials={initials}
      memberSince={memberSince}
      initialVisited={visited}
      planned={planned}
      apps={apps}
    />
  );
}
