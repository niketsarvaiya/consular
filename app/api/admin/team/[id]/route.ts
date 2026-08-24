import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";

export const runtime = "nodejs";

const patchSchema = z.object({
  countryIds: z.array(z.string()).optional(),
  role: z.enum(["ADMIN", "OPS", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/team/[id] — assign countries / change role / deactivate
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireOpsRole("ADMIN");
  if (response) return response;

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }
  const { countryIds, role, isActive } = parsed.data;

  // Don't let an admin lock themselves out.
  if (params.id === session!.user.id && (isActive === false || (role && role !== "ADMIN"))) {
    return NextResponse.json({ success: false, error: "You cannot demote or deactivate yourself." }, { status: 400 });
  }

  await prisma.opsUser.update({
    where: { id: params.id },
    data: {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(countryIds && { countries: { set: countryIds.map((id) => ({ id })) } }),
    },
  });

  await logAction({
    actorType: "ops_user", actorId: session!.user.id, action: "UPDATE",
    resourceType: "ops_user", resourceId: params.id, newValue: { role, isActive, countryIds },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
