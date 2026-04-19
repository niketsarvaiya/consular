// Static visa content — FAQs, success tips, hero images, country info
// Used by the apply page to power the Atlys-style UI

export interface FAQQuestion { q: string; a: string }
export interface FAQCategory { category: string; questions: FAQQuestion[] }
export interface CountryInfo { tagline: string; description: string; highlights: string[] }

// ── Hero Images ────────────────────────────────────────────────────────────
// First image = main large panel. 2–5 = mosaic thumbnails.
export const COUNTRY_HERO_IMAGES: Record<string, string[]> = {
  CA: [
    "https://images.unsplash.com/photo-1568168765363-3f1db0b48c9a?w=1200&q=80", // Banff lake
    "https://images.unsplash.com/photo-1526397751294-331021109fbd?w=600&q=80",  // Toronto
    "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",    // Niagara
    "https://images.unsplash.com/photo-1535041422672-8c3254ab4a03?w=600&q=80", // Vancouver
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80", // wilderness
  ],
  NZ: [
    "https://images.unsplash.com/photo-1589196728870-3f5fbcac8f54?w=1200&q=80", // Milford Sound
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80",  // NZ countryside
    "https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80",  // Auckland harbour
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",  // travel
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",  // mountains
  ],
  EG: [
    "https://images.unsplash.com/photo-1539768942893-daf069ae0b33?w=1200&q=80",
    "https://images.unsplash.com/photo-1543269865-0a740d43b90c?w=600&q=80",
    "https://images.unsplash.com/photo-1562128850-9b649bd3f03d?w=600&q=80",
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=80",
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=80",
  ],
  AE: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80",
    "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600&q=80",
    "https://images.unsplash.com/photo-1577648188599-291bb8b831c3?w=600&q=80",
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=600&q=80",
  ],
  TH: [
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80",
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
  ],
  SG: [
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&q=80",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80",
    "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=600&q=80",
    "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=600&q=80",
  ],
  JP: [
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&q=80",
    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&q=80",
  ],
  GB: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80",
    "https://images.unsplash.com/photo-1543832923-44667a44c804?w=600&q=80",
    "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80",
    "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&q=80",
  ],
  AU: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80",
    "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80",
    "https://images.unsplash.com/photo-1547720974-88bfda756b3d?w=600&q=80",
    "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&q=80",
  ],
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
  "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80",
];

export function getHeroImages(code: string): string[] {
  const imgs = COUNTRY_HERO_IMAGES[code.toUpperCase()] ?? FALLBACK_IMAGES;
  while (imgs.length < 5) imgs.push(FALLBACK_IMAGES[imgs.length % FALLBACK_IMAGES.length]);
  return imgs;
}

