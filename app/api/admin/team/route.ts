import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "OPS", "VIEWER"]).default("OPS"),
  countryIds: z.array(z.string()).default([]),
});

// POST /api/admin/team — super admin creates an agent
export async function POST(req: NextRequest) {
  const { session, response } = await requireOpsRole("ADMIN");
  if (response) return response;

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { email, fullName, password, role, countryIds } = parsed.data;

  if (await prisma.opsUser.findUnique({ where: { email } })) {
    return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 409 });
  }

  const user = await prisma.opsUser.create({
    data: {
      email,
      fullName,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      countries: { connect: countryIds.map((id) => ({ id })) },
    },
  });

  await logAction({
    actorType: "ops_user", actorId: session!.user.id, action: "CREATE",
    resourceType: "ops_user", resourceId: user.id, newValue: { email, role, countryIds },
  }).catch(() => {});

  return NextResponse.json({ success: true, data: { id: user.id } }, { status: 201 });
}
