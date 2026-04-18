import type { Job } from "bullmq";
import * as cheerio from "cheerio";
import { diff_match_patch } from "diff-match-patch";
import { prisma } from "@/lib/db/prisma";
import { hashContent } from "@/lib/utils/crypto";
import { logAction } from "@/lib/services/audit.service";
import { enqueueNotification } from "@/lib/services/notification.service";
import type { PolicyRefreshJobData } from "@/lib/jobs/queue";

export async function processPolicyRefreshJob(job: Job<PolicyRefreshJobData>): Promise<void> {
  const { policyId, countryCode, visaType, triggeredByUserId } = job.data;
  console.log(`[PolicyRefresh] Processing: ${countryCode} ${visaType}`);

  const policy = await prisma.visaPolicy.findUniqueOrThrow({ where: { id: policyId }, include: { sources: true, country: true } });
  if (policy.sources.length === 0) { console.warn(`[PolicyRefresh] No sources for policy ${policyId}`); return; }

  const fetchedTexts: string[] = [];
  const changedSourceIds: string[] = [];

  for (const source of policy.sources) {
    try {
      const { text, hash } = await fetchAndExtractText(source.sourceUrl, source.cssSelector);
      await prisma.policySource.update({ where: { id: source.id }, data: { lastFetchedAt: new Date() } });
      if (source.lastContentHash && source.lastContentHash === hash) continue;
      await prisma.policySource.update({ where: { id: source.id }, data: { lastContentHash: hash, lastFetchedAt: new Date() } });
      fetchedTexts.push(`=== ${source.label} ===\n${text}`);
      changedSourceIds.push(source.id);
    } catch (error) {
      console.error(`[PolicyRefresh] Failed to fetch ${source.sourceUrl}:`, error);
    }
  }

  if (fetchedTexts.length === 0) { console.log(`[PolicyRefresh] No changes detected for ${countryCode} ${visaType}`); return; }

  const combinedText = fetchedTexts.join("\n\n");
  const lastSnapshot = await prisma.policySnapshot.findFirst({ where: { policyId, status: "approved" }, orderBy: { versionNumber: "desc" } });
  const lastText = lastSnapshot ? JSON.stringify(lastSnapshot.snapshot, null, 2) : "";

  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(lastText, combinedText);
  dmp.diff_cleanupSemantic(diffs);
  const diffSummary = buildDiffSummary(diffs);
  const newVersionNumber = (policy.versionNumber ?? 1) + 1;

  await prisma.$transaction(async (tx) => {
    await tx.policySnapshot.create({
      data: {
        policyId,
        versionNumber: newVersionNumber,
        snapshot: { fetchedContent: combinedText.slice(0, 50000), sources: changedSourceIds, refreshedAt: new Date().toISOString() },
        diff: diffSummary as unknown as object,
        changeTypes: diffSummary.changeTypes,
        changeSource: "auto_refresh",
        status: "pending_review",
      },
    });
    await tx.visaPolicy.update({ where: { id: policyId }, data: { status: "NEEDS_REVIEW", lastRefreshedAt: new Date() } });
  });

  const adminUsers = await prisma.opsUser.findMany({ where: { role: "ADMIN", isActive: true }, select: { email: true, id: true } });
  for (const admin of adminUsers) {
    await enqueueNotification({
      eventType: "policy_refresh_alert", opsUserId: admin.id, channel: "EMAIL", recipient: admin.email,
      templateVars: { countryName: policy.country.name, visaType, countryCode, visaTypeSlug: visaType.toLowerCase(), changeTypes: diffSummary.changeTypes.join(", ") },
    });
  }

  await logAction({ actorId: triggeredByUserId, actorType: "system", action: "POLICY_REFRESH", resourceType: "policy", resourceId: policyId, newValue: { newVersionNumber, changeTypes: diffSummary.changeTypes } });
  console.log(`[PolicyRefresh] Created snapshot v${newVersionNumber} for ${countryCode} ${visaType}`);
}

async function fetchAndExtractText(url: string, cssSelector?: string | null): Promise<{ text: string; hash: string }> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ConsularPolicyBot/1.0)" }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("nav, footer, header, script, style").remove();
  const targetEl = cssSelector ? $(cssSelector) : $("main, article, body");
  const text = targetEl.text().replace(/\s+/g, " ").trim();
  return { text, hash: hashContent(text) };
}

function buildDiffSummary(diffs: [number, string][]) {
  const CHANGE_KEYWORDS: Record<string, string[]> = {
    fees: ["fee", "cost", "price", "charge", "inr", "usd", "₹", "$"],
    timeline: ["day", "week", "processing", "turnaround", "duration"],
    requirements: ["document", "required", "passport", "photo", "certificate", "bank"],
    eligibility: ["eligible", "nationality", "restrict", "banned", "allow"],
    appointment: ["appointment", "vfs", "vac", "biometric", "center", "book"],
  };
  const changedText = diffs.filter(([op]) => op !== 0).map(([, text]) => text.toLowerCase()).join(" ");
  const changeTypes = Object.entries(CHANGE_KEYWORDS).filter(([, kws]) => kws.some((kw) => changedText.includes(kw))).map(([type]) => type);
  if (changeTypes.length === 0) changeTypes.push("other");
  return { changeTypes, totalChanges: diffs.filter(([op]) => op !== 0).length, summary: changedText.slice(0, 500) };
}
