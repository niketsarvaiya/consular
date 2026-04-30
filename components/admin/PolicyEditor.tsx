"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Trash2, Save, RefreshCw, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle2, Image, Link2, FileText,
  DollarSign, BookOpen, Settings, Info, X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocumentItem {
  id: string; // uuid for DnD
  key: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSizeMb: number;
  isRequired: boolean;
}

interface FaqQuestion {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  category: string;
  questions: FaqQuestion[];
}

interface EmbassyLink {
  id: string;
  label: string;
  url: string;
}

interface FeeDetails {
  currency: string;
  foreignGovFee: number;
  governmentFeeINR: number;
  serviceFeeINR: number;
  gatewayFeePct: number;
  gstPct: number;
  totalINR: number;
  notes: string;
}

interface PolicyEditorProps {
  policyId: string;
  countryCode: string;
  countryName: string;
  visaType: string;
  initialData: {
    visaCategory: string;
    status: string;
    processingTimeMin: number;
    processingTimeMax: number;
    processingNotes: string | null;
    requiredDocuments: { key: string; title: string; description?: string; acceptedFormats?: string[]; maxFileSizeMb?: number }[];
    optionalDocuments: { key: string; title: string; description?: string; acceptedFormats?: string[]; maxFileSizeMb?: number }[];
    feeDetails: Record<string, unknown> | null;
    appointmentNotes: string | null;
    biometricsNotes: string | null;
    vacNotes: string | null;
    embassyLinks: { label: string; url: string }[];
    eligibilityRules: Record<string, unknown> | null;
  };
}

// ─── Exchange Rate Hook ───────────────────────────────────────────────────────

