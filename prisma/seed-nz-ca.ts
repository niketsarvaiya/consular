import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const policies = [
    {
      code: "NZ",
      visaType: "TOURIST" as const,
      visaCategory: "REQUIRED" as const,
      processingTimeMin: 10,
      processingTimeMax: 14,
      governmentFeeINR: 22050,
      serviceFeeINR: 2500,
      requiredDocuments: [
        { key: "passport_front", title: "Passport (front & back pages)", notes: "Valid for at least 3 months beyond departure date", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photograph", notes: "Two recent photos, white background, 45×35mm", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statements (last 6 months)", notes: "Must show consistent balance — min NZD 1,000/month of stay. Stamped by bank.", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "employment_letter", title: "Employment Letter", notes: "On company letterhead — designation, salary, approved leave dates, confirmation of return to job", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "return_ticket", title: "Return / Onward Flight Ticket", notes: "Confirmed booking or travel itinerary", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "hotel_booking", title: "Hotel / Accommodation Bookings", notes: "Day-by-day itinerary strongly recommended", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "cover_letter", title: "Cover Letter", notes: "Explain purpose of visit, places you'll visit, and your intent to return to India", acceptedFormats: ["PDF"], maxFileSizeMb: 2 },
        { key: "property_docs", title: "Proof of Ties to India", notes: "Property ownership, family dependents, business ownership — demonstrates intent to return", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 10 },
        { key: "itr", title: "Income Tax Returns (last 2 years)", notes: "ITR-V or Form 16 accepted", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "travel_insurance", title: "Travel Insurance", notes: "Recommended — New Zealand does not provide public healthcare to visitors", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Indian passport holders are NOT eligible for the NZeTA — a full Visitor Visa is mandatory. India is classified as a TB-risk country; a chest X-ray may be required for stays over 6 months. Apply at least 4–6 weeks before travel.",
    },
    {
      code: "CA",
      visaType: "TOURIST" as const,
      visaCategory: "REQUIRED" as const,
      processingTimeMin: 70,
      processingTimeMax: 99,
      governmentFeeINR: 11300,
      serviceFeeINR: 3500,
      requiredDocuments: [
        { key: "passport_front", title: "Passport (all pages with stamps)", notes: "Valid for at least 6 months beyond intended stay. Include all old passports if available.", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 10 },
        { key: "photo", title: "Two Passport Size Photographs", notes: "White background, 35×45mm, no glasses, taken within last 6 months", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statements (last 6 months)", notes: "Stamped by bank. Show organic balance — avoid large last-minute deposits. Target CAD 8,000–12,000 equivalent.", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "itr", title: "Income Tax Returns (last 3 years)", notes: "ITR-V / Form 26AS. Critical for establishing financial standing.", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "salary_slips", title: "Salary Slips (last 3 months)", notes: "Must match employment letter figures", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "employment_letter", title: "Employment Letter", notes: "On company letterhead — designation, salary, tenure, approved leave dates, and explicit confirmation of return to employment", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "cover_letter", title: "Detailed Cover Letter", notes: "Include: full name, passport number, exact travel dates, purpose of visit, day-by-day itinerary, who you're visiting, and intent to return to India", acceptedFormats: ["PDF"], maxFileSizeMb: 2 },
        { key: "travel_itinerary", title: "Flight Itinerary & Hotel Bookings", notes: "Confirmed flights strongly preferred. Day-by-day plan with hotel names.", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "property_docs", title: "Proof of Ties to India", notes: "Property ownership, family dependents (spouse, children), business registration — critical for showing you will return", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 10 },
        { key: "biometrics", title: "Biometrics at VFS Global", notes: "Required within 30 days of application. Visit nearest VFS Global centre in India. Processing does NOT begin until biometrics are submitted.", acceptedFormats: [], maxFileSizeMb: 0 },
        { key: "travel_history", title: "Previous Visa Copies (if any)", notes: "US, UK, Schengen visas significantly improve approval odds. Include used visas.", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 10 },
      ],
      processingNotes: "India is NOT eligible for Canada's eTA. All Indian citizens require a full Temporary Resident Visa (TRV). Biometrics are mandatory at VFS Global — processing clock only starts after biometrics submission. Apply 3–4 months before intended travel. Canada has an ~28% rejection rate for Indian visitor visa applicants; a strong cover letter and comprehensive financial proof are essential.",
    },
  ];

  for (const policy of policies) {
    const country = await prisma.country.findFirst({ where: { code: policy.code } });
    if (!country) {
      console.error(`  ✗ Country ${policy.code} not found — run seed-all-countries first`);
      continue;
    }

    const existing = await prisma.visaPolicy.findFirst({
      where: { countryId: country.id, visaType: policy.visaType, nationality: "IND" },
    });
    if (existing) {
      console.log(`  ↺ ${policy.code} policy already exists — updating...`);
      await prisma.visaPolicy.update({
        where: { id: existing.id },
        data: {
          visaCategory: policy.visaCategory,
          status: "ACTIVE",
          requiredDocuments: policy.requiredDocuments.map((d) => ({ ...d, isRequired: true })),
          feeDetails: {
            currency: "INR",
            governmentFeeINR: policy.governmentFeeINR,
            serviceFeeINR: policy.serviceFeeINR,
            taxes: Math.round((policy.governmentFeeINR + policy.serviceFeeINR) * 0.18),
          },
          processingTimeMin: policy.processingTimeMin,
          processingTimeMax: policy.processingTimeMax,
          processingNotes: policy.processingNotes,
          lastApprovedAt: new Date(),
        },
      });
    } else {
      await prisma.visaPolicy.create({
        data: {
          countryId: country.id,
          visaType: policy.visaType,
          nationality: "IND",
          visaCategory: policy.visaCategory,
          status: "ACTIVE",
          versionNumber: 1,
          eligibilityRules: [
            { type: "passport_validity", description: "Passport must be valid for at least 6 months beyond departure date.", minPassportValidityDays: 180 },
          ],
          requiredDocuments: policy.requiredDocuments.map((d) => ({ ...d, isRequired: true })),
          optionalDocuments: [],
          feeDetails: {
            currency: "INR",
            governmentFeeINR: policy.governmentFeeINR,
            serviceFeeINR: policy.serviceFeeINR,
            taxes: Math.round((policy.governmentFeeINR + policy.serviceFeeINR) * 0.18),
          },
          processingTimeMin: policy.processingTimeMin,
          processingTimeMax: policy.processingTimeMax,
          processingNotes: policy.processingNotes,
          appointmentNotes: "No appointment required — online application only.",
          biometricsNotes: policy.code === "CA" ? "Biometrics required at VFS Global. Must be completed within 30 days of application submission." : "No biometrics required.",
          embassyLinks: [],
          internalOpsNotes: "",
          lastApprovedAt: new Date(),
        },
      });
      console.log(`  ✓ ${policy.code} (${country.name}) policy created`);
    }
  }

  console.log("\n✅ NZ and CA policies seeded.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
