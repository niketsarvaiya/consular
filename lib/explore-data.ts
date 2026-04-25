/**
 * explore-data.ts
 * Static dataset for the Explore page world map + discovery rows.
 * All 52 live DB destinations + ~70 additional countries for map coloring.
 */

export type VisaStatus =
  | "visa_free"
  | "visa_on_arrival"
  | "e_visa"
  | "visa_required"
  | "restricted"
  | "unknown";

export type Region =
  | "Asia"
  | "Europe"
  | "Americas"
  | "Middle East"
  | "Africa"
  | "Oceania";

export interface ExploreCountry {
  /** ISO-2 code (matches DB `code` field) */
  iso2: string;
  /** ISO numeric code — must match geo.id from world-atlas topojson */
  isoNumeric: string;
  name: string;
  flag: string;
  region: Region;
  visaStatus: VisaStatus;
  /** Whether there is a live Consular page for this country */
  hasLivePage: boolean;
  /** Slug for the apply page, e.g. "fr" → /apply/fr/tourist */
  slug?: string;
  processingDays?: string;
  /** Total approx fee in INR */
  totalFeeINR?: number;
  tagline?: string;
  heroImage?: string;
  popular?: boolean;
  trending?: boolean;
}

// ── Complete dataset ─────────────────────────────────────────────────────────
// isoNumeric values from https://en.wikipedia.org/wiki/ISO_3166-1_numeric
export const EXPLORE_COUNTRIES: ExploreCountry[] = [
  // ── Live Consular destinations (52) ────────────────────────────────────────
  // Phase 1 (original 12)
  {
    iso2: "TH", isoNumeric: "764", name: "Thailand", flag: "🇹🇭", region: "Asia",
    visaStatus: "visa_on_arrival", hasLivePage: true, slug: "th",
    processingDays: "On arrival", totalFeeINR: 0,
    tagline: "Land of Smiles", popular: true, trending: true,
    heroImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  },
  {
    iso2: "SG", isoNumeric: "702", name: "Singapore", flag: "🇸🇬", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "sg",
    processingDays: "3–5 days", totalFeeINR: 4800,
    tagline: "City of the future", popular: true,
    heroImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  },
  {
    iso2: "JP", isoNumeric: "392", name: "Japan", flag: "🇯🇵", region: "Asia",
    visaStatus: "visa_required", hasLivePage: true, slug: "jp",
    processingDays: "5–7 days", totalFeeINR: 1499,
    tagline: "Where tradition meets tomorrow", popular: true, trending: true,
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  },
  {
    iso2: "GB", isoNumeric: "826", name: "United Kingdom", flag: "🇬🇧", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "gb",
    processingDays: "3 weeks", totalFeeINR: 18000,
    tagline: "Beyond the crown",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  },
  {
    iso2: "AU", isoNumeric: "36", name: "Australia", flag: "🇦🇺", region: "Oceania",
    visaStatus: "e_visa", hasLivePage: true, slug: "au",
    processingDays: "1–3 days", totalFeeINR: 12000,
    tagline: "The great wide open", popular: true,
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    iso2: "CA", isoNumeric: "124", name: "Canada", flag: "🇨🇦", region: "Americas",
    visaStatus: "visa_required", hasLivePage: true, slug: "ca",
    processingDays: "4–6 weeks", totalFeeINR: 9200,
    tagline: "Wild & wonderfully vast",
    heroImage: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80",
  },
  {
    iso2: "AE", isoNumeric: "784", name: "UAE", flag: "🇦🇪", region: "Middle East",
    visaStatus: "visa_on_arrival", hasLivePage: true, slug: "ae",
    processingDays: "On arrival", totalFeeINR: 2500,
    tagline: "Where luxury is the standard", popular: true,
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  },
  {
    iso2: "EG", isoNumeric: "818", name: "Egypt", flag: "🇪🇬", region: "Africa",
    visaStatus: "visa_on_arrival", hasLivePage: true, slug: "eg",
    processingDays: "On arrival", totalFeeINR: 2500,
    tagline: "Seven millennia of wonder",
    heroImage: "https://images.unsplash.com/photo-1594732832278-abd644401426?w=800&q=80",
  },
  {
    iso2: "NZ", isoNumeric: "554", name: "New Zealand", flag: "🇳🇿", region: "Oceania",
    visaStatus: "e_visa", hasLivePage: true, slug: "nz",
    processingDays: "2–3 days", totalFeeINR: 14000,
    tagline: "Pure nature, pure adventure",
    heroImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
  },
  {
    iso2: "US", isoNumeric: "840", name: "USA", flag: "🇺🇸", region: "Americas",
    visaStatus: "visa_required", hasLivePage: true, slug: "us",
    processingDays: "3–6 months", totalFeeINR: 13600,
    tagline: "The land of endless possibilities", popular: true,
    heroImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
  },
  {
    iso2: "DE", isoNumeric: "276", name: "Germany", flag: "🇩🇪", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "de",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Engineering meets enchantment",
    heroImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
  },
  {
    iso2: "IT", isoNumeric: "380", name: "Italy", flag: "🇮🇹", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "it",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Art, pasta, and la dolce vita", popular: true,
    heroImage: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  },
  // Phase 2 (23 countries)
  {
    iso2: "LK", isoNumeric: "144", name: "Sri Lanka", flag: "🇱🇰", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "lk",
    processingDays: "1–2 days", totalFeeINR: 2679,
    tagline: "The Pearl of the Indian Ocean", popular: true,
    heroImage: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80",
  },
  {
    iso2: "MY", isoNumeric: "458", name: "Malaysia", flag: "🇲🇾", region: "Asia",
    visaStatus: "visa_free", hasLivePage: true, slug: "my",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "Truly Asia",
    heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  },
  {
    iso2: "ID", isoNumeric: "360", name: "Indonesia", flag: "🇮🇩", region: "Asia",
    visaStatus: "visa_on_arrival", hasLivePage: true, slug: "id",
    processingDays: "On arrival", totalFeeINR: 4140,
    tagline: "17,000 islands of wonder", popular: true,
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  },
  {
    iso2: "VN", isoNumeric: "704", name: "Vietnam", flag: "🇻🇳", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "vn",
    processingDays: "3–5 days", totalFeeINR: 3099,
    tagline: "Timeless landscapes, vibrant soul",
    heroImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
  },
  {
    iso2: "KR", isoNumeric: "410", name: "South Korea", flag: "🇰🇷", region: "Asia",
    visaStatus: "visa_required", hasLivePage: true, slug: "kr",
    processingDays: "5 days", totalFeeINR: 4800,
    tagline: "K-culture capital of the world", trending: true,
    heroImage: "https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800&q=80",
  },
  {
    iso2: "TW", isoNumeric: "158", name: "Taiwan", flag: "🇹🇼", region: "Asia",
    visaStatus: "visa_free", hasLivePage: true, slug: "tw",
    processingDays: "Visa-free", totalFeeINR: 999,
    tagline: "Asia's best-kept secret",
    heroImage: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80",
  },
  {
    iso2: "HK", isoNumeric: "344", name: "Hong Kong", flag: "🇭🇰", region: "Asia",
    visaStatus: "visa_free", hasLivePage: true, slug: "hk",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "East meets West in dazzling style",
    heroImage: "https://images.unsplash.com/photo-1506970845246-18f21d533b20?w=800&q=80",
  },
  {
    iso2: "TR", isoNumeric: "792", name: "Turkey", flag: "🇹🇷", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "tr",
    processingDays: "1–2 days", totalFeeINR: 5400,
    tagline: "Where East and West collide", popular: true,
    heroImage: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  },
  {
    iso2: "KE", isoNumeric: "404", name: "Kenya", flag: "🇰🇪", region: "Africa",
    visaStatus: "e_visa", hasLivePage: true, slug: "ke",
    processingDays: "2–3 days", totalFeeINR: 3729,
    tagline: "Safari capital of the world",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
  },
  {
    iso2: "TZ", isoNumeric: "834", name: "Tanzania", flag: "🇹🇿", region: "Africa",
    visaStatus: "e_visa", hasLivePage: true, slug: "tz",
    processingDays: "2–3 days", totalFeeINR: 5400,
    tagline: "Serengeti, Kilimanjaro, Zanzibar",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
  },
  {
    iso2: "QA", isoNumeric: "634", name: "Qatar", flag: "🇶🇦", region: "Middle East",
    visaStatus: "visa_free", hasLivePage: true, slug: "qa",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "Modern Arabia at its finest",
    heroImage: "https://images.unsplash.com/photo-1538804977665-5f9cba0bdb43?w=800&q=80",
  },
  {
    iso2: "OM", isoNumeric: "512", name: "Oman", flag: "🇴🇲", region: "Middle East",
    visaStatus: "e_visa", hasLivePage: true, slug: "om",
    processingDays: "1–3 days", totalFeeINR: 5560,
    tagline: "Arabia's hidden treasure",
    heroImage: "https://images.unsplash.com/photo-1583266313612-f4c7c1f1b4b1?w=800&q=80",
  },
  {
    iso2: "GE", isoNumeric: "268", name: "Georgia", flag: "🇬🇪", region: "Asia",
    visaStatus: "visa_free", hasLivePage: true, slug: "ge",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "Europe's soul in the Caucasus", trending: true,
    heroImage: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&q=80",
  },
  {
    iso2: "KZ", isoNumeric: "398", name: "Kazakhstan", flag: "🇰🇿", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "kz",
    processingDays: "3–5 days", totalFeeINR: 2679,
    tagline: "The steppe frontier",
    heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  },
  {
    iso2: "UZ", isoNumeric: "860", name: "Uzbekistan", flag: "🇺🇿", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "uz",
    processingDays: "3 days", totalFeeINR: 2679,
    tagline: "The Silk Road lives on", trending: true,
    heroImage: "https://images.unsplash.com/photo-1598030304671-5aa1d6f9e79a?w=800&q=80",
  },
  {
    iso2: "PH", isoNumeric: "608", name: "Philippines", flag: "🇵🇭", region: "Asia",
    visaStatus: "visa_free", hasLivePage: true, slug: "ph",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "7,000+ islands of paradise",
    heroImage: "https://images.unsplash.com/photo-1480926965639-9b5f46476e6e?w=800&q=80",
  },
  {
    iso2: "KH", isoNumeric: "116", name: "Cambodia", flag: "🇰🇭", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "kh",
    processingDays: "3 days", totalFeeINR: 4224,
    tagline: "Angkor and beyond",
    heroImage: "https://images.unsplash.com/photo-1552645272-ba3ffd2e5c15?w=800&q=80",
  },
  {
    iso2: "LA", isoNumeric: "418", name: "Laos", flag: "🇱🇦", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "la",
    processingDays: "3 days", totalFeeINR: 4560,
    tagline: "Southeast Asia's quiet jewel",
    heroImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
  },
  {
    iso2: "MV", isoNumeric: "462", name: "Maldives", flag: "🇲🇻", region: "Asia",
    visaStatus: "visa_on_arrival", hasLivePage: true, slug: "mv",
    processingDays: "On arrival", totalFeeINR: 699,
    tagline: "Heaven on Earth", popular: true,
    heroImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  },
  {
    iso2: "MU", isoNumeric: "480", name: "Mauritius", flag: "🇲🇺", region: "Africa",
    visaStatus: "visa_free", hasLivePage: true, slug: "mu",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "The island of dreams",
    heroImage: "https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80",
  },
  {
    iso2: "AZ", isoNumeric: "31", name: "Azerbaijan", flag: "🇦🇿", region: "Asia",
    visaStatus: "e_visa", hasLivePage: true, slug: "az",
    processingDays: "3 days", totalFeeINR: 3183,
    tagline: "Land of Fire",
    heroImage: "https://images.unsplash.com/photo-1557791926-67dc71fa50b7?w=800&q=80",
  },
  {
    iso2: "RS", isoNumeric: "688", name: "Serbia", flag: "🇷🇸", region: "Europe",
    visaStatus: "visa_free", hasLivePage: true, slug: "rs",
    processingDays: "Visa-free", totalFeeINR: 699,
    tagline: "Europe's party capital",
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  },
  // Phase 3 Schengen (17 countries)
  {
    iso2: "FR", isoNumeric: "250", name: "France", flag: "🇫🇷", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "fr",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Art, love, and joie de vivre", popular: true, trending: true,
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  },
  {
    iso2: "ES", isoNumeric: "724", name: "Spain", flag: "🇪🇸", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "es",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Fiestas, flamenco, and flavor", popular: true,
    heroImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  },
  {
    iso2: "NL", isoNumeric: "528", name: "Netherlands", flag: "🇳🇱", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "nl",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Tulips, windmills, and canals",
    heroImage: "https://images.unsplash.com/photo-1584003564911-9a1cca26f5d7?w=800&q=80",
  },
  {
    iso2: "PT", isoNumeric: "620", name: "Portugal", flag: "🇵🇹", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "pt",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Where the sea begins", trending: true,
    heroImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  },
  {
    iso2: "GR", isoNumeric: "300", name: "Greece", flag: "🇬🇷", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "gr",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Where mythology walks the earth", popular: true,
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  },
  {
    iso2: "AT", isoNumeric: "40", name: "Austria", flag: "🇦🇹", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "at",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Classical music and alpine glory",
    heroImage: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80",
  },
  {
    iso2: "CH", isoNumeric: "756", name: "Switzerland", flag: "🇨🇭", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "ch",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Peaks, precision, and perfection",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
  },
  {
    iso2: "CZ", isoNumeric: "203", name: "Czechia", flag: "🇨🇿", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "cz",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Fairy tales come to life",
    heroImage: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80",
  },
  {
    iso2: "HU", isoNumeric: "348", name: "Hungary", flag: "🇭🇺", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "hu",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "The Pearl of the Danube",
    heroImage: "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=800&q=80",
  },
  {
    iso2: "PL", isoNumeric: "616", name: "Poland", flag: "🇵🇱", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "pl",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "History in every cobblestone",
    heroImage: "https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=800&q=80",
  },
  {
    iso2: "BE", isoNumeric: "56", name: "Belgium", flag: "🇧🇪", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "be",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Chocolates, waffles, and medieval charm",
    heroImage: "https://images.unsplash.com/photo-1559113513-d5406b089e4b?w=800&q=80",
  },
  {
    iso2: "SE", isoNumeric: "752", name: "Sweden", flag: "🇸🇪", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "se",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Northern lights and midnight sun",
    heroImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
  },
  {
    iso2: "DK", isoNumeric: "208", name: "Denmark", flag: "🇩🇰", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "dk",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Hygge and Hans Christian Andersen",
    heroImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
  },
  {
    iso2: "NO", isoNumeric: "578", name: "Norway", flag: "🇳🇴", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "no",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Fjords and the Northern Lights",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
  },
  {
    iso2: "FI", isoNumeric: "246", name: "Finland", flag: "🇫🇮", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "fi",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Land of a thousand lakes",
    heroImage: "https://images.unsplash.com/photo-1559113513-d5406b089e4b?w=800&q=80",
  },
  {
    iso2: "HR", isoNumeric: "191", name: "Croatia", flag: "🇭🇷", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "hr",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Pearl of the Adriatic", trending: true,
    heroImage: "https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=80",
  },
  {
    iso2: "SK", isoNumeric: "703", name: "Slovakia", flag: "🇸🇰", region: "Europe",
    visaStatus: "visa_required", hasLivePage: true, slug: "sk",
    processingDays: "15 days", totalFeeINR: 13688,
    tagline: "Castles and Carpathian landscapes",
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  },

  // ── Additional countries for map coloring (no live page) ──────────────────
  { iso2: "CN", isoNumeric: "156", name: "China", flag: "🇨🇳", region: "Asia", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "IN", isoNumeric: "356", name: "India", flag: "🇮🇳", region: "Asia", visaStatus: "visa_free", hasLivePage: false },
  { iso2: "RU", isoNumeric: "643", name: "Russia", flag: "🇷🇺", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "BR", isoNumeric: "76", name: "Brazil", flag: "🇧🇷", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "MX", isoNumeric: "484", name: "Mexico", flag: "🇲🇽", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "AR", isoNumeric: "32", name: "Argentina", flag: "🇦🇷", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "ZA", isoNumeric: "710", name: "South Africa", flag: "🇿🇦", region: "Africa", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "NG", isoNumeric: "566", name: "Nigeria", flag: "🇳🇬", region: "Africa", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "MA", isoNumeric: "504", name: "Morocco", flag: "🇲🇦", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "ET", isoNumeric: "231", name: "Ethiopia", flag: "🇪🇹", region: "Africa", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "GH", isoNumeric: "288", name: "Ghana", flag: "🇬🇭", region: "Africa", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "SA", isoNumeric: "682", name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "IL", isoNumeric: "376", name: "Israel", flag: "🇮🇱", region: "Middle East", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "JO", isoNumeric: "400", name: "Jordan", flag: "🇯🇴", region: "Middle East", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "IR", isoNumeric: "364", name: "Iran", flag: "🇮🇷", region: "Middle East", visaStatus: "restricted", hasLivePage: false },
  { iso2: "IQ", isoNumeric: "368", name: "Iraq", flag: "🇮🇶", region: "Middle East", visaStatus: "restricted", hasLivePage: false },
  { iso2: "SY", isoNumeric: "760", name: "Syria", flag: "🇸🇾", region: "Middle East", visaStatus: "restricted", hasLivePage: false },
  { iso2: "AF", isoNumeric: "4", name: "Afghanistan", flag: "🇦🇫", region: "Asia", visaStatus: "restricted", hasLivePage: false },
  { iso2: "PK", isoNumeric: "586", name: "Pakistan", flag: "🇵🇰", region: "Asia", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "BD", isoNumeric: "50", name: "Bangladesh", flag: "🇧🇩", region: "Asia", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "NP", isoNumeric: "524", name: "Nepal", flag: "🇳🇵", region: "Asia", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "MM", isoNumeric: "104", name: "Myanmar", flag: "🇲🇲", region: "Asia", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "KW", isoNumeric: "414", name: "Kuwait", flag: "🇰🇼", region: "Middle East", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "BH", isoNumeric: "48", name: "Bahrain", flag: "🇧🇭", region: "Middle East", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "YE", isoNumeric: "887", name: "Yemen", flag: "🇾🇪", region: "Middle East", visaStatus: "restricted", hasLivePage: false },
  { iso2: "UY", isoNumeric: "858", name: "Uruguay", flag: "🇺🇾", region: "Americas", visaStatus: "visa_free", hasLivePage: false },
  { iso2: "CL", isoNumeric: "152", name: "Chile", flag: "🇨🇱", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "CO", isoNumeric: "170", name: "Colombia", flag: "🇨🇴", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "PE", isoNumeric: "604", name: "Peru", flag: "🇵🇪", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "EC", isoNumeric: "218", name: "Ecuador", flag: "🇪🇨", region: "Americas", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "BO", isoNumeric: "68", name: "Bolivia", flag: "🇧🇴", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "VE", isoNumeric: "862", name: "Venezuela", flag: "🇻🇪", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "CU", isoNumeric: "192", name: "Cuba", flag: "🇨🇺", region: "Americas", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "UA", isoNumeric: "804", name: "Ukraine", flag: "🇺🇦", region: "Europe", visaStatus: "visa_free", hasLivePage: false },
  { iso2: "RO", isoNumeric: "642", name: "Romania", flag: "🇷🇴", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "BG", isoNumeric: "100", name: "Bulgaria", flag: "🇧🇬", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "SI", isoNumeric: "705", name: "Slovenia", flag: "🇸🇮", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "BA", isoNumeric: "70", name: "Bosnia", flag: "🇧🇦", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "AL", isoNumeric: "8", name: "Albania", flag: "🇦🇱", region: "Europe", visaStatus: "visa_free", hasLivePage: false },
  { iso2: "MK", isoNumeric: "807", name: "N. Macedonia", flag: "🇲🇰", region: "Europe", visaStatus: "visa_free", hasLivePage: false },
  { iso2: "EE", isoNumeric: "233", name: "Estonia", flag: "🇪🇪", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "LV", isoNumeric: "428", name: "Latvia", flag: "🇱🇻", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "LT", isoNumeric: "440", name: "Lithuania", flag: "🇱🇹", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "IE", isoNumeric: "372", name: "Ireland", flag: "🇮🇪", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "IS", isoNumeric: "352", name: "Iceland", flag: "🇮🇸", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "LU", isoNumeric: "442", name: "Luxembourg", flag: "🇱🇺", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "MT", isoNumeric: "470", name: "Malta", flag: "🇲🇹", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "CY", isoNumeric: "196", name: "Cyprus", flag: "🇨🇾", region: "Europe", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "TN", isoNumeric: "788", name: "Tunisia", flag: "🇹🇳", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "LY", isoNumeric: "434", name: "Libya", flag: "🇱🇾", region: "Africa", visaStatus: "restricted", hasLivePage: false },
  { iso2: "DZ", isoNumeric: "12", name: "Algeria", flag: "🇩🇿", region: "Africa", visaStatus: "visa_required", hasLivePage: false },
  { iso2: "SD", isoNumeric: "729", name: "Sudan", flag: "🇸🇩", region: "Africa", visaStatus: "restricted", hasLivePage: false },
  { iso2: "UG", isoNumeric: "800", name: "Uganda", flag: "🇺🇬", region: "Africa", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "RW", isoNumeric: "646", name: "Rwanda", flag: "🇷🇼", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "ZM", isoNumeric: "894", name: "Zambia", flag: "🇿🇲", region: "Africa", visaStatus: "e_visa", hasLivePage: false },
  { iso2: "ZW", isoNumeric: "716", name: "Zimbabwe", flag: "🇿🇼", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "MZ", isoNumeric: "508", name: "Mozambique", flag: "🇲🇿", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "MG", isoNumeric: "450", name: "Madagascar", flag: "🇲🇬", region: "Africa", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "PG", isoNumeric: "598", name: "Papua New Guinea", flag: "🇵🇬", region: "Oceania", visaStatus: "visa_on_arrival", hasLivePage: false },
  { iso2: "FJ", isoNumeric: "242", name: "Fiji", flag: "🇫🇯", region: "Oceania", visaStatus: "visa_free", hasLivePage: false },
];

