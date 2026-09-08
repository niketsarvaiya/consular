import { NextRequest, NextResponse } from "next/server";
import { verifyPayuPayment } from "@/lib/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PayU posts here twice: once as the browser return URL (surl/furl, form-encoded)
 * and once as the server-to-server webhook. markOrderPaid is idempotent, so both are safe.
 * Never trust `status` alone — verifyPayuPayment checks the reverse hash first.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const body: Record<string, string> = {};
  form.forEach((v, k) => { body[k] = typeof v === "string" ? v : ""; });

  const base = (process.env.APP_URL ?? "https://visasetgo.com").replace(/\/$/, "");
  const applicationId = body.udf1 ?? "";

  try {
    const result = await verifyPayuPayment(body);
    // A webhook has no browser to redirect; PayU ignores the body either way.
    if (result && "failed" in result) {
      return NextResponse.redirect(`${base}/dashboard/application/${applicationId}/payment?status=failed`, 303);
    }
    return NextResponse.redirect(`${base}/dashboard/application/${applicationId}?paid=1`, 303);
  } catch (error) {
    console.error("[payu callback] verification failed", error);
    return NextResponse.redirect(`${base}/dashboard/application/${applicationId}/payment?status=invalid`, 303);
  }
}
