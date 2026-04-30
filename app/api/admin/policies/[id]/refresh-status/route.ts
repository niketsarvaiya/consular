import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { policyRefreshQueue } from "@/lib/jobs/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/policies/[id]/refresh-status
 * Polled by PolicyRefreshButton after queuing a refresh job.
 * Returns:
 *   { hasNewSnapshot: true }  — a pending_review snapshot was created (changes detected)
 *   { jobCompleted: true }    — job finished but no snapshot (no changes)
 *   { pending: true }         — job still running
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  // Check for a pending_review snapshot created in the last 2 minutes
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recentSnapshot = await prisma.policySnapshot.findFirst({
    where: {
      policyId: params.id,
      status: "pending_review",
      createdAt: { gte: twoMinsAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentSnapshot) {
    return NextResponse.json({ hasNewSnapshot: true, snapshotId: recentSnapshot.id });
  }

  // Check if the BullMQ job finished (no active/waiting jobs for this policy)
  try {
    const waiting  = await policyRefreshQueue.getWaiting();
    const active   = await policyRefreshQueue.getActive();
    const allJobs  = [...waiting, ...active];
    const jobStillRunning = allJobs.some((j) => j.data?.policyId === params.id);

    if (!jobStillRunning) {
      return NextResponse.json({ jobCompleted: true });
    }
  } catch {
    // Queue might not be available — assume still running
  }

  return NextResponse.json({ pending: true });
}
