/**
 * seed-verified-launch.ts
 * Applies official-source-backed verified launch data to existing Country + VisaPolicy records.
 * Run: export $(cat .env.local | grep -v '^#' | xargs) && npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-verified-launch.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Freshness helper — "fresh" if verified within 14 days
function computeFreshness(verifiedAt: Date): string {
  const daysSince = (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 14) return "fresh";
  if (daysSince <= 30) return "stale";
  return "needs_review";
}

function nextRefresh(cadence: string, from: Date): Date {
  const d = new Date(from);
  if (cadence === "weekly") d.setDate(d.getDate() + 7);
  else if (cadence === "biweekly") d.setDate(d.getDate() + 14);
  else d.setDate(d.getDate() + 30);
  return d;
}

const VERIFIED_AT = new Date("2026-04-22");

const LAUNCH_DATA = [
  {
    iso2: "TH",
    priorityRank: 1,
    launchBucket: "low_friction_volume",
    refreshPriority: "high",
    refreshCadence: "weekly",
    policy: {
      productLabel: "60-day visa exemption",
      officialSourceUrl: "https://newdelhi.thaiembassy.org/en/page/visa",
      officialSourceSummary: "60-day visa exemption for Indian ordinary passport holders for tourism and short-term business engagements remains effective until further announcement.",
      applyMode: "No prior visa application for eligible short visits; traveller must satisfy entry conditions.",
      stayValiditySummary: "Up to 60 days under current exemption notice.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Flight details", "Accommodation details"],
      coreChecklist: ["Valid passport", "Onward/return travel evidence", "Accommodation details", "Sufficient funds evidence if requested at entry"],
      opsRouting: "info_only_or_light_support",
      paymentModelHint: "Low-ticket assistance or upsell travel support",
      caseComplexity: "low",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Do not label as VOA. Keep a freshness banner because Thailand has changed rules multiple times.",
  },
  {
    iso2: "AE",
    priorityRank: 2,
    launchBucket: "high_volume_agent_assisted",
    refreshPriority: "high",
    refreshCadence: "weekly",
    policy: {
      productLabel: "Tourist visa via sponsor/hotel/airline/agent",
      officialSourceUrl: "https://www.mofa.gov.ae/en/missions/new-delhi/services/visas",
      officialSourceSummary: "The UAE Consulate does not issue visit/tourist visas on ordinary passports. Tourist visas for Indian nationals holding ordinary passports are arranged by a sponsor in UAE, hotel, airline office, or travel agent in India.",
      applyMode: "Agent/sponsor-assisted route; special 14-day VOA may apply only for certain Indians holding valid visas or residence permits from specified countries.",
      stayValiditySummary: "Depends on visa product; ordinary tourist flow is sponsor/agent arranged.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Purpose of visit", "Confirmed sponsor/hotel/airline/agent path", "Prior visas/residence permits for VOA eligibility check if applicable"],
      coreChecklist: ["Passport copy", "Photograph", "Travel itinerary", "Accommodation/sponsor details", "Any extra documents required by sponsor/issuing channel"],
      opsRouting: "manual_ops_with_partner_or_agent",
      paymentModelHint: "Service fee plus visa/channel fee",
      caseComplexity: "medium",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: [
      {
        id: "standard_tourist",
        label: "Standard Tourist Visa",
        description: "Arranged through sponsor, hotel, airline or travel agent in India. Most common route.",
        conditions: [],
        checklist: ["Passport copy", "Photograph", "Travel itinerary", "Accommodation/sponsor details"],
      },
      {
        id: "voa_eligible",
        label: "14-Day Visa on Arrival",
        description: "Only available to Indians holding a valid US/UK/Schengen visa or residence permit from select countries.",
        conditions: ["Must hold valid US, UK, or Schengen visa/residency permit"],
        checklist: ["Passport copy", "Valid US/UK/Schengen visa copy", "Return ticket", "Hotel booking"],
      },
    ],
    notes: "Branch flow: ordinary tourist visa vs 14-day VOA eligibility route. Do not flatten into a simple e-visa tag.",
  },
  {
    iso2: "SG",
    priorityRank: 3,
    launchBucket: "high_volume_authorised_channel",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Singapore entry visa via authorised agent",
      officialSourceUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements/visa-detail-page/india",
      officialSourceSummary: "Indian ordinary passport holders require a Singapore entry visa. Applicants submit Form 14A, photograph, passport biodata page, onward/return ticket, and can be asked for additional supporting documents.",
      applyMode: "Apply through authorised visa agent / e-visa submission channel depending local process.",
      stayValiditySummary: "Entry visa is pre-entry permission; duration of stay is determined at entry.",
      coreCustomerInputs: ["Passport biodata page", "Photograph", "Travel dates", "Onward/return ticket", "Accommodation details", "Financial/supporting docs if requested"],
      coreChecklist: ["Signed Form 14A", "Recent passport photo", "Passport biodata page copy valid 6+ months", "Confirmed onward/return ticket", "Entry card/details as applicable", "Additional docs on request"],
      opsRouting: "standard_document_case",
      paymentModelHint: "Standard service fee",
      caseComplexity: "medium",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Label as entry visa, not generic e-visa. Use authorised-agent workflow in ops.",
  },
  {
    iso2: "VN",
    priorityRank: 4,
    launchBucket: "self_serve_digital",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Vietnam e-visa",
      officialSourceUrl: "https://evisa.gov.vn/",
      officialSourceSummary: "Vietnam's national e-visa system: USD 25 single entry, USD 50 multiple entry; travellers use approved ports and receive approval electronically.",
      applyMode: "Online e-visa application through national portal.",
      stayValiditySummary: "Single-entry and multiple-entry options; validity up to 90 days.",
      coreCustomerInputs: ["Passport biodata page", "Portrait photo", "Travel dates", "Port of entry", "Accommodation details"],
      coreChecklist: ["Passport valid per official requirements", "Portrait photo", "Passport biodata image", "Trip details and intended port", "Payment card for fee"],
      opsRouting: "digital_processing_case",
      paymentModelHint: "Low to medium service fee",
      caseComplexity: "low",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Add optional flag for Ho Chi Minh City digital arrival declaration as a supplemental travel advisory.",
  },
  {
    iso2: "NZ",
    priorityRank: 5,
    launchBucket: "premium_online",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Visitor Visa",
      officialSourceUrl: "https://www.immigration.govt.nz/visas/visitor-visa/",
      officialSourceSummary: "Travellers on some passports must apply for a Visitor Visa. Stay up to 6 or 9 months, cost from NZD 441, 80% processed within 2 weeks.",
      applyMode: "Online application; VFS supports submission logistics in India.",
      stayValiditySummary: "Up to 6 or 9 months depending grant conditions.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Travel purpose", "Financial evidence", "Itinerary", "Employment/business details if relevant"],
      coreChecklist: ["Passport", "Photo", "Travel plans", "Proof of funds or sponsorship", "Evidence of bona fide visit and return intentions", "Other docs per profile"],
      opsRouting: "document_heavy_online_case",
      paymentModelHint: "Premium advisory fee",
      caseComplexity: "medium",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Useful candidate for guided checklist and refusal-risk coaching.",
  },
  {
    iso2: "AU",
    priorityRank: 6,
    launchBucket: "premium_online",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Visitor visa (subclass 600)",
      officialSourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
      officialSourceSummary: "Australia's Visitor visa (subclass 600) includes tourist and business visitor streams and is the standard visitor route for Indian travellers.",
      applyMode: "Online via ImmiAccount.",
      stayValiditySummary: "Varies by stream and grant conditions.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Travel purpose", "Financial evidence", "Employment/business details", "Travel history"],
      coreChecklist: ["Passport", "Photograph if requested", "Travel itinerary", "Funds evidence", "Employment/business proof", "Ties-to-home-country evidence", "Additional profile documents"],
      opsRouting: "document_heavy_online_case",
      paymentModelHint: "Premium advisory fee",
      caseComplexity: "medium_high",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Use exact subclass naming in UI and backend.",
  },
  {
    iso2: "GB",
    priorityRank: 7,
    launchBucket: "premium_vac",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Standard Visitor visa",
      officialSourceUrl: "https://www.gov.uk/standard-visitor",
      officialSourceSummary: "Standard Visitor visa costs £135 for up to 6 months; applications can be submitted up to 3 months before travel.",
      applyMode: "Online application followed by visa application centre appointment.",
      stayValiditySummary: "Usually up to 6 months for the standard short-term route; longer-term variants exist.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Purpose of visit", "Financial evidence", "Travel history", "Employment/business details"],
      coreChecklist: ["Passport", "Application form details", "Proof of funds", "Travel/accommodation plan", "Purpose-specific supporting docs", "Biometrics appointment attendance"],
      opsRouting: "document_heavy_vac_case",
      paymentModelHint: "Premium advisory fee",
      caseComplexity: "high",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Store fee and application window separately because they are user-visible decision drivers.",
  },
  {
    iso2: "JP",
    priorityRank: 9,
    launchBucket: "premium_vac",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Temporary Visitor visa (via VFS)",
      officialSourceUrl: "https://www.in.emb-japan.go.jp/itpr_en/visa.html",
      officialSourceSummary: "In India, applicants submit Japan visa applications through VFS; applications can be accepted from 3 months prior to travel.",
      applyMode: "VFS-facilitated submission in India.",
      stayValiditySummary: "Temporary visitor route supports sightseeing/family/friends trips, typically short stay.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Purpose of visit", "Itinerary", "Financial evidence", "Employment/business details"],
      coreChecklist: ["Passport", "Visa application form", "Photo", "Schedule of stay/itinerary", "Financial evidence", "Supporting purpose documents", "VFS submission details"],
      opsRouting: "document_heavy_vfs_case",
      paymentModelHint: "Premium advisory fee",
      caseComplexity: "medium_high",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Operational change in India has moved ordinary submissions to VFS. Keep city-level appointment logic configurable.",
  },
  {
    iso2: "CA",
    priorityRank: 10,
    launchBucket: "premium_vac",
    refreshPriority: "high",
    refreshCadence: "biweekly",
    policy: {
      productLabel: "Visitor visa (Temporary Resident Visa)",
      officialSourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/visitor-visa.html",
      officialSourceSummary: "Canada's visitor visa page covers eligibility, application steps, fees from CAD 100, biometrics, processing, and arrival preparation.",
      applyMode: "Apply online or on paper; biometrics and VAC support may apply.",
      stayValiditySummary: "Visitor visa validity varies by issuance; admission period decided by border officer.",
      coreCustomerInputs: ["Passport biodata page", "Travel dates", "Travel purpose", "Funds evidence", "Travel history", "Employment/business details", "Host details if any"],
      coreChecklist: ["Passport", "Application forms/details", "Proof of funds", "Travel purpose evidence", "Travel history evidence", "Biometrics when instructed", "Additional docs per profile"],
      opsRouting: "document_heavy_ircc_case",
      paymentModelHint: "Premium advisory fee",
      caseComplexity: "high",
      humanReviewRequired: true,
      sourceConfidence: "high",
    },
    flowBranches: null,
    notes: "Separate visa requirement from eTA logic because Indian ordinary passport cases are typically TRV cases.",
  },
];

async function main() {
  console.log("🌍 Applying verified launch dataset...\n");

  for (const entry of LAUNCH_DATA) {
    const country = await prisma.country.findFirst({ where: { code: entry.iso2 } });
    if (!country) {
      console.log(`  ✗ ${entry.iso2} — country not found, skipping`);
      continue;
    }

    // Update country-level fields
    await prisma.country.update({
      where: { id: country.id },
      data: {
        priorityRank: entry.priorityRank,
        launchBucket: entry.launchBucket,
        refreshPriority: entry.refreshPriority,
        refreshCadence: entry.refreshCadence,
        sortOrder: entry.priorityRank,
      },
    });

    // Find existing TOURIST policy
    const policy = await prisma.visaPolicy.findFirst({
      where: { countryId: country.id, visaType: "TOURIST", nationality: "IND" },
    });

    if (!policy) {
      console.log(`  ✗ ${entry.iso2} — no TOURIST policy found, skipping policy update`);
      continue;
    }

    const verifiedAt = VERIFIED_AT;
    const nextDue = nextRefresh(entry.refreshCadence, verifiedAt);

    await prisma.visaPolicy.update({
      where: { id: policy.id },
      data: {
        productLabel: entry.policy.productLabel,
        officialSourceUrl: entry.policy.officialSourceUrl,
        officialSourceSummary: entry.policy.officialSourceSummary,
        applyMode: entry.policy.applyMode,
        stayValiditySummary: entry.policy.stayValiditySummary,
        coreCustomerInputs: entry.policy.coreCustomerInputs,
        coreChecklist: entry.policy.coreChecklist,
        opsRouting: entry.policy.opsRouting,
        paymentModelHint: entry.policy.paymentModelHint,
        caseComplexity: entry.policy.caseComplexity,
        humanReviewRequired: entry.policy.humanReviewRequired,
        sourceConfidence: entry.policy.sourceConfidence,
        lastVerifiedAt: verifiedAt,
        nextRefreshDueAt: nextDue,
        freshnessStatus: computeFreshness(verifiedAt),
        flowBranches: entry.flowBranches ?? undefined,
        internalOpsNotes: entry.notes,
      },
    });

    console.log(`  ✓ ${entry.iso2} (${country.name}) — verified, freshness: ${computeFreshness(verifiedAt)}`);
  }

  console.log("\n✅ Verified launch dataset applied.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