// ── Country Info ───────────────────────────────────────────────────────────
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  CA: {
    tagline: "The Great White North",
    description: "From Banff's turquoise glacier lakes and the thundering Niagara Falls to the cosmopolitan skylines of Toronto and Vancouver — Canada is a destination of extraordinary scale. It's a country where pristine wilderness and world-class cities exist side by side, making every trip uniquely unforgettable.",
    highlights: ["Banff National Park & Lake Louise", "Niagara Falls", "Toronto's CN Tower & waterfront", "Vancouver's Stanley Park & mountains"],
  },
  NZ: {
    tagline: "The Land of the Long White Cloud",
    description: "New Zealand is one of the world's most spectacular destinations — the dramatic fjords of Milford Sound, the geothermal wonders of Rotorua, Hobbiton's rolling hills, and the adventure capital Queenstown. Clean, safe, and breathtakingly beautiful, it's a destination that consistently exceeds expectations.",
    highlights: ["Milford Sound & Fiordland National Park", "Queenstown — adventure capital of the world", "Hobbiton & the Bay of Islands", "Geothermal wonders of Rotorua"],
  },
  EG: {
    tagline: "Land of the Pharaohs",
    description: "Egypt is one of the world's most ancient civilisations — home to the Pyramids of Giza, the Sphinx, and the mighty Nile. From desert safaris to world-class diving in the Red Sea, Egypt is an unforgettable sensory journey unlike anywhere else on Earth.",
    highlights: ["Pyramids of Giza & the Sphinx", "Red Sea diving & snorkelling", "Luxor temples & Valley of the Kings", "Cairo's Khan el-Khalili bazaar"],
  },
  AE: {
    tagline: "Where the Future Lives",
    description: "A gleaming metropolis rising from the desert — Dubai and Abu Dhabi offer world-class shopping, Michelin-starred dining, pristine beaches, and architecture that defies imagination. The UAE is India's most-visited international destination, and for good reason.",
    highlights: ["Burj Khalifa & Dubai Mall", "Desert safari & dune bashing", "Abu Dhabi's Louvre & Grand Mosque", "World-class beaches & resorts"],
  },
  TH: {
    tagline: "The Land of Smiles",
    description: "From golden temples and floating markets in Bangkok to the turquoise waters of Koh Samui and the lush hills of Chiang Mai — Thailand has been India's favourite holiday for decades. The food alone is worth the trip.",
    highlights: ["Bangkok temples & street food", "Phuket & Koh Samui beaches", "Elephant sanctuaries in Chiang Mai", "Floating markets & night bazaars"],
  },
  SG: {
    tagline: "Asia's Crown Jewel",
    description: "The world's most efficient and immaculate city-state. Singapore blends Chinese, Malay, and Indian cultures in a place that always delivers — from the Gardens by the Bay to the hawker centres, it's a destination that never disappoints.",
    highlights: ["Marina Bay Sands & Gardens by the Bay", "Universal Studios Singapore", "Hawker food at Maxwell & Newton", "Sentosa Island & S.E.A. Aquarium"],
  },
  JP: {
    tagline: "Ancient Soul, Future City",
    description: "Ancient temples, cherry blossoms, neon-lit cities, bullet trains, and the best ramen of your life — Japan is a sensory experience unlike any other. Every corner offers a perfect blend of the traditional and the cutting-edge.",
    highlights: ["Tokyo's Shibuya & Shinjuku", "Mount Fuji & Hakone", "Kyoto's temples & geisha districts", "Osaka street food & Dotonbori"],
  },
  GB: {
    tagline: "Where History Comes Alive",
    description: "From the iconic skyline of London to the Scottish Highlands, rolling English countryside, and Wales's dramatic coastline — the United Kingdom is steeped in history, culture, and charm that has captivated visitors for centuries.",
    highlights: ["Buckingham Palace & Tower of London", "Edinburgh Castle & Royal Mile", "The Cotswolds villages", "Stonehenge & Bath"],
  },
  AU: {
    tagline: "The Land Down Under",
    description: "From the iconic Sydney Opera House and Bondi Beach to the ancient red landscape of Uluru and the Great Barrier Reef — Australia offers a lifetime of exploration. It's one of the world's most diverse, safe, and welcoming destinations.",
    highlights: ["Sydney Opera House & Bondi Beach", "Great Barrier Reef, Queensland", "Uluru & the Red Centre", "Melbourne's laneways & coffee culture"],
  },
  VN: {
    tagline: "Where Tradition Meets Beauty",
    description: "Ha Long Bay's emerald waters, Hoi An's lantern-lit streets, Hanoi's French-colonial charm, and Ho Chi Minh City's electrifying energy — Vietnam is a long, narrow country packed with extraordinary diversity.",
    highlights: ["Ha Long Bay cruise", "Hoi An ancient town & lanterns", "Hanoi's Hoan Kiem Lake", "Mekong Delta boat tours"],
  },
  ID: {
    tagline: "Island Paradise",
    description: "Bali's terraced rice paddies, sacred temples, and spiritual energy make it one of the most iconic destinations in the world. Beyond Bali, Indonesia's 17,000 islands offer some of the best diving, surfing, and biodiversity on the planet.",
    highlights: ["Bali's Ubud & Tanah Lot temple", "Komodo National Park", "Raja Ampat diving", "Borobudur & Prambanan temples"],
  },
  MY: {
    tagline: "Truly Asia",
    description: "The Petronas Twin Towers, George Town's street art, the Cameron Highlands tea gardens, and the pristine Perhentian Islands — Malaysia packs an extraordinary variety into one incredibly affordable destination.",
    highlights: ["Petronas Twin Towers, Kuala Lumpur", "Penang street food & street art", "Langkawi island beaches", "Batu Caves & Taman Negara rainforest"],
  },
  TR: {
    tagline: "Where East Meets West",
    description: "Istanbul's skyline of minarets and domes, Cappadocia's fairy chimneys, the turquoise Aegean coast — Turkey sits at the crossroads of civilisations and offers one of the most spectacular travel experiences anywhere.",
    highlights: ["Hagia Sophia & Blue Mosque, Istanbul", "Hot air balloons over Cappadocia", "Ephesus ancient ruins", "Pamukkale's thermal terraces"],
  },
  FR: {
    tagline: "The Art of Living",
    description: "From the Eiffel Tower and the Louvre to the vineyards of Bordeaux and the lavender fields of Provence — France is the world's most visited country for a reason. Food, art, fashion, and history unite in a destination that defines elegance.",
    highlights: ["Eiffel Tower & the Louvre, Paris", "French Riviera & Monaco", "Vineyards of Bordeaux & Burgundy", "Mont Saint-Michel & the Loire Valley"],
  },
  DE: {
    tagline: "Engineering Meets Culture",
    description: "Fairytale castles, world-class museums, Bavarian beer halls, and the vibrant street art of Berlin — Germany is a country of extraordinary contrasts. Modern, efficient, and deeply cultured, it rewards every kind of traveller.",
    highlights: ["Berlin's history & street art", "Neuschwanstein Castle, Bavaria", "Oktoberfest & Bavarian villages", "Rhine Valley & Black Forest"],
  },
  IT: {
    tagline: "Where Every Meal is a Memory",
    description: "The Colosseum, the Vatican, the canals of Venice, the art of Florence, and the Amalfi Coast — Italy may be the single most beautiful country on Earth. And the food and wine make everything even better.",
    highlights: ["Rome's Colosseum & Vatican", "Venice canals & gondolas", "Florence's Uffizi & Duomo", "Amalfi Coast & Cinque Terre"],
  },
  US: {
    tagline: "Endless Possibilities",
    description: "New York's skyline, the Grand Canyon's vastness, LA's beaches, Chicago's architecture, and the wilderness of Yellowstone — the United States is a continent masquerading as a country, with something extraordinary in every corner.",
    highlights: ["New York City — Times Square & Central Park", "Grand Canyon National Park", "Las Vegas & the Nevada desert", "San Francisco's Golden Gate & Napa Valley"],
  },
};