// ── Derived maps for fast lookup ─────────────────────────────────────────────
export const COUNTRY_BY_ISO2 = Object.fromEntries(
  EXPLORE_COUNTRIES.map((c) => [c.iso2, c])
);

export const COUNTRY_BY_NUMERIC = Object.fromEntries(
  EXPLORE_COUNTRIES.map((c) => [c.isoNumeric, c])
);

// ── Status display metadata ───────────────────────────────────────────────────
export const VISA_STATUS_META: Record<
  VisaStatus,
  { label: string; color: string; mapColor: string; badge: string }
> = {
  visa_free: {
    label: "Visa Free",
    color: "text-emerald-700",
    mapColor: "#10b981",
    badge: "bg-emerald-100 text-emerald-700",
  },
  visa_on_arrival: {
    label: "Visa on Arrival",
    color: "text-blue-700",
    mapColor: "#3b82f6",
    badge: "bg-blue-100 text-blue-700",
  },
  e_visa: {
    label: "e-Visa",
    color: "text-violet-700",
    mapColor: "#8b5cf6",
    badge: "bg-violet-100 text-violet-700",
  },
  visa_required: {
    label: "Visa Required",
    color: "text-amber-700",
    mapColor: "#f59e0b",
    badge: "bg-amber-100 text-amber-700",
  },
  restricted: {
    label: "Restricted",
    color: "text-red-700",
    mapColor: "#ef4444",
    badge: "bg-red-100 text-red-700",
  },
  unknown: {
    label: "Unknown",
    color: "text-slate-500",
    mapColor: "#94a3b8",
    badge: "bg-slate-100 text-slate-500",
  },
};

// ── Discovery row helpers ─────────────────────────────────────────────────────
export const POPULAR_DESTINATIONS = EXPLORE_COUNTRIES.filter(
  (c) => c.popular && c.hasLivePage
);

export const TRENDING_DESTINATIONS = EXPLORE_COUNTRIES.filter(
  (c) => c.trending && c.hasLivePage
);

export const EASIEST_DESTINATIONS = EXPLORE_COUNTRIES.filter(
  (c) =>
    c.hasLivePage &&
    (c.visaStatus === "visa_free" || c.visaStatus === "visa_on_arrival")
).slice(0, 10);

export const EVISA_DESTINATIONS = EXPLORE_COUNTRIES.filter(
  (c) => c.hasLivePage && c.visaStatus === "e_visa"
).slice(0, 10);
