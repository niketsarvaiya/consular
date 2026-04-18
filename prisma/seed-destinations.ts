import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const destinations = [
    // Already seeded (upsert handles duplicates)
    { code: "AE", name: "United Arab Emirates", flagUrl: "https://flagcdn.com/w80/ae.png", sortOrder: 1 },
    { code: "TH", name: "Thailand",              flagUrl: "https://flagcdn.com/w80/th.png", sortOrder: 2 },
    { code: "SG", name: "Singapore",             flagUrl: "https://flagcdn.com/w80/sg.png", sortOrder: 3 },
    { code: "NZ", name: "New Zealand",           flagUrl: "https://flagcdn.com/w80/nz.png", sortOrder: 4 },
    { code: "GB", name: "United Kingdom",        flagUrl: "https://flagcdn.com/w80/gb.png", sortOrder: 5 },
    { code: "US", name: "United States",         flagUrl: "https://flagcdn.com/w80/us.png", sortOrder: 6 },
    { code: "CA", name: "Canada",                flagUrl: "https://flagcdn.com/w80/ca.png", sortOrder: 7 },
    { code: "AU", name: "Australia",             flagUrl: "https://flagcdn.com/w80/au.png", sortOrder: 8 },
    // New destinations
    { code: "FR", name: "France",                flagUrl: "https://flagcdn.com/w80/fr.png", sortOrder: 9 },
    { code: "DE", name: "Germany",               flagUrl: "https://flagcdn.com/w80/de.png", sortOrder: 10 },
    { code: "IT", name: "Italy",                 flagUrl: "https://flagcdn.com/w80/it.png", sortOrder: 11 },
    { code: "ES", name: "Spain",                 flagUrl: "https://flagcdn.com/w80/es.png", sortOrder: 12 },
    { code: "JP", name: "Japan",                 flagUrl: "https://flagcdn.com/w80/jp.png", sortOrder: 13 },
    { code: "KR", name: "South Korea",           flagUrl: "https://flagcdn.com/w80/kr.png", sortOrder: 14 },
    { code: "VN", name: "Vietnam",               flagUrl: "https://flagcdn.com/w80/vn.png", sortOrder: 15 },
    { code: "ID", name: "Indonesia",             flagUrl: "https://flagcdn.com/w80/id.png", sortOrder: 16 },
    { code: "MY", name: "Malaysia",              flagUrl: "https://flagcdn.com/w80/my.png", sortOrder: 17 },
    { code: "TR", name: "Turkey",                flagUrl: "https://flagcdn.com/w80/tr.png", sortOrder: 18 },
    { code: "EG", name: "Egypt",                 flagUrl: "https://flagcdn.com/w80/eg.png", sortOrder: 19 },
    { code: "KE", name: "Kenya",                 flagUrl: "https://flagcdn.com/w80/ke.png", sortOrder: 20 },
    { code: "ZA", name: "South Africa",          flagUrl: "https://flagcdn.com/w80/za.png", sortOrder: 21 },
    { code: "GR", name: "Greece",                flagUrl: "https://flagcdn.com/w80/gr.png", sortOrder: 22 },
    { code: "PT", name: "Portugal",              flagUrl: "https://flagcdn.com/w80/pt.png", sortOrder: 23 },
    { code: "NL", name: "Netherlands",           flagUrl: "https://flagcdn.com/w80/nl.png", sortOrder: 24 },
    { code: "CH", name: "Switzerland",           flagUrl: "https://flagcdn.com/w80/ch.png", sortOrder: 25 },
  ];

  for (const c of destinations) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, flagUrl: c.flagUrl, sortOrder: c.sortOrder, isActive: true },
      create: { ...c, isActive: true },
    });
  }

  // Seed tourist policies for new destinations
  const sg = await prisma.country.findUniqueOrThrow({ where: { code: "SG" } });
  const existingPolicyCodes = await prisma.visaPolicy.findMany({
    select: { countryId: true },
  });
  const existingCountryIds = new Set(existingPolicyCodes.map((p) => p.countryId));

  const newPolicies = [
    {
      code: "JP",
      visaType: "TOURIST" as const,
      visaCategory: "E_VISA" as const,
      processingTimeMin: 5, processingTimeMax: 7,
      governmentFeeINR: 3200, serviceFeeINR: 1200,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photo", description: "White background, 45x45mm", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statement", description: "Last 3 months, minimum ₹1 lakh balance", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "hotel_booking", title: "Hotel Booking", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "itr", title: "Income Tax Return (Last 2 years)", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
      ],
      processingNotes: "Japan requires comprehensive financial documents. Apply at least 3 weeks before travel.",
    },
    {
      code: "VN",
      visaType: "TOURIST" as const,
      visaCategory: "E_VISA" as const,
      processingTimeMin: 3, processingTimeMax: 5,
      governmentFeeINR: 2100, serviceFeeINR: 800,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photo", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Vietnam e-Visa is valid for 90 days, multiple entry.",
    },
    {
      code: "ID",
      visaType: "TOURIST" as const,
      visaCategory: "VISA_EXEMPT" as const,
      processingTimeMin: 1, processingTimeMax: 1,
      governmentFeeINR: 0, serviceFeeINR: 699,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "travel_itinerary", title: "Return Flight Ticket", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "hotel_booking", title: "Hotel Booking", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Visa-free for Indian passport holders for up to 30 days.",
    },
    {
      code: "MY",
      visaType: "TOURIST" as const,
      visaCategory: "VISA_EXEMPT" as const,
      processingTimeMin: 1, processingTimeMax: 1,
      governmentFeeINR: 0, serviceFeeINR: 699,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "travel_itinerary", title: "Return Flight Ticket", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Visa-free entry for Indian passport holders for up to 30 days.",
    },
    {
      code: "TR",
      visaType: "TOURIST" as const,
      visaCategory: "E_VISA" as const,
      processingTimeMin: 1, processingTimeMax: 2,
      governmentFeeINR: 3000, serviceFeeINR: 900,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photo", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statement", description: "Last 3 months", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "hotel_booking", title: "Hotel Booking", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Turkey e-Visa issued within 24 hours. Valid 180 days, 30-day stay.",
    },
    {
      code: "EG",
      visaType: "TOURIST" as const,
      visaCategory: "E_VISA" as const,
      processingTimeMin: 2, processingTimeMax: 3,
      governmentFeeINR: 2500, serviceFeeINR: 900,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photo", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statement", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Egypt e-Visa valid for 90 days, single entry.",
    },
    {
      code: "KE",
      visaType: "TOURIST" as const,
      visaCategory: "E_VISA" as const,
      processingTimeMin: 2, processingTimeMax: 4,
      governmentFeeINR: 4200, serviceFeeINR: 1000,
      requiredDocuments: [
        { key: "passport_front", title: "Passport Front Page", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
        { key: "photo", title: "Passport Size Photo", acceptedFormats: ["JPEG","PNG"], maxFileSizeMb: 2 },
        { key: "bank_statement", title: "Bank Statement", acceptedFormats: ["PDF"], maxFileSizeMb: 10 },
        { key: "travel_itinerary", title: "Flight Bookings", acceptedFormats: ["PDF"], maxFileSizeMb: 5 },
        { key: "yellow_fever", title: "Yellow Fever Vaccination Certificate", acceptedFormats: ["PDF","JPEG","PNG"], maxFileSizeMb: 5 },
      ],
      processingNotes: "Kenya e-Visa valid for 90 days. Yellow fever vaccination required.",
    },
  ];

  for (const policy of newPolicies) {
    const country = await prisma.country.findUniqueOrThrow({ where: { code: policy.code } });
    if (existingCountryIds.has(country.id)) continue;

    const taxes = Math.round((policy.governmentFeeINR + policy.serviceFeeINR) * 0.18);
    await prisma.visaPolicy.create({
      data: {
        countryId: country.id,
        visaType: policy.visaType,
        nationality: "IND",
        visaCategory: policy.visaCategory,
        status: "ACTIVE",
        versionNumber: 1,
        eligibilityRules: [{ type: "passport_validity", description: "Passport must be valid for at least 6 months.", minPassportValidityDays: 180 }],
        requiredDocuments: policy.requiredDocuments.map((d) => ({ ...d, isRequired: true })),
        optionalDocuments: [],
        feeDetails: {
          currency: "INR",
          governmentFeeINR: policy.governmentFeeINR,
          serviceFeeINR: policy.serviceFeeINR,
          taxes,
        },
        processingTimeMin: policy.processingTimeMin,
        processingTimeMax: policy.processingTimeMax,
        processingNotes: policy.processingNotes,
        appointmentNotes: "No appointment required.",
        biometricsNotes: "No biometrics required.",
        embassyLinks: [],
        internalOpsNotes: "",
        lastApprovedAt: new Date(),
      },
    });
    console.log(`  ✓ ${policy.code} policy created`);
  }

  console.log(`\n✅ ${destinations.length} countries upserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