export const COUNTRY_INFO_FALLBACK: CountryInfo = {
  tagline: "Discover a New World",
  description: "This destination offers a rich blend of culture, history, natural beauty, and unforgettable experiences. Let us handle the visa — you focus on the adventure.",
  highlights: ["Rich cultural heritage", "Stunning natural landscapes", "World-class cuisine", "Warm, welcoming people"],
};

export function getCountryInfo(code: string): CountryInfo {
  return COUNTRY_INFO[code.toUpperCase()] ?? COUNTRY_INFO_FALLBACK;
}

// ── Success Tips ───────────────────────────────────────────────────────────
export const COUNTRY_SUCCESS_TIPS: Record<string, string[]> = {
  CA: [
    "Show 6 months of organic bank balance — target CAD 8,000–12,000 (≈ ₹5–7 lakh) consistently, not parked last-minute. Large sudden deposits are a red flag.",
    "Write a strong, detailed cover letter — include your full name, passport number, exact travel dates, day-by-day itinerary, and a clear statement of intent to return to India.",
    "Your employment letter must mention approved leave dates, salary, tenure, and explicitly confirm your position awaits your return. Weak employment letters are the #1 avoidable rejection.",
    "Disclose all previous visa refusals honestly — hiding a refusal is far more damaging than the refusal itself, and can result in a 5-year ban.",
    "Book biometrics at VFS Global the same day as your application — processing doesn't start until biometrics are done. Don't wait.",
    "If you have a valid US B1/B2, UK, or Schengen visa — include copies. Prior international travel history dramatically improves approval odds.",
    "Show multiple ties to India simultaneously: employment + owned property + spouse/children + parents. Officers ask: 'Does this person have more to lose by staying than by returning?'",
  ],
  NZ: [
    "Show strong ties to India — employment letter with approved leave, family dependents, and property ownership all demonstrate your intent to return.",
    "Maintain 3–6 months of clean bank statements showing stable income. Avoid large unexplained deposits in the weeks before applying.",
    "Provide a detailed day-by-day travel itinerary with hotel bookings — vague plans are one of the most common rejection reasons.",
    "Write a clear cover letter explaining who you are, why you're visiting, what you plan to do, and how you plan to return to India.",
    "Apply online via Immigration New Zealand — it's faster, trackable, and preferred over paper applications.",
    "India is classified as a TB-risk country — if your stay exceeds 6 months, proactively get a chest X-ray done before applying.",
    "Use the INZ checklist specifically for India — it highlights common gaps in Indian applications that differ from other nationalities.",
  ],
  EG: [
    "Apply for the e-Visa online at least 7 days before travel — it's the fastest and most reliable method.",
    "Ensure your passport is valid for at least 6 months beyond your departure from Egypt.",
    "Carry printed copies of your e-Visa confirmation and hotel bookings at the airport.",
  ],
  AE: [
    "UAE visa is typically straightforward for Indian passport holders — apply through the airline or an authorised agent.",
    "Ensure your passport has at least 2 blank pages for visa stamps.",
    "Travel insurance is strongly recommended — UAE has world-class healthcare but it's expensive for visitors.",
  ],
  TH: [
    "Thailand is visa-free for Indian passport holders for up to 30 days — no visa needed for short trips.",
    "Ensure you have proof of return ticket and sufficient funds (approx ₹5,000/day) on arrival.",
    "For stays over 30 days, apply for a Tourist Visa in advance from the Thai consulate.",
  ],
  GB: [
    "Show significant financial ties to India — UK visa officers look closely at whether you'll return.",
    "Previous UK or Schengen visas greatly improve your chances. If you have them, include copies.",
    "Apply at least 3 months in advance — UK standard processing is 3 weeks, but applications from India can take longer.",
    "Your bank balance should show at least ₹3–5 lakh maintained consistently over 3+ months.",
  ],
};

