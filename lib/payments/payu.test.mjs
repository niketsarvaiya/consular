// node lib/payments/payu.test.mjs — locks the two PayU hash formulas.
import crypto from "node:crypto";
import assert from "node:assert";

const sha512 = (s) => crypto.createHash("sha512").update(s).digest("hex");
const KEY = "testkey", SALT = "testsalt";
const P10 = "|".repeat(10);

// --- request: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
const udfs = ["app123", "", "", "", ""];
const built = sha512(
  [KEY, "T1", "6700.00", "Visa", "Niket", "n@x.com", ...udfs].join("|") + "||||||" + SALT
);
assert.equal(built, sha512(`${KEY}|T1|6700.00|Visa|Niket|n@x.com|app123${P10}${SALT}`), "request hash layout");

// --- response: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|key
const body = { status: "success", udf1: "app123", email: "n@x.com", firstname: "Niket", productinfo: "Visa", amount: "6700.00" };
const rev = [5, 4, 3, 2, 1].map((n) => body[`udf${n}`] ?? "");
const base = [SALT, body.status, "", "", "", "", "", ...rev, body.email, body.firstname, body.productinfo, body.amount, KEY].join("|");
assert.equal(base, `${SALT}|success${P10}app123|n@x.com|Niket|Visa|6700.00|${KEY}`, "response hash layout");
assert.notEqual(sha512(`10.00|${base}`), sha512(base), "additional_charges must change the hash");

console.log("ok");