function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 });
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/exchange-rates")
      .then((r) => r.json())
      .then((d) => {
        setRates(d.rates ?? { INR: 1 });
        setLastUpdated(d.lastUpdated ?? "");
        setIsFallback(d.isFallback ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { rates, lastUpdated, isFallback, loading };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toDocItems(
  docs: { key: string; title: string; description?: string; acceptedFormats?: string[]; maxFileSizeMb?: number }[],
  required: boolean
): DocumentItem[] {
  return docs.map((d) => ({
    id: uid(),
    key: d.key,
    title: d.title,
    description: d.description ?? "",
    acceptedFormats: d.acceptedFormats ?? ["pdf", "jpg", "jpeg", "png"],
    maxFileSizeMb: d.maxFileSizeMb ?? 5,
    isRequired: required,
  }));
}

const SUPPORTED_CURRENCIES = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "AED", label: "د.إ AED" },
  { code: "SGD", label: "S$ SGD" },
  { code: "THB", label: "฿ THB" },
  { code: "AUD", label: "A$ AUD" },
  { code: "CAD", label: "C$ CAD" },
  { code: "JPY", label: "¥ JPY" },
  { code: "NZD", label: "NZ$ NZD" },
  { code: "MYR", label: "RM MYR" },
  { code: "KES", label: "KSh KES" },
  { code: "ZAR", label: "R ZAR" },
  { code: "TRY", label: "₺ TRY" },
  { code: "EGP", label: "E£ EGP" },
];

const VISA_CATEGORIES = [
  "REQUIRED", "E_VISA", "ETA", "VISA_EXEMPT", "VISA_ON_ARRIVAL",
];

const ACCEPTED_FORMAT_OPTIONS = ["pdf", "jpg", "jpeg", "png", "docx", "doc", "tiff"];

// ─── Sortable Document Row ────────────────────────────────────────────────────

function SortableDocRow({
  item,
  onChange,
  onDelete,
}: {
  item: DocumentItem;
  onChange: (updated: DocumentItem) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  // Auto-expand freshly added rows (empty title signals brand-new)
  const [expanded, setExpanded] = useState(!item.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleFormat = (fmt: string) => {
    const current = item.acceptedFormats;
    const next = current.includes(fmt) ? current.filter((f) => f !== fmt) : [...current, fmt];
    onChange({ ...item, acceptedFormats: next });
  };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl border ${isDragging ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"} overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-300 hover:text-slate-500 touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <input
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
            className="w-full text-sm font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-400"
            placeholder="Document title"
          />
          <input
            value={item.key}
            onChange={(e) => onChange({ ...item, key: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
            className="w-full text-xs text-slate-400 font-mono bg-transparent border-none outline-none focus:ring-0"
            placeholder="doc_key"
          />
        </div>

        <label className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          <input
            type="checkbox"
            checked={item.isRequired}
            onChange={(e) => onChange({ ...item, isRequired: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
          />
          Required
        </label>

        <button type="button" onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <button type="button" onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3 bg-slate-50">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description / instructions</label>
            <textarea
              value={item.description}
              onChange={(e) => onChange({ ...item, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
              placeholder="What should the customer upload?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Accepted formats</label>
            <div className="flex flex-wrap gap-1.5">
              {ACCEPTED_FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => toggleFormat(fmt)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${item.acceptedFormats.includes(fmt) ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Max file size (MB)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={item.maxFileSizeMb}
              onChange={(e) => onChange({ ...item, maxFileSizeMb: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview",  icon: Settings },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "pricing",   label: "Pricing",   icon: DollarSign },
  { id: "content",   label: "Content & FAQs", icon: BookOpen },
  { id: "process",   label: "Process Notes",  icon: Info },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function PolicyEditor({ policyId, countryCode, countryName, visaType, initialData }: PolicyEditorProps) {
  const { rates, lastUpdated, isFallback, loading: ratesLoading } = useExchangeRates();

  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Overview state ──
  const [visaCategory, setVisaCategory] = useState(initialData.visaCategory);
  const [procMin, setProcMin] = useState(initialData.processingTimeMin);
  const [procMax, setProcMax] = useState(initialData.processingTimeMax);
  const [procNotes, setProcNotes] = useState(initialData.processingNotes ?? "");

  // ── Documents state (merged list, sorted by required first) ──
  const [docs, setDocs] = useState<DocumentItem[]>(() => [
    ...toDocItems(initialData.requiredDocuments, true),
    ...toDocItems(initialData.optionalDocuments, false),
  ]);

  // ── Pricing state ──
  const existingFee = initialData.feeDetails as {
    currency?: string;
    foreignGovFee?: number;
    governmentFeeINR?: number;
    serviceFeeINR?: number;
    gatewayFeePct?: number;
    gstPct?: number;
    totalINR?: number;
    notes?: string;
  } | null;

  const [feeCurrency, setFeeCurrency] = useState(existingFee?.currency ?? "INR");
  const [foreignGovFee, setForeignGovFee] = useState(existingFee?.foreignGovFee ?? existingFee?.governmentFeeINR ?? 0);
  const [serviceFeeINR, setServiceFeeINR] = useState(existingFee?.serviceFeeINR ?? 0);
  const [gatewayFeePct, setGatewayFeePct] = useState(existingFee?.gatewayFeePct ?? 2);
  const [gstPct, setGstPct] = useState(existingFee?.gstPct ?? 18);
  const [feeNotes, setFeeNotes] = useState(existingFee?.notes ?? "");

  // ── Content / FAQ state ──
  const existingEligibility = initialData.eligibilityRules ?? {};
  const [tagline, setTagline] = useState((existingEligibility as Record<string, unknown>).tagline as string ?? "");
  // heroImages: array of up to 5 URLs.
  // Priority: saved DB data → single heroImage field → empty (user adds manually)
  const [heroImages, setHeroImages] = useState<string[]>(() => {
    const saved = (existingEligibility as Record<string, unknown>).heroImages;
    if (Array.isArray(saved) && (saved as string[]).some(Boolean)) return (saved as string[]).filter(Boolean);
    const single = (existingEligibility as Record<string, unknown>).heroImage as string | undefined;
    if (single) return [single];
    return [];
  });
  const [faqs, setFaqs] = useState<FaqCategory[]>(() => {
    const raw = (existingEligibility as Record<string, unknown>).faqs;
    if (Array.isArray(raw)) {
      return (raw as FaqCategory[]).map((c) => ({
        ...c,
        id: c.id ?? uid(),
        questions: (c.questions ?? []).map((q: FaqQuestion) => ({ ...q, id: q.id ?? uid() })),
      }));
    }
    return [];
  });

  // ── Process notes state ──
  const [apptNotes, setApptNotes] = useState(initialData.appointmentNotes ?? "");
  const [bioNotes, setBioNotes] = useState(initialData.biometricsNotes ?? "");
  const [vacNotes, setVacNotes] = useState(initialData.vacNotes ?? "");
  const [embassyLinks, setEmbassyLinks] = useState<EmbassyLink[]>(
    (initialData.embassyLinks ?? []).map((l) => ({ ...l, id: uid() }))
  );

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Computed pricing ── GST applies to service fee only
  const govFeeINR = feeCurrency === "INR" ? foreignGovFee : Math.round((foreignGovFee * (rates[feeCurrency] ?? 1)) * 100) / 100;
  const subtotal = govFeeINR + serviceFeeINR;
  const gatewayAmount = Math.round((subtotal * gatewayFeePct) / 100);
  const gstAmount = Math.round((serviceFeeINR * gstPct) / 100); // GST on service fee only
  const totalINR = subtotal + gatewayAmount + gstAmount;

  // ── Save handler ──
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const requiredDocs = docs.filter((d) => d.isRequired).map(({ id: _id, ...rest }) => rest);
      const optionalDocs = docs.filter((d) => !d.isRequired).map(({ id: _id, ...rest }) => rest);

      const payload = {
        visaCategory,
        processingTimeMin: procMin,
        processingTimeMax: procMax,
        processingNotes: procNotes || null,
        requiredDocuments: requiredDocs,
        optionalDocuments: optionalDocs,
        feeDetails: {
          currency: feeCurrency,
          foreignGovFee,
          governmentFeeINR: govFeeINR,
          serviceFeeINR,
          gatewayFeePct,
          gstPct,
          totalINR,
          notes: feeNotes,
        },
        appointmentNotes: apptNotes || null,
        biometricsNotes: bioNotes || null,
        vacNotes: vacNotes || null,
        embassyLinks: embassyLinks.map(({ id: _id, ...rest }) => rest),
        contentFaqs: faqs,
        contentTagline: tagline || null,
        contentHeroImages: heroImages.filter(Boolean),
      };

      const res = await fetch(`/api/admin/policies/${policyId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }

      setSavedAt(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // ── DnD handler ──
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDocs((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  // ── Add document ──
  const addDoc = (required: boolean) => {
    setDocs((prev) => [
      ...prev,
      {
        id: uid(),
        key: `doc_${uid()}`,
        title: "",
        description: "",
        acceptedFormats: ["pdf", "jpg", "jpeg", "png"],
        maxFileSizeMb: 5,
        isRequired: required,
      },
    ]);
  };

  // ── FAQ helpers ──
  const addFaqCategory = () => {
    setFaqs((prev) => [...prev, { id: uid(), category: "New Category", questions: [] }]);
  };
  const deleteFaqCategory = (catId: string) => {
    setFaqs((prev) => prev.filter((c) => c.id !== catId));
  };
  const addFaqQuestion = (catId: string) => {
    setFaqs((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, questions: [...c.questions, { id: uid(), q: "", a: "" }] } : c
      )
    );
  };
  const updateFaqQuestion = (catId: string, qId: string, field: "q" | "a", value: string) => {
    setFaqs((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, questions: c.questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q)) }
          : c
      )
    );
  };
  const deleteFaqQuestion = (catId: string, qId: string) => {
    setFaqs((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, questions: c.questions.filter((q) => q.id !== qId) } : c
      )
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {countryName} — {visaType.charAt(0).toUpperCase() + visaType.slice(1).toLowerCase()} Visa Editor
          </p>
          {savedAt && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" />
              Saved {savedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-all"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Visa Category</label>
              <select
                value={visaCategory}
                onChange={(e) => setVisaCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                {VISA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Processing Time (business days)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">Minimum</label>
                  <input
                    type="number"
                    min={1}
                    value={procMin}
                    onChange={(e) => setProcMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <span className="text-slate-400 mt-5">–</span>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">Maximum</label>
                  <input
                    type="number"
                    min={1}
                    value={procMax}
                    onChange={(e) => setProcMax(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Processing Notes</label>
              <textarea
                value={procNotes}
                onChange={(e) => setProcNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
                placeholder="e.g. Processing times may be longer during peak seasons"
              />
            </div>
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {activeTab === "documents" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Drag rows to reorder · Toggle &ldquo;Required&rdquo; checkbox per document · Expand row for advanced settings
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addDoc(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Required doc
                </button>
                <button
                  type="button"
                  onClick={() => addDoc(false)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Optional doc
                </button>
              </div>
            </div>

            {docs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No documents yet — add your first document above</p>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={docs.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <SortableDocRow
                      key={doc.id}
                      item={doc}
                      onChange={(updated) => setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
                      onDelete={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {docs.filter((d) => d.isRequired).length} required
              </span>
              {" · "}
              <span>{docs.filter((d) => !d.isRequired).length} optional</span>
              {" · "}
              <span>{docs.length} total documents</span>
            </div>
          </div>
        )}

        {/* ── PRICING TAB ── */}
        {activeTab === "pricing" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fee Inputs</h3>

              {/* Gov fee with currency */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Government / Visa Fee</label>
                <div className="flex gap-2">
                  <select
                    value={feeCurrency}
                    onChange={(e) => setFeeCurrency(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none shrink-0"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={foreignGovFee}
                    onChange={(e) => setForeignGovFee(Number(e.target.value))}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                {feeCurrency !== "INR" && !ratesLoading && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    ≈ ₹{govFeeINR.toLocaleString("en-IN")} INR
                    {" "}
                    <span className="text-slate-400">
                      (1 {feeCurrency} = ₹{(rates[feeCurrency] ?? 1).toLocaleString("en-IN", { maximumFractionDigits: 2 })})
                    </span>
                    {isFallback && <span className="ml-1 text-amber-500">· fallback rates</span>}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Service Fee (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={serviceFeeINR}
                    onChange={(e) => setServiceFeeINR(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Payment Gateway Fee — {gatewayFeePct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={gatewayFeePct}
                  onChange={(e) => setGatewayFeePct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0%</span><span>2.5%</span><span>5%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">≈ ₹{gatewayAmount.toLocaleString("en-IN")} on this order</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  GST — {gstPct}%
                </label>
                <div className="flex gap-2">
                  {[0, 5, 12, 18, 28].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setGstPct(pct)}
                      className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${gstPct === pct ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Fee notes</label>
                <input
                  type="text"
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g. Excludes courier charges"
                />
              </div>
            </div>

            {/* Breakdown preview */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Pricing Breakdown Preview</h3>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Government / Visa Fee</span>
                  <span className="font-medium text-slate-900">₹{govFeeINR.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Service Fee</span>
                  <span className="font-medium text-slate-900">₹{serviceFeeINR.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Gateway fee ({gatewayFeePct}%)</span>
                  <span className="text-slate-700">+ ₹{gatewayAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST ({gstPct}% on service fee)</span>
                  <span className="text-slate-700">+ ₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total charged to customer</span>
                  <span className="text-xl font-black text-indigo-700">₹{totalINR.toLocaleString("en-IN")}</span>
                </div>
                {feeNotes && (
                  <p className="text-xs text-slate-400 italic">{feeNotes}</p>
                )}
              </div>

              {!ratesLoading && lastUpdated && (
                <p className="mt-3 text-[10px] text-slate-400">
                  FX rates: {lastUpdated.slice(0, 25)}
                  {isFallback && " (fallback)"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── CONTENT & FAQs TAB ── */}
        {activeTab === "content" && (
          <div className="space-y-6 max-w-3xl">
            {/* Basic content */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Page Content</h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g. Land of cherry blossoms and bullet trains"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Image className="h-3.5 w-3.5" /> Hero Images
                    <span className="text-slate-400 font-normal ml-1">({heroImages.length}/5 · first = main hero, rest = mosaic)</span>
                  </label>
                  {heroImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setHeroImages((prev) => [...prev, ""])}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add image
                    </button>
                  )}
                </div>

                {heroImages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                    <Image className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">No images yet — click Add image</p>
                  </div>
                )}

                <div className="space-y-3">
                  {heroImages.map((url, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${idx === 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                          {idx === 0 ? "MAIN HERO" : `MOSAIC ${idx}`}
                        </span>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const copy = [...heroImages];
                            copy[idx] = e.target.value;
                            setHeroImages(copy);
                          }}
                          className="flex-1 bg-transparent text-xs text-slate-700 border-none outline-none placeholder:text-slate-400"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        <button
                          type="button"
                          onClick={() => setHeroImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {url && (
                        <div className={`overflow-hidden ${idx === 0 ? "h-36" : "h-20"}`}>
                          <img
                            src={url}
                            alt={`Image ${idx + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">FAQ Categories</h3>
                <button
                  onClick={addFaqCategory}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add category
                </button>
              </div>

              {faqs.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <BookOpen className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No FAQs yet — add a category to get started</p>
                </div>
              )}

              <div className="space-y-4">
                {faqs.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 border-b border-slate-100">
                      <input
                        value={cat.category}
                        onChange={(e) =>
                          setFaqs((prev) => prev.map((c) => (c.id === cat.id ? { ...c, category: e.target.value } : c)))
                        }
                        className="flex-1 bg-transparent text-sm font-semibold text-slate-800 border-none outline-none"
                        placeholder="Category name"
                      />
                      <button
                        onClick={() => addFaqQuestion(cat.id)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Q&A
                      </button>
                      <button onClick={() => deleteFaqCategory(cat.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {cat.questions.length === 0 && (
                        <p className="px-4 py-3 text-xs text-slate-400">No questions yet — click &ldquo;Add Q&A&rdquo;</p>
                      )}
                      {cat.questions.map((q) => (
                        <div key={q.id} className="px-4 py-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-slate-400 mt-2 shrink-0">Q</span>
                            <input
                              value={q.q}
                              onChange={(e) => updateFaqQuestion(cat.id, q.id, "q", e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none"
                              placeholder="Question…"
                            />
                            <button onClick={() => deleteFaqQuestion(cat.id, q.id)} className="text-red-300 hover:text-red-500 mt-1">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-emerald-500 mt-2 shrink-0">A</span>
                            <textarea
                              value={q.a}
                              onChange={(e) => updateFaqQuestion(cat.id, q.id, "a", e.target.value)}
                              rows={2}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
                              placeholder="Answer…"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESS NOTES TAB ── */}
        {activeTab === "process" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Appointment Notes</label>
              <textarea
                value={apptNotes}
                onChange={(e) => setApptNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
                placeholder="Instructions about scheduling appointments at the consulate or visa centre…"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Biometrics Notes</label>
              <textarea
                value={bioNotes}
                onChange={(e) => setBioNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
                placeholder="Information about biometric data collection requirements…"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">VAC / Application Centre Notes</label>
              <textarea
                value={vacNotes}
                onChange={(e) => setVacNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none resize-none"
                placeholder="Details about Visa Application Centres — locations, hours, fees…"
              />
            </div>

            {/* Embassy links */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Official Links & Resources
                </label>
                <button
                  onClick={() => setEmbassyLinks((prev) => [...prev, { id: uid(), label: "", url: "" }])}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add link
                </button>
              </div>
              <div className="space-y-2">
                {embassyLinks.map((link) => (
                  <div key={link.id} className="flex gap-2 items-center">
                    <input
                      value={link.label}
                      onChange={(e) =>
                        setEmbassyLinks((prev) =>
                          prev.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l))
                        )
                      }
                      className="w-36 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                      placeholder="Label"
                    />
                    <div className="flex-1 relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          setEmbassyLinks((prev) =>
                            prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l))
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                        placeholder="https://…"
                      />
                    </div>
                    <button
                      onClick={() => setEmbassyLinks((prev) => prev.filter((l) => l.id !== link.id))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {embassyLinks.length === 0 && (
                  <p className="text-xs text-slate-400">No links added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
