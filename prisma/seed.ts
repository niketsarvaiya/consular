import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const countries = [
    { code: "AE", name: "United Arab Emirates", flagUrl: "https://flagcdn.com/w80/ae.png", sortOrder: 1 },
    { code: "NZ", name: "New Zealand", flagUrl: "https://flagcdn.com/w80/nz.png", sortOrder: 2 },
    { code: "TH", name: "Thailand", flagUrl: "https://flagcdn.com/w80/th.png", sortOrder: 3 },
    { code: "SG", name: "Singapore", flagUrl: "https://flagcdn.com/w80/sg.png", sortOrder: 4 },
    { code: "GB", name: "United Kingdom", flagUrl: "https://flagcdn.com/w80/gb.png", sortOrder: 5 },
    { code: "US", name: "United States", flagUrl: "https://flagcdn.com/w80/us.png", sortOrder: 6 },
    { code: "CA", name: "Canada", flagUrl: "https://flagcdn.com/w80/ca.png", sortOrder: 7 },
    { code: "AU", name: "Australia", flagUrl: "https://flagcdn.com/w80/au.png", sortOrder: 8 },
  ];

  for (const country of countries) {
    await prisma.country.upsert({ where: { code: country.code }, update: country, create: { ...country, isActive: true } });
  }
  console.log(`Seeded ${countries.length} countries.`);

  const uae = await prisma.country.findUniqueOrThrow({ where: { code: "AE" } });

  const uaeTouristPolicy = await prisma.visaPolicy.upsert({
    where: { countryId_visaType_nationality: { countryId: uae.id, visaType: "TOURIST", nationality: "IND" } },
    update: {},
    create: {
      countryId: uae.id, visaType: "TOURIST", nationality: "IND", visaCategory: "E_VISA", status: "ACTIVE", versionNumber: 1,
      eligibilityRules: [
        { type: "passport_validity", description: "Passport must be valid for at least 6 months from date of travel.", minPassportValidityDays: 180 },
        { type: "financial", description: "Must have sufficient funds to support stay." },
      ],
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", description: "Clear color scan of passport biographical page", acceptedFormats: ["PDF", "JPEG", "PNG"], maxFileSizeMb: 5, isRequired: true },
        { key: "passport_back", title: "Passport Back Page", description: "Clear color scan of passport back page", acceptedFormats: ["PDF", "JPEG", "PNG"], maxFileSizeMb: 5, isRequired: true },
        { key: "photo", title: "Passport Size Photo", description: "Recent passport-size photo, white background, no glasses", acceptedFormats: ["JPEG", "PNG"], maxFileSizeMb: 2, isRequired: true },
        { key: "bank_statement", title: "Bank Statement", description: "Last 3 months bank statement showing sufficient funds", acceptedFormats: ["PDF"], maxFileSizeMb: 10, isRequired: true },
        { key: "travel_itinerary", title: "Travel Itinerary", description: "Confirmed flight bookings (return)", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
        { key: "hotel_booking", title: "Hotel Booking Confirmation", description: "Confirmed accommodation for entire stay", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
      ],
      optionalDocuments: [
        { key: "salary_slip", title: "Salary Slips", description: "Last 3 months salary slips", acceptedFormats: ["PDF"], maxFileSizeMb: 10, isRequired: false },
        { key: "employment_letter", title: "Employment Letter", description: "Letter from employer confirming employment", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: false },
      ],
      feeDetails: { currency: "INR", governmentFeeINR: 5500, serviceFeeINR: 1500, taxes: 540, notes: "Single entry 30-day visa." },
      processingTimeMin: 3, processingTimeMax: 5,
      processingNotes: "Standard processing is 3-5 business days.",
      appointmentNotes: "No appointment required for UAE e-visa.",
      biometricsNotes: "Biometrics not required for UAE tourist e-visa for Indian passport holders.",
      embassyLinks: [{ label: "UAE ICA Official Portal", url: "https://icp.gov.ae" }],
      internalOpsNotes: "UAE is one of our highest-volume destinations.",
      lastApprovedAt: new Date(),
    },
  });

  await prisma.policySource.upsert({
    where: { id: "src_uae_ica" },
    update: {},
    create: { id: "src_uae_ica", policyId: uaeTouristPolicy.id, sourceUrl: "https://icp.gov.ae/en/services/visaservices/", sourceType: "gov", cssSelector: "main", label: "UAE ICA Visa Services Page" },
  });

  const th = await prisma.country.findUniqueOrThrow({ where: { code: "TH" } });
  await prisma.visaPolicy.upsert({
    where: { countryId_visaType_nationality: { countryId: th.id, visaType: "TOURIST", nationality: "IND" } },
    update: {},
    create: {
      countryId: th.id, visaType: "TOURIST", nationality: "IND", visaCategory: "VISA_EXEMPT", status: "ACTIVE", versionNumber: 1,
      eligibilityRules: [{ type: "passport_validity", description: "Passport must be valid for at least 6 months.", minPassportValidityDays: 180 }],
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", description: "Valid passport with 6+ months validity", acceptedFormats: ["PDF", "JPEG", "PNG"], maxFileSizeMb: 5, isRequired: true },
        { key: "travel_itinerary", title: "Return Flight Ticket", description: "Confirmed return or onward journey", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
        { key: "hotel_booking", title: "Accommodation Proof", description: "Hotel booking for entire stay", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
      ],
      optionalDocuments: [],
      feeDetails: { currency: "INR", governmentFeeINR: 0, serviceFeeINR: 999, notes: "Thailand grants visa-free entry for 30 days to Indian passport holders." },
      processingTimeMin: 1, processingTimeMax: 2,
      processingNotes: "Visa-free entry. Documentation check only.",
      appointmentNotes: "No appointment required. Entry on arrival.",
      biometricsNotes: "No biometrics required.",
      embassyLinks: [{ label: "Thai Embassy India", url: "https://thaiembassy.in" }],
      internalOpsNotes: "Verify return ticket and hotel booking carefully.",
      lastApprovedAt: new Date(),
    },
  });

  const sg = await prisma.country.findUniqueOrThrow({ where: { code: "SG" } });
  await prisma.visaPolicy.upsert({
    where: { countryId_visaType_nationality: { countryId: sg.id, visaType: "TOURIST", nationality: "IND" } },
    update: {},
    create: {
      countryId: sg.id, visaType: "TOURIST", nationality: "IND", visaCategory: "E_VISA", status: "ACTIVE", versionNumber: 1,
      eligibilityRules: [
        { type: "passport_validity", description: "Passport must be valid for at least 6 months.", minPassportValidityDays: 180 },
        { type: "financial", description: "Must show sufficient funds (SGD 1,000+ per week recommended)." },
      ],
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF", "JPEG", "PNG"], maxFileSizeMb: 5, isRequired: true },
        { key: "photo", title: "Recent Photograph", description: "White background, taken within last 3 months", acceptedFormats: ["JPEG", "PNG"], maxFileSizeMb: 2, isRequired: true },
        { key: "bank_statement", title: "Bank Statement", description: "Last 3 months, showing minimum balance of INR 1,00,000", acceptedFormats: ["PDF"], maxFileSizeMb: 10, isRequired: true },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
        { key: "hotel_booking", title: "Hotel Booking", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: true },
      ],
      optionalDocuments: [
        { key: "employment_letter", title: "Employment / Business Letter", acceptedFormats: ["PDF"], maxFileSizeMb: 5, isRequired: false },
      ],
      feeDetails: { currency: "INR", governmentFeeINR: 4500, serviceFeeINR: 1200, notes: "Single entry 30-day visa." },
      processingTimeMin: 5, processingTimeMax: 7,
      processingNotes: "E-Visa via ICA. Apply at least 1 month before travel.",
      appointmentNotes: "No appointment required for e-Visa.",
      biometricsNotes: "No biometrics required.",
      embassyLinks: [{ label: "ICA Singapore", url: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements" }],
      internalOpsNotes: "Singapore is selective. Ensure clean travel history and strong bank statement.",
      lastApprovedAt: new Date(),
    },
  });

  const adminHash = await bcrypt.hash("Admin@Consular2024", 12);
  const opsHash = await bcrypt.hash("Ops@Consular2024", 12);

  await prisma.opsUser.upsert({ where: { email: "admin@consular.in" }, update: {}, create: { email: "admin@consular.in", fullName: "Consular Admin", passwordHash: adminHash, role: "ADMIN", isActive: true } });
  await prisma.opsUser.upsert({ where: { email: "ops@consular.in" }, update: {}, create: { email: "ops@consular.in", fullName: "Ops Team Member", passwordHash: opsHash, role: "OPS", isActive: true } });

  console.log("Seed complete.");
  console.log("Admin: admin@consular.in / Admin@Consular2024");
  console.log("Ops:   ops@consular.in / Ops@Consular2024");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
