import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      include: {
        policies: {
          where: { status: "ACTIVE", nationality: "IND" },
          select: {
            visaType: true,
            visaCategory: true,
            productLabel: true,
            processingTimeMin: true,
            processingTimeMax: true,
            feeDetails: true,
            lastVerifiedAt: true,
            nextRefreshDueAt: true,
            freshnessStatus: true,
            caseComplexity: true,
            sourceConfidence: true,
            ruleGroupId: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: countries });
  } catch (error) {
    console.error("[destinations]", error);
    return NextResponse.json({ success: false, error: "Failed to load destinations." }, { status: 500 });
  }
}
