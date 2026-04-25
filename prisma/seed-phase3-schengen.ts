/**
 * seed-phase3-schengen.ts
 * Seeds 29 Schengen countries as individual destinations sharing one common rules engine.
 * Each country gets its own policy row with the shared ruleGroupId = "schengen_short_stay".
 *
 * DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-phase3-schengen.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VERIFIED_AT = new Date("2026-04-22");
const SCHENGEN_SHARED_RULES_URL =
  "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/applying-schengen-visa_en";
const SCHENGEN_RULE_GROUP_ID = "schengen_short_stay";
const SCHENGEN_APPLICATION_CHANNEL = "Consulate/VAC/official visa portal";

function computeFreshness(verifiedAt: Date): string {
  const daysSince = (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 14) return "fresh";
  if (daysSince <= 30) return "stale";
  return "needs_review";
}

// Shared Schengen rules applied to all 29 countries
const SCHENGEN_SHARED = {
  eligibilityRules: [
    { rule: "Valid passport with at least 3 months validity beyond intended stay" },
    { rule: "Purpose of stay: tourism/leisure/cultural/family" },
    { rule: "Adequate financial means for duration of stay" },
    { rule: "Confirmed travel medical insurance (min €30,000 coverage)" },
    { rule: "Intention to leave before Schengen stay expires (max 90 days in 180-day period)" },
  ],
  requiredDocuments: [
    { key: "passport", title: "Passport", description: "Valid for at least 3 months beyond return date, with blank pages" },
    { key: "visa_application_form", title: "Visa Application Form", description: "Completed and signed Schengen visa application form" },
    { key: "photo", title: "Passport Photo", description: "Recent biometric photo per ICAO standards" },
    { key: "travel_insurance", title: "Travel Medical Insurance", description: "Minimum €30,000 coverage, valid throughout Schengen area" },
    { key: "flight_itinerary", title: "Travel Itinerary", description: "Confirmed flight bookings showing entry and exit from Schengen area" },
    { key: "accommodation", title: "Accommodation Proof", description: "Hotel bookings or host invitation letter for full duration of stay" },
    { key: "proof_of_funds", title: "Proof of Funds", description: "Bank statements, traveller's cheques, or sponsor letter showing adequate finances" },
    { key: "return_intent", title: "Proof of Return Intent", description: "Evidence of ties to home country: employment letter, property documents, family ties" },
    { key: "biometrics", title: "Biometrics", description: "Fingerprints enrolled at consulate or VAC (required unless previously enrolled)" },
  ],
  optionalDocuments: [
    { key: "employment_letter", title: "Employment / Business Letter", description: "For employed applicants: letter confirming employment, leave approval" },
    { key: "income_tax_returns", title: "Income Tax Returns", description: "Last 3 years' ITR for self-employed or business owners" },
  ],
  feeDetails: {
    currency: "INR",
    governmentFeeINR: 8100,
    serviceFeeINR: 3500,
    taxes: 2088,
    notes: "Schengen visa fee EUR 90 for adults (12+), EUR 45 for children 6–12, free under 6. INR amount approximate at ~90 INR/EUR. Premium Consular advisory fee applies.",
  },
  processingTimeMin: 15,
  processingTimeMax: 45,
  processingNotes: "Standard processing: 15 calendar days. Complex cases or peak season may extend up to 45 days. Apply at least 15 business days before travel.",
  appointmentNotes: "Appointment required at consulate or Visa Application Centre (VAC). Apply no earlier than 6 months before intended travel date.",
  biometricsNotes: "Biometrics (10 fingerprints) mandatory unless previously enrolled within last 59 months. Enrolment at consulate or VAC during appointment.",
  coreCustomerInputs: [
    "Passport biodata page",
    "Travel dates and itinerary",
    "Accommodation details",
    "Financial documents (bank statements 3–6 months)",
    "Travel insurance with €30,000+ coverage",
    "Employment or business proof",
    "Return intent evidence",
  ],
  coreChecklist: [
    "Valid passport (3+ months beyond return)",
    "Completed visa application form",
    "Recent biometric photo",
    "Travel medical insurance",
    "Confirmed flight itinerary",
    "Confirmed accommodation",
    "Bank statements (last 3–6 months)",
    "Employment/business supporting documents",
    "Biometrics appointment attendance",
  ],
  opsRouting: "manual_ops_with_vac_partner",
  paymentModelHint: "Premium advisory fee — high-friction consular workflow",
  caseComplexity: "high",
  humanReviewRequired: true,
  sourceConfidence: "high",
  policyVersion: "2026-04-22-p3",
  reviewStatus: "officially_verified_shared_rules",
  phase: "phase_3",
};

// 29 Schengen countries: iso2, country name, official country URL
const SCHENGEN_COUNTRIES = [
  { iso2: "AT", name: "Austria",      sortOrder: 34, officialCountryUrl: "https://www.bmeia.gv.at/en/travel-stay/entry-and-residence-in-austria/schengen-visa" },
  { iso2: "BE", name: "Belgium",      sortOrder: 35, officialCountryUrl: "https://dofi.ibz.be/en/themes/ressortissants-dun-pays-tiers/short-stay/visa-short-stay" },
  { iso2: "BG", name: "Bulgaria",     sortOrder: 36, officialCountryUrl: "https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visas-bulgaria" },
  { iso2: "HR", name: "Croatia",      sortOrder: 37, officialCountryUrl: "https://mvep.gov.hr/services-for-citizens/consular-information-22802/visas-22807/22807" },
  { iso2: "CZ", name: "Czechia",      sortOrder: 38, officialCountryUrl: "https://mzv.gov.cz/jnp/en/information_for_aliens/short_stay_visa/index.html" },
  { iso2: "DK", name: "Denmark",      sortOrder: 39, officialCountryUrl: "https://nyidanmark.dk/en-GB/You-want-to-apply/Short-stay-visa" },
  { iso2: "EE", name: "Estonia",      sortOrder: 40, officialCountryUrl: "https://vm.ee/en/consular-visa-and-travel-information/visa-information/applying-visa" },
  { iso2: "FI", name: "Finland",      sortOrder: 41, officialCountryUrl: "https://um.fi/visa-to-visit-finland" },
  { iso2: "FR", name: "France",       sortOrder: 42, officialCountryUrl: "https://france-visas.gouv.fr/en/web/france-visas/tourism-or-private-stay" },
  { iso2: "DE", name: "Germany",      sortOrder: 43, officialCountryUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { iso2: "GR", name: "Greece",       sortOrder: 44, officialCountryUrl: "https://www.mfa.gr/india/en/visas.html" },
  { iso2: "HU", name: "Hungary",      sortOrder: 45, officialCountryUrl: "https://konzinfo.mfa.gov.hu/en/visa" },
  { iso2: "IS", name: "Iceland",      sortOrder: 46, officialCountryUrl: "https://www.government.is/topics/foreign-affairs/visa-to-iceland/" },
  { iso2: "IT", name: "Italy",        sortOrder: 47, officialCountryUrl: "https://vistoperitalia.esteri.it/home/en" },
  { iso2: "LV", name: "Latvia",       sortOrder: 48, officialCountryUrl: "https://www.mfa.gov.lv/en/india/consular-information/visas" },
  { iso2: "LI", name: "Liechtenstein",sortOrder: 49, officialCountryUrl: "https://www.llv.li/en/national-administration/ministry-for-home-affairs-economy-and-environment/office-of-foreign-affairs/passport-and-identity-card/visa-and-entry-to-liechtenstein" },
  { iso2: "LT", name: "Lithuania",    sortOrder: 50, officialCountryUrl: "https://www.migracija.lt/en/visas-for-short-term-stay" },
  { iso2: "LU", name: "Luxembourg",   sortOrder: 51, officialCountryUrl: "https://guichet.public.lu/en/citoyens/immigration/plus-3-mois/ressortissant-tiers/visa-court-sejour.html" },
  { iso2: "MT", name: "Malta",        sortOrder: 52, officialCountryUrl: "https://identita.gov.mt/expatriates-unit/visa-information/" },
  { iso2: "NL", name: "Netherlands",  sortOrder: 53, officialCountryUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa" },
  { iso2: "NO", name: "Norway",       sortOrder: 54, officialCountryUrl: "https://www.udi.no/en/want-to-apply/visit-and-holiday/" },
  { iso2: "PL", name: "Poland",       sortOrder: 55, officialCountryUrl: "https://www.gov.pl/web/india/visas---general-information" },
  { iso2: "PT", name: "Portugal",     sortOrder: 56, officialCountryUrl: "https://vistos.mne.gov.pt/en/short-stay-visas-schengen" },
  { iso2: "RO", name: "Romania",      sortOrder: 57, officialCountryUrl: "https://www.mae.ro/en/node/2040" },
  { iso2: "SK", name: "Slovakia",     sortOrder: 58, officialCountryUrl: "https://www.mzv.sk/en/web/en/consular_info/visa" },
  { iso2: "SI", name: "Slovenia",     sortOrder: 59, officialCountryUrl: "https://www.gov.si/en/topics/entry-and-residence/visas/" },
  { iso2: "ES", name: "Spain",        sortOrder: 60, officialCountryUrl: "https://www.exteriores.gob.es/Embajadas/nuevadelhi/en/ServiciosConsulares/Paginas/Consular/Visados-Schengen.aspx" },
  { iso2: "SE", name: "Sweden",       sortOrder: 61, officialCountryUrl: "https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/india/going-to-sweden/visiting-sweden/applying-for-a-visa/" },
  { iso2: "CH", name: "Switzerland",  sortOrder: 62, officialCountryUrl: "https://www.swiss-visa.ch/ivis2/#/i210-select-country" },
];

async function main() {
  console.log("🇪🇺 Applying Phase 3 Schengen dataset (29 countries)...\n");

  const freshness = computeFreshness(VERIFIED_AT);
  const nextDue = new Date(VERIFIED_AT);
  nextDue.setDate(nextDue.getDate() + 14); // biweekly refresh for Schengen

  for (const sc of SCHENGEN_COUNTRIES) {
    // Upsert country
    const country = await prisma.country.upsert({
      where: { code: sc.iso2 },
      create: {
        code: sc.iso2,
        name: sc.name,
        isActive: true,
        priorityRank: sc.sortOrder,
        launchBucket: "schengen_premium",
        refreshPriority: "medium",
        refreshCadence: "biweekly",
        sortOrder: sc.sortOrder,
      },
      update: {
        priorityRank: sc.sortOrder,
        launchBucket: "schengen_premium",
        refreshPriority: "medium",
        refreshCadence: "biweekly",
        sortOrder: sc.sortOrder,
        isActive: true,
      },
    });

    // Find or create TOURIST policy
    const existing = await prisma.visaPolicy.findFirst({
      where: { countryId: country.id, visaType: "TOURIST", nationality: "IND" },
    });

    const policyData = {
      visaCategory: "REQUIRED" as any,
      productLabel: "Schengen short-stay visa",
      officialSourceUrl: sc.officialCountryUrl,
      officialSourceSummary: `Schengen short-stay visa for ${sc.name}. Apply at the ${sc.name} consulate or Visa Application Centre. Standard Schengen rules apply: up to 90 days in any 180-day period.`,
      applyMode: "In-person at consulate or VAC. Biometrics and appointment mandatory.",
      stayValiditySummary: "Up to 90 days in any 180-day period across the entire Schengen area.",
      applicationChannel: SCHENGEN_APPLICATION_CHANNEL,
      coreCustomerInputs: SCHENGEN_SHARED.coreCustomerInputs,
      coreChecklist: SCHENGEN_SHARED.coreChecklist,
      opsRouting: SCHENGEN_SHARED.opsRouting,
      paymentModelHint: SCHENGEN_SHARED.paymentModelHint,
      caseComplexity: SCHENGEN_SHARED.caseComplexity,
      humanReviewRequired: SCHENGEN_SHARED.humanReviewRequired,
      sourceConfidence: SCHENGEN_SHARED.sourceConfidence,
      lastVerifiedAt: VERIFIED_AT,
      nextRefreshDueAt: nextDue,
      freshnessStatus: freshness,
      sharedRulesUrl: SCHENGEN_SHARED_RULES_URL,
      ruleGroupId: SCHENGEN_RULE_GROUP_ID,
      verifiedFrom: "European Commission Schengen visa policy + country-specific official portal",
      reviewStatus: SCHENGEN_SHARED.reviewStatus,
      policyVersion: SCHENGEN_SHARED.policyVersion,
      phase: SCHENGEN_SHARED.phase,
      internalOpsNotes: `Schengen short-stay visa — shared rules engine. Country-specific submission: ${sc.officialCountryUrl}`,
    };

    if (existing) {
      await prisma.visaPolicy.update({
        where: { id: existing.id },
        data: {
          ...policyData,
          eligibilityRules: SCHENGEN_SHARED.eligibilityRules,
          requiredDocuments: SCHENGEN_SHARED.requiredDocuments,
          optionalDocuments: SCHENGEN_SHARED.optionalDocuments,
          feeDetails: SCHENGEN_SHARED.feeDetails,
          processingTimeMin: SCHENGEN_SHARED.processingTimeMin,
          processingTimeMax: SCHENGEN_SHARED.processingTimeMax,
          processingNotes: SCHENGEN_SHARED.processingNotes,
          appointmentNotes: SCHENGEN_SHARED.appointmentNotes,
          biometricsNotes: SCHENGEN_SHARED.biometricsNotes,
          embassyLinks: [{ label: `${sc.name} Official Visa Page`, url: sc.officialCountryUrl }, { label: "EU Schengen Rules", url: SCHENGEN_SHARED_RULES_URL }],
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.visaPolicy.create({
        data: {
          countryId: country.id,
          visaType: "TOURIST",
          nationality: "IND",
          status: "ACTIVE",
          eligibilityRules: SCHENGEN_SHARED.eligibilityRules,
          requiredDocuments: SCHENGEN_SHARED.requiredDocuments,
          optionalDocuments: SCHENGEN_SHARED.optionalDocuments,
          feeDetails: SCHENGEN_SHARED.feeDetails,
          processingTimeMin: SCHENGEN_SHARED.processingTimeMin,
          processingTimeMax: SCHENGEN_SHARED.processingTimeMax,
          processingNotes: SCHENGEN_SHARED.processingNotes,
          appointmentNotes: SCHENGEN_SHARED.appointmentNotes,
          biometricsNotes: SCHENGEN_SHARED.biometricsNotes,
          embassyLinks: [{ label: `${sc.name} Official Visa Page`, url: sc.officialCountryUrl }, { label: "EU Schengen Rules", url: SCHENGEN_SHARED_RULES_URL }],
          ...policyData,
        },
      });
    }

    console.log(`  ✓ ${sc.iso2} (${sc.name}) — Schengen short-stay visa [freshness: ${freshness}]`);
  }

  console.log("\n✅ Phase 3 Schengen dataset applied (29 countries).");
  console.log(`   All linked to ruleGroupId: "${SCHENGEN_RULE_GROUP_ID}"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
