import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  // ISO numeric code (world-atlas geo.id), e.g. "528" for Netherlands
  geoId: z.string().min(1).max(4),
  visited: z.boolean(),
});

// PATCH /api/profile/visited — toggle a single country in the user's visited list
export async function PATCH(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { geoId, visited } = parsed.data;

  const customer = await prisma.customer.findUnique({
    where: { id: session!.user.id },
    select: { visitedCountries: true },
  });
  if (!customer) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const current = new Set(customer.visitedCountries);
  if (visited) current.add(geoId);
  else current.delete(geoId);

  const next = Array.from(current);
  await prisma.customer.update({
    where: { id: session!.user.id },
    data: { visitedCountries: next },
  });

  return NextResponse.json({ success: true, data: { visitedCountries: next } });
}
