import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, CreditCard, FileText, Info, ShieldCheck, Banknote, CalendarDays, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { country: string; visaType: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Apply – ${params.country.toUpperCase()} ${params.visaType} Visa` };
}

const VISA_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "Sticker Visa",
  E_VISA: "e-Visa",
  ETA: "ETA",
  VISA_EXEMPT: "Visa-free",
};

const VISA_CATEGORY_COLORS: Record<string, string> = {
  REQUIRED: "bg-purple-100 text-purple-700",
  E_VISA: "bg-blue-100 text-blue-700",
  ETA: "bg-amber-100 text-amber-700",
  VISA_EXEMPT: "bg-emerald-100 text-emerald-700",
};

// Country hero images (Unsplash)
const COUNTRY_HERO: Record<string, string> = {
  EG: "https://images.unsplash.com/photo-1539768942893-daf069ae0b33?w=1600&q=80",  // Pyramids
  AE: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",  // Dubai
  TH: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80",  // Thailand
  SG: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80",  // Singapore
  JP: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",  // Japan
  VN: "https://images.unsplash.com/photo-1533533580163-d2a7fded11cb?w=1600&q=80",  // Vietnam
  ID: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",  // Bali
  MY: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&q=80",  // KL
  TR: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1600&q=80",  // Istanbul
  KE: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",     // Kenya
  GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80",  // London
  AU: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",  // Sydney
  NZ: "https://images.unsplash.com/photo-1589196728870-3f5fbcac8f54?w=1600&q=80",  // NZ
  FR: "https://images.unsplash.com/photo-1431274172761-fcdab704a0f6?w=1600&q=80",  // Paris
  DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80",  // Berlin
  IT: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=80",  // Italy
  US: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80",  // NYC
  CA: "https://images.unsplash.com/photo-1568168765363-3f1db0b48c9a?w=1600&q=80",  // Canada
};

const COUNTRY_FALLBACK = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80"; // travel

// Country descriptions and highlights
const COUNTRY_INFO: Record<string, { tagline: string; description: string; highlights: string[] }> = {
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
  GB: {
    tagline: "Where History Comes Alive",
    description: "From the iconic skyline of London to the Scottish Highlands, rolling English countryside, and Wales's dramatic coastline — the United Kingdom is steeped in history, culture, and charm that has captivated visitors for centuries.",
    highlights: ["Buckingham Palace & Tower of London", "Edinburgh Castle & Royal Mile", "The Cotswolds villages", "Stonehenge & Bath"],
  },
};

const COUNTRY_INFO_FALLBACK = {
  tagline: "Discover a New World",
  description: "This destination offers a rich blend of culture, history, natural beauty, and unforgettable experiences. Let us handle the visa — you focus on the adventure.",
  highlights: ["Rich cultural heritage", "Stunning natural landscapes", "World-class cuisine", "Warm, welcoming people"],
};

export default async function ApplyStartPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const country = await prisma.country.findFirst({
    where: { code: params.country.toUpperCase(), isActive: true },
  });
  if (!country) notFound();

  const policy = await prisma.visaPolicy.findFirst({
    where: {
      countryId: country.id,
      visaType: params.visaType.toUpperCase() as "TOURIST" | "BUSINESS",
      nationality: "IND",
      status: "ACTIVE",
    },
  });
  if (!policy) notFound();

  const fee = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number; taxes?: number; notes?: string } | null;
  const reqDocs = (policy.requiredDocuments as { title: string; key: string; notes?: string }[]) ?? [];
  const totalFee = fee ? fee.governmentFeeINR + fee.serviceFeeINR : 0;
  const visaTypeLabel = params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1).toLowerCase();
  const categoryLabel = VISA_CATEGORY_LABELS[policy.visaCategory] ?? policy.visaCategory;
  const categoryColor = VISA_CATEGORY_COLORS[policy.visaCategory] ?? "bg-slate-100 text-slate-700";
  const code = params.country.toUpperCase();
  const heroImage = COUNTRY_HERO[code] ?? COUNTRY_FALLBACK;
  const info = COUNTRY_INFO[code] ?? COUNTRY_INFO_FALLBACK;

  const unauthCTA = !session ? (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Link
        href={`/auth/register?next=/apply/${params.country}/${params.visaType}`}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
      >
        Create free account <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/auth/login?next=/apply/${params.country}/${params.visaType}`}
        className="flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition-colors"
      >
        Already have an account
      </Link>
    </div>
  ) : null;

  return (
    <div className="bg-white">

      {/* ── HERO with country image ── */}
      <div className="relative h-[480px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={country.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay — darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-900/20" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
              <span>/</span>
              <span className="text-white/80">{country.name}</span>
              <span>/</span>
              <span className="text-white/80">{visaTypeLabel} Visa</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 pb-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/50">
                  <MapPin className="h-3 w-3" /> {info.tagline}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {country.flagUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={country.flagUrl} alt="" className="h-9 w-14 rounded-md object-cover shadow-lg" />
                  )}
                  <h1 className="text-4xl font-bold text-white tracking-tight">{country.name}</h1>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>{categoryLabel}</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{visaTypeLabel} Visa · For Indian passport holders</p>
              </div>

              {/* Quick stats strip */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Fee</p>
                  <p className="text-lg font-bold text-white mt-0.5">{totalFee > 0 ? `₹${totalFee.toLocaleString("en-IN")}` : "Free"}</p>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Processing</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {policy.processingTimeMin && policy.processingTimeMax
                      ? `${policy.processingTimeMin}–${policy.processingTimeMax}d`
                      : "Varies"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Docs</p>
                  <p className="text-lg font-bold text-white mt-0.5">{reqDocs.length} items</p>
                </div>
              </div>
            </div>

            {/* Unauthenticated CTA in hero */}
            {!session && unauthCTA}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">

        {/* Mobile stats row */}
        <div className="grid grid-cols-3 gap-3 sm:hidden">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Fee</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{totalFee > 0 ? `₹${totalFee.toLocaleString("en-IN")}` : "Free"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Processing</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{policy.processingTimeMin && policy.processingTimeMax ? `${policy.processingTimeMin}–${policy.processingTimeMax}d` : "Varies"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Docs</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{reqDocs.length}</p>
          </div>
        </div>

        {/* About the country */}
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">About {country.name}</h2>
          </div>
          <p className="text-slate-700 leading-relaxed">{info.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {info.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-slate-600">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        {fee && (
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Banknote className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Visa fees</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Government fee</span>
                <span className="font-semibold text-slate-900">₹{fee.governmentFeeINR.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Consular service fee</span>
                <span className="font-semibold text-slate-900">₹{fee.serviceFeeINR.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                <span className="text-sm font-semibold text-indigo-700">Total</span>
                <span className="text-lg font-bold text-indigo-700">₹{totalFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-400">Processing time: {policy.processingTimeMin && policy.processingTimeMax ? `${policy.processingTimeMin}–${policy.processingTimeMax} business days` : "Varies based on embassy"}</p>
              </div>
            </div>
            {fee.notes && <p className="mt-3 text-xs text-slate-400 italic">{fee.notes}</p>}
          </div>
        )}

        {/* How it works */}
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">How your application works</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: FileText, label: "You enter your passport details", desc: "Securely saved and encrypted. Used across all future applications.", color: "bg-indigo-50 text-indigo-600" },
              { icon: CheckCircle2, label: `We prepare a ${reqDocs.length}-item document checklist`, desc: "Country-specific, always up to date. We tell you exactly what to gather — no surprises.", color: "bg-emerald-50 text-emerald-600" },
              { icon: CreditCard, label: "You pay only after we approve your docs", desc: "No upfront payment. Our team reviews every document before charging a rupee.", color: "bg-amber-50 text-amber-600" },
              { icon: CalendarDays, label: "We submit and track your visa", desc: "From filing to final stamp, we manage every interaction with the embassy on your behalf.", color: "bg-violet-50 text-violet-600" },
            ].map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                    <step.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-slate-100 min-h-[20px]" />}
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required documents */}
        {reqDocs.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Required documents</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{reqDocs.length} items</span>
            </div>
            <div className="space-y-2">
              {reqDocs.map((doc, i) => (
                <div key={doc.key} className="flex items-start gap-3 rounded-xl border border-slate-50 bg-slate-50 px-4 py-3.5 transition-colors hover:bg-indigo-50/50 hover:border-indigo-100">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                    {doc.notes && <p className="mt-0.5 text-xs text-slate-500">{doc.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing notes */}
        {policy.processingNotes && (
          <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{policy.processingNotes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center shadow-lg shadow-indigo-100">
          <ShieldCheck className="mx-auto h-8 w-8 text-white/70 mb-3" />
          <h3 className="text-xl font-bold text-white">Ready to visit {country.name}?</h3>
          <p className="mt-2 text-sm text-indigo-100">We handle the paperwork — you focus on packing your bags.</p>

          {session ? (
            <>
              <Link
                href={`/apply/${params.country}/${params.visaType}/passport`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50 shadow-sm"
              >
                Start my application <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-xs text-indigo-200">Free to start · You pay only after docs are approved</p>
            </>
          ) : (
            <>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={`/auth/register?next=/apply/${params.country}/${params.visaType}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50"
                >
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/auth/login?next=/apply/${params.country}/${params.visaType}`}
                  className="inline-flex items-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Log in
                </Link>
              </div>
              <p className="mt-3 text-xs text-indigo-200">Free to start · No card required</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
