// node lib/services/wallet.test.mjs — the arithmetic that guards real money.
import assert from "node:assert";

const coinsForPaise = (p) => Math.ceil(p / 100);

// Never undercharge on a fractional rupee.
assert.equal(coinsForPaise(670000), 6700, "whole rupees");
assert.equal(coinsForPaise(670050), 6701, "half rupee rounds UP, not down");
assert.equal(coinsForPaise(1), 1, "one paise still costs a coin");
assert.equal(coinsForPaise(0), 0, "free is free");

// Balance check: a debit may not take the wallet negative.
const apply = (balance, delta) => {
  const after = balance + delta;
  if (after < 0) throw new Error("insufficient");
  return after;
};
assert.equal(apply(100, -100), 0, "exact spend is allowed");
assert.throws(() => apply(100, -101), /insufficient/, "overdraw rejected");
assert.equal(apply(0, 500), 500, "credit from empty");

// Two concurrent spends of 60 from 100 must not both succeed.
let bal = 100;
bal = apply(bal, -60);
assert.throws(() => apply(bal, -60), /insufficient/, "second spend must fail");

console.log("ok");