export const DEFAULT_SUCCESS_TIPS: string[] = [
  "Apply well in advance — most embassies recommend at least 4–6 weeks before your travel date.",
  "Ensure your passport has at least 6 months validity beyond your travel dates and has blank pages for stamps.",
  "Show strong financial proof — consistent bank statements over 3–6 months are more convincing than a high balance that appeared recently.",
  "Write a cover letter explaining your purpose of visit, itinerary, and intent to return to India.",
  "Provide proof of ties to India (employment, property, family) to demonstrate you will return after your visit.",
];

export function getSuccessTips(code: string): string[] {
  return COUNTRY_SUCCESS_TIPS[code.toUpperCase()] ?? DEFAULT_SUCCESS_TIPS;
}

// ── FAQ Data ───────────────────────────────────────────────────────────────
export const COUNTRY_FAQ: Record<string, FAQCategory[]> = {
  CA: [
    {
      category: "General",
      questions: [
        {
          q: "Do Indian passport holders need a visa for Canada?",
          a: "Yes. Indian citizens are not eligible for Canada's eTA (Electronic Travel Authorization). All Indian passport holders must apply for a Temporary Resident Visa (TRV) — also called a visitor visa — before travelling to Canada.",
        },
        {
          q: "How long does a Canada visa take for Indians?",
          a: "As of 2026, processing times from India are approximately 70–99 days. The processing clock starts only after biometrics are submitted at a VFS Global centre — not at the time of online application. Apply at least 3–4 months before your intended travel date.",
        },
        {
          q: "What is the Canada visitor visa fee for Indians?",
          a: "The government application fee is CAD $100 (≈ ₹6,100). Biometrics cost an additional CAD $85 (≈ ₹5,200). Consular's service fee is ₹3,500. Total all-in cost is approximately ₹14,800–15,000.",
        },
        {
          q: "How long can I stay in Canada on a visitor visa?",
          a: "Each individual visit is typically granted for up to 6 months, determined by the border officer on entry. The visa itself (TRV) can be valid for up to 10 years, allowing multiple entries — but each stay is limited to 6 months.",
        },
      ],
    },
    {
      category: "Requirements",
      questions: [
        {
          q: "What documents are required for a Canada visitor visa?",
          a: "The core documents are: valid passport, 2 passport photos, 6 months bank statements, 3 years of ITRs, 3 months salary slips, employment letter with leave approval, detailed cover letter, travel itinerary and hotel bookings, and proof of ties to India (property, family). Biometrics at VFS Global is also mandatory.",
        },
        {
          q: "How much money do I need to show for a Canada visa?",
          a: "There's no official minimum, but officers expect to see sufficient funds to cover your entire stay — typically CAD $1,000–1,500 per week (≈ ₹60,000–90,000/week). A consistent balance of CAD 8,000–12,000 (≈ ₹5–7 lakh) over 6 months is generally well-regarded. Avoid large last-minute deposits.",
        },
        {
          q: "Is a strong employment letter important?",
          a: "Critically important. Your employment letter must include: your designation, salary, length of service, the specific dates of approved leave, and a statement that your position will be held for your return. Weak or generic letters are a leading cause of rejection for Indian applicants.",
        },
        {
          q: "Will a US or UK visa help my Canada application?",
          a: "Yes, significantly. Officers see prior visa grants from the US, UK, or Schengen as validation that you are a credible traveller who returns home. Always include copies of any valid foreign visas when applying.",
        },
      ],
    },
    {
      category: "Process",
      questions: [
        {
          q: "Can I apply for a Canada visa online?",
          a: "Yes. Applications are submitted online through the IRCC portal at canada.ca. Online applications are processed faster than paper ones. After submission, you receive a biometrics instruction letter — you must attend a VFS Global centre within 30 days to give fingerprints and photograph.",
        },
        {
          q: "What is the biometrics requirement?",
          a: "Biometrics (fingerprints + photo) are mandatory for all Indian applicants. They must be given at a VFS Global centre in India within 30 days of your application. Important: IRCC will not begin processing your application until biometrics are submitted, so book your appointment immediately.",
        },
        {
          q: "Should I declare previous visa refusals?",
          a: "Yes, always. You must declare all prior refusals from any country. Non-disclosure is treated as misrepresentation, which results in a 5-year ban. A past refusal, disclosed and explained, is far less damaging than one that is concealed.",
        },
      ],
    },
    {
      category: "After Your Visa",
      questions: [
        {
          q: "What can I do on a Canada visitor visa?",
          a: "You can visit as a tourist, see family and friends, attend business meetings or conferences, and participate in short-term training. You cannot work, study for more than 6 months, or access publicly funded healthcare.",
        },
        {
          q: "Can I extend my stay in Canada?",
          a: "Yes — you can apply to extend your stay from within Canada before your status expires. This is done online via the IRCC portal. Extensions are not guaranteed and require proof that you still have valid reasons to stay.",
        },
        {
          q: "What are the most common reasons Indian visitor visas are rejected?",
          a: "The top reasons are: (1) Insufficient ties to India — no job, property, or family dependents to prove you'll return; (2) Weak or suspicious financials — sudden large deposits or inconsistent history; (3) Vague purpose of visit — no clear itinerary or reason; (4) Incomplete application — missing documents or inconsistent information; (5) Undisclosed prior refusals.",
        },
      ],
    },
  ],
  NZ: [
    {
      category: "General",
      questions: [
        {
          q: "Do Indian passport holders need a visa for New Zealand?",
          a: "Yes. Indian citizens are NOT eligible for the NZeTA (New Zealand Electronic Travel Authority). A full Visitor Visa application is mandatory for all travel purposes — tourism, family visits, or business. This applies regardless of how long you intend to stay.",
        },
        {
          q: "How long does a New Zealand visa take for Indians?",
          a: "80% of applications are decided within 2 weeks (approximately 10 working days). However, if Immigration New Zealand requests additional documents, processing can take longer. Apply at least 4–6 weeks before travel.",
        },
        {
          q: "What is the New Zealand visitor visa fee?",
          a: "The government application fee is NZD 441 (approximately ₹22,000). This fee is non-refundable regardless of outcome. Consular's service fee is ₹2,500. Additional costs may include a medical examination (if required) and a police clearance certificate.",
        },
        {
          q: "How long can I stay in New Zealand on a visitor visa?",
          a: "A standard Visitor Visa allows up to 6 months stay per 12-month period (multiple-entry) or up to 9 months in any 18-month period (single-entry). You are not permitted to work, but you may study for up to 3 months per year.",
        },
      ],
    },
    {
      category: "Requirements",
      questions: [
        {
          q: "What documents are required for a New Zealand visitor visa?",
          a: "Core documents: valid passport (3+ months validity beyond departure), photos, 3–6 months bank statements, employment letter with leave approval, return/onward flight ticket, hotel bookings, cover letter explaining your trip, and proof of ties to India (property, dependents). A police clearance may be needed for longer stays.",
        },
        {
          q: "How much money do I need to show?",
          a: "Immigration New Zealand requires proof of NZD 1,000 per month of your intended stay (or NZD 400/month if accommodation is pre-paid). So for a 4-week visit you'd need to show approximately NZD 4,000 (≈ ₹2 lakh) available. Show consistent bank statements, not sudden deposits.",
        },
        {
          q: "Do I need a medical examination?",
          a: "India is classified as a TB-risk country by New Zealand. A chest X-ray is almost always required if your intended stay exceeds 6 months. For shorter stays it may still be requested based on your health declaration. Arrange this early as it can take 2–3 weeks.",
        },
      ],
    },
    {
      category: "Process",
      questions: [
        {
          q: "How do I apply for a New Zealand visitor visa?",
          a: "Apply online through Immigration New Zealand's portal at apply.immigration.govt.nz. You'll need a RealMe account (New Zealand's identity system). Online applications are faster, trackable, and strongly preferred over paper. After submission, you receive an e-Visa electronically — no physical label or stamp is required.",
        },
        {
          q: "Can I reapply if my visa is rejected?",
          a: "Yes — there's no mandatory waiting period. You can reapply immediately, but you must specifically address every reason mentioned in the rejection. Simply resubmitting the same application will result in the same outcome.",
        },
      ],
    },
    {
      category: "After Your Visa",
      questions: [
        {
          q: "Can I work on a New Zealand visitor visa?",
          a: "No, you cannot work for a New Zealand employer on a visitor visa. However, you are permitted to work remotely for your Indian employer if you are employed outside of New Zealand — this is considered offshore work and is allowed.",
        },
        {
          q: "What are the most common rejection reasons for Indian applicants?",
          a: "Top reasons: (1) Insufficient financial evidence or inconsistent bank history; (2) Weak ties to home country — no job, property, or family dependents; (3) Vague itinerary without specific hotel or activity bookings; (4) Incomplete or inconsistent documents; (5) Undisclosed prior visa refusals. New Zealand's approval rate for Indians is approximately 72% (28% rejection rate).",
        },
      ],
    },
  ],
};

