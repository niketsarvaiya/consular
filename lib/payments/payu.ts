import crypto from "crypto";

/**
 * PayU (India) hosted-checkout helpers.
 * PayU is a redirect POST flow, not a JS modal: we render a self-submitting form
 * to `paymentUrl`, and PayU POSTs the result back to our callback route.
 */

export const PAYU_UDF_COUNT = 5;

export function payuConfig() {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!key || !salt) throw new Error("PayU is not configured (PAYU_MERCHANT_KEY / PAYU_MERCHANT_SALT).");
  const test = process.env.PAYU_MODE !== "live";
  return {
    key,
    salt,
    paymentUrl: test ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment",
  };
}

const sha512 = (s: string) => crypto.createHash("sha512").update(s).digest("hex");

export interface PayuRequestFields {
  key: string;
  txnid: string;
  amount: string; // rupees, 2dp — PayU rejects paise
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string; // applicationId — echoed back so the callback can find the order
  hash: string;
}

/** Request hash: key|txnid|amount|productinfo|firstname|email|udf1..udf5||||||salt */
export function buildPayuRequest(params: {
  txnid: string;
  amountPaise: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
}): { paymentUrl: string; fields: PayuRequestFields } {
  const { key, salt, paymentUrl } = payuConfig();
  const amount = (params.amountPaise / 100).toFixed(2);
  const udfs = [params.udf1, "", "", "", ""];

  const hash = sha512(
    [key, params.txnid, amount, params.productinfo, params.firstname, params.email, ...udfs].join("|") +
      "||||||" + salt
  );

  return {
    paymentUrl,
    fields: {
      key,
      txnid: params.txnid,
      amount,
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      phone: params.phone,
      surl: params.surl,
      furl: params.furl,
      udf1: params.udf1,
      hash,
    },
  };
}

/**
 * Response hash (reverse order): [additionalCharges|]salt|status||||||udf5..udf1|email|firstname|productinfo|amount|key
 * PayU prepends additionalCharges only when it sends that field — omitting it silently fails verification.
 */
export function verifyPayuResponse(body: Record<string, string>): boolean {
  const { key, salt } = payuConfig();
  if (body.key !== key) return false;

  const udfs = [5, 4, 3, 2, 1].map((n) => body[`udf${n}`] ?? "");
  const base = [
    salt,
    body.status ?? "",
    "", "", "", "", "", // 5 empty slots + the join pipes reproduce PayU's ||||||
    ...udfs,
    body.email ?? "",
    body.firstname ?? "",
    body.productinfo ?? "",
    body.amount ?? "",
    key,
  ].join("|");

  const expected = sha512(body.additional_charges ? `${body.additional_charges}|${base}` : base);
  const given = (body.hash ?? "").toLowerCase();
  // Constant-time compare — both are fixed-length hex digests.
  return given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

/** PayU caps txnid at 25 chars. */
export function payuTxnId(applicationId: string): string {
  return `vsg${applicationId.slice(-8)}${Date.now().toString(36)}`.slice(0, 25);
}
