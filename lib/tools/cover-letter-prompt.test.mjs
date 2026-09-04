// node lib/tools/cover-letter-prompt.test.mjs
import assert from "node:assert";

// Mirrors parseLetters in app/api/tools/cover-letter/route.ts
function parseLetters(raw) {
  const json = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(json);
    const list = Array.isArray(parsed) ? parsed : parsed?.letters;
    if (!Array.isArray(list)) return [];
    return list.filter((l) => l && typeof l.letter_markdown === "string")
      .map((l) => ({ traveler: String(l.traveler ?? "Applicant"), letter_markdown: l.letter_markdown }));
  } catch { return []; }
}

assert.equal(parseLetters('{"letters":[{"traveler":"A","letter_markdown":"x"}]}').length, 1);
assert.equal(parseLetters('```json\n{"letters":[{"traveler":"A","letter_markdown":"x"}]}\n```').length, 1, "fenced");
assert.equal(parseLetters('[{"traveler":"A","letter_markdown":"x"}]').length, 1, "bare array");
assert.equal(parseLetters("sorry, I can't").length, 0, "prose → empty, caller 502s");
assert.equal(parseLetters('{"letters":[{"traveler":"A"}]}').length, 0, "missing markdown dropped");
console.log("ok");
