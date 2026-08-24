import { prisma } from "@/lib/db/prisma";

/**
 * Countries an ops user may work on.
 * ADMIN (super admin) => null = no restriction.
 * Everyone else => the country IDs assigned to them (empty array = sees nothing).
 */
export async function agentCountryIds(user: { id: string; role?: string }): Promise<string[] | null> {
  if (user.role === "ADMIN") return null;
  const rows = await prisma.opsUser.findUnique({
    where: { id: user.id },
    select: { countries: { select: { id: true } } },
  });
  return (rows?.countries ?? []).map((c) => c.id);
}

/** True if this ops user may open a case for the given country. */
export async function canAccessCountry(user: { id: string; role?: string }, countryId: string) {
  const ids = await agentCountryIds(user);
  return ids === null || ids.includes(countryId);
}
