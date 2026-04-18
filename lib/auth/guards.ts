import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { OpsRole } from "@prisma/client";

/**
 * Gets the current session and throws a 401 response if not authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}

/**
 * Requires the user to be an ops team member with at least the given role.
 */
export async function requireOpsRole(minRole: OpsRole = "OPS") {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "ops") {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const roleHierarchy: Record<OpsRole, number> = {
    VIEWER: 0,
    OPS: 1,
    ADMIN: 2,
  };

  const userRoleLevel = roleHierarchy[session.user.role as OpsRole] ?? -1;
  const minRoleLevel = roleHierarchy[minRole];

  if (userRoleLevel < minRoleLevel) {
    return {
      session: null,
      response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
    };
  }

  return { session, response: null };
}

/**
 * Requires the user to be a customer.
 */
export async function requireCustomer() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "customer") {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
}