export const DEFAULT_FAQ: FAQCategory[] = [
  {
    category: "General",
    questions: [
      { q: "How long does visa processing take?", a: "Processing times vary by country and visa type. The estimated processing window for this destination is shown in the details above. We recommend applying well before your travel date to allow for any delays." },
      { q: "What happens if my visa is rejected?", a: "If your application is rejected, we will notify you immediately with the reason (if provided by the embassy). You can reapply with additional documentation. Consular's team will guide you through strengthening your application." },
      { q: "Is the fee refundable if my visa is rejected?", a: "Government fees paid to embassies are non-refundable. Consular's service fee is charged only after your documents are approved — so you don't pay us unless your application is ready to file." },
    ],
  },
  {
    category: "Requirements",
    questions: [
      { q: "What documents do I need?", a: "The required documents for this destination are listed in the Documents section above. Our team will review your documents before submission and flag any issues." },
      { q: "How recent should my bank statements be?", a: "Bank statements should be from the last 3–6 months and must be stamped by your bank. They should show consistent transactions, not a sudden large deposit just before applying." },
    ],
  },
  {
    category: "Process",
    questions: [
      { q: "How does the Consular process work?", a: "You enter your passport details, upload your documents, and our team reviews everything before you pay. Once approved, we submit your application and track it until you receive your visa. You're updated at every step." },
    ],
  },
];

export function getCountryFAQ(code: string): FAQCategory[] {
  return COUNTRY_FAQ[code.toUpperCase()] ?? DEFAULT_FAQ;
}
