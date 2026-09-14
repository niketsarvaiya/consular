// node lib/services/trip.test.mjs — tracking token must be stable, secret-bound, and constant-time safe.
import crypto from "node:crypto";
import assert from "node:assert";

const token = (secret, id) => crypto.createHmac("sha256", secret).update(`track:${id}`).digest("base64url").slice(0, 32);

assert.equal(token("s", "app1"), token("s", "app1"), "deterministic");
assert.notEqual(token("s", "app1"), token("s", "app2"), "bound to application id");
assert.notEqual(token("s", "app1"), token("other", "app1"), "bound to secret");
assert.equal(token("s", "app1").length, 32, "fixed length so timingSafeEqual never throws");
assert.match(token("s", "app1"), /^[A-Za-z0-9_-]+$/, "url-safe without encoding");
console.log("ok");
